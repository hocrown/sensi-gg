import { createSupabaseServer } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { UserAvatar } from '@/components/UserAvatar';
import { CopyLinkButton } from '@/components/CopyLinkButton';

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
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <UserAvatar
          src={profile.avatar_url}
          username={profile.display_name}
          size={64}
        />
        <div>
          <h1 className="text-2xl font-bold text-cloud-white">
            {profile.display_name}
          </h1>
          <p className="text-text-muted text-sm">@{profile.handle}</p>
        </div>
        <div className="ml-auto">
          <CopyLinkButton />
        </div>
      </div>

      {/* Sensitivity */}
      <div className="rounded-xl border border-deep-periwinkle/50 bg-soft-navy/40 p-6 mb-4">
        <h2 className="text-fairy-gold font-semibold text-lg mb-4">Sensitivity</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <span className="text-xs text-text-muted block">DPI</span>
            <span className="text-xl font-bold text-cloud-white">{setup.dpi}</span>
          </div>
          <div>
            <span className="text-xs text-text-muted block">In-game</span>
            <span className="text-xl font-bold text-cloud-white">{setup.general_sens}</span>
          </div>
          <div>
            <span className="text-xs text-text-muted block">eDPI</span>
            <span className="text-xl font-bold text-fairy-gold">{edpi.toLocaleString()}</span>
          </div>
        </div>

        {(setup.ads_sens || setup.vertical_multiplier) && (
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-deep-periwinkle/30">
            {setup.ads_sens != null && (
              <div>
                <span className="text-xs text-text-muted block">ADS</span>
                <span className="text-sm text-text-secondary">{setup.ads_sens}</span>
              </div>
            )}
            {setup.vertical_multiplier != null && (
              <div>
                <span className="text-xs text-text-muted block">Vertical</span>
                <span className="text-sm text-text-secondary">{setup.vertical_multiplier}</span>
              </div>
            )}
          </div>
        )}

        {scopes.length > 0 && (
          <div className="mt-4 pt-4 border-t border-deep-periwinkle/30">
            <span className="text-xs text-text-muted block mb-2">Scopes</span>
            <div className="flex flex-wrap gap-3">
              {scopes.map(s => (
                <div key={s.label} className="text-sm">
                  <span className="text-text-muted">{s.label}:</span>{' '}
                  <span className="text-text-secondary">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Gear */}
      {gear.length > 0 && (
        <div className="rounded-xl border border-deep-periwinkle/50 bg-soft-navy/40 p-6 mb-4">
          <h2 className="text-fairy-gold font-semibold text-lg mb-4">Gear</h2>
          <div className="space-y-2">
            {gear.map(g => (
              <div key={g.label} className="flex justify-between text-sm">
                <span className="text-text-muted">{g.label}</span>
                <span className="text-text-secondary">{g.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {setup.notes && (
        <div className="rounded-xl border border-deep-periwinkle/50 bg-soft-navy/40 p-6 mb-4">
          <h2 className="text-fairy-gold font-semibold text-lg mb-3">Notes</h2>
          <p className="text-text-secondary text-sm whitespace-pre-wrap">{setup.notes}</p>
        </div>
      )}

      {/* Updated at */}
      <p className="text-xs text-text-muted text-center mt-6">
        Updated {new Date(setup.updated_at).toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </p>
    </div>
  );
}
