# EscalAds Product Blueprint

## Product statement

EscalAds is an intelligence layer for paid social teams. It collects public creatives from Meta Ad Library, highlights campaigns that are still scaling, and makes creative patterns searchable for media buyers, affiliates, and infoproduct owners.

## MVP scope

- JWT-based auth (owner/admin/member roles)
- Ad ingestion endpoint (extension -> API)
- Creative storage (MinIO) with async asset download
- Dashboard with search, filters, insights, and creative list
- Chrome extension for Facebook/Instagram Ad Library capture
- Dockerised infra (Supabase-managed schema, Redis, MinIO, API worker)

## Future backlog

- Semantic search (vector DB) and similarity clustering
- Automatic classification with AI labels
- Scheduled monitoring for saved offers / advertisers
- Reporting exports and trend dashboards
- Subscription plans and billing guards

## Data model (high level)

- `User` – auth entity with role, password hash, API key (future)
- `Ad` – canonical creative metadata (advertiser, texts, formats, spread)
- `AdAsset` – stored media in MinIO with checksum/dimensions
- `AdSnapshot` – raw capture payload from extension (audit trail)
- `AdMetric` – derived aggregation (active days, observations, spread)

## Operational flow

1. User logs into the dashboard and retrieves a JWT token.
2. Chrome extension monitors Meta Ad Library, extracts creatives, and posts snapshots to `/ads`.
3. API writes snapshot, upserts ad, enqueues asset downloads.
4. Worker fetches image/video, uploads to MinIO, updates `AdAsset` metadata.
5. Dashboard fetches `/ads` and `/ads/insights/summary` for filters, cards, and creative grid.

## Non-functional notes

- Start with eventual consistency (assets may appear after ingestion) – surface status in UI later.
- Keep infra local-friendly: everything runs via `docker-compose up -d`.
- Prefer ASCII/English naming across code and docs to avoid encoding pitfalls.
