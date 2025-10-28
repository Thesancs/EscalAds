export type OfferStatus = 'escalando' | 'estável' | 'caindo';

export interface Offer {
  id: string;
  name: string;
  platform: string | null;
  country: string | null;
  total_ads_today: number;
  variation_percent: number | null;
  status: OfferStatus;
  created_at: string;
  updated_at: string | null;
}

export interface OfferTrackingRow {
  id: string;
  offer_id: string;
  date: string;
  ads_count: number;
  variation: number | null;
  status: OfferStatus;
  created_at: string;
}

export interface MonitoredOffer {
  id: string;
  user_id: string;
  offer_name: string | null;
  offer_url: string;
  last_ads_count: number | null;
  last_variation: number | null;
  status: OfferStatus;
  created_at: string;
}

export interface MonitoredOfferTrackingRow {
  id: string;
  monitored_offer_id: string;
  date: string;
  ads_count: number;
  variation: number | null;
  status: OfferStatus;
  created_at: string;
}

export type OfferRole = 'Owner' | 'Admin' | 'Membro';

export interface SupabaseProfile {
  id: string;
  full_name: string | null;
  role: OfferRole;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface SupabaseAuthUser {
  id: string;
  email: string;
  role: OfferRole;
  full_name?: string | null;
  avatar_url?: string | null;
}
