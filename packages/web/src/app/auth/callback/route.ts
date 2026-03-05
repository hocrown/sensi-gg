import { createSupabaseServer } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createSupabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Sync Discord profile to profiles table
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const discordUserId = user.user_metadata?.provider_id;
        const displayName = user.user_metadata?.full_name || user.user_metadata?.name || 'User';
        const avatarUrl = user.user_metadata?.avatar_url;

        if (discordUserId) {
          await supabase.from('profiles').upsert({
            id: user.id,
            discord_user_id: discordUserId,
            handle: discordUserId,
            display_name: displayName,
            avatar_url: avatarUrl || null,
          }, { onConflict: 'id' });
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth error — redirect to home
  return NextResponse.redirect(`${origin}/`);
}
