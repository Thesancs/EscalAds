# Supabase Data Model

This document translates the previous Prisma/Postgres schema into the Supabase stack, while incorporating the new requirements for extension-driven scraping, advertiser insights, and user-private offers. All tables live in the `public` schema unless stated otherwise.

## Core authentication

- `auth.users` *(managed by Supabase Auth)*  
  Stores the canonical identity. We reuse it for JWT issuing and row-level security (RLS).

- `public.profiles`  
  | Column              | Type        | Notes                                                                 |
  | ------------------- | ----------- | --------------------------------------------------------------------- |
  | `id`                | uuid        | Primary key, `references auth.users.id` (`on delete cascade`).        |
  | `email`             | text        | Kept in sync with `auth.users.email` via trigger.                     |
  | `full_name`         | text        | Optional display name.                                                |
  | `role`              | text        | Enum: `OWNER`, `ADMIN`, `MEMBER`. Defaults to `MEMBER`.               |
  | `api_key`           | text        | Nullable, reserved for future ingestion API keys.                     |
  | `created_at`        | timestamptz | Default `now()`.                                                      |
  | `updated_at`        | timestamptz | Managed by trigger.                                                   |

  **RLS**: enable and allow `SELECT/UPDATE/DELETE` only when `id = auth.uid()`. Admin/owner roles can be granted broader access through an additional policy.

## Canonical ads

- `public.ads`  
  | Column                 | Type         | Notes                                                                 |
  | ---------------------- | ------------ | --------------------------------------------------------------------- |
  | `id`                   | uuid         | Primary key (`gen_random_uuid()`).                                   |
  | `ad_library_id`        | text         | Unique per platform creative.                                        |
  | `platform`             | text         | Enum: `FACEBOOK`, `INSTAGRAM`.                                       |
  | `advertiser_name`      | text         | Indexed for full-text search.                                        |
  | `page_url`             | text         | Nullable landing page.                                               |
  | `primary_text`         | text         | Nullable.                                                            |
  | `headline`             | text         | Nullable.                                                            |
  | `call_to_action`       | text         | Nullable.                                                            |
  | `countries`            | text[]       | Store ISO country codes.                                             |
  | `languages`            | text[]       | Store ISO language codes.                                            |
  | `creative_format`      | text         | Enum: `IMAGE`, `VIDEO`, `CAROUSEL`, `HTML5`.                         |
  | `spend_bucket`         | text         | Nullable enum: `LOW`, `MEDIUM`, `HIGH`, `VERY_HIGH`.                 |
  | `variations_count`     | integer      | Defaults to 1.                                                       |
  | `is_active`            | boolean      | Defaults to `true`.                                                  |
  | `first_seen_at`        | timestamptz  | Required.                                                            |
  | `last_seen_at`         | timestamptz  | Required.                                                            |
  | `impressions_range`    | text         | Nullable.                                                            |
  | `captured_by_profile`  | uuid         | Nullable FK → `profiles.id` (first user who captured it).            |
  | `source_type`          | text         | Enum: `EXTENSION`, `USER_CUSTOM`. Enables fast filtering by origin.  |
  | `created_at`           | timestamptz  | Default `now()`.                                                     |
  | `updated_at`           | timestamptz  | Managed by trigger.                                                  |

  **Indexes**:  
  - `idx_ads_advertiser_name_trgm` (pg_trgm) for fuzzy search.  
  - `idx_ads_countries_gin` and `idx_ads_languages_gin` (GIN on arrays).  
  - `idx_ads_last_seen_at` for recency sorting.

- `public.ad_assets`  
  | Column            | Type        | Notes                                                                |
  | ----------------- | ----------- | -------------------------------------------------------------------- |
  | `id`              | uuid        | Primary key.                                                         |
  | `ad_id`           | uuid        | FK → `ads.id` (`on delete cascade`).                                 |
  | `type`            | text        | Enum: `IMAGE`, `VIDEO`, `UNKNOWN`.                                   |
  | `mime_type`       | text        | Defaults to `application/octet-stream`.                              |
  | `storage_key`     | text        | MinIO key.                                                           |
  | `storage_bucket`  | text        | MinIO bucket name.                                                   |
  | `width`           | integer     | Nullable.                                                            |
  | `height`          | integer     | Nullable.                                                            |
  | `duration_ms`     | integer     | Nullable.                                                            |
  | `checksum`        | text        | Nullable SHA-256 digest.                                             |
  | `created_at`      | timestamptz | Default `now()`.                                                     |
  | `updated_at`      | timestamptz | Managed by trigger.                                                  |

- `public.ad_snapshots`  
  Raw payload archive for provenance.

  | Column           | Type        | Notes                                                                 |
  | ---------------- | ----------- | --------------------------------------------------------------------- |
  | `id`             | uuid        | Primary key.                                                          |
  | `ad_id`          | uuid        | Nullable FK → `ads.id` (`on delete set null`).                        |
  | `ad_library_id`  | text        | Stored redundantly for debugging.                                     |
  | `raw_payload`    | jsonb       | Exact payload captured.                                              |
  | `captured_by`    | uuid        | Nullable FK → `profiles.id`.                                          |
  | `captured_at`    | timestamptz | Default `now()`.                                                      |
  | `processed`      | boolean     | Defaults to `false` until enrichment completes.                       |
  | `processing_log` | text        | Nullable diagnostic info.                                             |

- `public.ad_metrics`  
  Derived metrics that power filtering cards and satisfy the new scraping requirements.

  | Column                     | Type        | Notes                                                                 |
  | -------------------------- | ----------- | --------------------------------------------------------------------- |
  | `ad_id`                    | uuid        | Primary key, FK → `ads.id`.                                           |
  | `total_observations`       | integer     | Increments each time the ad is captured.                              |
  | `active_days`              | integer     | Rolling `CEIL(last_seen - first_seen)`.                               |
  | `variants_count`           | integer     | Defaults to 1.                                                        |
  | `country_spread`           | integer     | Derived from unique countries.                                        |
  | `language_spread`          | integer     | Derived from unique languages.                                        |
  | `similar_ads_count`        | integer     | Number of creatives classified as similar to this one.                |
  | `advertiser_total_ads`     | integer     | Total ads currently associated with the advertiser.                   |
  | `advertiser_active_ads`    | uuid[]      | Array of active ad IDs for quick drill-down.                          |
  | `last_seen_at`             | timestamptz | Mirrors `ads.last_seen_at` for efficient ordering.                    |
  | `first_seen_at`            | timestamptz | Mirrors `ads.first_seen_at`.                                          |
  | `updated_at`               | timestamptz | Managed by trigger.                                                   |

- `public.extension_captures`  
  Tracks each ingestion event from the browser extension and binds ad-level enrichment.

  | Column                 | Type        | Notes                                                             |
  | ---------------------- | ----------- | ----------------------------------------------------------------- |
  | `id`                   | uuid        | Primary key.                                                      |
  | `ad_id`                | uuid        | FK → `ads.id`.                                                    |
  | `snapshot_id`          | uuid        | FK → `ad_snapshots.id`.                                           |
  | `captured_by`          | uuid        | Nullable FK → `profiles.id`.                                      |
  | `captured_at`          | timestamptz | Default `now()`.                                                  |
  | `similar_ads_payload`  | jsonb       | Raw list of similar ads returned by scraping (ids, urls, etc.).   |
  | `advertiser_meta`      | jsonb       | Stores advertiser-level stats used to update `ad_metrics`.        |
  | `extension_version`    | text        | For debugging capture changes.                                    |

  Aggregation routines consume this table to refresh `ad_metrics`.

## User-private offers

- `public.user_custom_ads`  
  Meets the requirement of a separate table where users see only their submissions.

  | Column             | Type        | Notes                                                                                   |
  | ------------------ | ----------- | --------------------------------------------------------------------------------------- |
  | `id`               | uuid        | Primary key.                                                                            |
  | `user_id`          | uuid        | FK → `profiles.id`.                                                                     |
  | `title`            | text        | Short label for the offer.                                                              |
  | `notes`            | text        | Markdown-compatible notes.                                                              |
  | `platform`         | text        | Same enum as `ads.platform`.                                                            |
  | `advertiser_name`  | text        | Optional override.                                                                      |
  | `reference_ad_id`  | uuid        | Nullable FK → `ads.id` when the user links an existing creative.                        |
  | `similar_ads_meta` | jsonb       | Cached insight for that user (similar items, competitor list).                          |
  | `created_at`       | timestamptz | Default `now()`.                                                                        |
  | `updated_at`       | timestamptz | Managed by trigger.                                                                     |

  **RLS**: enable the table and add `SELECT/UPDATE/DELETE` policies restricted to `user_id = auth.uid()`. Optionally grant `INSERT` to authenticated users only.

- `public.user_custom_assets` *(optional helper)*  
  Allows users to attach files stored in MinIO to their private entries.

  | Column        | Type | Notes |
  | ------------- | ---- | ----- |
  | `id`          | uuid | Primary key. |
  | `custom_ad_id`| uuid | FK → `user_custom_ads.id` (`on delete cascade`). |
  | `asset_id`    | uuid | FK → `ad_assets.id` when reusing an existing creative asset. |

  RLS matches `user_custom_ads` by joining on `custom_ad_id`.

## Analytical helpers

- `public.advertisers` *(materialized view or table)*  
  Summarises advertiser-level stats for quick aggregation. Refresh via cron or background worker.

  | Column            | Type        | Notes                                                 |
  | ----------------- | ----------- | ----------------------------------------------------- |
  | `advertiser_name` | text        | Primary key.                                          |
  | `active_ads`      | integer     | Count of active ads.                                  |
  | `total_snapshots` | integer     | Total captures.                                       |
  | `last_seen_at`    | timestamptz | Latest activity.                                      |

- `public.ads_feed` *(database view)*  
  Joins `ads`, `ad_metrics`, and `ad_assets` to minimise round-trips:

  ```sql
  create view public.ads_feed as
    select
      ads.*,
      metrics.total_observations,
      metrics.active_days,
      metrics.variants_count,
      metrics.country_spread,
      metrics.language_spread,
      metrics.similar_ads_count,
      metrics.advertiser_total_ads,
      metrics.advertiser_active_ads
    from ads
    left join ad_metrics metrics on metrics.ad_id = ads.id;
  ```

  Supabase clients can then query `ads_feed` with `select('*, ad_assets(*)')`.

## Row-level security summary

| Table               | Policy goal                                             |
| ------------------- | ------------------------------------------------------- |
| `profiles`          | Users manage their own profile; admins get full access. |
| `ads`               | Readable by any authenticated user (no edits directly). |
| `ad_assets`         | Readable to facilitate creative display.                |
| `ad_snapshots`      | Restricted to staff roles due to raw payload content.   |
| `extension_captures`| Insert via service role; select restricted.            |
| `user_custom_ads`   | Fully private per user (`user_id = auth.uid()`).        |

## Suggested migrations order

1. Enable required extensions: `uuid-ossp` or `pgcrypto`, `pg_trgm`.  
2. Create enums (`ad_platform`, `creative_format`, `asset_type`, `spend_bucket`, `source_type`).  
3. Create core tables (`profiles`, `ads`, `ad_assets`, `ad_snapshots`, `ad_metrics`).  
4. Create extension-specific tables (`extension_captures`, helper views).  
5. Create user-private tables (`user_custom_ads`, `user_custom_assets`) and attach RLS policies.  
6. Populate data via migration script or Supabase SQL editor.  
7. Refresh materialized views and verify policies with Supabase CLI.

## Why this layout

- Keeps a single canonical `ads` record regardless of origin, while `source_type` and auxiliary tables capture provenance.
- Extension ingestion remains append-only via `extension_captures`, making enrichment idempotent.
- Metrics now store the “number of similar ads”, “advertiser total ads”, and “list of the advertiser’s ads”, satisfying the scraping insights with fast reads.
- User-contributed offers live in a separate table guarded by RLS, ensuring privacy without duplicating business logic.
- Views provide the superset of data the dashboard and extension already consume, minimising refactors on the front end.
