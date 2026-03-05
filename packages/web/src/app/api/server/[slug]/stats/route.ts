import { createSupabaseServer } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const SENSITIVITY_BANDS = { low: 280, mid: 380 } as const;
const STATS_CACHE_TTL_MS = 60_000;

// Simple in-memory cache (single instance — good enough for MVP)
const cache = new Map<string, { data: object; expires: number }>();

function getCached(key: string) {
  const entry = cache.get(key);
  if (entry && entry.expires > Date.now()) return entry.data;
  cache.delete(key);
  return null;
}

function setCached(key: string, data: object) {
  cache.set(key, { data, expires: Date.now() + STATS_CACHE_TTL_MS });
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return Math.round(sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo));
}

function topCounts(rows: Array<Record<string, unknown>>, field: string, limit = 5) {
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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const cached = getCached(`stats:${slug}`);
  if (cached) return NextResponse.json(cached);

  const supabase = await createSupabaseServer();

  const { data: server, error } = await supabase
    .from('servers')
    .select('id, slug, name, is_public')
    .eq('slug', slug)
    .single();

  if (error || !server) {
    return NextResponse.json({ error: 'Server not found' }, { status: 404 });
  }

  if (!server.is_public) {
    return NextResponse.json({ error: 'Server is not public' }, { status: 404 });
  }

  // Fetch all member setups via the server_stats_raw view
  const { data: rows } = await supabase
    .from('server_stats_raw')
    .select('dpi, general_sens, edpi, mouse, keyboard, headset')
    .eq('server_id', server.id);

  const stats = rows || [];
  const memberCount = stats.length;

  // DPI distribution
  const dpiCounts: Record<number, number> = {};
  for (const row of stats) {
    dpiCounts[row.dpi] = (dpiCounts[row.dpi] || 0) + 1;
  }
  const dpiDistribution = Object.entries(dpiCounts)
    .map(([dpi, count]) => ({ dpi: Number(dpi), count }))
    .sort((a, b) => a.dpi - b.dpi);

  // Sensitivity bands: low < 280, mid 280-379, high >= 380
  const bands = { low: 0, mid: 0, high: 0 };
  const edpiSorted: number[] = [];
  for (const row of stats) {
    const edpi = Number(row.edpi);
    if (edpi > 0) {
      edpiSorted.push(edpi);
      if (edpi < SENSITIVITY_BANDS.low) bands.low++;
      else if (edpi < SENSITIVITY_BANDS.mid) bands.mid++;
      else bands.high++;
    }
  }
  edpiSorted.sort((a, b) => a - b);

  // eDPI percentiles
  const edpiPercentiles = {
    p25: percentile(edpiSorted, 25),
    p50: percentile(edpiSorted, 50),
    p75: percentile(edpiSorted, 75),
  };

  // Top gear (top 5 per category)
  const topGear = {
    mouse: topCounts(stats, 'mouse'),
    keyboard: topCounts(stats, 'keyboard'),
    headset: topCounts(stats, 'headset'),
  };

  const result = {
    server: { slug: server.slug, name: server.name, member_count: memberCount },
    stats: {
      dpi_distribution: dpiDistribution,
      sensitivity_bands: bands,
      edpi_percentiles: edpiPercentiles,
      top_gear: topGear,
    },
  };

  setCached(`stats:${slug}`, result);
  return NextResponse.json(result);
}
