import { createSupabaseServer } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { UserAvatar } from '@/components/UserAvatar';
import { CopyLinkButton } from '@/components/CopyLinkButton';
import { Crosshair, Mouse, Monitor, Lightbulb } from 'lucide-react';

interface PageProps {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const supabase = await createSupabaseServer();

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, display_name')
    .eq('handle', handle)
    .single();

  if (!profile) {
    return { title: 'Not Found - SENSI.GG' };
  }

  const { data: setup } = await supabase
    .from('setups')
    .select('dpi, general_sens')
    .eq('profile_id', profile.id)
    .single();

  const edpi = setup ? Math.round(setup.dpi * setup.general_sens) : null;

  return {
    title: `${profile.display_name}의 PUBG 세팅 - SENSI.GG`,
    description: edpi
      ? `DPI:${setup!.dpi} eDPI:${edpi.toLocaleString()}`
      : `${profile.display_name}의 PUBG 세팅`,
    openGraph: {
      title: `${profile.display_name}의 PUBG 세팅`,
      description: edpi
        ? `DPI:${setup!.dpi} eDPI:${edpi.toLocaleString()}`
        : `${profile.display_name}의 PUBG 세팅`,
    },
  };
}

const glassCard = {
  className: 'rounded-3xl border border-white/10 p-6 md:p-8',
  style: { background: 'rgba(26,26,58,0.4)', boxShadow: '0px 25px 50px -12px rgba(0,0,0,0.25)' } as React.CSSProperties,
};

export default async function ProfilePage({ params }: PageProps) {
  const { handle } = await params;
  const supabase = await createSupabaseServer();

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, handle, display_name, avatar_url')
    .eq('handle', handle)
    .single();

  if (!profile) notFound();

  const { data: setup } = await supabase
    .from('setups')
    .select('*')
    .eq('profile_id', profile.id)
    .single();

  if (!setup) notFound();

  const edpi = Math.round(setup.dpi * setup.general_sens);

  const scopes = [
    { label: '2x', value: setup.scope_2x },
    { label: '3x', value: setup.scope_3x },
    { label: '4x', value: setup.scope_4x },
    { label: '6x', value: setup.scope_6x },
    { label: '8x', value: setup.scope_8x },
    { label: '15x', value: setup.scope_15x },
  ].filter(s => s.value != null);

  const gear = [
    { label: 'Mouse', value: setup.mouse },
    { label: 'Keyboard', value: setup.keyboard },
    { label: 'Headset', value: setup.headset },
    { label: 'Mousepad', value: setup.mousepad },
    { label: 'Monitor', value: setup.monitor },
  ].filter(g => g.value);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Mini Hero Banner */}
      <div className="relative w-full rounded-3xl overflow-hidden mb-8" style={{ minHeight: '180px' }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1a1a4a 0%, #2B2F5A 25%, #3A4A86 50%, #2a2050 75%, #1a1030 100%)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 80% at 80% 20%, rgba(175,198,255,0.18) 0%, transparent 60%), radial-gradient(ellipse 40% 60% at 20% 80%, rgba(244,210,122,0.12) 0%, transparent 50%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(26,26,58,0.85) 0%, transparent 60%)' }} />

        {/* User info at bottom-left */}
        <div className="absolute bottom-5 left-6 flex items-end gap-4">
          <UserAvatar
            src={profile.avatar_url}
            username={profile.display_name}
            size={56}
            className="ring-2 ring-white/20"
          />
          <div>
            <h1 className="text-3xl font-bold text-cloud-white drop-shadow-lg">
              {profile.display_name}
            </h1>
            <p className="text-sm text-white/50">@{profile.handle}</p>
          </div>
        </div>

        {/* Copy button top-right */}
        <div className="absolute top-5 right-5">
          <CopyLinkButton />
        </div>
      </div>

      {/* Sensitivity */}
      <div className={glassCard.className + ' mb-4'} style={glassCard.style}>
        <h2 className="flex items-center gap-3 text-lg font-semibold text-cloud-white mb-5">
          <Crosshair size={18} className="text-fairy-gold" />
          Sensitivity
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-2xl bg-white/5 border border-white/5 px-4 py-3 text-center">
            <span className="text-sm text-white/40 block mb-1">DPI</span>
            <span className="text-2xl font-bold text-cloud-white">{setup.dpi}</span>
          </div>
          <div className="rounded-2xl bg-white/5 border border-white/5 px-4 py-3 text-center">
            <span className="text-sm text-white/40 block mb-1">In-game</span>
            <span className="text-2xl font-bold text-cloud-white">{setup.general_sens}</span>
          </div>
          <div className="rounded-2xl bg-white/5 border border-white/5 px-4 py-3 text-center">
            <span className="text-sm text-white/40 block mb-1">eDPI</span>
            <span className="text-2xl font-bold text-fairy-gold">{edpi.toLocaleString()}</span>
          </div>
        </div>

        {(setup.ads_sens || setup.vertical_multiplier) && (
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/5">
            {setup.ads_sens != null && (
              <div className="text-center">
                <span className="text-sm text-white/40 block mb-1">ADS</span>
                <span className="text-sm text-text-secondary">{setup.ads_sens}</span>
              </div>
            )}
            {setup.vertical_multiplier != null && (
              <div className="text-center">
                <span className="text-sm text-white/40 block mb-1">Vertical</span>
                <span className="text-sm text-text-secondary">{setup.vertical_multiplier}</span>
              </div>
            )}
          </div>
        )}

        {scopes.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/5">
            <span className="text-sm text-white/40 block mb-3">Scopes</span>
            <div className="flex flex-wrap gap-3">
              {scopes.map(s => (
                <div key={s.label} className="rounded-xl bg-white/5 border border-white/5 px-3 py-1.5 text-sm">
                  <span className="text-white/40">{s.label}:</span>{' '}
                  <span className="text-text-secondary">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Gear */}
      {gear.length > 0 && (
        <div className={glassCard.className + ' mb-4'} style={glassCard.style}>
          <h2 className="flex items-center gap-3 text-lg font-semibold text-cloud-white mb-5">
            <Mouse size={18} className="text-fairy-gold" />
            Gear
          </h2>
          <div className="space-y-3">
            {gear.map(g => (
              <div key={g.label} className="flex justify-between text-sm">
                <span className="text-white/40">{g.label}</span>
                <span className="text-text-secondary">{g.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {setup.notes && (
        <div className={glassCard.className + ' mb-4'} style={glassCard.style}>
          <h2 className="flex items-center gap-3 text-lg font-semibold text-cloud-white mb-5">
            <Lightbulb size={18} className="text-fairy-gold" />
            Notes
          </h2>
          <p className="text-text-secondary text-sm whitespace-pre-wrap">{setup.notes}</p>
        </div>
      )}

      {/* Updated at */}
      <p className="text-xs text-white/30 text-center mt-6">
        Updated {new Date(setup.updated_at).toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </p>
    </div>
  );
}
