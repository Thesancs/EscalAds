
import {
  adSearchSchema,
  loginRequestSchema,
  loginResponseSchema,
  paginatedAdsSchema,
  registerRequestSchema
} from '@escalads/shared';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type RequestOptions = RequestInit & {
  token?: string | null;
};

async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const {token, headers, ...rest} = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(headers ?? {}),
      ...(token ? {Authorization: `Bearer ${token}`} : {})
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    const fallbackMessage = `API request failed with status ${response.status}`;
    try {
      const payload = await response.json();
      throw new Error(payload.message ?? fallbackMessage);
    } catch {
      throw new Error(fallbackMessage);
    }
  }

  return (await response.json()) as T;
}

export async function login(email: string, password: string) {
  const payload = loginRequestSchema.parse({email, password});
  const response = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return loginResponseSchema.parse(response);
}

export async function register(email: string, password: string, fullName?: string | null) {
  const payload = registerRequestSchema.parse({
    email,
    password,
    fullName: fullName ?? null
  });

  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function getCurrentUser(token: string) {
  return apiFetch('/auth/me', {
    method: 'GET',
    token
  });
}

export interface GetAdsParams {
  query?: string;
  platform?: 'FACEBOOK' | 'INSTAGRAM';
  country?: string;
  language?: string;
  advertiser?: string;
  minActiveDays?: number;
  sortBy?: 'recent' | 'active_days' | 'variations';
  page?: number;
  pageSize?: number;
}

export async function getAds(token: string, params: GetAdsParams = {}) {
  const searchParams = new URLSearchParams();

  const parsed = adSearchSchema.parse(params);

  Object.entries(parsed).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  const response = await apiFetch(`/ads${queryString ? `?${queryString}` : ''}`, {
    method: 'GET',
    token
  });

  return paginatedAdsSchema.parse(response);
}

export async function getAd(token: string, adId: string) {
  return apiFetch(`/ads/${adId}`, {
    method: 'GET',
    token
  });
}

export async function getSummary(token: string) {
  return apiFetch('/ads/insights/summary', {
    method: 'GET',
    token
  });
}

export async function getAssetDownloadUrl(token: string, adId: string, assetId: string) {
  return apiFetch<{url: string}>(`/ads/${adId}/assets/${assetId}/download`, {
    method: 'GET',
    token
  });
}
