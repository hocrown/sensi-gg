export const dynamic = 'force-dynamic';

import { createSupabaseServer } from '@/lib/supabase/server';
import { SetupGallery } from '@/components/SetupGallery';
import Link from 'next/link';

const PAGE_SIZE = 12;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || '1', 10));
  const supabase = await createSupabaseServer();

  const offset = (page - 1) * PAGE_SIZE;

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();

  let serverSetups: any[] = [];
  let serverName: string | null = null;

  if (user) {
    // Find user's first server membership (with server name)
    const { data: memberships } = await supabase
      .from('server_memberships')
      .select('server_id, servers(id, name)')
      .eq('profile_id', user.id)
      .limit(1);

    if (memberships && memberships.length > 0) {
      const firstMembership = memberships[0];
      const server = firstMembership.servers as unknown as { id: string; name: string } | null;
      serverName = server?.name ?? null;

      if (firstMembership.server_id) {
        // Get all member profile_ids in that server
        const { data: allMembers } = await supabase
          .from('server_memberships')
          .select('profile_id')
          .eq('server_id', firstMembership.server_id);

        const memberIds = (allMembers || []).map((m) => m.profile_id);

        if (memberIds.length > 0) {
          const { data: svrSetups } = await supabase
            .from('setups')
            .select('*, profiles!inner(display_name, avatar_url, handle)')
            .in('profile_id', memberIds)
            .order('updated_at', { ascending: false });

          serverSetups = svrSetups || [];
        }
      }
    }
  }

  // Main paginated query (all setups)
  const { data: setups, count } = await supabase
    .from('setups')
    .select('*, profiles!inner(display_name, avatar_url, handle)', { count: 'exact' })
    .order('updated_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  const total = count || 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero */}
      <div className="relative text-center mb-12 pt-8">
        {/* Subtle ambient glow behind title */}
        <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-40 bg-fairy-gold/5 blur-3xl rounded-full" />
        </div>

        <h1 className="text-5xl font-bold mb-3 tracking-tight">
          <span className="text-fairy-gold drop-shadow-[0_0_24px_rgba(244,210,122,0.4)]">SENSI</span>
          <span className="text-white/30">.GG</span>
        </h1>
        <p className="text-mist-blue/60 text-xs font-semibold tracking-[0.25em] uppercase mb-3">
          PUBG Sensitivity Database
        </p>
        <p className="text-white/40 text-base max-w-md mx-auto">
          Discover and share your perfect sensitivity settings
        </p>
      </div>

      <div className="flex justify-end mb-6">
        <Link
          href="/setup/me"
          className="bg-fairy-gold/10 border border-fairy-gold/30 text-fairy-gold rounded-xl px-6 py-2.5 font-semibold hover:bg-fairy-gold/20 hover:shadow-[0_0_24px_rgba(244,210,122,0.25)] transition-all shadow-[0_0_15px_rgba(244,210,122,0.1)]"
        >
          + 내 세팅 등록
        </Link>
      </div>

      <SetupGallery
        setups={setups || []}
        total={total}
        page={page}
        totalPages={totalPages}
        serverSetups={serverSetups}
        serverName={serverName}
        isLoggedIn={!!user}
      />
    </div>
  );
}
