# EscalAds Platform

EscalAds combines Meta Ad Library scraping, creative intelligence, and a dashboard for media buying teams. This monorepo hosts the Next.js frontend, Fastify/Supabase backend, Chrome extension collector, and a shared type package.

## Architecture overview

- **apps/web** - Next.js dashboard with shadcn/ui, React Query, and JWT auth against the API.
- **apps/api** - Fastify + Supabase (managed Postgres with RLS), BullMQ (Redis) queues, MinIO storage for creatives, REST/Swagger endpoints.
- **apps/extension** - Manifest v3 Chrome extension that watches Meta Ad Library pages, extracts creative metadata, and posts AdSnapshotPayload objects to the API.
- **packages/shared** - Zod schemas and TypeScript DTOs shared across every runtime.
- **docker-compose.yml** - spins up Redis, MinIO, API, and worker for local development (Supabase remains hosted or via Supabase CLI).

## Requirements

- Node.js 20+
- pnpm 9+
- Docker + Docker Compose (Redis + MinIO)
- Supabase project (cloud or self-hosted) with tables described in docs/supabase-schema.md

## Getting started

`ash
# install dependencies
pnpm install

# copy env files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# bring up redis + minio + api/worker shell
docker-compose up -d

# run dev servers
pnpm run dev:web
pnpm run dev:api
`

Set the following API environment variables before running the stack:

- SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (required by API + worker)
- SUPABASE_ANON_KEY (shared with the extension/web when needed)
- MINIO_* (local MinIO instance – defaults in docker-compose.yml)
- REDIS_URL (defaults to the compose service)
- JWT credentials (DEFAULT_LOGIN_EMAIL / DEFAULT_LOGIN_PASSWORD and JWT_SECRET)

Supabase tables, views, and RLS policies are documented in [docs/supabase-schema.md](docs/supabase-schema.md). Use Supabase migrations/CLI to apply schema changes and keep that document updated.

The dashboard runs on [http://localhost:3000](http://localhost:3000) and the API on [http://localhost:4000](http://localhost:4000). Swagger docs are exposed at /docs.

### Environment variables

- **API** (pps/api/.env.example)
  - SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY, JWT_SECRET, MINIO_*, REDIS_URL, ASSET_QUEUE_NAME.
- **Web** (pps/web/.env.example)
  - NEXT_PUBLIC_API_URL pointing to the API host.
- **Extension**
  - Configured via the options page (API base + JWT token). Defaults are populated on first install.

### Asset worker

The d-asset-download queue downloads images/videos referenced by the extension, stores them in MinIO, and enriches metadata. The worker runs as part of docker-compose, but you can launch it manually:

`ash
pnpm --filter @escalads/api run queue:worker
`

### Directory layout

`
apps/
  api/         Fastify + Supabase + queues
  web/         Next.js dashboard
  extension/   Chrome MV3 collector
packages/
  shared/      Zod schemas and DTOs
`

## Useful scripts

| Command | Description |
| --- | --- |
| pnpm run dev:web | Next.js dashboard in dev mode |
| pnpm run dev:api | Fastify API with tsx reload |
| pnpm run dev --workspace @escalads/extension | Rebuild extension bundle with watch |
| pnpm run build | Build web + API bundles |
| pnpm run lint | Lint web and API workspaces |

## Chrome extension

1. Execute pnpm run dev --workspace @escalads/extension to generate pps/extension/dist.
2. In chrome://extensions, enable developer mode and load the unpacked folder pps/extension/dist.
3. Open the options page and set API Base URL plus the JWT token (copy it after logging in on the dashboard).
4. Browse the Meta Ad Library; creatives are posted to /ads and queued for asset download.

## Next steps

- Improve DOM heuristics in the content script to capture countries, languages, and incremental updates.
- Add automated tests (unit/API/e2e) and CI workflows.
- Ship container images for API/worker and deploy the dashboard to your hosting of choice.
- Integrate a managed auth provider or provisioning workflow for multi-tenant accounts.
