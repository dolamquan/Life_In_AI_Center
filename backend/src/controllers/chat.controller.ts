import type { Request, Response } from 'express';
import { createSession, sendMessage, getMessages } from '../services/chat.service';
import { type TutorMode } from '../services/prompt.service';

export const createChatSession = async (req: Request, res: Response) => {
  const { tutorId, mode } = req.body as { tutorId?: number; mode?: TutorMode };

  if (!tutorId) {
    res.status(400).json({ error: 'tutorId is required' });
    return;
  }

  const session = await createSession(tutorId, mode);
  if (!session) {
    res.status(404).json({ error: 'Tutor not found' });
    return;
  }

  res.status(201).json(session);
};

export const postMessage = async (req: Request, res: Response) => {
  const sessionId = parseInt(req.params['sessionId'] as string ?? '', 10);
  const { message, mode, studyPlanItemId } = req.body as { message?: string; mode?: TutorMode; studyPlanItemId?: number };

  if (isNaN(sessionId)) {
    res.status(400).json({ error: 'Invalid session id' });
    return;
  }

  if (!message || message.trim() === '') {
    res.status(400).json({ error: 'message is required' });
    return;
  }

  const result = await sendMessage(sessionId, message.trim(), mode, studyPlanItemId);
  if (!result) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  res.json(result);
};

export const getChatMessages = async (req: Request, res: Response) => {
  const sessionId = parseInt(req.params['sessionId'] as string ?? '', 10);

  if (isNaN(sessionId)) {
    res.status(400).json({ error: 'Invalid session id' });
    return;
  }

  const messages = await getMessages(sessionId);
  if (!messages) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  res.json(messages);
};
