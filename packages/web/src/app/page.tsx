export const dynamic = 'force-dynamic';

import { createSupabaseServer } from '@/lib/supabase/server';
import { SetupGallery } from '@/components/SetupGallery';
import { SectionBadge } from '@/components/SectionBadge';
import Link from 'next/link';

const PAGE_SIZE = 12;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tag?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || '1', 10));
  const tag = params.tag;
  const supabase = await createSupabaseServer();

  let query = supabase
    .from('setups')
    .select('*, profiles!inner(username, avatar_url)', { count: 'exact' });

  if (tag && ['sens', 'gear', 'game', 'tips'].includes(tag)) {
    query = query.not(tag, 'is', null);
  }

  const offset = (page - 1) * PAGE_SIZE;
  query = query.order('created_at', { ascending: false }).range(offset, offset + PAGE_SIZE - 1);

  const { data: setups, count } = await query;

  // Get like counts
  const setupsWithLikes = await Promise.all(
    (setups || []).map(async (setup) => {
      const { count: likeCount } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('setup_id', setup.id);
      return { ...setup, like_count: likeCount || 0 };
    })
  );

  const total = count || 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const tags = ['sens', 'gear', 'game', 'tips'];

  return (
    <div>
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-3">
          <span className="text-fairy-gold">SENSI</span>
          <span className="text-text-muted">.GG</span>
        </h1>
        <p className="text-text-secondary text-lg">
          PUBG 감도 · 장비 · 그래픽 · 꿀팁 공유 플랫폼
        </p>
      </div>

      {/* Tag Filter */}
      <div className="flex justify-center gap-2 mb-8 flex-wrap">
        <Link
          href="/"
          className={`px-4 py-2 rounded-full text-sm transition-colors border ${
            !tag
              ? 'bg-fairy-gold/20 text-fairy-gold border-fairy-gold/40'
              : 'bg-deep-periwinkle/30 text-text-secondary border-deep-periwinkle/50 hover:text-cloud-white'
          }`}
        >
          전체
        </Link>
        {tags.map(t => (
          <Link
            key={t}
            href={`/?tag=${t}`}
            className={`transition-colors ${
              tag === t ? 'ring-2 ring-fairy-gold/50 rounded-full' : ''
            }`}
          >
            <SectionBadge section={t} size="md" />
          </Link>
        ))}
      </div>

      <SetupGallery
        setups={setupsWithLikes}
        total={total}
        page={page}
        totalPages={totalPages}
        tag={tag}
      />
    </div>
  );
}
