import { serviceRoleSelect } from '@/lib/supabase/auth';
import { supabaseFetch } from './client';
import type {
  Offer,
  MonitoredOffer,
  OfferTrackingRow,
  MonitoredOfferTrackingRow,
  SupabaseAuthAdminUser,
  SupabaseAuthAdminListResponse,
  SupabaseProfile,
  AdminProfile,
} from './types';

export async function fetchOffers() {
  return serviceRoleSelect<Offer>('offers', { order: { column: 'name' } });
}

export async function fetchOfferById(offerId: string) {
  const [offer] = await serviceRoleSelect<Offer>('offers', {
    match: { id: offerId },
    limit: 1,
  });

  if (!offer) {
    throw new Error('Oferta não encontrada.');
  }

  return offer;
}

export async function fetchOfferTracking(offerId: string) {
  return serviceRoleSelect<OfferTrackingRow>('offer_tracking', {
    match: { offer_id: offerId },
    order: { column: 'date', ascending: false },
  });
}

export async function fetchMonitoredOffers() {
  return serviceRoleSelect<MonitoredOffer>('monitored_offers', { order: { column: 'created_at', ascending: false } });
}

export async function fetchMonitoredOfferTracking(monitoredOfferId: string) {
  return serviceRoleSelect<MonitoredOfferTrackingRow>('monitored_offer_tracking', {
    match: { monitored_offer_id: monitoredOfferId },
    order: { column: 'date', ascending: false },
  });
}

async function listAllAuthUsers() {
  const users: SupabaseAuthAdminUser[] = [];
  let pageToken: string | null = null;

  do {
    const searchParams: Record<string, string> = pageToken
      ? { page_token: pageToken }
      : { page: '1', per_page: '200' };

    const response = await supabaseFetch<SupabaseAuthAdminListResponse>(`/auth/v1/admin/users`, {
      method: 'GET',
      searchParams,
    });

    if (response?.users?.length) {
      users.push(...response.users);
    }

    pageToken = (response?.next_page ?? response?.nextPage ?? null) || null;
  } while (pageToken);

  return users;
}

function resolveStatus(user: SupabaseAuthAdminUser | undefined): 'ativo' | 'trial' | 'suspenso' {
  if (!user) {
    return 'trial';
  }

  if (user.banned_until) {
    return 'suspenso';
  }

  if (user.email_confirmed_at || user.last_sign_in_at) {
    return 'ativo';
  }

  return 'trial';
}

export async function fetchAdminProfiles(): Promise<AdminProfile[]> {
  const [profiles, authUsers] = await Promise.all([
    serviceRoleSelect<SupabaseProfile>('profiles', {
      order: { column: 'created_at', ascending: false },
    }),
    listAllAuthUsers(),
  ]);

  const usersById = new Map(authUsers.map((user) => [user.id, user]));

  return profiles.map((profile) => {
    const user = usersById.get(profile.id);
    const avatar = (user?.user_metadata?.avatar_url as string | undefined) ?? null;

    return {
      id: profile.id,
      full_name: profile.full_name,
      role: profile.role,
      email: user?.email ?? null,
      status: resolveStatus(user),
      avatar_url: avatar,
      created_at: profile.created_at ?? user?.created_at ?? null,
      last_sign_in_at: user?.last_sign_in_at ?? null,
      tags: [],
    } satisfies AdminProfile;
  });
}
