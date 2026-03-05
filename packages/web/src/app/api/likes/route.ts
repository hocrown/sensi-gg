import { createSupabaseServer } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/likes — Toggle like (authenticated)
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { setup_id } = body;

  if (!setup_id) {
    return NextResponse.json({ error: 'setup_id is required' }, { status: 400 });
  }

  const discordId = user.user_metadata?.provider_id;
  const username = user.user_metadata?.full_name || user.user_metadata?.name || 'User';
  const avatarUrl = user.user_metadata?.avatar_url;

  // Ensure profile
  const { data: profile } = await supabase
    .from('profiles')
    .upsert({
      discord_id: discordId,
      username,
      avatar_url: avatarUrl,
    }, { onConflict: 'discord_id' })
    .select('id')
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Profile creation failed' }, { status: 500 });
  }

  // Check existing like
  const { data: existing } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', profile.id)
    .eq('setup_id', setup_id)
    .single();

  if (existing) {
    await supabase.from('likes').delete().eq('id', existing.id);
  } else {
    await supabase.from('likes').insert({ user_id: profile.id, setup_id });
  }

  const { count } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('setup_id', setup_id);

  return NextResponse.json({
    liked: !existing,
    totalLikes: count || 0,
  });
}
