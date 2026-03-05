export const dynamic = 'force-dynamic';

import { createSupabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SetupMeClient } from './SetupMeClient';

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
    .select('handle')
    .eq('id', user.id)
    .single();

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">
        {setup ? '내 세팅 수정' : '세팅 등록'}
      </h1>
      <p className="text-text-secondary text-sm mb-8">
        {setup ? '세팅을 수정하고 저장하세요.' : '나의 PUBG 세팅을 등록하세요.'}
      </p>
      <SetupMeClient
        initialSetup={setup}
        handle={profile?.handle ?? null}
      />
    </div>
  );
}
