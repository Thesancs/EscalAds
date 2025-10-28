import { serviceRoleSelect, serviceRoleInsert } from '@/lib/supabase/auth';
import type { Offer, MonitoredOffer, OfferTrackingRow, MonitoredOfferTrackingRow } from '@/lib/supabase/types';
import { determineStatus, calculateVariation } from '@/lib/monitoring/status';

async function getTodayAdCount(offer: Offer): Promise<number> {
  // Placeholder implementation. Replace with an integration to your data source.
  return offer.total_ads_today;
}

async function getTodayAdCountFromLibrary(_url: string): Promise<number> {
  // Placeholder implementation for manual monitored offers.
  return Math.floor(Math.random() * 200);
}

async function updateOfferTracking(offer: Offer, adsCount: number, date: string) {
  const previous = await serviceRoleSelect<OfferTrackingRow>('offer_tracking', {
    match: { offer_id: offer.id },
    order: { column: 'date', ascending: false },
    limit: 1,
  });

  const lastCount = previous[0]?.ads_count ?? 0;
  const variation = calculateVariation(lastCount, adsCount);
  const status = determineStatus(variation);

  await serviceRoleInsert('offer_tracking', [
    {
      offer_id: offer.id,
      date,
      ads_count: adsCount,
      variation,
      status,
    },
  ] satisfies Partial<OfferTrackingRow>[]);

  return { variation, status };
}

async function updateMonitoredOfferTracking(
  offer: MonitoredOffer,
  adsCount: number,
  date: string,
) {
  const previous = await serviceRoleSelect<MonitoredOfferTrackingRow>('monitored_offer_tracking', {
    match: { monitored_offer_id: offer.id },
    order: { column: 'date', ascending: false },
    limit: 1,
  });

  const lastCount = previous[0]?.ads_count ?? 0;
  const variation = calculateVariation(lastCount, adsCount);
  const status = determineStatus(variation);

  await serviceRoleInsert('monitored_offer_tracking', [
    {
      monitored_offer_id: offer.id,
      date,
      ads_count: adsCount,
      variation,
      status,
    },
  ] satisfies Partial<MonitoredOfferTrackingRow>[]);

  return { variation, status };
}

export async function updateAllOffersDaily(date: string) {
  const offers = await serviceRoleSelect<Offer>('offers');
  for (const offer of offers) {
    const count = await getTodayAdCount(offer);
    await updateOfferTracking(offer, count, date);
  }

  const monitored = await serviceRoleSelect<MonitoredOffer>('monitored_offers');
  for (const item of monitored) {
    const count = await getTodayAdCountFromLibrary(item.offer_url);
    await updateMonitoredOfferTracking(item, count, date);
  }
}
