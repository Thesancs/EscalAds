import { z } from 'zod';

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
