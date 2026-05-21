const CHUNK_SIZE = 800;
const OVERLAP = 100;

export function chunkText(text: string): string[] {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  const chunks: string[] = [];
  let start = 0;

  while (start < cleaned.length) {
    let end = start + CHUNK_SIZE;

    if (end < cleaned.length) {
      // Try to end at a sentence boundary to keep meaning intact
      const boundary = cleaned.lastIndexOf('. ', end);
      if (boundary > start + CHUNK_SIZE / 2) {
        end = boundary + 1;
      }
    }

    const chunk = cleaned.slice(start, Math.min(end, cleaned.length)).trim();
    if (chunk.length > 0) chunks.push(chunk);

    start = end - OVERLAP;
  }

  return chunks;
}
