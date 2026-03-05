import { createSupabaseServer } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

const SENSITIVITY_BANDS = { low: 280, mid: 380 } as const;

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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createSupabaseServer();

  const { data: server } = await supabase
    .from('servers')
    .select('name')
    .eq('slug', slug)
    .single();

  if (!server) return { title: 'Not Found - SENSI.GG' };

  return {
    title: `${server.name} - SENSI.GG`,
    description: `${server.name} server stats on SENSI.GG`,
  };
}

export default async function ServerPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createSupabaseServer();

  const { data: server } = await supabase
    .from('servers')
    .select('id, slug, name, is_public')
    .eq('slug', slug)
    .single();

  if (!server || !server.is_public) notFound();

  // Fetch raw stats from the view
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

  // Sensitivity bands
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

  const edpiPercentiles = {
    p25: percentile(edpiSorted, 25),
    p50: percentile(edpiSorted, 50),
    p75: percentile(edpiSorted, 75),
  };

  const topGear = {
    mouse: topCounts(stats, 'mouse'),
    keyboard: topCounts(stats, 'keyboard'),
    headset: topCounts(stats, 'headset'),
  };

  const hasData = memberCount > 0;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-cloud-white mb-2">{server.name}</h1>
        <p className="text-text-muted text-sm">{memberCount} member{memberCount !== 1 ? 's' : ''} with setups</p>
      </div>

      {/* CTA */}
      <Link
        href="/setup/me"
        className="block w-full text-center px-6 py-3 rounded-lg bg-fairy-gold text-night-indigo font-semibold text-sm hover:bg-fairy-gold/90 transition-colors mb-8"
      >
        Register my setup
      </Link>

      {!hasData ? (
        <div className="rounded-xl border border-deep-periwinkle/50 bg-soft-navy/40 p-8 text-center">
          <p className="text-text-muted text-sm">No setups registered yet.</p>
          <p className="text-text-muted text-xs mt-1">Be the first to register your setup!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* DPI Distribution */}
          <section className="rounded-xl border border-deep-periwinkle/50 bg-soft-navy/40 p-6">
            <h2 className="text-fairy-gold font-semibold text-lg mb-4">DPI Distribution</h2>
            <div className="space-y-2">
              {dpiDistribution.map(({ dpi, count }) => {
                const pct = Math.round((count / memberCount) * 100);
                return (
                  <div key={dpi} className="flex items-center gap-3">
                    <span className="text-text-secondary text-sm w-16 text-right">{dpi}</span>
                    <div className="flex-1 bg-night-indigo rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-fairy-gold/70 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-text-muted text-xs w-12">{count} ({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Sensitivity Bands */}
          <section className="rounded-xl border border-deep-periwinkle/50 bg-soft-navy/40 p-6">
            <h2 className="text-fairy-gold font-semibold text-lg mb-4">
              Sensitivity Bands
              <span className="text-text-muted text-xs font-normal ml-2">
                Low &lt;{SENSITIVITY_BANDS.low} eDPI · Mid {SENSITIVITY_BANDS.low}–{SENSITIVITY_BANDS.mid - 1} · High {SENSITIVITY_BANDS.mid}+
              </span>
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Low', value: bands.low, color: 'text-mist-blue' },
                { label: 'Mid', value: bands.mid, color: 'text-fairy-gold' },
                { label: 'High', value: bands.high, color: 'text-cloud-white' },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center">
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  <p className="text-text-muted text-xs mt-1">{label}</p>
                  <p className="text-text-muted text-xs">
                    {memberCount > 0 ? Math.round((value / memberCount) * 100) : 0}%
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* eDPI Percentiles */}
          <section className="rounded-xl border border-deep-periwinkle/50 bg-soft-navy/40 p-6">
            <h2 className="text-fairy-gold font-semibold text-lg mb-4">eDPI Percentiles</h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'p25', value: edpiPercentiles.p25 },
                { label: 'p50 (median)', value: edpiPercentiles.p50 },
                { label: 'p75', value: edpiPercentiles.p75 },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="text-2xl font-bold text-cloud-white">{value.toLocaleString()}</p>
                  <p className="text-text-muted text-xs mt-1">{label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Top Gear */}
          <section className="rounded-xl border border-deep-periwinkle/50 bg-soft-navy/40 p-6">
            <h2 className="text-fairy-gold font-semibold text-lg mb-4">Top Gear (Top 5)</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {[
                { label: 'Mouse', items: topGear.mouse },
                { label: 'Keyboard', items: topGear.keyboard },
                { label: 'Headset', items: topGear.headset },
              ].map(({ label, items }) => (
                <div key={label}>
                  <h3 className="text-text-secondary text-sm font-medium mb-2">{label}</h3>
                  {items.length === 0 ? (
                    <p className="text-text-muted text-xs">No data</p>
                  ) : (
                    <ol className="space-y-1">
                      {items.map((item, i) => (
                        <li key={item.name} className="flex items-center gap-2 text-sm">
                          <span className="text-text-muted text-xs w-4">{i + 1}.</span>
                          <span className="text-text-secondary flex-1 truncate">{item.name}</span>
                          <span className="text-text-muted text-xs">{item.count}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
