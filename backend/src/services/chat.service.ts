import prisma from '../config/prisma';
import { routeToMode } from './modeRouter.service';
import { type TutorMode } from './prompt.service';

export async function createSession(tutorId: number, mode: TutorMode = 'DOCUMENT_GROUNDED') {
  const tutor = await prisma.tutor.findUnique({ where: { id: tutorId } });
  if (!tutor) return null;

  return prisma.chatSession.create({
    data: { tutorId, mode },
  });
}

export async function sendMessage(
  sessionId: number,
  userMessage: string,
  mode?: TutorMode,
  studyPlanItemId?: number
) {
  const session = await prisma.chatSession.findUnique({ where: { id: sessionId } });
  if (!session) return null;

  const effectiveMode: TutorMode = mode ?? (session.mode as TutorMode);

  if (mode && mode !== session.mode) {
    await prisma.chatSession.update({ where: { id: sessionId }, data: { mode } });
  }

  // Phase 10: build lesson context from study plan item if provided
  let lessonContext: string | undefined;
  if (studyPlanItemId) {
    const item = await prisma.studyPlanItem.findUnique({ where: { id: studyPlanItemId } });
    if (item) {
      lessonContext = `Current lesson: ${item.title}\nObjective: ${item.objective}`;
    }
  }

  await prisma.chatMessage.create({
    data: { sessionId, role: 'user', content: userMessage },
  });

  const history = await prisma.chatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' },
  });

  const { answer, sources } = await routeToMode(
    history.map((m: { role: string; content: string }) => ({ role: m.role, content: m.content })),
    effectiveMode,
    userMessage,
    lessonContext
  );

  const assistantMessage = await prisma.chatMessage.create({
    data: {
      sessionId,
      role: 'assistant',
      content: answer,
      sources: sources.length > 0 ? JSON.stringify(sources) : null,
    },
  });

  return { ...assistantMessage, mode: effectiveMode, sources };
}

export async function getMessages(sessionId: number) {
  const session = await prisma.chatSession.findUnique({ where: { id: sessionId } });
  if (!session) return null;

  const messages = await prisma.chatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' },
  });

  type DbMessage = { id: number; sessionId: number; role: string; content: string; sources: string | null; createdAt: Date };
  return messages.map((m: DbMessage) => ({
    ...m,
    sources: m.sources ? JSON.parse(m.sources) : [],
  }));
}
