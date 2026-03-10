export function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return Math.round(sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo));
}

export function topCounts(rows: Array<Record<string, unknown>>, field: string, limit = 5) {
  const counts: Record<string, number> = {};
  for (const row of rows) {
    const val = row[field];
    if (val && typeof val === 'string') {
      counts[val] = (counts[val] || 0) + 1;
    }
  }
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
