import { NextResponse } from 'next/server';
import { createOfferSchema } from '@/lib/validators/offers';
import { serviceRoleInsert } from '@/lib/supabase/auth';
import type { Offer } from '@/lib/supabase/types';

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => ({}));
    const data = createOfferSchema.parse(payload);

    const [offer] = await serviceRoleInsert('offers', [
      {
        name: data.name,
        platform: data.platform,
        country: data.country,
        summary: data.summary,
        funnel_type: data.funnel_type,
        niche: data.niche,
        is_monitored: data.is_monitored,
        checkout_url: data.checkout_url,
        ads_page_url: data.ads_page_url,
        conversion_page_url: data.conversion_page_url,
        total_ads_today: 0,
        variation_percent: null,
        status: 'estável',
      },
    ] satisfies Partial<Offer>[]);

    return NextResponse.json({ offer }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: 'Não foi possível cadastrar a oferta.' }, { status: 400 });
  }
}
