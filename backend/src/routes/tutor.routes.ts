import { Router } from 'express';
import { getTutors, getTutor, postExamples } from '../controllers/tutor.controller';

export const tutorRouter = Router();

tutorRouter.get('/', getTutors);
tutorRouter.get('/:id', getTutor);
tutorRouter.post('/:tutorId/examples', postExamples);
