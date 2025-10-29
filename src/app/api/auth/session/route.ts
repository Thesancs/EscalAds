import { NextResponse } from 'next/server';
import { getCurrentUserFromCookies } from '@/lib/supabase/auth';

export async function GET() {
  const user = await getCurrentUserFromCookies();
  return NextResponse.json({ user });
}
