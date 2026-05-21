import { getChatCompletion } from './openai.service';
import { getSystemPrompt, type TutorMode } from './prompt.service';
import { retrieveRelevantChunks, type RetrievedChunk } from './retrieval.service';
import { formatSources, type Source } from './source.service';

type HistoryMessage = { role: string; content: string };

export type RagResult = {
  answer: string;
  sources: Source[];
};

// Hybrid retrieves more chunks to give the LLM richer source material to extend from
const TOP_K_BY_MODE: Record<TutorMode, number> = {
  DOCUMENT_GROUNDED: 5,
  HYBRID: 8,
};

function buildContextBlock(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) return '';
  return chunks
    .map((c, i) => `[Source ${i + 1}: ${c.documentTitle}]\n${c.text}`)
    .join('\n\n');
}

export async function ragAnswer(
  userQuestion: string,
  history: HistoryMessage[],
  mode: TutorMode,
  lessonContext?: string
): Promise<RagResult> {
  const topK = TOP_K_BY_MODE[mode];
  const chunks = await retrieveRelevantChunks(userQuestion, topK);
  const context = buildContextBlock(chunks);

  const systemPrompt = getSystemPrompt(mode, context || undefined, lessonContext);

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...history.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  ];

  const answer = await getChatCompletion(messages);

  const sources = formatSources(
    chunks.map((c) => ({ documentTitle: c.documentTitle, chunkIndex: c.chunkIndex }))
  );

  return { answer, sources };
}
