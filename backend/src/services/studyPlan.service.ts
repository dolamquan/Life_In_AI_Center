import prisma from '../config/prisma';
import { getJsonCompletion } from './openai.service';
import { retrieveRelevantChunks } from './retrieval.service';

type StudyPlanResponse = {
  estimatedTime: string;
  items: {
    order: number;
    title: string;
    objective: string;
    estimatedMinutes: number;
  }[];
};

export async function generateStudyPlan(studyGoalId: number) {
  const studyGoal = await prisma.studyGoal.findUnique({
    where: { id: studyGoalId },
    include: { tutor: true },
  });
  if (!studyGoal) return null;

  const existing = await prisma.studyPlan.findUnique({ where: { studyGoalId } });
  if (existing) {
    return prisma.studyPlan.findUnique({
      where: { studyGoalId },
      include: { items: { orderBy: { order: 'asc' } } },
    });
  }

  const chunks = await retrieveRelevantChunks(studyGoal.goalText, 5);
  const context = chunks.map((c) => c.text).join('\n\n');

  const plan = await getJsonCompletion<StudyPlanResponse>([
    {
      role: 'system',
      content: `You are an AI assistant creating a personalized study plan for a student learning about ${studyGoal.tutor.subject}.

Student goal: ${studyGoal.goalText}
Goal type: ${studyGoal.goalType}
${context ? `\nRelevant course material:\n${context}\n` : ''}
Create a study plan with 4-7 focused lessons tailored to this goal. Return ONLY valid JSON:
{
  "estimatedTime": "X minutes",
  "items": [
    { "order": 1, "title": "...", "objective": "...", "estimatedMinutes": 5 }
  ]
}`,
    },
    { role: 'user', content: 'Generate the study plan.' },
  ]);

  return prisma.studyPlan.create({
    data: {
      studyGoalId,
      estimatedTime: plan.estimatedTime,
      items: {
        create: plan.items.map((item) => ({
          order: item.order,
          title: item.title,
          objective: item.objective,
          estimatedMinutes: item.estimatedMinutes,
        })),
      },
    },
    include: { items: { orderBy: { order: 'asc' } } },
  });
}

export async function getStudyPlan(studyPlanId: number) {
  return prisma.studyPlan.findUnique({
    where: { id: studyPlanId },
    include: {
      items: { orderBy: { order: 'asc' } },
      studyGoal: true,
    },
  });
}

export async function completeStudyPlanItem(itemId: number) {
  const item = await prisma.studyPlanItem.findUnique({ where: { id: itemId } });
  if (!item) return null;

  return prisma.studyPlanItem.update({
    where: { id: itemId },
    data: { completed: true },
  });
}
