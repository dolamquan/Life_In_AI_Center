import express from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health.routes';
import { tutorRouter } from './routes/tutor.routes';
import { chatRouter } from './routes/chat.routes';
import { studyPlanRouter } from './routes/studyPlan.routes';
import { questionRouter } from './routes/question.routes';

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN ?? '*' }));
app.use(express.json());

app.use('/api', healthRouter);
app.use('/api/tutors', tutorRouter);
app.use('/api/chat', chatRouter);
app.use('/api', studyPlanRouter);
app.use('/api/questions', questionRouter);

export default app;
