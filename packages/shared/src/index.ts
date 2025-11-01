import {z} from 'zod';

export const userRoleSchema = z.enum(['OWNER', 'ADMIN', 'MEMBER']);
export type UserRole = z.infer<typeof userRoleSchema>;

export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters long')
});
export type LoginRequest = z.infer<typeof loginRequestSchema>;

const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  fullName: z.string().nullable(),
  role: userRoleSchema,
  apiKeyLastRotatedAt: z.string().nullable().optional(),
  hasApiKey: z.boolean().optional()
});

export const loginResponseSchema = z.object({
  token: z.string(),
  user: userSchema
});
export type LoginResponse = z.infer<typeof loginResponseSchema>;

export const currentUserSchema = userSchema.extend({
  createdAt: z.string().optional()
});
export type CurrentUser = z.infer<typeof currentUserSchema>;

export const registerRequestSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6),
    fullName: z.string().min(2).nullable().optional(),
    role: userRoleSchema.optional()
  })
  .strict();
export type RegisterRequest = z.infer<typeof registerRequestSchema>;

export const adPlatformSchema = z.enum(['FACEBOOK', 'INSTAGRAM']);
export type AdPlatform = z.infer<typeof adPlatformSchema>;

export const creativeFormatSchema = z.enum(['IMAGE', 'VIDEO', 'CAROUSEL', 'HTML5']);
export type CreativeFormat = z.infer<typeof creativeFormatSchema>;

export const assetTypeSchema = z.enum(['IMAGE', 'VIDEO', 'UNKNOWN']);
export type AssetType = z.infer<typeof assetTypeSchema>;

export const spendBucketSchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH']);
export type SpendBucket = z.infer<typeof spendBucketSchema>;

const adInsightAdvertiserSchema = z.object({
  totalAds: z.number().int().nonnegative(),
  activeAds: z.array(z.string())
});
export type AdInsightAdvertiser = z.infer<typeof adInsightAdvertiserSchema>;

export const adSnapshotInsightsSchema = z
  .object({
    similarAdsCount: z.number().int().nonnegative().optional(),
    similarAds: z
      .array(
        z.object({
          adLibraryId: z.string(),
          platform: adPlatformSchema.optional(),
          advertiserName: z.string().optional(),
          headline: z.string().nullable().optional(),
          primaryText: z.string().nullable().optional(),
          pageUrl: z.string().url().nullable().optional()
        })
      )
      .optional(),
    advertiser: adInsightAdvertiserSchema.optional(),
    advertiserActiveAds: z.array(z.string()).optional(),
    advertiserTotalAds: z.number().int().nonnegative().optional()
  })
  .optional();
export type AdSnapshotInsights = z.infer<typeof adSnapshotInsightsSchema>;

export const adSnapshotPayloadSchema = z.object({
  adLibraryId: z.string(),
  platform: adPlatformSchema,
  advertiserName: z.string(),
  pageUrl: z.string().url().nullable(),
  primaryText: z.string().nullable(),
  headline: z.string().nullable(),
  callToAction: z.string().nullable(),
  countries: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
  creativeFormat: creativeFormatSchema,
  spendBucket: spendBucketSchema.nullable(),
  impressionsRange: z.string().nullable(),
  firstSeenAt: z.coerce.date(),
  lastSeenAt: z.coerce.date(),
  assets: z.array(
    z.object({
      type: assetTypeSchema,
      url: z.string().url().nullable(),
      mimeType: z.string().nullable(),
      width: z.number().int().positive().nullable(),
      height: z.number().int().positive().nullable(),
      durationMs: z.number().int().positive().nullable()
    })
  ),
  insights: adSnapshotInsightsSchema,
  extensionVersion: z.string().optional(),
  raw: z.record(z.unknown()).optional()
});
export type AdSnapshotPayload = z.infer<typeof adSnapshotPayloadSchema>;

export const adSearchSchema = z.object({
  query: z.string().optional(),
  platform: adPlatformSchema.optional(),
  country: z.string().optional(),
  language: z.string().optional(),
  advertiser: z.string().optional(),
  minActiveDays: z.number().int().optional(),
  sortBy: z.enum(['recent', 'active_days', 'variations']).default('recent'),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(50).default(12)
});
export type AdSearchQuery = z.infer<typeof adSearchSchema>;

export const adListItemSchema = z.object({
  id: z.string(),
  advertiserName: z.string(),
  platform: adPlatformSchema,
  primaryText: z.string().nullable(),
  headline: z.string().nullable(),
  callToAction: z.string().nullable(),
  countries: z.array(z.string()),
  languages: z.array(z.string()),
  creativeFormat: creativeFormatSchema,
  spendBucket: spendBucketSchema.nullable(),
  variationsCount: z.number().int(),
  isActive: z.boolean(),
  firstSeenAt: z.string(),
  lastSeenAt: z.string(),
  impressionsRange: z.string().nullable(),
  assets: z.array(
    z.object({
      id: z.string(),
      type: assetTypeSchema,
      mimeType: z.string(),
      previewUrl: z.string().url().nullable()
    })
  ),
  metrics: z
    .object({
      totalObservations: z.number().int(),
      activeDays: z.number().int(),
      variantsCount: z.number().int(),
      countrySpread: z.number().int(),
      languageSpread: z.number().int(),
      similarAdsCount: z.number().int().nonnegative().optional(),
      advertiserTotalAds: z.number().int().nonnegative().optional(),
      advertiserActiveAds: z.array(z.string()).optional()
    })
    .nullable()
});
export type AdListItem = z.infer<typeof adListItemSchema>;

export const paginatedAdsSchema = z.object({
  items: z.array(adListItemSchema),
  total: z.number().int(),
  page: z.number().int(),
  pageSize: z.number().int()
});
export type PaginatedAds = z.infer<typeof paginatedAdsSchema>;
