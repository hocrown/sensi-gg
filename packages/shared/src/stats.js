// @sensi-gg/shared — Stats utility functions

/**
 * Calculate eDPI (effective DPI)
 * @param {number} dpi
 * @param {number} generalSens
 * @returns {number}
 */
export function calculateEdpi(dpi, generalSens) {
  return Math.round(dpi * generalSens);
}

/**
 * Calculate percentile from a sorted array
 * @param {number[]} sorted - ascending sorted numbers
 * @param {number} p - percentile (0-100)
 * @returns {number}
 */
export function percentile(sorted, p) {
  if (sorted.length === 0) return 0;
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return Math.round(sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo));
}

/**
 * Count top N items by frequency
 * @param {Array<Record<string, unknown>>} rows
 * @param {string} field
 * @param {number} [limit=5]
 * @returns {Array<{name: string, count: number}>}
 */
export function topCounts(rows, field, limit = 5) {
  const counts = {};
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
