import { Router } from 'express';
import {
  postStudyGoal,
  postGenerateStudyPlan,
  getStudyPlanById,
  patchCompleteItem,
} from '../controllers/studyPlan.controller';

export const studyPlanRouter = Router();

// Phase 9
studyPlanRouter.post('/tutors/:tutorId/study-goals', postStudyGoal);
studyPlanRouter.post('/tutors/:tutorId/study-plans/generate', postGenerateStudyPlan);
studyPlanRouter.get('/study-plans/:studyPlanId', getStudyPlanById);

// Phase 10
studyPlanRouter.patch('/study-plans/items/:itemId/complete', patchCompleteItem);
