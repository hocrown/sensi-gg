import { createSupabaseServer } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/setup — fetch own setup (auth required)
export async function GET() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: setup, error } = await supabase
    .from('setups')
    .select('*')
    .eq('profile_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ setup: setup || null });
}

// POST /api/setup — upsert setup (auth required)
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const {
    dpi, general_sens, vertical_multiplier, ads_sens,
    scope_2x, scope_3x, scope_4x, scope_6x, scope_8x, scope_15x,
    mouse, keyboard, headset, mousepad, monitor, notes,
  } = body;

  if (!dpi || !general_sens) {
    return NextResponse.json({ error: 'dpi and general_sens are required' }, { status: 400 });
  }

  if (typeof dpi !== 'number' || dpi < 100 || dpi > 6400) {
    return NextResponse.json({ error: 'dpi must be between 100 and 6400' }, { status: 400 });
  }

  if (typeof general_sens !== 'number' || general_sens < 1 || general_sens > 100) {
    return NextResponse.json({ error: 'general_sens must be between 1 and 100' }, { status: 400 });
  }

  const row = {
    profile_id: user.id,
    dpi,
    general_sens,
    vertical_multiplier: vertical_multiplier ?? null,
    ads_sens: ads_sens ?? null,
    scope_2x: scope_2x ?? null,
    scope_3x: scope_3x ?? null,
    scope_4x: scope_4x ?? null,
    scope_6x: scope_6x ?? null,
    scope_8x: scope_8x ?? null,
    scope_15x: scope_15x ?? null,
    mouse: mouse || null,
    keyboard: keyboard || null,
    headset: headset || null,
    mousepad: mousepad || null,
    monitor: monitor || null,
    notes: notes || null,
  };

  const { data: setup, error } = await supabase
    .from('setups')
    .upsert(row, { onConflict: 'profile_id' })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ setup });
}
