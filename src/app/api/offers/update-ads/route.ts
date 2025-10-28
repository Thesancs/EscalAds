import { NextResponse } from 'next/server';
import { updateOfferAdsSchema } from '@/lib/validators/offers';
import { serviceRoleInsert, serviceRoleSelect, serviceRoleUpsert } from '@/lib/supabase/auth';
import { calculateVariation, determineStatus } from '@/lib/monitoring/status';
import type { Offer, OfferTrackingRow } from '@/lib/supabase/types';

function normaliseDate(date?: string) {
  if (!date) {
    return new Date().toISOString().split('T')[0];
  }

  return new Date(date).toISOString().split('T')[0];
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { offer_id, ads_count, date } = updateOfferAdsSchema.parse(body);
  const collectionDate = normaliseDate(date);

  const [offer] = await serviceRoleSelect<Offer>('offers', { match: { id: offer_id } });
  if (!offer) {
    return NextResponse.json({ error: 'Oferta não encontrada.' }, { status: 404 });
  }

  const [previous] = await serviceRoleSelect<OfferTrackingRow>('offer_tracking', {
    match: { offer_id },
    order: { column: 'date', ascending: false },
    limit: 1,
  });

  const variation = calculateVariation(previous?.ads_count ?? offer.total_ads_today ?? 0, ads_count);
  const status = determineStatus(variation);

  await serviceRoleInsert('offer_tracking', [
    {
      offer_id,
      date: collectionDate,
      ads_count,
      variation,
      status,
    },
  ] satisfies Partial<OfferTrackingRow>[]);

  await serviceRoleUpsert('offers', [
    {
      id: offer_id,
      total_ads_today: ads_count,
      variation_percent: variation,
      status,
    },
  ] satisfies Partial<Offer>[]);

  return NextResponse.json({ ok: true, variation, status });
}
