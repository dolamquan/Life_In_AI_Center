import { Router } from 'express';
import { postEvaluate } from '../controllers/question.controller';

export const questionRouter = Router();

// Phase 13
questionRouter.post('/:questionId/evaluate', postEvaluate);
