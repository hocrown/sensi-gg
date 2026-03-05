import { createSupabaseServer } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/server/join — join a server by join_code (auth required)
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { join_code } = body;

  if (!join_code || typeof join_code !== 'string') {
    return NextResponse.json({ error: 'join_code is required' }, { status: 400 });
  }

  // Look up server by join_code
  const { data: server, error: serverError } = await supabase
    .from('servers')
    .select('id, slug, name')
    .eq('join_code', join_code.trim())
    .single();

  if (serverError || !server) {
    return NextResponse.json({ error: 'Invalid join code' }, { status: 404 });
  }

  // Create membership
  const { error: memberError } = await supabase
    .from('server_memberships')
    .insert({
      server_id: server.id,
      profile_id: user.id,
    });

  if (memberError) {
    if (memberError.code === '23505') {
      return NextResponse.json({ server, message: 'Already a member' });
    }
    return NextResponse.json({ error: memberError.message }, { status: 500 });
  }

  return NextResponse.json({ server, message: 'Joined successfully' }, { status: 201 });
}
