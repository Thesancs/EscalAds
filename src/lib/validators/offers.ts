import { z } from 'zod';
import type { OfferFunnelType } from '@/lib/supabase/types';

const funnelTypes = ['VSL', 'Quiz', 'LP'] as const satisfies readonly OfferFunnelType[];

const trimOrUndefined = (value: unknown) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

const optionalText = (min = 2, max = 120) =>
  z.preprocess(trimOrUndefined, z.string().min(min).max(max)).optional();

const optionalUrl = () => z.preprocess(trimOrUndefined, z.string().url()).optional();

export const createOfferSchema = z
  .object({
    name: z.string().trim().min(3).max(160),
    platform: optionalText(),
    country: optionalText(),
    summary: z.string().trim().min(10).max(600),
    funnel_type: z.enum(funnelTypes),
    niche: z.string().trim().min(2).max(120),
    is_monitored: z.boolean().default(false),
    checkout_url: optionalUrl(),
    ads_page_url: optionalUrl(),
    conversion_page_url: optionalUrl(),
  });

export type CreateOfferInput = z.infer<typeof createOfferSchema>;

export const updateOfferAdsSchema = z.object({
  offer_id: z.string().uuid(),
  ads_count: z.number().int().nonnegative(),
  date: z.string().datetime().optional(),
});

export type UpdateOfferAdsInput = z.infer<typeof updateOfferAdsSchema>;

export const createMonitoredOfferSchema = z.object({
  offer_url: z.string().url(),
  offer_name: z.string().min(1).max(255).optional(),
});

export type CreateMonitoredOfferInput = z.infer<typeof createMonitoredOfferSchema>;

export const updateMonitoredOfferSchema = z.object({
  monitored_offer_id: z.string().uuid(),
  ads_count: z.number().int().nonnegative(),
  date: z.string().datetime().optional(),
});

export type UpdateMonitoredOfferInput = z.infer<typeof updateMonitoredOfferSchema>;

export const authSignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  rememberMe: z.boolean().optional(),
});

export const authSignUpSchema = authSignInSchema.extend({
  full_name: z.string().min(1).max(120).optional(),
});

export type AuthSignInInput = z.infer<typeof authSignInSchema>;
export type AuthSignUpInput = z.infer<typeof authSignUpSchema>;
