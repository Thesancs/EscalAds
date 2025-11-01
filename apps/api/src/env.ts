import {config} from 'dotenv';
import {z} from 'zod';

config({path: process.env.NODE_ENV === 'test' ? '.env.test' : undefined});

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  JWT_SECRET: z.string().min(16),
  DEFAULT_LOGIN_EMAIL: z.string().email().default('admin@escalads.dev'),
  DEFAULT_LOGIN_PASSWORD: z.string().min(1).default('changeme'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_ANON_KEY: z.string().min(1).optional(),
  MINIO_ENDPOINT: z.string(),
  MINIO_PORT: z.coerce.number().default(9000),
  MINIO_ACCESS_KEY: z.string(),
  MINIO_SECRET_KEY: z.string(),
  MINIO_USE_SSL: z
    .union([z.string(), z.boolean()])
    .default('false')
    .transform((value) => value === 'true' || value === true),
  MINIO_BUCKET_ADS: z.string().default('ad-creatives'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  ASSET_QUEUE_NAME: z.string().default('ad-asset-download')
});

export type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse(process.env);
