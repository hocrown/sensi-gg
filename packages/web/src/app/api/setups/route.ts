import { createSupabaseServer } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const PAGE_SIZE = 12;

// GET /api/setups — List setups
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const tag = searchParams.get('tag');
  const userId = searchParams.get('userId');
  const guildId = searchParams.get('guildId');

  const supabase = await createSupabaseServer();

  let query = supabase
    .from('setups')
    .select('*, profiles!inner(discord_id, username, avatar_url)', { count: 'exact' });

  if (guildId) query = query.eq('guild_id', guildId);
  if (userId) query = query.eq('profiles.discord_id', userId);
  if (tag && ['sens', 'gear', 'game', 'tips'].includes(tag)) {
    query = query.not(tag, 'is', null);
  }

  const offset = (page - 1) * PAGE_SIZE;
  query = query.order('created_at', { ascending: false }).range(offset, offset + PAGE_SIZE - 1);

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    results: data || [],
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / PAGE_SIZE),
  });
}

// POST /api/setups — Create setup (authenticated)
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { sens, gear, game, tips, guild_id } = body;

  if (!guild_id) {
    return NextResponse.json({ error: 'guild_id is required' }, { status: 400 });
  }

  // Find or create profile
  const discordId = user.user_metadata?.provider_id;
  const username = user.user_metadata?.full_name || user.user_metadata?.name || 'User';
  const avatarUrl = user.user_metadata?.avatar_url;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .upsert({
      discord_id: discordId,
      username,
      avatar_url: avatarUrl,
    }, { onConflict: 'discord_id' })
    .select('id')
    .single();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  const { data: setup, error: setupError } = await supabase
    .from('setups')
    .insert({
      user_id: profile.id,
      guild_id,
      sens: sens || null,
      gear: gear || null,
      game: game || null,
      tips: tips || null,
      source: 'web',
      sync_status: 'pending_thread',
    })
    .select()
    .single();

  if (setupError) {
    if (setupError.code === '23505') {
      return NextResponse.json({ error: 'Setup already exists for this guild' }, { status: 409 });
    }
    return NextResponse.json({ error: setupError.message }, { status: 500 });
  }

  return NextResponse.json(setup, { status: 201 });
}
