import { supabaseFetch } from './client';
import type { OfferRole, SupabaseAuthUser, SupabaseProfile } from './types';

export async function fetchProfileById(userId: string): Promise<SupabaseProfile | null> {
  const rows = await supabaseFetch<SupabaseProfile[]>(`/rest/v1/profiles`, {
    method: 'GET',
    searchParams: {
      select: '*',
      id: `eq.${userId}`,
      limit: '1',
    },
  });

  if (!rows || rows.length === 0) {
    return null;
  }

  return rows[0];
}

export async function upsertProfileForUser({
  id,
  full_name,
  role,
}: {
  id: string;
  full_name?: string | null;
  role: OfferRole;
}) {
  await supabaseFetch(`/rest/v1/profiles`, {
    method: 'POST',
    headers: {
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify([
      {
        id,
        full_name: full_name ?? null,
        role,
      },
    ]),
  });
}

export function mergeUserWithProfile(
  user: SupabaseAuthUser,
  profile: SupabaseProfile | null,
): SupabaseAuthUser {
  if (!profile) {
    return user;
  }

  return {
    ...user,
    role: profile.role,
    full_name: profile.full_name ?? user.full_name ?? null,
  } satisfies SupabaseAuthUser;
}
