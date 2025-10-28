import { NextResponse } from 'next/server';
import { updateMonitoredOfferSchema } from '@/lib/validators/offers';
import { serviceRoleInsert, serviceRoleSelect, serviceRoleUpsert } from '@/lib/supabase/auth';
import { calculateVariation, determineStatus } from '@/lib/monitoring/status';
import type { MonitoredOffer, MonitoredOfferTrackingRow } from '@/lib/supabase/types';

function normaliseDate(date?: string) {
  if (!date) {
    return new Date().toISOString().split('T')[0];
  }

  return new Date(date).toISOString().split('T')[0];
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { monitored_offer_id, ads_count, date } = updateMonitoredOfferSchema.parse(body);
  const collectionDate = normaliseDate(date);

  const [offer] = await serviceRoleSelect<MonitoredOffer>('monitored_offers', {
    match: { id: monitored_offer_id },
  });

  if (!offer) {
    return NextResponse.json({ error: 'Oferta monitorada não encontrada.' }, { status: 404 });
  }

  const [previous] = await serviceRoleSelect<MonitoredOfferTrackingRow>('monitored_offer_tracking', {
    match: { monitored_offer_id },
    order: { column: 'date', ascending: false },
    limit: 1,
  });

  const variation = calculateVariation(previous?.ads_count ?? offer.last_ads_count ?? 0, ads_count);
  const status = determineStatus(variation);

  await serviceRoleInsert('monitored_offer_tracking', [
    {
      monitored_offer_id,
      date: collectionDate,
      ads_count,
      variation,
      status,
    },
  ] satisfies Partial<MonitoredOfferTrackingRow>[]);

  await serviceRoleUpsert('monitored_offers', [
    {
      id: monitored_offer_id,
      last_ads_count: ads_count,
      last_variation: variation,
      status,
    },
  ] satisfies Partial<MonitoredOffer>[]);

  return NextResponse.json({ ok: true, variation, status });
}
