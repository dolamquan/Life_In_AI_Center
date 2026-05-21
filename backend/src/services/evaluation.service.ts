import prisma from '../config/prisma';
import { getJsonCompletion } from './openai.service';
import { retrieveRelevantChunks } from './retrieval.service';
import { type TutorMode } from './prompt.service';

type EvaluationResponse = {
  score: number;
  strength: string;
  improvement: string;
  betterAnswer: string;
  followUpQuestion: string;
};

export async function evaluateAnswer(
  questionId: number,
  studentAnswer: string,
  mode: TutorMode = 'DOCUMENT_GROUNDED'
) {
  const question = await prisma.tutorQuestion.findUnique({ where: { id: questionId } });
  if (!question) return null;

  const existing = await prisma.studentAnswerEvaluation.findUnique({ where: { questionId } });
  if (existing) return existing;

  const chunks = await retrieveRelevantChunks(question.questionText, 3);
  const context = chunks.map((c) => c.text).join('\n\n');

  const evaluation = await getJsonCompletion<EvaluationResponse>([
    {
      role: 'system',
      content: `You are evaluating a student's answer about confirmation bias.
${context ? `Source material:\n${context}\n` : ''}
Score the answer from 1 (poor) to 5 (excellent). Be encouraging but honest.
Return ONLY JSON:
{
  "score": 1-5,
  "strength": "what the student got right",
  "improvement": "what is missing or could be improved",
  "betterAnswer": "a model answer the student can learn from",
  "followUpQuestion": "a follow-up question to deepen their understanding"
}`,
    },
    {
      role: 'user',
      content: `Question: ${question.questionText}\n\nStudent answer: ${studentAnswer}`,
    },
  ]);

  return prisma.studentAnswerEvaluation.create({
    data: {
      questionId,
      studentAnswer,
      score: evaluation.score,
      strength: evaluation.strength,
      improvement: evaluation.improvement,
      betterAnswer: evaluation.betterAnswer,
      followUpQuestion: evaluation.followUpQuestion,
    },
  });
}
