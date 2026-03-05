import { createSupabaseServer } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const PAGE_SIZE = 12;

// GET /api/setups — List setups (gallery)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

  const supabase = await createSupabaseServer();

  const offset = (page - 1) * PAGE_SIZE;
  const { data, count, error } = await supabase
    .from('setups')
    .select('*, profiles!inner(display_name, discord_user_id, avatar_url, handle)', { count: 'exact' })
    .order('updated_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

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

// POST — use /api/setup (singular) instead
export async function POST() {
  return NextResponse.json(
    { error: 'Use /api/setup for creating/updating setups' },
    { status: 410 }
  );
}
