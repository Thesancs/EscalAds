import { cookies } from 'next/headers';
import { assertSupabaseEnv } from './config';

interface SupabaseRequestOptions extends RequestInit {
  accessToken?: string | null;
  searchParams?: Record<string, string | number | boolean | undefined>;
}

function buildUrl(path: string, searchParams?: SupabaseRequestOptions['searchParams']) {
  const { url } = assertSupabaseEnv();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const finalUrl = new URL(`${url}${normalizedPath}`);

  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      finalUrl.searchParams.set(key, String(value));
    });
  }

  return finalUrl;
}

function buildHeaders(accessToken?: string | null) {
  const { anonKey, serviceKey } = assertSupabaseEnv();
  const token = accessToken ?? serviceKey ?? anonKey;

  return {
    apikey: anonKey,
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  } satisfies Record<string, string>;
}

export async function supabaseFetch<T>(
  path: string,
  { accessToken, searchParams, headers, ...init }: SupabaseRequestOptions = {},
): Promise<T> {
  const url = buildUrl(path, searchParams);
  const response = await fetch(url, {
    ...init,
    headers: {
      ...buildHeaders(accessToken),
      ...(headers ?? {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase request failed (${response.status}): ${errorText}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return (await response.json()) as T;
  }

  return undefined as T;
}

export async function getAccessTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('sb-access-token')?.value ?? null;
}

export async function getRefreshTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('sb-refresh-token')?.value ?? null;
}
