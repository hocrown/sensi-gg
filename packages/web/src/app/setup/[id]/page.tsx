export const dynamic = 'force-dynamic';

import { createSupabaseServer } from '@/lib/supabase/server';
import { UserAvatar } from '@/components/UserAvatar';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function SetupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServer();

  const { data: setup } = await supabase
    .from('setups')
    .select('*, profiles!inner(display_name, discord_user_id, avatar_url, handle)')
    .eq('id', id)
    .single();

  if (!setup) notFound();

  const formatVal = (v: number | null | undefined) =>
    v != null ? String(v) : '—';

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-text-muted hover:text-cloud-white transition-colors mb-6 text-sm"
      >
        ← Gallery
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <UserAvatar
          src={setup.profiles.avatar_url}
          username={setup.profiles.display_name}
          size={56}
        />
        <div>
          <h1 className="text-2xl font-bold text-cloud-white">
            {setup.profiles.display_name}
          </h1>
          <p className="text-text-muted text-sm">
            {new Date(setup.updated_at).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Sensitivity */}
        <div className="rounded-xl border border-deep-periwinkle/50 bg-soft-navy/40 p-6">
          <h2 className="text-fairy-gold font-semibold text-lg mb-4">🎯 Sensitivity</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">DPI</span>
              <span className="text-cloud-white font-medium">{setup.dpi}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">General</span>
              <span className="text-cloud-white font-medium">{setup.general_sens}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">eDPI</span>
              <span className="text-fairy-gold font-medium">
                {Math.round(setup.dpi * setup.general_sens).toLocaleString()}
              </span>
            </div>
            {setup.vertical_multiplier != null && (
              <div className="flex justify-between">
                <span className="text-text-muted">Vertical</span>
                <span className="text-cloud-white font-medium">{setup.vertical_multiplier}</span>
              </div>
            )}
            {setup.ads_sens != null && (
              <div className="flex justify-between">
                <span className="text-text-muted">ADS</span>
                <span className="text-cloud-white font-medium">{setup.ads_sens}</span>
              </div>
            )}
          </div>
        </div>

        {/* Scopes */}
        {[setup.scope_2x, setup.scope_3x, setup.scope_4x, setup.scope_6x, setup.scope_8x, setup.scope_15x].some(v => v != null) && (
          <div className="rounded-xl border border-deep-periwinkle/50 bg-soft-navy/40 p-6">
            <h2 className="text-fairy-gold font-semibold text-lg mb-4">🔭 Scopes</h2>
            <div className="grid grid-cols-3 gap-3 text-sm">
              {[
                ['2×', setup.scope_2x],
                ['3×', setup.scope_3x],
                ['4×', setup.scope_4x],
                ['6×', setup.scope_6x],
                ['8×', setup.scope_8x],
                ['15×', setup.scope_15x],
              ].map(([label, val]) => val != null && (
                <div key={String(label)} className="flex justify-between">
                  <span className="text-text-muted">{label}</span>
                  <span className="text-cloud-white font-medium">{formatVal(val as number)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gear */}
        {[setup.mouse, setup.keyboard, setup.headset, setup.mousepad, setup.monitor].some(Boolean) && (
          <div className="rounded-xl border border-deep-periwinkle/50 bg-soft-navy/40 p-6">
            <h2 className="text-fairy-gold font-semibold text-lg mb-4">⌨️ Gear</h2>
            <div className="space-y-2 text-sm">
              {setup.mouse && (
                <div className="flex justify-between">
                  <span className="text-text-muted">Mouse</span>
                  <span className="text-cloud-white">{setup.mouse}</span>
                </div>
              )}
              {setup.keyboard && (
                <div className="flex justify-between">
                  <span className="text-text-muted">Keyboard</span>
                  <span className="text-cloud-white">{setup.keyboard}</span>
                </div>
              )}
              {setup.headset && (
                <div className="flex justify-between">
                  <span className="text-text-muted">Headset</span>
                  <span className="text-cloud-white">{setup.headset}</span>
                </div>
              )}
              {setup.mousepad && (
                <div className="flex justify-between">
                  <span className="text-text-muted">Mousepad</span>
                  <span className="text-cloud-white">{setup.mousepad}</span>
                </div>
              )}
              {setup.monitor && (
                <div className="flex justify-between">
                  <span className="text-text-muted">Monitor</span>
                  <span className="text-cloud-white">{setup.monitor}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {setup.notes && (
          <div className="rounded-xl border border-deep-periwinkle/50 bg-soft-navy/40 p-6">
            <h2 className="text-fairy-gold font-semibold text-lg mb-3">💡 Notes</h2>
            <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">
              {setup.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
