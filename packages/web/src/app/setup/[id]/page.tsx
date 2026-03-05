export const dynamic = 'force-dynamic';

import { createSupabaseServer } from '@/lib/supabase/server';
import { UserAvatar } from '@/components/UserAvatar';
import { SectionBadge } from '@/components/SectionBadge';
import { LikeButton } from '@/components/LikeButton';
import { notFound } from 'next/navigation';
import Link from 'next/link';

const SECTION_CONFIG: Record<string, { label: string; emoji: string }> = {
  sens: { label: '감도', emoji: '🎯' },
  gear: { label: '장비', emoji: '⌨️' },
  game: { label: '그래픽', emoji: '🖥️' },
  tips: { label: '꿀팁', emoji: '💡' },
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
    .select('*, profiles!inner(discord_id, username, avatar_url)')
    .eq('id', id)
    .single();

  if (!setup) notFound();

  // Like count
  const { count: likeCount } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('setup_id', setup.id);

  // Current user liked?
  const { data: { user } } = await supabase.auth.getUser();
  let userLiked = false;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('discord_id', user.user_metadata?.provider_id || '')
      .single();

    if (profile) {
      const { data: like } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', profile.id)
        .eq('setup_id', setup.id)
        .single();
      userLiked = !!like;
    }
  }

  const sections = ['sens', 'gear', 'game', 'tips'].filter(s => setup[s]);

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-text-muted hover:text-cloud-white transition-colors mb-6 text-sm"
      >
        ← Gallery
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <UserAvatar
            src={setup.profiles.avatar_url}
            username={setup.profiles.username}
            size={56}
          />
          <div>
            <h1 className="text-2xl font-bold text-cloud-white">
              {setup.profiles.username}
            </h1>
            <p className="text-text-muted text-sm">
              {new Date(setup.created_at).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        <LikeButton
          setupId={setup.id}
          initialCount={likeCount || 0}
          initialLiked={userLiked}
          isLoggedIn={!!user}
        />
      </div>

      {/* Badges */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {sections.map(s => (
          <SectionBadge key={s} section={s} size="md" />
        ))}
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {sections.map(section => {
          const config = SECTION_CONFIG[section];
          return (
            <div
              key={section}
              className="rounded-xl border border-deep-periwinkle/50 bg-soft-navy/40 p-6"
            >
              <h2 className="text-fairy-gold font-semibold text-lg mb-3 flex items-center gap-2">
                <span>{config.emoji}</span>
                <span>{config.label}</span>
              </h2>
              <pre className="text-text-secondary whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {setup[section]}
              </pre>
            </div>
          );
        })}
      </div>
    </div>
  );
}
