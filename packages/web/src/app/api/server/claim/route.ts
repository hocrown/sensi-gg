import { createSupabaseServer } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/server/claim — create a new server + claim ownership (auth required)
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { slug, name } = body;

  if (!slug || !name) {
    return NextResponse.json({ error: 'slug and name are required' }, { status: 400 });
  }

  // Validate slug format (lowercase alphanumeric + hyphens, 3-32 chars)
  if (!/^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$/.test(slug)) {
    return NextResponse.json({
      error: 'slug must be 3-32 chars, lowercase alphanumeric and hyphens only',
    }, { status: 400 });
  }

  // Create server
  const { data: server, error: serverError } = await supabase
    .from('servers')
    .insert({ slug, name })
    .select()
    .single();

  if (serverError) {
    if (serverError.code === '23505') {
      return NextResponse.json({ error: 'slug already taken' }, { status: 409 });
    }
    return NextResponse.json({ error: serverError.message }, { status: 500 });
  }

  // Claim ownership
  const { error: claimError } = await supabase
    .from('server_claims')
    .insert({
      server_id: server.id,
      claimed_by_profile_id: user.id,
    });

  if (claimError) {
    return NextResponse.json({ error: claimError.message }, { status: 500 });
  }

  // Auto-join as member
  await supabase
    .from('server_memberships')
    .insert({
      server_id: server.id,
      profile_id: user.id,
    });

  return NextResponse.json({ server }, { status: 201 });
}
