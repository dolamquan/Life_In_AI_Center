/// <reference types="node" />
import 'dotenv/config';
import path from 'path';
import fs from 'fs';
import prisma from '../config/prisma';
import { extractText } from '../services/textExtraction.service';
import { chunkText } from '../services/chunking.service';
import { generateEmbedding } from '../services/embedding.service';
import { addChunks } from '../services/vector.service';

const ASSET_DIR = path.resolve(__dirname, '../../Asset');
const SUPPORTED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.txt'];

async function ingestFile(filePath: string, tutorId: number) {
  const fileName = path.basename(filePath);
  const title = path.basename(filePath, path.extname(filePath)).replace(/[_-]/g, ' ');

  console.log(`\nProcessing: ${fileName}`);
  console.log('  Extracting text...');

  const rawText = await extractText(filePath);
  if (!rawText.trim()) {
    console.log('  No text extracted - skipping.');
    return;
  }

  const existing = await prisma.document.findFirst({ where: { fileName, tutorId } });
  const document = existing
    ? await prisma.document.update({
        where: { id: existing.id },
        data: { title, fileName, rawText },
      })
    : await prisma.document.create({
        data: { tutorId, title, fileName, rawText },
      });

  if (existing) {
    console.log('  Existing document found - refreshing stored chunks and vectors.');
    await prisma.documentChunk.deleteMany({ where: { documentId: document.id } });
  }

  const chunks = chunkText(rawText);
  console.log(`  Split into ${chunks.length} chunks`);

  const chromaChunks: {
    id: string;
    text: string;
    embedding: number[];
    metadata: Record<string, string | number>;
  }[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i] as string;

    await prisma.documentChunk.create({
      data: { documentId: document.id, chunkIndex: i, content: chunk },
    });

    try {
      process.stdout.write(`  Embedding chunk ${i + 1}/${chunks.length}...\r`);
      const embedding = await generateEmbedding(chunk);

      chromaChunks.push({
        id: `doc-${document.id}-chunk-${i}`,
        text: chunk,
        embedding,
        metadata: { documentId: document.id, chunkIndex: i, fileName, title },
      });
    } catch (error) {
      console.warn(`  Embedding failed for chunk ${i + 1}; keeping SQLite chunk for keyword fallback.`, error);
    }
  }

  if (chromaChunks.length > 0) {
    await addChunks(chromaChunks);
    console.log(`  Done: saved ${chunks.length} chunks to SQLite and ${chromaChunks.length} vectors to ChromaDB`);
    return;
  }

  console.log(`  Done: saved ${chunks.length} chunks to SQLite. ChromaDB was skipped because embeddings failed.`);
}

async function main() {
  console.log('Starting ingestion...');
  console.log(`Asset folder: ${ASSET_DIR}`);

  const tutor = await prisma.tutor.findUnique({ where: { slug: 'confirmation-bias-tutor' } });
  if (!tutor) {
    console.error('Tutor not found. Run `npm run db:seed` first.');
    process.exit(1);
  }

  const files = fs
    .readdirSync(ASSET_DIR)
    .filter((file) => SUPPORTED_EXTENSIONS.includes(path.extname(file).toLowerCase()))
    .map((file) => path.join(ASSET_DIR, file));

  if (files.length === 0) {
    console.error('No supported files found in Asset folder.');
    process.exit(1);
  }

  console.log(`Found ${files.length} file(s) to process.`);

  for (const filePath of files) {
    try {
      await ingestFile(filePath, tutor.id);
    } catch (error) {
      console.error(`Failed to ingest ${path.basename(filePath)}. Continuing with remaining files.`, error);
    }
  }

  console.log('\nIngestion complete.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
