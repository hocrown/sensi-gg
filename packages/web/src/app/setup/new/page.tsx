export const dynamic = 'force-dynamic';

import { createSupabaseServer } from '@/lib/supabase/server';
import { SetupForm } from '@/components/SetupForm';
import { redirect } from 'next/navigation';

export default async function NewSetupPage() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">세팅 등록</h1>
      <p className="text-text-secondary mb-8">나의 PUBG 세팅을 등록하세요.</p>
      <SetupForm />
    </div>
  );
}
