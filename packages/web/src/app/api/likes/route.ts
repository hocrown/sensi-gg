import { NextResponse } from 'next/server';

// Likes table was removed in migration 002. Return stub responses to avoid UI errors.
export async function POST() {
  return NextResponse.json({ liked: false, totalLikes: 0 });
}
