import { createSupabaseServer } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { SENSITIVITY_BANDS, percentile, topCounts } from '@sensi-gg/shared';
import { ServerStatsClient } from '@/components/ServerStatsClient';

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
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
    description: `${server.name} 서버 세팅 통계 on SENSI.GG`,
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

  // Get user's server list for the server switcher
  const { data: { user } } = await supabase.auth.getUser();
  let userServers: { slug: string; name: string; icon_url: string | null }[] = [];

  if (user) {
    const { data: memberships } = await supabase
      .from('server_memberships')
      .select('servers(slug, name, icon_url)')
      .eq('profile_id', user.id);

    if (memberships) {
      userServers = memberships
        .map((m) => m.servers as unknown as { slug: string; name: string; icon_url: string | null } | null)
        .filter((s): s is { slug: string; name: string; icon_url: string | null } => s !== null);
    }
  }

  // Fetch raw stats from the view (include profile_id for lastUpdateAt lookup)
  const { data: rows } = await supabase
    .from('server_stats_raw')
    .select('profile_id, dpi, general_sens, edpi, mouse, keyboard, headset')
    .eq('server_id', server.id);

  const stats = rows || [];
  const memberCount = stats.length;

  // Get lastUpdateAt from setups for this server's members
  let lastUpdateAt: string | null = null;
  if (memberCount > 0) {
    const profileIds = stats.map((r) => r.profile_id as string);
    const { data: lastSetup } = await supabase
      .from('setups')
      .select('updated_at')
      .in('profile_id', profileIds)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();
    lastUpdateAt = (lastSetup as { updated_at: string } | null)?.updated_at ?? null;
  }

  // DPI distribution
  const dpiCounts: Record<number, number> = {};
  for (const row of stats) {
    dpiCounts[row.dpi] = (dpiCounts[row.dpi] || 0) + 1;
  }
  const dpiDistribution = Object.entries(dpiCounts)
    .map(([dpi, count]) => ({ dpi: Number(dpi), count }))
    .sort((a, b) => a.dpi - b.dpi);

  // Sensitivity bands overall + byDpi breakdown
  const bands = { low: 0, mid: 0, high: 0 };
  const byDpiMap: Record<number, { total: number; low: number; mid: number; high: number }> = {};

  const edpiValues: number[] = [];

  for (const row of stats) {
    const edpi = Number(row.edpi);
    const dpi = Number(row.dpi);
    if (edpi > 0) {
      edpiValues.push(edpi);
      if (!byDpiMap[dpi]) byDpiMap[dpi] = { total: 0, low: 0, mid: 0, high: 0 };
      byDpiMap[dpi].total++;
      if (edpi < SENSITIVITY_BANDS.low) {
        bands.low++;
        byDpiMap[dpi].low++;
      } else if (edpi < SENSITIVITY_BANDS.mid) {
        bands.mid++;
        byDpiMap[dpi].mid++;
      } else {
        bands.high++;
        byDpiMap[dpi].high++;
      }
    }
  }

  const avgEdpi =
    edpiValues.length > 0
      ? edpiValues.reduce((sum, v) => sum + v, 0) / edpiValues.length
      : null;

  const byDpi = Object.entries(byDpiMap)
    .map(([dpi, counts]) => ({ dpi: Number(dpi), ...counts }))
    .sort((a, b) => a.dpi - b.dpi);

  // TOP DPI = DPI with highest member count
  const topDpiEntry = dpiDistribution.length > 0
    ? dpiDistribution.reduce((best, cur) => cur.count > best.count ? cur : best)
    : null;
  const topDpi = topDpiEntry?.dpi ?? null;

  // Percentiles for TOP DPI group only
  const topDpiEdpi = topDpi !== null
    ? stats
        .filter((r) => Number(r.dpi) === topDpi && Number(r.edpi) > 0)
        .map((r) => Number(r.edpi))
        .sort((a, b) => a - b)
    : [];

  const edpiQuantiles = {
    p25: percentile(topDpiEdpi, 25),
    p50: percentile(topDpiEdpi, 50),
    p75: percentile(topDpiEdpi, 75),
  };

  const topGear = {
    mouse: topCounts(stats, 'mouse'),
    keyboard: topCounts(stats, 'keyboard'),
    headset: topCounts(stats, 'headset'),
  };

  const lastUpdatedLabel = lastUpdateAt
    ? new Date(lastUpdateAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <ServerStatsClient
      serverName={server.name}
      serverSlug={server.slug}
      userServers={userServers}
      memberCount={memberCount}
      topDpi={topDpi}
      avgEdpi={avgEdpi}
      lastUpdatedLabel={lastUpdatedLabel}
      dpiDistribution={dpiDistribution}
      byDpi={byDpi}
      topDpiEdpi={topDpiEdpi}
      edpiQuantiles={edpiQuantiles}
      bands={bands}
      topGear={topGear}
    />
  );
}
