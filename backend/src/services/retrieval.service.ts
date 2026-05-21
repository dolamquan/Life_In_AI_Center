import prisma from '../config/prisma';
import { generateEmbedding } from './embedding.service';
import { queryChunks } from './vector.service';

export type RetrievedChunk = {
  text: string;
  documentTitle: string;
  chunkIndex: number;
  documentId: number;
};

function normalizeQuery(question: string) {
  return question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= 3);
}

function scoreChunk(content: string, tokens: string[]) {
  const haystack = content.toLowerCase();
  let score = 0;

  for (const token of tokens) {
    if (haystack.includes(token)) {
      score += 1;
    }
  }

  return score;
}

async function fallbackKeywordSearch(question: string, topK: number): Promise<RetrievedChunk[]> {
  const tokens = normalizeQuery(question);
  if (tokens.length === 0) {
    return [];
  }

  const allChunks = await prisma.documentChunk.findMany({
    include: {
      document: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  return allChunks
    .map((chunk) => ({
      text: chunk.content,
      documentTitle: chunk.document.title,
      chunkIndex: chunk.chunkIndex,
      documentId: chunk.document.id,
      score: scoreChunk(chunk.content, tokens),
    }))
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => b.score - a.score || a.chunkIndex - b.chunkIndex)
    .slice(0, topK)
    .map(({ score: _score, ...chunk }) => chunk);
}

export async function retrieveRelevantChunks(
  question: string,
  topK = 5
): Promise<RetrievedChunk[]> {
  try {
    const embedding = await generateEmbedding(question);
    const results = await queryChunks(embedding, topK);

    const docs = results.documents?.[0] ?? [];
    const metas = results.metadatas?.[0] ?? [];

    const chunks: RetrievedChunk[] = [];

    for (let i = 0; i < docs.length; i++) {
      const text = docs[i];
      const meta = metas[i];
      if (!text || !meta) continue;

      chunks.push({
        text,
        documentTitle: String(meta['title'] ?? 'Unknown Source'),
        chunkIndex: Number(meta['chunkIndex'] ?? 0),
        documentId: Number(meta['documentId'] ?? 0),
      });
    }

    if (chunks.length > 0) {
      return chunks;
    }
  } catch (error) {
    console.warn('Vector retrieval failed, falling back to SQLite keyword search.', error);
  }

  return fallbackKeywordSearch(question, topK);
}
