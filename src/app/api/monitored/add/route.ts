import { NextResponse } from 'next/server';
import { createMonitoredOfferSchema } from '@/lib/validators/offers';
import { serviceRoleInsert } from '@/lib/supabase/auth';
import { getCurrentUserFromCookies } from '@/lib/supabase/auth';
import type { MonitoredOffer } from '@/lib/supabase/types';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { offer_url, offer_name } = createMonitoredOfferSchema.parse(body);

  const user = await getCurrentUserFromCookies();
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const [record] = await serviceRoleInsert('monitored_offers', [
    {
      user_id: user.id,
      offer_url,
      offer_name: offer_name ?? null,
      status: 'estável',
      last_ads_count: 0,
      last_variation: 0,
    },
  ] satisfies Partial<MonitoredOffer>[]);

  return NextResponse.json({ monitored_offer: record });
}
