# EscalAds API

Fastify 5 API backed by Supabase (Postgres + Row Level Security), Redis/BullMQ, and MinIO for creative storage.

## Setup

`
pnpm install
cp apps/api/.env.example apps/api/.env

# configure SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET, MINIO_*, and REDIS_URL
pnpm --filter @escalads/api run dev
`

Key environment variables:

- SUPABASE_URL – project REST URL (https://<project>.supabase.co)
- SUPABASE_SERVICE_ROLE_KEY – service role key used by the API and worker
- SUPABASE_ANON_KEY – optional; surfaced to the web/extension apps
- MINIO_* – MinIO connection for asset storage
- REDIS_URL – Redis instance for BullMQ queues

Schema expectations and table descriptions live in ../../docs/supabase-schema.md. Apply changes through Supabase migrations or the SQL editor, then keep that document in sync.

### Core endpoints

- POST /auth/login – obtain JWT token (static credentials in .env for now)
- GET /ads – paginated ads with filters (query, platform, country, ...)
- POST /ads – ingest AdSnapshotPayload captured by the extension
- GET /ads/insights/summary – aggregated metrics for dashboard cards
- GET /ads/:id/assets/:assetId/download – presigned URL to fetch creatives

Swagger docs: access /docs when the server is running.

## Queues and workers

The d-asset-download queue downloads assets referenced by the extension. Workers live in src/workers/asset-downloader.worker.ts. Launch via:

`
pnpm --filter @escalads/api run queue:worker
`

Set SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY in the worker environment so it can enrich asset metadata.

## Testing (todo)

Add unit/integration tests using Vitest or Jest plus supertest for endpoints.
