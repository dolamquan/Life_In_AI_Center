import prisma from '../config/prisma';
import { getJsonCompletion } from './openai.service';

type QuestionType = 'KNOWLEDGE' | 'REFLECTION';

type QuestionResponse = { question: string };

export async function generateQuestion(sessionId: number, questionType: QuestionType) {
  const session = await prisma.chatSession.findUnique({ where: { id: sessionId } });
  if (!session) return null;

  const history = await prisma.chatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' },
    take: 10,
  });

  const typeInstruction =
    questionType === 'KNOWLEDGE'
      ? 'Generate a knowledge-check question that tests the student\'s factual understanding of confirmation bias based on the conversation so far.'
      : 'Generate a reflection question that asks the student to connect confirmation bias to their own personal experience or daily life.';

  const { question } = await getJsonCompletion<QuestionResponse>([
    {
      role: 'system',
      content: `You are an AI tutor generating a single question about confirmation bias.
${typeInstruction}
Return ONLY JSON: { "question": "your question here" }`,
    },
    ...history.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    {
      role: 'user',
      content: `Generate one ${questionType.toLowerCase().replace('_', ' ')} question.`,
    },
  ]);

  return prisma.tutorQuestion.create({
    data: { sessionId, questionText: question, questionType },
  });
}
