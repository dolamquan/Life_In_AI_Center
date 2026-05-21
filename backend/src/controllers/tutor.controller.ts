import type { Request, Response } from 'express';
import { getAllTutors, getTutorById } from '../services/tutor.service';
import { generateExamples } from '../services/examples.service';
import { type TutorMode } from '../services/prompt.service';

export const getTutors = async (_req: Request, res: Response) => {
  const tutors = await getAllTutors();
  res.json(tutors);
};

export const getTutor = async (req: Request, res: Response) => {
  const id = parseInt(req.params['id'] as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: 'Invalid tutor id' }); return; }

  const tutor = await getTutorById(id);
  if (!tutor) { res.status(404).json({ error: 'Tutor not found' }); return; }

  res.json(tutor);
};

export const postExamples = async (req: Request, res: Response) => {
  const tutorId = parseInt(req.params['tutorId'] as string, 10);
  const { category, mode } = req.body as { category?: string; mode?: TutorMode };

  if (isNaN(tutorId)) { res.status(400).json({ error: 'Invalid tutor id' }); return; }
  if (!category) { res.status(400).json({ error: 'category is required' }); return; }

  const result = await generateExamples(tutorId, category, mode ?? 'DOCUMENT_GROUNDED');
  res.json(result);
};
