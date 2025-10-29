import { NextResponse } from 'next/server';
import { clearSessionCookies } from '@/lib/supabase/auth';
import { getRefreshTokenFromCookies } from '@/lib/supabase/client';
import { assertSupabaseEnv } from '@/lib/supabase/config';

export async function POST() {
  const refreshToken = await getRefreshTokenFromCookies();
  if (refreshToken) {
    const { url, anonKey } = assertSupabaseEnv();
    await fetch(`${url}/auth/v1/logout`, {
      method: 'POST',
      headers: {
        apikey: anonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    }).catch(() => undefined);
  }

  await clearSessionCookies();
  return NextResponse.json({ ok: true });
}
