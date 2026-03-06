export const dynamic = 'force-dynamic';

import { createSupabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SetupMeClient } from './SetupMeClient';
import { SetupHeaderControls } from '@/components/SetupHeaderControls';

export default async function SetupMePage() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch existing setup
  const { data: setup } = await supabase
    .from('setups')
    .select('*')
    .eq('profile_id', user.id)
    .single();

  // Fetch profile handle for "view card" link
  const { data: profile } = await supabase
    .from('profiles')
    .select('handle, display_name')
    .eq('id', user.id)
    .single();

  const displayName = profile?.display_name ?? profile?.handle ?? 'Guest';

  return (
    <div className="max-w-4xl mx-auto px-0 pb-16">
      {/* ── Hero Banner ────────────────────────────────────────────────── */}
      <div
        className="relative w-full rounded-3xl overflow-hidden mb-8"
        style={{ minHeight: '260px' }}
      >
        {/* Gradient background — replace with <Image> when real asset is ready */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, #1a1a4a 0%, #2B2F5A 25%, #3A4A86 50%, #2a2050 75%, #1a1030 100%)',
          }}
        />
        {/* Decorative glow blobs */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 80% at 80% 20%, rgba(175,198,255,0.18) 0%, transparent 60%), ' +
              'radial-gradient(ellipse 40% 60% at 20% 80%, rgba(244,210,122,0.12) 0%, transparent 50%)',
          }}
        />
        {/* Dark overlay at bottom so text is always readable */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(26,26,58,0.85) 0%, transparent 60%)',
          }}
        />

        {/* Top-right controls */}
        <div className="absolute top-5 right-5">
          <SetupHeaderControls />
        </div>

        {/* Bottom-left: user info */}
        <div className="absolute bottom-6 left-7">
          <h1 className="text-5xl font-bold text-cloud-white tracking-tight drop-shadow-lg">
            {displayName}
          </h1>
          <p
            className="mt-1 text-sm font-medium tracking-[0.25em] uppercase"
            style={{ color: '#AFC6FF' }}
          >
            — SENSI.GG —
          </p>
        </div>
      </div>

      {/* ── Setup Form (tabs + content) ─────────────────────────────────── */}
      <SetupMeClient
        initialSetup={setup}
        handle={profile?.handle ?? null}
      />
    </div>
  );
}
