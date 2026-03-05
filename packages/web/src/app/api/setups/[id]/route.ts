import { createSupabaseServer } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/setups/[id] — Single setup
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServer();

  const { data: setup, error } = await supabase
    .from('setups')
    .select('*, profiles!inner(discord_id, username, avatar_url)')
    .eq('id', id)
    .single();

  if (error || !setup) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { count: likeCount } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('setup_id', setup.id);

  return NextResponse.json({ ...setup, like_count: likeCount || 0 });
}

// PUT /api/setups/[id] — Update setup (authenticated, owner only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const discordId = user.user_metadata?.provider_id;
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('discord_id', discordId)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from('setups')
    .select('user_id')
    .eq('id', id)
    .single();

  if (!existing || existing.user_id !== profile.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const updates: Record<string, unknown> = { sync_status: 'pending_thread' };
  if (body.sens !== undefined) updates.sens = body.sens;
  if (body.gear !== undefined) updates.gear = body.gear;
  if (body.game !== undefined) updates.game = body.game;
  if (body.tips !== undefined) updates.tips = body.tips;

  const { data: setup, error } = await supabase
    .from('setups')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(setup);
}

// DELETE /api/setups/[id] — Delete setup (authenticated, owner only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const discordId = user.user_metadata?.provider_id;
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('discord_id', discordId)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  const { data: existing } = await supabase
    .from('setups')
    .select('user_id, thread_id')
    .eq('id', id)
    .single();

  if (!existing || existing.user_id !== profile.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (existing.thread_id) {
    // Mark for bot deletion
    await supabase
      .from('setups')
      .update({ sync_status: 'pending_delete' })
      .eq('id', id);
  } else {
    // No thread, just delete directly
    await supabase.from('setups').delete().eq('id', id);
  }

  return NextResponse.json({ success: true });
}
