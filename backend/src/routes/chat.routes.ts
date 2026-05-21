import { Router } from 'express';
import { createChatSession, postMessage, getChatMessages } from '../controllers/chat.controller';
import { postQuestion } from '../controllers/question.controller';
import { postSessionSummary } from '../controllers/summary.controller';

export const chatRouter = Router();

chatRouter.post('/sessions', createChatSession);
chatRouter.post('/sessions/:sessionId/messages', postMessage);
chatRouter.get('/sessions/:sessionId/messages', getChatMessages);

// Phase 12
chatRouter.post('/sessions/:sessionId/questions', postQuestion);

// Phase 14
chatRouter.post('/sessions/:sessionId/summary', postSessionSummary);
