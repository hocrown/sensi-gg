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
    .select('*, profiles!inner(display_name, discord_user_id, avatar_url, handle)')
    .eq('id', id)
    .single();

  if (error || !setup) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(setup);
}

// PUT /api/setups/[id] — Update setup (owner only)
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

  // Verify ownership — profile_id = user.id in new schema
  const { data: existing } = await supabase
    .from('setups')
    .select('profile_id')
    .eq('id', id)
    .single();

  if (!existing || existing.profile_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const {
    dpi, general_sens, vertical_multiplier, ads_sens,
    scope_2x, scope_3x, scope_4x, scope_6x, scope_8x, scope_15x,
    mouse, keyboard, headset, mousepad, monitor, notes,
  } = body;

  // Validate numeric fields when provided
  if (dpi !== undefined && (typeof dpi !== 'number' || dpi < 100 || dpi > 6400)) {
    return NextResponse.json({ error: 'dpi must be between 100 and 6400' }, { status: 400 });
  }
  if (general_sens !== undefined && (typeof general_sens !== 'number' || general_sens < 1 || general_sens > 100)) {
    return NextResponse.json({ error: 'general_sens must be between 1 and 100' }, { status: 400 });
  }
  const sensFields = { ads_sens, scope_2x, scope_3x, scope_4x, scope_6x, scope_8x, scope_15x };
  for (const [key, val] of Object.entries(sensFields)) {
    if (val !== undefined && val !== null && (typeof val !== 'number' || val < 1 || val > 100)) {
      return NextResponse.json({ error: `${key} must be between 1 and 100` }, { status: 400 });
    }
  }
  if (vertical_multiplier !== undefined && vertical_multiplier !== null &&
      (typeof vertical_multiplier !== 'number' || vertical_multiplier < 0.5 || vertical_multiplier > 2.0)) {
    return NextResponse.json({ error: 'vertical_multiplier must be between 0.5 and 2.0' }, { status: 400 });
  }
  const textFields = { mouse, keyboard, headset, mousepad, monitor };
  for (const [key, val] of Object.entries(textFields)) {
    if (val !== undefined && val !== null && (typeof val !== 'string' || val.length > 100)) {
      return NextResponse.json({ error: `${key} must be a string under 100 characters` }, { status: 400 });
    }
  }
  if (notes !== undefined && notes !== null && (typeof notes !== 'string' || notes.length > 1000)) {
    return NextResponse.json({ error: 'notes must be under 1000 characters' }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (dpi !== undefined) updates.dpi = dpi;
  if (general_sens !== undefined) updates.general_sens = general_sens;
  if (vertical_multiplier !== undefined) updates.vertical_multiplier = vertical_multiplier;
  if (ads_sens !== undefined) updates.ads_sens = ads_sens;
  if (scope_2x !== undefined) updates.scope_2x = scope_2x;
  if (scope_3x !== undefined) updates.scope_3x = scope_3x;
  if (scope_4x !== undefined) updates.scope_4x = scope_4x;
  if (scope_6x !== undefined) updates.scope_6x = scope_6x;
  if (scope_8x !== undefined) updates.scope_8x = scope_8x;
  if (scope_15x !== undefined) updates.scope_15x = scope_15x;
  if (mouse !== undefined) updates.mouse = mouse;
  if (keyboard !== undefined) updates.keyboard = keyboard;
  if (headset !== undefined) updates.headset = headset;
  if (mousepad !== undefined) updates.mousepad = mousepad;
  if (monitor !== undefined) updates.monitor = monitor;
  if (notes !== undefined) updates.notes = notes;

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

// DELETE /api/setups/[id] — Delete setup (owner only)
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

  const { data: existing } = await supabase
    .from('setups')
    .select('profile_id')
    .eq('id', id)
    .single();

  if (!existing || existing.profile_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await supabase.from('setups').delete().eq('id', id);

  return NextResponse.json({ success: true });
}
