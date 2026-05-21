import type { Request, Response } from 'express';
import { generateSessionSummary } from '../services/summary.service';

export const postSessionSummary = async (req: Request, res: Response) => {
  const sessionId = parseInt(req.params['sessionId'] as string ?? '', 10);

  if (isNaN(sessionId)) {
    res.status(400).json({ error: 'Invalid session id' });
    return;
  }

  const summary = await generateSessionSummary(sessionId);
  if (!summary) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  res.status(201).json(summary);
};
