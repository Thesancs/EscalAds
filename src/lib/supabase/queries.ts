import { serviceRoleSelect } from '@/lib/supabase/auth';
import type { Offer, MonitoredOffer, OfferTrackingRow, MonitoredOfferTrackingRow } from './types';

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
