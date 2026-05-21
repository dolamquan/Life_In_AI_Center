import { ChromaClient } from 'chromadb';

const COLLECTION_NAME = 'confirmation-bias-chunks';

function getClient() {
  return new ChromaClient({ path: process.env.CHROMA_URL ?? 'http://localhost:8000' });
}

// Suppress the "cannot instantiate DefaultEmbeddingFunction" warning by
// providing a no-op — we always supply OpenAI embeddings manually.
const noopEmbeddingFunction = {
  generate: async (_texts: string[]): Promise<number[][]> => [],
};

export async function getOrCreateCollection() {
  const client = getClient();
  return client.getOrCreateCollection({
    name: COLLECTION_NAME,
    embeddingFunction: noopEmbeddingFunction,
  });
}

type ChunkInput = {
  id: string;
  text: string;
  embedding: number[];
  metadata: Record<string, string | number>;
};

export async function addChunks(chunks: ChunkInput[]) {
  const collection = await getOrCreateCollection();
  await collection.upsert({
    ids: chunks.map((c) => c.id),
    embeddings: chunks.map((c) => c.embedding),
    documents: chunks.map((c) => c.text),
    metadatas: chunks.map((c) => c.metadata),
  });
}

export async function queryChunks(queryEmbedding: number[], topK = 5) {
  const collection = await getOrCreateCollection();
  return collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: topK,
    include: ['documents', 'metadatas', 'distances'],
  });
}
