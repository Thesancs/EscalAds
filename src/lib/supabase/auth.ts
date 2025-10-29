import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { assertSupabaseEnv } from './config';
import { supabaseFetch } from './client';
import { fetchProfileById, mergeUserWithProfile } from './profiles';
import type { SupabaseAuthUser, OfferRole } from './types';

type AuthResponse = {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    user_metadata?: Record<string, unknown>;
    app_metadata?: Record<string, unknown>;
  };
};

export async function signInWithPassword(email: string, password: string) {
  const { url, anonKey } = assertSupabaseEnv();
  const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Não foi possível autenticar.');
  }

  const data = (await response.json()) as AuthResponse;
  return normalizeAuthResponse(data);
}

const VALID_ROLES: OfferRole[] = ['Owner', 'Admin', 'Membro'];

function parseRole(value: unknown): OfferRole | undefined {
  if (typeof value !== 'string') return undefined;
  return VALID_ROLES.includes(value as OfferRole) ? (value as OfferRole) : undefined;
}

export async function signUpWithPassword(
  email: string,
  password: string,
  metadata?: Record<string, unknown>,
) {
  const { url, anonKey } = assertSupabaseEnv();
  const requestedMetadata = { ...(metadata ?? {}) };
  const requestedRole =
    'role' in requestedMetadata ? parseRole(requestedMetadata.role) : undefined;

  const normalizedMetadata = {
    ...requestedMetadata,
    role: requestedRole ?? ('Membro' as OfferRole),
  };

  const response = await fetch(`${url}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      data: {
        ...normalizedMetadata,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Não foi possível criar a conta.');
  }

  const data = (await response.json()) as AuthResponse;
  return normalizeAuthResponse(data);
}

export async function refreshAccessToken(refreshToken: string) {
  const { url, anonKey } = assertSupabaseEnv();
  const response = await fetch(`${url}/auth/v1/token?grant_type=refresh_token`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Não foi possível atualizar o token.');
  }

  const data = (await response.json()) as AuthResponse;
  return normalizeAuthResponse(data);
}

export async function getUserFromAccessToken(accessToken: string) {
  const { url, anonKey } = assertSupabaseEnv();
  const response = await fetch(`${url}/auth/v1/user`, {
    method: 'GET',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Não foi possível recuperar o usuário.');
  }

  const data = (await response.json()) as AuthResponse['user'];
  return normalizeUser(data);
}

export async function persistSessionCookies(session: NormalizedAuthResponse, rememberMe = false) {
  const cookieStore = await cookies();
  const ttl = rememberMe ? 30 : 7;
  const expires = new Date(Date.now() + ttl * 24 * 60 * 60 * 1000);

  cookieStore.set('sb-access-token', session.accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    expires,
  });

  cookieStore.set('sb-refresh-token', session.refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    expires,
  });
}

export async function clearSessionCookies() {
  const cookieStore = await cookies();
  cookieStore.delete('sb-access-token');
  cookieStore.delete('sb-refresh-token');
}

export async function getCurrentUserFromCookies() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('sb-access-token')?.value;
  const refreshToken = cookieStore.get('sb-refresh-token')?.value;

  if (!accessToken && !refreshToken) {
    return null;
  }

  if (accessToken) {
    try {
      const user = await getUserFromAccessToken(accessToken);
      return await hydrateUserWithProfile(user);
    } catch (error) {
      console.error('Failed to read Supabase user from access token', error);
    }
  }

  if (refreshToken) {
    try {
      const refreshed = await refreshAccessToken(refreshToken);
      await persistSessionCookies(refreshed);
      const session = await hydrateSessionWithProfile(refreshed);
      return session.user;
    } catch (error) {
      console.error('Failed to refresh Supabase session', error);
      await clearSessionCookies();
      return null;
    }
  }

  return null;
}

export async function createSessionResponse(data: NormalizedAuthResponse, rememberMe = false) {
  await persistSessionCookies(data, rememberMe);
  return NextResponse.json({ user: data.user });
}

export type NormalizedAuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: SupabaseAuthUser;
};

function normalizeUser(user: AuthResponse['user']): SupabaseAuthUser {
  const role =
    parseRole(user.app_metadata?.role) ||
    parseRole(user.user_metadata?.role) ||
    ('Membro' as OfferRole);

  return {
    id: user.id,
    email: user.email,
    role,
    full_name: (user.user_metadata?.full_name as string | undefined) ?? null,
    avatar_url: (user.user_metadata?.avatar_url as string | undefined) ?? null,
  } satisfies SupabaseAuthUser;
}

function normalizeAuthResponse(data: AuthResponse): NormalizedAuthResponse {
  const user = normalizeUser(data.user);

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    user,
  } satisfies NormalizedAuthResponse;
}

async function hydrateUserWithProfile(
  user: SupabaseAuthUser,
): Promise<SupabaseAuthUser> {
  try {
    const profile = await fetchProfileById(user.id);
    return mergeUserWithProfile(user, profile);
  } catch (error) {
    console.error('Failed to load Supabase profile for user', user.id, error);
    return user;
  }
}

export async function hydrateSessionWithProfile(
  session: NormalizedAuthResponse,
): Promise<NormalizedAuthResponse> {
  const user = await hydrateUserWithProfile(session.user);
  return { ...session, user } satisfies NormalizedAuthResponse;
}

export async function serviceRoleSelect<T>(
  table: string,
  { match, limit, order }: { match?: Record<string, string | number | boolean>; limit?: number; order?: { column: string; ascending?: boolean } } = {},
) {
  const searchParams: Record<string, string> = {
    select: '*',
  };

  if (limit) {
    searchParams.limit = String(limit);
  }

  if (order) {
    searchParams.order = `${order.column}.${order.ascending === false ? 'desc' : 'asc'}`;
  }

  if (match) {
    Object.entries(match).forEach(([key, value]) => {
      searchParams[key] = `eq.${value}`;
    });
  }

  return supabaseFetch<T[]>(`/rest/v1/${table}`, {
    method: 'GET',
    searchParams,
  });
}

export async function serviceRoleInsert<T>(table: string, rows: T | T[]) {
  return supabaseFetch<T[]>(`/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      Prefer: 'return=representation',
    },
    body: JSON.stringify(rows),
  });
}

export async function serviceRoleUpsert<T>(table: string, rows: T | T[]) {
  return supabaseFetch<T[]>(`/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify(rows),
  });
}

export async function serviceRoleRpc<T>(fnName: string, args?: Record<string, unknown>) {
  return supabaseFetch<T>(`/rest/v1/rpc/${fnName}`, {
    method: 'POST',
    body: JSON.stringify(args ?? {}),
  });
}
