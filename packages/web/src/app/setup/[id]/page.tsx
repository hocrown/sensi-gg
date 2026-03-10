export const dynamic = 'force-dynamic';

import { createSupabaseServer } from '@/lib/supabase/server';
import { UserAvatar } from '@/components/UserAvatar';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Crosshair, Mouse, Lightbulb, Target } from 'lucide-react';

const glassCard = {
  className: 'rounded-3xl border border-white/10 p-6 md:p-8',
  style: { background: 'rgba(26,26,58,0.4)', boxShadow: '0px 25px 50px -12px rgba(0,0,0,0.25)' } as React.CSSProperties,
};

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
    v != null ? String(v) : '\u2014';

  const edpi = Math.round(setup.dpi * setup.general_sens);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm text-white/60 hover:text-mist-blue hover:border-mist-blue/30 transition-all mb-6"
      >
        &larr; Gallery
      </Link>

      {/* Mini Hero Banner */}
      <div className="relative w-full rounded-3xl overflow-hidden mb-8" style={{ minHeight: '180px' }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1a1a4a 0%, #2B2F5A 25%, #3A4A86 50%, #2a2050 75%, #1a1030 100%)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 80% at 80% 20%, rgba(175,198,255,0.18) 0%, transparent 60%), radial-gradient(ellipse 40% 60% at 20% 80%, rgba(244,210,122,0.12) 0%, transparent 50%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(26,26,58,0.85) 0%, transparent 60%)' }} />

        {/* User info at bottom-left */}
        <div className="absolute bottom-5 left-6 flex items-end gap-4">
          <UserAvatar
            src={setup.profiles.avatar_url}
            username={setup.profiles.display_name}
            size={56}
            className="ring-2 ring-white/20"
          />
          <div>
            <h1 className="text-3xl font-bold text-cloud-white drop-shadow-lg">
              {setup.profiles.display_name}
            </h1>
            <p className="text-sm text-white/50">
              {new Date(setup.updated_at).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Sensitivity */}
        <div className={glassCard.className} style={glassCard.style}>
          <h2 className="flex items-center gap-3 text-lg font-semibold text-cloud-white mb-5">
            <Crosshair size={18} className="text-fairy-gold" />
            Sensitivity
          </h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="rounded-2xl bg-white/5 border border-white/5 px-4 py-3 text-center">
              <span className="text-sm text-white/40 block mb-1">DPI</span>
              <span className="text-2xl font-bold text-cloud-white">{setup.dpi}</span>
            </div>
            <div className="rounded-2xl bg-white/5 border border-white/5 px-4 py-3 text-center">
              <span className="text-sm text-white/40 block mb-1">General</span>
              <span className="text-2xl font-bold text-cloud-white">{setup.general_sens}</span>
            </div>
            <div className="rounded-2xl bg-white/5 border border-white/5 px-4 py-3 text-center">
              <span className="text-sm text-white/40 block mb-1">eDPI</span>
              <span className="text-2xl font-bold text-fairy-gold">{edpi.toLocaleString()}</span>
            </div>
          </div>
          {(setup.vertical_multiplier != null || setup.ads_sens != null) && (
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
              {setup.vertical_multiplier != null && (
                <div className="text-center">
                  <span className="text-sm text-white/40 block mb-1">Vertical</span>
                  <span className="text-sm text-cloud-white font-medium">{setup.vertical_multiplier}</span>
                </div>
              )}
              {setup.ads_sens != null && (
                <div className="text-center">
                  <span className="text-sm text-white/40 block mb-1">ADS</span>
                  <span className="text-sm text-cloud-white font-medium">{setup.ads_sens}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Scopes */}
        {[setup.scope_2x, setup.scope_3x, setup.scope_4x, setup.scope_6x, setup.scope_8x, setup.scope_15x].some(v => v != null) && (
          <div className={glassCard.className} style={glassCard.style}>
            <h2 className="flex items-center gap-3 text-lg font-semibold text-cloud-white mb-5">
              <Target size={18} className="text-fairy-gold" />
              Scopes
            </h2>
            <div className="flex flex-wrap gap-3">
              {[
                ['2x', setup.scope_2x],
                ['3x', setup.scope_3x],
                ['4x', setup.scope_4x],
                ['6x', setup.scope_6x],
                ['8x', setup.scope_8x],
                ['15x', setup.scope_15x],
              ].map(([label, val]) => val != null && (
                <div key={String(label)} className="rounded-xl bg-white/5 border border-white/5 px-3 py-1.5 text-sm">
                  <span className="text-white/40">{label}:</span>{' '}
                  <span className="text-cloud-white font-medium">{formatVal(val as number)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gear */}
        {[setup.mouse, setup.keyboard, setup.headset, setup.mousepad, setup.monitor].some(Boolean) && (
          <div className={glassCard.className} style={glassCard.style}>
            <h2 className="flex items-center gap-3 text-lg font-semibold text-cloud-white mb-5">
              <Mouse size={18} className="text-fairy-gold" />
              Gear
            </h2>
            <div className="space-y-3 text-sm">
              {setup.mouse && (
                <div className="flex justify-between">
                  <span className="text-white/40">Mouse</span>
                  <span className="text-cloud-white">{setup.mouse}</span>
                </div>
              )}
              {setup.keyboard && (
                <div className="flex justify-between">
                  <span className="text-white/40">Keyboard</span>
                  <span className="text-cloud-white">{setup.keyboard}</span>
                </div>
              )}
              {setup.headset && (
                <div className="flex justify-between">
                  <span className="text-white/40">Headset</span>
                  <span className="text-cloud-white">{setup.headset}</span>
                </div>
              )}
              {setup.mousepad && (
                <div className="flex justify-between">
                  <span className="text-white/40">Mousepad</span>
                  <span className="text-cloud-white">{setup.mousepad}</span>
                </div>
              )}
              {setup.monitor && (
                <div className="flex justify-between">
                  <span className="text-white/40">Monitor</span>
                  <span className="text-cloud-white">{setup.monitor}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {setup.notes && (
          <div className={glassCard.className} style={glassCard.style}>
            <h2 className="flex items-center gap-3 text-lg font-semibold text-cloud-white mb-5">
              <Lightbulb size={18} className="text-fairy-gold" />
              Notes
            </h2>
            <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">
              {setup.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
