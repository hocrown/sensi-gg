'use client';

import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Users, MousePointer, Zap, Clock, Palette } from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { useTheme, type ThemeColors } from '@/lib/theme';
import { SENSITIVITY_BANDS } from '@sensi-gg/shared';

interface GearItem {
  name: string;
  count: number;
}

interface DpiDistributionEntry {
  dpi: number;
  count: number;
}

interface ByDpiEntry {
  dpi: number;
  total: number;
  low: number;
  mid: number;
  high: number;
}

interface EdpiQuantiles {
  p25: number;
  p50: number;
  p75: number;
}

interface UserServer {
  slug: string;
  name: string;
  icon_url: string | null;
}

export interface ServerStatsProps {
  serverName: string;
  serverSlug: string;
  userServers?: UserServer[];
  memberCount: number;
  topDpi: number | null;
  avgEdpi: number | null;
  lastUpdatedLabel: string | null;
  dpiDistribution: DpiDistributionEntry[];
  byDpi: ByDpiEntry[];
  topDpiEdpi: number[];
  edpiQuantiles: EdpiQuantiles;
  bands: { low: number; mid: number; high: number };
  topGear: {
    mouse: GearItem[];
    keyboard: GearItem[];
    headset: GearItem[];
  };
}

function GlassCard({ children, className = '', colors }: { children: React.ReactNode; className?: string; colors: ThemeColors }) {
  return (
    <div
      className={`backdrop-blur-xl rounded-2xl shadow-xl ${className}`}
      style={{
        backgroundColor: colors.cardBg,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: colors.cardBorder,
      }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children, accentColor }: { children: React.ReactNode; accentColor: string }) {
  return (
    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2.5" style={{ color: '#fff' }}>
      <span className="w-1 h-6 rounded-full" style={{ backgroundColor: accentColor }} />
      {children}
    </h2>
  );
}

function ThemeToggle() {
  const { mode, setMode, colors } = useTheme();

  return (
    <button
      onClick={() => setMode(mode === 'sensi' ? 'figma' : 'sensi')}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all hover:scale-105"
      style={{
        backgroundColor: `${colors.accent}15`,
        borderColor: `${colors.accent}40`,
        color: colors.accent,
      }}
      title={mode === 'sensi' ? 'Switch to Figma theme' : 'Switch to SENSI.GG theme'}
    >
      <Palette size={14} />
      {mode === 'sensi' ? 'SENSI.GG' : 'Figma'}
    </button>
  );
}

export function ServerStatsClient({
  serverName,
  serverSlug,
  userServers,
  memberCount,
  topDpi,
  avgEdpi,
  lastUpdatedLabel,
  dpiDistribution,
  byDpi,
  topDpiEdpi,
  edpiQuantiles,
  bands,
  topGear,
}: ServerStatsProps) {
  const { t } = useLang();
  const { colors } = useTheme();
  const hasData = memberCount > 0;
  const showSwitcher = userServers && userServers.length > 1;

  const tooltipStyle = {
    backgroundColor: colors.tooltipBg,
    border: `1px solid ${colors.cardBorder}`,
    borderRadius: '8px',
    color: colors.textPrimary,
    fontSize: '12px',
  };

  // Build stacked bar data
  const stackedData = byDpi.map(({ dpi, total, low, mid, high }) => ({
    dpi: String(dpi),
    Low: total > 0 ? Math.round((low / total) * 100) : 0,
    Mid: total > 0 ? Math.round((mid / total) * 100) : 0,
    High: total > 0 ? Math.round((high / total) * 100) : 0,
    total,
  }));

  const dpiChartData = dpiDistribution.map(({ dpi, count }) => ({
    dpi: String(dpi),
    count,
  }));

  return (
    <div className="max-w-3xl mx-auto">
      {/* Server Switcher + Theme Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide flex-1">
          {showSwitcher &&
            userServers.map((s) => {
              const isActive = s.slug === serverSlug;
              return (
                <Link
                  key={s.slug}
                  href={`/s/${s.slug}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium whitespace-nowrap transition-all"
                  style={{
                    backgroundColor: isActive ? `${colors.accent}15` : 'rgba(255,255,255,0.05)',
                    borderColor: isActive ? `${colors.accent}40` : 'rgba(255,255,255,0.1)',
                    color: isActive ? colors.accent : 'rgba(255,255,255,0.5)',
                    boxShadow: isActive ? `0 0 12px ${colors.accent}25` : 'none',
                  }}
                >
                  {s.icon_url ? (
                    <img src={s.icon_url} alt="" className="w-5 h-5 rounded-full" />
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">
                      {s.name?.charAt(0) ?? '?'}
                    </span>
                  )}
                  {s.name}
                </Link>
              );
            })}
        </div>
        <ThemeToggle />
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: colors.textPrimary }}>
          {serverName}
        </h1>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm" style={{ color: colors.textMuted }}>
          <span>{t.stats.memberCount} {memberCount}{t.stats.members}</span>
          {lastUpdatedLabel && <span>· {t.stats.lastUpdate} {lastUpdatedLabel}</span>}
        </div>
      </div>

      {/* CTA */}
      <Link
        href="/setup/me"
        className="block w-full text-center px-6 py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity mb-8"
        style={{ backgroundColor: colors.ctaBg, color: colors.ctaText }}
      >
        {t.stats.registerCta}
      </Link>

      {!hasData ? (
        <GlassCard className="p-8 text-center" colors={colors}>
          <p className="text-sm" style={{ color: colors.textMuted }}>{t.stats.noData}</p>
          <p className="text-xs mt-1" style={{ color: colors.textMuted }}>{t.stats.registerFirst}</p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {/* Overview stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: <Users size={16} />, iconColor: colors.iconColors.members, label: t.stats.memberCount, value: String(memberCount), large: true },
              { icon: <MousePointer size={16} />, iconColor: colors.iconColors.topDpi, label: t.stats.topDpi, value: topDpi !== null ? String(topDpi) : '—', large: true },
              { icon: <Zap size={16} />, iconColor: colors.iconColors.avgEdpi, label: t.stats.avgEdpi, value: avgEdpi !== null ? Math.round(avgEdpi).toLocaleString() : '—', large: true },
              { icon: <Clock size={16} />, iconColor: colors.iconColors.lastUpdate, label: t.stats.lastUpdate, value: lastUpdatedLabel ?? '—', large: false },
            ].map(({ icon, iconColor, label, value, large }) => (
              <GlassCard key={label} className="p-4" colors={colors}>
                <div className="flex items-center gap-2 mb-2">
                  <span style={{ color: iconColor }}>{icon}</span>
                  <p className="text-xs" style={{ color: colors.textMuted }}>{label}</p>
                </div>
                <p
                  className={`font-bold ${large ? 'text-2xl' : 'text-sm font-semibold'}`}
                  style={{ color: colors.textPrimary }}
                >
                  {value}
                </p>
              </GlassCard>
            ))}
          </div>

          {/* DPI Distribution */}
          <GlassCard className="p-6" colors={colors}>
            <SectionTitle accentColor={colors.sectionAccents.dpi}>{t.stats.dpiDistribution}</SectionTitle>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dpiChartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                <XAxis dataKey="dpi" stroke={colors.axisStroke} style={{ fontSize: '11px' }} />
                <YAxis stroke={colors.axisStroke} style={{ fontSize: '11px' }} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v) => [`${v}${t.stats.members}`, t.stats.memberCount]}
                />
                <Bar dataKey="count" fill={colors.chartBar1} radius={[6, 6, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Sensitivity Bands per DPI */}
          <GlassCard className="p-6" colors={colors}>
            <SectionTitle accentColor={colors.sectionAccents.sens}>{t.stats.sensBands}</SectionTitle>
            <p className="text-xs mb-3" style={{ color: colors.textMuted }}>
              {t.stats.low} &lt;{SENSITIVITY_BANDS.low} eDPI · {t.stats.mid} {SENSITIVITY_BANDS.low}–{SENSITIVITY_BANDS.mid - 1} · {t.stats.high} {SENSITIVITY_BANDS.mid}+
            </p>
            {/* Legend */}
            <div className="flex gap-4 mb-4 text-xs" style={{ color: colors.textSecondary }}>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: colors.bandLow, opacity: 0.7 }} />
                {t.stats.low}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: colors.bandMid, opacity: 0.7 }} />
                {t.stats.mid}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: colors.bandHigh, opacity: 0.6 }} />
                {t.stats.high}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={Math.max(160, stackedData.length * 44)}>
              <BarChart
                layout="vertical"
                data={stackedData}
                margin={{ top: 0, right: 8, left: 24, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" horizontal={false} />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  stroke={colors.axisStroke}
                  style={{ fontSize: '10px' }}
                  tickFormatter={(v) => `${v}%`}
                />
                <YAxis
                  type="category"
                  dataKey="dpi"
                  stroke={colors.axisStroke}
                  style={{ fontSize: '11px' }}
                  width={36}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v, name) => [`${v}%`, name]}
                />
                <Bar dataKey="Low" stackId="a" fill={colors.bandLow} fillOpacity={0.7} isAnimationActive={false} />
                <Bar dataKey="Mid" stackId="a" fill={colors.bandMid} fillOpacity={0.7} isAnimationActive={false} />
                <Bar dataKey="High" stackId="a" fill={colors.bandHigh} fillOpacity={0.6} radius={[0, 4, 4, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* TOP DPI eDPI Quantiles */}
          {topDpi !== null && topDpiEdpi.length > 0 && (
            <GlassCard className="p-6" colors={colors}>
              <SectionTitle accentColor={colors.sectionAccents.edpi}>{t.stats.edpiQuantiles}</SectionTitle>
              <p className="text-xs mb-4" style={{ color: colors.textMuted }}>
                {topDpi} DPI · {topDpiEdpi.length}{t.stats.basedOn}
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'p25', value: edpiQuantiles.p25 },
                  { label: `p50 (${t.stats.median})`, value: edpiQuantiles.p50 },
                  { label: 'p75', value: edpiQuantiles.p75 },
                ].map(({ label, value }) => (
                  <GlassCard key={label} className="p-4 text-center" colors={colors}>
                    <p className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                      {value.toLocaleString()}
                    </p>
                    <p className="text-xs mt-1" style={{ color: colors.textMuted }}>{label}</p>
                  </GlassCard>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Popular Gear */}
          <GlassCard className="p-6" colors={colors}>
            <SectionTitle accentColor={colors.sectionAccents.gear}>{t.stats.popularGear}</SectionTitle>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {[
                { label: t.stats.mouse, items: topGear.mouse },
                { label: t.stats.keyboard, items: topGear.keyboard },
                { label: t.stats.headset, items: topGear.headset },
              ].map(({ label, items }) => (
                <div key={label}>
                  <h3
                    className="text-xs font-semibold uppercase tracking-wider mb-3"
                    style={{ color: colors.textSecondary }}
                  >
                    {label}
                  </h3>
                  {items.length === 0 ? (
                    <p className="text-xs" style={{ color: colors.textMuted }}>{t.stats.noGearData}</p>
                  ) : (
                    <ol className="space-y-2">
                      {items.map((item, i) => (
                        <li
                          key={item.name}
                          className="flex items-center gap-2 py-2 px-3 rounded-xl transition-colors hover:brightness-110"
                          style={{
                            backgroundColor: 'rgba(13,13,32,0.3)',
                            borderWidth: 1,
                            borderStyle: 'solid',
                            borderColor: 'rgba(255,255,255,0.05)',
                          }}
                        >
                          <span
                            className="flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold shrink-0"
                            style={{
                              backgroundColor: colors.rankBg[i] ?? colors.rankBg[4],
                              color: colors.rankText[i] ?? colors.rankText[4],
                              borderWidth: 1,
                              borderStyle: 'solid',
                              borderColor: colors.rankBorder[i] ?? colors.rankBorder[4],
                            }}
                          >
                            #{i + 1}
                          </span>
                          <span className="text-xs flex-1 truncate" style={{ color: colors.textSecondary }}>
                            {item.name}
                          </span>
                          <span className="text-xs shrink-0" style={{ color: colors.textMuted }}>
                            {item.count}
                          </span>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
