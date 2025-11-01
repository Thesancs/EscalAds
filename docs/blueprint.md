# EscalAds Product Blueprint

## Product statement

EscalAds is an intelligence layer for paid social teams. It collects public creatives from Meta Ad Library, highlights campaigns that are still scaling, and makes creative patterns searchable for media buyers, affiliates, and infoproduct owners. Access to the data lake requires the official EscalAds browser extension, distributed via the web app, and authenticated through per-user API keys.

## MVP scope

- JWT-based auth (owner/admin/member roles)
- API key management (issue, rotate, revoke per profile)
- Ad ingestion endpoint (extension -> API)
- Creative storage (MinIO) with async asset download
- Dashboard with search, filters, insights, and creative list
- Chrome extension for Facebook/Instagram Ad Library capture (downloadable from the dashboard)
- Dockerised infra (Supabase-managed schema, Redis, MinIO, API worker)

## Future backlog

- Semantic search (vector DB) and similarity clustering
- Automatic classification with AI labels
- Scheduled monitoring for saved offers / advertisers
- Reporting exports and trend dashboards
- Subscription plans and billing guards

## Data model (high level)

- `User` – auth entity with role, password hash, API key (mandatory, unique per profile)
- `Ad` – canonical creative metadata (advertiser, texts, formats, spread)
- `AdAsset` – stored media in MinIO with checksum/dimensions
- `AdSnapshot` – raw capture payload from extension (audit trail)
- `AdMetric` – derived aggregation (active days, observations, spread)

## Operational flow

1. User logs into the dashboard and retrieves a JWT token.
2. From the dashboard, the user downloads the signed EscalAds extension package and installs it in their browser.
3. The user copies their personal API key (generated on profile creation and rotatable on demand) and saves it in the extension options.
4. Chrome extension monitors Meta Ad Library, extracts creatives, and posts snapshots to `/ads` using the API key for authentication alongside the JWT session.
5. API writes snapshot, upserts ad, enqueues asset downloads.
6. Worker fetches image/video, uploads to MinIO, updates `AdAsset` metadata.
7. Dashboard fetches `/ads` and `/ads/insights/summary` for filters, cards, and creative grid.

## Extension distribution & gating

- Bundle signed builds of the Chrome extension and expose them in a gated download section of the dashboard (available to authenticated users only).
- Enforce API key validation on every extension request; keys are unique per profile and can be revoked to immediately block rogue captures.
- Track extension version + API key usage to help support teams troubleshoot installation issues and detect abuse.

## Non-functional notes

- Start with eventual consistency (assets may appear after ingestion) – surface status in UI later.
- Keep infra local-friendly: everything runs via `docker-compose up -d`.
- Prefer ASCII/English naming across code and docs to avoid encoding pitfalls.
