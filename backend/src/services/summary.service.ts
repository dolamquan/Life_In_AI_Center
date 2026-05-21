import prisma from '../config/prisma';
import { getJsonCompletion } from './openai.service';

type SummaryResponse = {
  summaryText: string;
  keyConcepts: string[];
  strengths: string[];
  improvementAreas: string[];
  recommendedNextStep: string;
};

function parseStringArray(value: string) {
  return JSON.parse(value) as string[];
}

function serializeSummary(summary: {
  id: number;
  sessionId: number;
  summaryText: string;
  completedLessons: string;
  keyConcepts: string;
  strengths: string;
  improvementAreas: string;
  recommendedNextStep: string;
  completedLessonCount: number;
  totalLessonCount: number;
  totalStudyMinutes: number;
  averageScore: number | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...summary,
    completedLessons: parseStringArray(summary.completedLessons),
    keyConcepts: parseStringArray(summary.keyConcepts),
    strengths: parseStringArray(summary.strengths),
    improvementAreas: parseStringArray(summary.improvementAreas),
  };
}

export async function generateSessionSummary(sessionId: number) {
  const session = await prisma.chatSession.findUnique({
    where: { id: sessionId },
    include: {
      tutor: true,
      messages: {
        orderBy: { createdAt: 'asc' },
      },
      questions: {
        include: {
          evaluation: true,
        },
        orderBy: { createdAt: 'asc' },
      },
      summary: true,
    },
  });

  if (!session) return null;

  const latestStudyGoal = await prisma.studyGoal.findFirst({
    where: { tutorId: session.tutorId },
    orderBy: { createdAt: 'desc' },
    include: {
      studyPlan: {
        include: {
          items: {
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  });

  const planItems = latestStudyGoal?.studyPlan?.items ?? [];
  const fallbackLessons = parseStringArray(session.tutor.suggestedLessons);
  const totalLessonCount = planItems.length > 0 ? planItems.length : fallbackLessons.length;
  const completedLessons =
    planItems.length > 0
      ? planItems.filter((item) => item.completed).map((item) => item.title)
      : [];
  const totalStudyMinutes = planItems.reduce((sum, item) => sum + item.estimatedMinutes, 0);

  const evaluations = session.questions
    .map((question) => question.evaluation)
    .filter((evaluation): evaluation is NonNullable<typeof evaluation> => Boolean(evaluation));
  const averageScore =
    evaluations.length > 0
      ? Number(
          (
            evaluations.reduce((sum, evaluation) => sum + evaluation.score, 0) /
            evaluations.length
          ).toFixed(2)
        )
      : null;

  const recentMessages = session.messages.slice(-10).map((message) => ({
    role: message.role === 'assistant' ? 'assistant' : 'user',
    content: message.content,
  })) as { role: 'user' | 'assistant'; content: string }[];

  const evaluationContext =
    evaluations.length > 0
      ? evaluations
          .map(
            (evaluation, index) =>
              `Evaluation ${index + 1}: score ${evaluation.score}/5\nStrength: ${evaluation.strength}\nImprovement: ${evaluation.improvement}\nFollow-up: ${evaluation.followUpQuestion}`
          )
          .join('\n\n')
      : 'No answer evaluations were completed in this session.';

  const lessonContext =
    totalLessonCount > 0
      ? `Completed lessons (${completedLessons.length}/${totalLessonCount}): ${
          completedLessons.length > 0 ? completedLessons.join(', ') : 'None completed yet'
        }`
      : 'No study plan lessons were available.';

  const llmSummary = await getJsonCompletion<SummaryResponse>([
    {
      role: 'system',
      content: `You are an AI tutor creating a concise reflection summary for a student who just studied ${session.tutor.subject}.
Use the session conversation, lesson progress, and answer evaluations.
Be specific, encouraging, and honest.
Return ONLY valid JSON:
{
  "summaryText": "2-4 sentence reflection summary",
  "keyConcepts": ["concept 1", "concept 2", "concept 3"],
  "strengths": ["strength 1", "strength 2"],
  "improvementAreas": ["area 1", "area 2"],
  "recommendedNextStep": "one concrete next step"
}`,
    },
    {
      role: 'user',
      content: `Lesson progress:
${lessonContext}

Tutor starter lessons:
${fallbackLessons.join(', ')}

Evaluation summary:
${evaluationContext}`,
    },
    ...recentMessages,
    {
      role: 'user',
      content: 'Create the reflection summary now.',
    },
  ]);

  const payload = {
    summaryText: llmSummary.summaryText,
    completedLessons: JSON.stringify(completedLessons),
    keyConcepts: JSON.stringify(llmSummary.keyConcepts ?? []),
    strengths: JSON.stringify(llmSummary.strengths ?? []),
    improvementAreas: JSON.stringify(llmSummary.improvementAreas ?? []),
    recommendedNextStep: llmSummary.recommendedNextStep,
    completedLessonCount: completedLessons.length,
    totalLessonCount,
    totalStudyMinutes,
    averageScore,
  };

  const saved = session.summary
    ? await prisma.sessionSummary.update({
        where: { sessionId },
        data: payload,
      })
    : await prisma.sessionSummary.create({
        data: {
          sessionId,
          ...payload,
        },
      });

  return serializeSummary(saved);
}
