import { ragAnswer, type RagResult } from './rag.service';
import { type TutorMode } from './prompt.service';

type HistoryMessage = { role: string; content: string };

export async function routeToMode(
  history: HistoryMessage[],
  mode: TutorMode,
  userQuestion: string,
  lessonContext?: string
): Promise<RagResult> {
  return ragAnswer(userQuestion, history, mode, lessonContext);
}
