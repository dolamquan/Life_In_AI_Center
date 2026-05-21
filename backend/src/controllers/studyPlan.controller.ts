import type { Request, Response } from 'express';
import { createStudyGoal, type StudyGoalType } from '../services/studyGoal.service';
import {
  generateStudyPlan,
  getStudyPlan,
  completeStudyPlanItem,
} from '../services/studyPlan.service';

export const postStudyGoal = async (req: Request, res: Response) => {
  const tutorId = parseInt(req.params['tutorId'] as string, 10);
  const { goalText, goalType } = req.body as { goalText?: string; goalType?: StudyGoalType };

  if (isNaN(tutorId)) { res.status(400).json({ error: 'Invalid tutor id' }); return; }
  if (!goalText || !goalType) { res.status(400).json({ error: 'goalText and goalType are required' }); return; }

  const goal = await createStudyGoal(tutorId, goalText, goalType);
  if (!goal) { res.status(404).json({ error: 'Tutor not found' }); return; }

  res.status(201).json(goal);
};

export const postGenerateStudyPlan = async (req: Request, res: Response) => {
  const tutorId = parseInt(req.params['tutorId'] as string, 10);
  const { studyGoalId } = req.body as { studyGoalId?: number };

  if (isNaN(tutorId)) { res.status(400).json({ error: 'Invalid tutor id' }); return; }
  if (!studyGoalId) { res.status(400).json({ error: 'studyGoalId is required' }); return; }

  const plan = await generateStudyPlan(studyGoalId);
  if (!plan) { res.status(404).json({ error: 'Study goal not found' }); return; }

  res.status(201).json(plan);
};

export const getStudyPlanById = async (req: Request, res: Response) => {
  const studyPlanId = parseInt(req.params['studyPlanId'] as string, 10);

  if (isNaN(studyPlanId)) { res.status(400).json({ error: 'Invalid study plan id' }); return; }

  const plan = await getStudyPlan(studyPlanId);
  if (!plan) { res.status(404).json({ error: 'Study plan not found' }); return; }

  res.json(plan);
};

export const patchCompleteItem = async (req: Request, res: Response) => {
  const itemId = parseInt(req.params['itemId'] as string, 10);

  if (isNaN(itemId)) { res.status(400).json({ error: 'Invalid item id' }); return; }

  const item = await completeStudyPlanItem(itemId);
  if (!item) { res.status(404).json({ error: 'Study plan item not found' }); return; }

  res.json(item);
};
