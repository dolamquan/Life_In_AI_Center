import type { Request, Response } from 'express';
import { generateQuestion } from '../services/question.service';
import { evaluateAnswer } from '../services/evaluation.service';
import { type TutorMode } from '../services/prompt.service';

type QuestionType = 'KNOWLEDGE' | 'REFLECTION';

export const postQuestion = async (req: Request, res: Response) => {
  const sessionId = parseInt(req.params['sessionId'] as string, 10);
  const { questionType } = req.body as { questionType?: QuestionType };

  if (isNaN(sessionId)) { res.status(400).json({ error: 'Invalid session id' }); return; }
  if (!questionType || !['KNOWLEDGE', 'REFLECTION'].includes(questionType)) {
    res.status(400).json({ error: 'questionType must be KNOWLEDGE or REFLECTION' });
    return;
  }

  const question = await generateQuestion(sessionId, questionType);
  if (!question) { res.status(404).json({ error: 'Session not found' }); return; }

  res.status(201).json(question);
};

export const postEvaluate = async (req: Request, res: Response) => {
  const questionId = parseInt(req.params['questionId'] as string, 10);
  const { answer, mode } = req.body as { answer?: string; mode?: TutorMode };

  if (isNaN(questionId)) { res.status(400).json({ error: 'Invalid question id' }); return; }
  if (!answer || answer.trim() === '') { res.status(400).json({ error: 'answer is required' }); return; }

  const evaluation = await evaluateAnswer(questionId, answer.trim(), mode);
  if (!evaluation) { res.status(404).json({ error: 'Question not found' }); return; }

  res.status(201).json(evaluation);
};
