export const dynamic = 'force-dynamic';

import { createSupabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SetupForm } from '@/components/SetupForm';
import { SectionBadge } from '@/components/SectionBadge';
import Link from 'next/link';

export default async function MySetupPage() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  const discordId = user.user_metadata?.provider_id;

  // Find profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('discord_id', discordId)
    .single();

  if (!profile) {
    redirect('/setup/new');
  }

  // Find user's setup (any guild)
  const { data: setup } = await supabase
    .from('setups')
    .select('*')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!setup) {
    redirect('/setup/new');
  }

  const sections = ['sens', 'gear', 'game', 'tips'].filter(s => setup[s]);

  const SECTION_CONFIG: Record<string, { label: string; emoji: string }> = {
    sens: { label: '감도', emoji: '🎯' },
    gear: { label: '장비', emoji: '⌨️' },
    game: { label: '그래픽', emoji: '🖥️' },
    tips: { label: '꿀팁', emoji: '💡' },
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">내 세팅</h1>
        <div className="flex gap-2">
          <Link
            href={`/setup/${setup.id}`}
            className="px-4 py-2 rounded-lg text-sm bg-deep-periwinkle/50 text-text-secondary hover:text-cloud-white transition-colors"
          >
            상세 보기
          </Link>
        </div>
      </div>

      {/* Current setup preview */}
      <div className="mb-8 space-y-3">
        <div className="flex gap-2 flex-wrap">
          {sections.map(s => (
            <SectionBadge key={s} section={s} size="md" />
          ))}
        </div>

        {sections.map(section => (
          <div
            key={section}
            className="rounded-xl border border-deep-periwinkle/50 bg-soft-navy/40 p-5"
          >
            <h3 className="text-fairy-gold font-semibold mb-2">
              {SECTION_CONFIG[section].emoji} {SECTION_CONFIG[section].label}
            </h3>
            <pre className="text-text-secondary whitespace-pre-wrap font-sans text-sm">
              {setup[section]}
            </pre>
          </div>
        ))}
      </div>

      {/* Edit form */}
      <div className="border-t border-deep-periwinkle/30 pt-8">
        <h2 className="text-xl font-bold mb-2">세팅 수정</h2>
        <p className="text-text-secondary text-sm mb-6">변경할 항목만 입력하세요. 빈 칸은 기존 값을 유지합니다.</p>
        <SetupForm
          mode="edit"
          setupId={setup.id}
          initialData={{
            sens: setup.sens || '',
            gear: setup.gear || '',
            game: setup.game || '',
            tips: setup.tips || '',
            guild_id: setup.guild_id,
          }}
        />
      </div>
    </div>
  );
}
