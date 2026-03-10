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
// Supports tab-based partial updates: body.tab = 'sens' | 'gear' | 'tips'
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const tab = body.tab as string | undefined;

  // Build row with only the fields for the given tab
  const row: Record<string, unknown> = { profile_id: user.id };

  if (!tab || tab === 'sens') {
    const { dpi, general_sens } = body;

    if (!dpi || !general_sens) {
      return NextResponse.json({ error: 'dpi and general_sens are required' }, { status: 400 });
    }
    if (typeof dpi !== 'number' || dpi < 100 || dpi > 6400) {
      return NextResponse.json({ error: 'dpi must be between 100 and 6400' }, { status: 400 });
    }
    if (typeof general_sens !== 'number' || general_sens < 1 || general_sens > 100) {
      return NextResponse.json({ error: 'general_sens must be between 1 and 100' }, { status: 400 });
    }

    row.dpi = dpi;
    row.general_sens = general_sens;
    row.vertical_multiplier = body.vertical_multiplier ?? null;
    row.ads_sens = body.ads_sens ?? null;
    row.scope_2x = body.scope_2x ?? null;
    row.scope_3x = body.scope_3x ?? null;
    row.scope_4x = body.scope_4x ?? null;
    row.scope_6x = body.scope_6x ?? null;
    row.scope_8x = body.scope_8x ?? null;
    row.scope_15x = body.scope_15x ?? null;
  }

  if (!tab || tab === 'gear') {
    row.mouse = body.mouse || null;
    row.keyboard = body.keyboard || null;
    row.headset = body.headset || null;
    row.mousepad = body.mousepad || null;
    row.monitor = body.monitor || null;
    row.monitor_settings = body.monitor_settings || null;
  }

  if (!tab || tab === 'tips') {
    row.notes = body.notes || null;
  }

  // For partial updates (tab specified), check if setup exists first
  if (tab) {
    const { data: existing } = await supabase
      .from('setups')
      .select('id')
      .eq('profile_id', user.id)
      .single();

    if (existing) {
      // Update only the tab's fields
      const { profile_id, ...updateFields } = row;
      const { data: setup, error } = await supabase
        .from('setups')
        .update(updateFields)
        .eq('profile_id', user.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ setup });
    }

    // No existing setup — for gear/tips tab, need dpi/general_sens for initial insert
    if (tab !== 'sens') {
      return NextResponse.json(
        { error: 'Please save Sensitivity settings first' },
        { status: 400 }
      );
    }
  }

  // Full upsert (no tab specified, or first-time sens save)
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
