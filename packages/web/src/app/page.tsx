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
      <div className="text-center mb-12 pt-8">
        <h1 className="text-5xl font-bold mb-4 tracking-tight">
          <span className="text-fairy-gold drop-shadow-[0_0_20px_rgba(244,210,122,0.3)]">SENSI</span>
          <span className="text-white/30">.GG</span>
        </h1>
        <p className="text-white/50 text-lg max-w-md mx-auto">
          Discover and share your perfect sensitivity settings
        </p>
      </div>

      <div className="flex justify-end mb-6">
        <Link
          href="/setup/me"
          className="bg-fairy-gold/10 border border-fairy-gold/30 text-fairy-gold rounded-xl px-5 py-2.5 font-medium hover:bg-fairy-gold/20 transition-all shadow-[0_0_15px_rgba(244,210,122,0.1)]"
        >
          + 내 세팅 등록
        </Link>
      </div>

      <SetupGallery
        setups={setups || []}
        total={total}
        page={page}
        totalPages={totalPages}
      />
    </div>
  );
}
