export type Source = {
  documentTitle: string;
  chunkIndex: number;
};

export function formatSources(sources: Source[]): Source[] {
  const seen = new Set<string>();
  return sources.filter((s) => {
    const key = `${s.documentTitle}-${s.chunkIndex}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
