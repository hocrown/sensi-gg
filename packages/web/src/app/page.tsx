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
    <div>
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-3">
          <span className="text-fairy-gold">SENSI</span>
          <span className="text-text-muted">.GG</span>
        </h1>
        <p className="text-text-secondary text-lg">
          PUBG 감도 · 장비 공유 플랫폼
        </p>
      </div>

      <div className="flex justify-end mb-6">
        <Link
          href="/setup/me"
          className="px-4 py-2 rounded-lg bg-fairy-gold/20 text-fairy-gold border border-fairy-gold/30 text-sm hover:bg-fairy-gold/30 transition-colors"
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
