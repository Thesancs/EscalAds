import {randomUUID} from 'crypto';

import {adSearchSchema, adSnapshotPayloadSchema, paginatedAdsSchema} from '@escalads/shared';
import type {AdSnapshotInsights, AdSnapshotPayload} from '@escalads/shared';
import type {FastifyInstance} from 'fastify';

import {env} from '../env';
import type {Database, Json} from '../types/supabase';

const PAGE_SIZE_DEFAULT = 12;
const DAY_IN_MS = 1000 * 60 * 60 * 24;
const ASSET_URL_TTL_SECONDS = 60 * 60;

type AdRow = Database['public']['Tables']['ads']['Row'];
type AssetRow = Database['public']['Tables']['ad_assets']['Row'];
type MetricsRow = Database['public']['Tables']['ad_metrics']['Row'];
type SnapshotRow = Database['public']['Tables']['ad_snapshots']['Row'];

type AdListQueryRow = Pick<
  AdRow,
  | 'id'
  | 'advertiser_name'
  | 'platform'
  | 'primary_text'
  | 'headline'
  | 'call_to_action'
  | 'countries'
  | 'languages'
  | 'creative_format'
  | 'spend_bucket'
  | 'variations_count'
  | 'is_active'
  | 'first_seen_at'
  | 'last_seen_at'
  | 'impressions_range'
> & {
  ad_assets: AssetRow[] | null;
  ad_metrics: MetricsRow[] | null;
};

type AdDetailRow = AdRow & {
  ad_assets: AssetRow[] | null;
  ad_metrics: MetricsRow[] | null;
  ad_snapshots: SnapshotRow[] | null;
};

type ActiveAdSummaryRow = Pick<AdRow, 'advertiser_name' | 'platform' | 'countries'> & {
  ad_metrics: Array<
    Pick<MetricsRow, 'active_days' | 'variants_count' | 'total_observations'>
  > | null;
};

const toIsoString = (value: string | Date) =>
  (value instanceof Date ? value : new Date(value)).toISOString();

const mapAd = (ad: AdListQueryRow) => {
  const metrics = ad.ad_metrics && ad.ad_metrics.length > 0 ? ad.ad_metrics[0] : null;

  return {
    id: ad.id,
  advertiserName: ad.advertiser_name,
  platform: ad.platform,
  primaryText: ad.primary_text,
  headline: ad.headline,
  callToAction: ad.call_to_action,
  countries: ad.countries,
  languages: ad.languages,
  creativeFormat: ad.creative_format,
  spendBucket: ad.spend_bucket,
  variationsCount: ad.variations_count,
  isActive: ad.is_active,
  firstSeenAt: toIsoString(ad.first_seen_at),
  lastSeenAt: toIsoString(ad.last_seen_at),
  impressionsRange: ad.impressions_range,
  assets: (ad.ad_assets ?? []).map((asset: AssetRow) => ({
    id: asset.id,
    type: asset.type,
    mimeType: asset.mime_type,
    previewUrl: `/api/ads/${ad.id}/assets/${asset.id}/download`
  })),
    metrics: metrics
      ? {
          totalObservations: metrics.total_observations,
          activeDays: metrics.active_days,
          variantsCount: metrics.variants_count,
          countrySpread: metrics.country_spread,
          languageSpread: metrics.language_spread,
          similarAdsCount: metrics.similar_ads_count,
          advertiserTotalAds: metrics.advertiser_total_ads,
          advertiserActiveAds: metrics.advertiser_active_ads
        }
      : null
  };
};

export async function registerAdsRoutes(app: FastifyInstance) {
  app.get('/', {preHandler: [app.authenticate]}, async (request) => {
    const query = request.query as Record<string, string | undefined>;

    const filters = adSearchSchema.parse({
      query: query.q ?? query.query,
      platform: query.platform,
      country: query.country,
      language: query.language,
      advertiser: query.advertiser,
      minActiveDays: query.minActiveDays ? Number(query.minActiveDays) : undefined,
      sortBy: query.sortBy,
      page: query.page ? Number(query.page) : undefined,
      pageSize: query.pageSize ? Number(query.pageSize) : undefined
    });

    let listQuery = app.supabase
      .from('ads')
      .select(
        `
          id,
          advertiser_name,
          platform,
          primary_text,
          headline,
          call_to_action,
          countries,
          languages,
          creative_format,
          spend_bucket,
          variations_count,
          is_active,
          first_seen_at,
          last_seen_at,
          impressions_range,
          ad_assets (
            id,
            type,
            mime_type,
            storage_key,
            storage_bucket
          ),
          ad_metrics (
            total_observations,
            active_days,
            variants_count,
            country_spread,
            language_spread,
            similar_ads_count,
            advertiser_total_ads,
            advertiser_active_ads
          )
        `,
        {count: 'exact'}
      );

    if (filters.platform) {
      listQuery = listQuery.eq('platform', filters.platform);
    }

    if (filters.country) {
      listQuery = listQuery.contains('countries', [filters.country]);
    }

    if (filters.language) {
      listQuery = listQuery.contains('languages', [filters.language]);
    }

    if (filters.advertiser) {
      listQuery = listQuery.ilike('advertiser_name', `%${filters.advertiser}%`);
    }

    if (filters.query) {
      const term = filters.query.replace(/%/g, '\\%').replace(/_/g, '\\_');
      listQuery = listQuery.or(
        `advertiser_name.ilike.%${term}%,primary_text.ilike.%${term}%,headline.ilike.%${term}%`
      );
    }

    if (filters.minActiveDays) {
      listQuery = listQuery.gte('ad_metrics.active_days', filters.minActiveDays);
    }

    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? PAGE_SIZE_DEFAULT;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    switch (filters.sortBy) {
      case 'active_days':
        listQuery = listQuery.order('ad_metrics.active_days', {ascending: false});
        break;
      case 'variations':
        listQuery = listQuery.order('variations_count', {ascending: false});
        break;
      default:
        listQuery = listQuery.order('last_seen_at', {ascending: false});
        break;
    }

    listQuery = listQuery.range(from, to);

    const {data, error, count} = await listQuery;

    if (error) {
      request.log.error({error}, 'Failed to fetch ads from Supabase');
      throw app.httpErrors.internalServerError('Unable to list ads');
    }

    const mapped = ((data ?? []) as AdListQueryRow[]).map(mapAd);

    return paginatedAdsSchema.parse({
      items: mapped,
      total: count ?? 0,
      page,
      pageSize
    });
  });

  app.get('/insights/summary', {preHandler: [app.authenticate]}, async () => {
    const sevenDaysAgo = new Date(Date.now() - DAY_IN_MS * 7).toISOString();

    const [totalAdsRes, activeAdsRes, activeAdsListRes, recentCapturesRes] = await Promise.all([
      app.supabase.from('ads').select('id', {count: 'exact', head: true}),
      app.supabase.from('ads').select('id', {count: 'exact', head: true}).eq('is_active', true),
      app.supabase
        .from('ads')
        .select(
          `
            advertiser_name,
            platform,
            countries,
            ad_metrics (
              active_days,
              variants_count,
              total_observations
            )
          `
        )
        .eq('is_active', true),
      app.supabase
        .from('extension_captures')
        .select('id', {count: 'exact', head: true})
        .gte('captured_at', sevenDaysAgo)
    ]);

    if (totalAdsRes.error) {
      throw app.httpErrors.internalServerError('Failed to compute total ads');
    }
    if (activeAdsRes.error) {
      throw app.httpErrors.internalServerError('Failed to compute active ads');
    }
    if (activeAdsListRes.error) {
      throw app.httpErrors.internalServerError('Failed to compute active ad list');
    }
    if (recentCapturesRes.error) {
      throw app.httpErrors.internalServerError('Failed to compute recent captures');
    }

    const activeList = (activeAdsListRes.data ?? []) as ActiveAdSummaryRow[];

    const platformCounts: Record<string, number> = {FACEBOOK: 0, INSTAGRAM: 0};
    const countryMap = new Map<string, number>();
    const advertiserMap = new Map<
      string,
      {activeAds: number; variantsTotal: number; observations: number; activeDaysTotal: number}
    >();

    let aggregateActiveDays = 0;
    let aggregateVariants = 0;

    for (const entry of activeList) {
      platformCounts[entry.platform] = (platformCounts[entry.platform] ?? 0) + 1;

      const metrics =
        entry.ad_metrics && entry.ad_metrics.length > 0 ? entry.ad_metrics[0] : null;
      aggregateActiveDays += metrics?.active_days ?? 0;
      aggregateVariants += metrics?.variants_count ?? 1;

      advertiserMap.set(entry.advertiser_name, {
        activeAds: (advertiserMap.get(entry.advertiser_name)?.activeAds ?? 0) + 1,
        variantsTotal:
          (advertiserMap.get(entry.advertiser_name)?.variantsTotal ?? 0) +
          (metrics?.variants_count ?? 1),
        observations:
          (advertiserMap.get(entry.advertiser_name)?.observations ?? 0) +
          (metrics?.total_observations ?? 1),
        activeDaysTotal:
          (advertiserMap.get(entry.advertiser_name)?.activeDaysTotal ?? 0) +
          (metrics?.active_days ?? 0)
      });

      for (const country of entry.countries) {
        countryMap.set(country, (countryMap.get(country) ?? 0) + 1);
      }
    }

    const topCountries = Array.from(countryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([country, count]) => ({
        country,
        activeAds: count
      }));

    const topAdvertisers = Array.from(advertiserMap.entries())
      .map(([advertiserName, data]) => ({
        advertiserName,
        activeAds: data.activeAds,
        avgVariants: Number((data.variantsTotal / data.activeAds).toFixed(1)),
        avgActiveDays: Math.round(data.activeDaysTotal / data.activeAds),
        totalObservations: data.observations
      }))
      .sort((a, b) => b.activeAds - a.activeAds)
      .slice(0, 5);

    const averageActiveDays =
      activeList.length > 0 ? Math.round(aggregateActiveDays / activeList.length) : 0;
    const averageVariants =
      activeList.length > 0 ? Number((aggregateVariants / activeList.length).toFixed(1)) : 0;

    return {
      totals: {
        trackedAds: totalAdsRes.count ?? 0,
        activeAds: activeAdsRes.count ?? 0,
        advertisers: advertiserMap.size,
        recentCaptures: recentCapturesRes.count ?? 0
      },
      platformBreakdown: [
        {
          platform: 'FACEBOOK',
          activeAds: platformCounts.FACEBOOK ?? 0
        },
        {
          platform: 'INSTAGRAM',
          activeAds: platformCounts.INSTAGRAM ?? 0
        }
      ],
      topAdvertisers,
      topCountries,
      velocity: {
        averageActiveDays,
        averageVariants
      }
    };
  });

  app.get('/:id', {preHandler: [app.authenticate]}, async (request, reply) => {
    const {id} = request.params as {id: string};

    const {data, error} = await app.supabase
      .from('ads')
      .select(
        `
          *,
          ad_assets (*),
          ad_metrics (*),
          ad_snapshots (
            id,
            ad_library_id,
            raw_payload,
            captured_by,
            captured_at,
            processed,
            processing_log
          )
        `
      )
      .eq('id', id)
      .order('captured_at', {ascending: false, foreignTable: 'ad_snapshots'})
      .limit(10, {foreignTable: 'ad_snapshots'})
      .single();

    if (error) {
      request.log.error({error}, 'Failed to fetch ad from Supabase');
      return reply.notFound('Ad not found');
    }

    const ad = data as AdDetailRow;

    return {
      id: ad.id,
      adLibraryId: ad.ad_library_id,
      advertiserName: ad.advertiser_name,
      platform: ad.platform,
      pageUrl: ad.page_url,
      primaryText: ad.primary_text,
      headline: ad.headline,
      callToAction: ad.call_to_action,
      countries: ad.countries,
      languages: ad.languages,
      creativeFormat: ad.creative_format,
      spendBucket: ad.spend_bucket,
      variationsCount: ad.variations_count,
      isActive: ad.is_active,
      firstSeenAt: toIsoString(ad.first_seen_at),
      lastSeenAt: toIsoString(ad.last_seen_at),
      impressionsRange: ad.impressions_range,
      metrics: ad.ad_metrics && ad.ad_metrics.length > 0
        ? {
            totalObservations: ad.ad_metrics[0].total_observations,
            activeDays: ad.ad_metrics[0].active_days,
            variantsCount: ad.ad_metrics[0].variants_count,
            countrySpread: ad.ad_metrics[0].country_spread,
            languageSpread: ad.ad_metrics[0].language_spread,
            similarAdsCount: ad.ad_metrics[0].similar_ads_count,
            advertiserTotalAds: ad.ad_metrics[0].advertiser_total_ads,
            advertiserActiveAds: ad.ad_metrics[0].advertiser_active_ads
          }
        : null,
      assets: (ad.ad_assets ?? []).map((asset: AssetRow) => ({
        id: asset.id,
        adId: asset.ad_id,
        type: asset.type,
        mimeType: asset.mime_type,
        storageKey: asset.storage_key,
        storageBucket: asset.storage_bucket,
        width: asset.width,
        height: asset.height,
        durationMs: asset.duration_ms,
        checksum: asset.checksum,
        createdAt: toIsoString(asset.created_at),
        updatedAt: toIsoString(asset.updated_at),
        previewUrl: `/api/ads/${ad.id}/assets/${asset.id}/download`
      })),
      snapshots: (ad.ad_snapshots ?? []).map((snapshot: SnapshotRow) => ({
        id: snapshot.id,
        adId: snapshot.ad_id,
        adLibraryId: snapshot.ad_library_id,
        rawPayload: snapshot.raw_payload,
        capturedBy: snapshot.captured_by,
        capturedAt: toIsoString(snapshot.captured_at),
        processed: snapshot.processed,
        processingLog: snapshot.processing_log,
        createdAt: toIsoString(snapshot.created_at)
      }))
    };
  });

  app.get(
    '/:id/assets/:assetId/download',
    {preHandler: [app.authenticate]},
    async (request, reply) => {
      const {id, assetId} = request.params as {id: string; assetId: string};

      const {data, error} = await app.supabase
        .from('ad_assets')
        .select('id, storage_bucket, storage_key, mime_type')
        .eq('id', assetId)
        .eq('ad_id', id)
        .maybeSingle();

      if (error || !data) {
        return reply.notFound('Asset not found');
      }

      const presignedUrl = await app.minio.presignedGetObject(
        data.storage_bucket,
        data.storage_key,
        ASSET_URL_TTL_SECONDS
      );

      return {url: presignedUrl, mimeType: data.mime_type};
    }
  );

  app.post('/', {preHandler: [app.authenticate]}, async (request, reply) => {
    const payload: AdSnapshotPayload = adSnapshotPayloadSchema.parse(request.body);
    const userId = request.user?.id ?? null;

    const firstSeenAt = payload.firstSeenAt instanceof Date ? payload.firstSeenAt : new Date(payload.firstSeenAt);
    const lastSeenAt = payload.lastSeenAt instanceof Date ? payload.lastSeenAt : new Date(payload.lastSeenAt);
    const isActive = Date.now() - lastSeenAt.getTime() < DAY_IN_MS * 14;

    const {data: existingAd, error: existingAdError} = await app.supabase
      .from('ads')
      .select('id, countries, languages, variations_count, first_seen_at, last_seen_at')
      .eq('ad_library_id', payload.adLibraryId)
      .maybeSingle();

    if (existingAdError) {
      request.log.error({error: existingAdError}, 'Failed to inspect existing ad');
      throw app.httpErrors.internalServerError('Unable to verify existing ad');
    }

    const mergedCountries = existingAd
      ? Array.from(new Set([...(existingAd.countries ?? []), ...payload.countries]))
      : payload.countries;

    const mergedLanguages = existingAd
      ? Array.from(new Set([...(existingAd.languages ?? []), ...payload.languages]))
      : payload.languages;

    const nextVariationsCount = Math.max(payload.assets.length || 1, existingAd?.variations_count ?? 1);
    const nextCountrySpread = mergedCountries.length || 1;
    const nextLanguageSpread = mergedLanguages.length || 1;

    const existingFirstSeen = existingAd ? new Date(existingAd.first_seen_at) : null;
    const existingLastSeen = existingAd ? new Date(existingAd.last_seen_at) : null;

    const nextFirstSeenAt =
      existingFirstSeen && existingFirstSeen < firstSeenAt ? existingFirstSeen : firstSeenAt;
    const nextLastSeenAt =
      existingLastSeen && existingLastSeen > lastSeenAt ? existingLastSeen : lastSeenAt;

    let adId: string;

    if (existingAd) {
      const {data: updatedAd, error: updateError} = await app.supabase
        .from('ads')
        .update({
          advertiser_name: payload.advertiserName,
          page_url: payload.pageUrl ?? null,
          primary_text: payload.primaryText,
          headline: payload.headline,
          call_to_action: payload.callToAction,
          countries: mergedCountries,
          languages: mergedLanguages,
          creative_format: payload.creativeFormat,
          spend_bucket: payload.spendBucket ?? null,
          variations_count: nextVariationsCount,
          last_seen_at: nextLastSeenAt.toISOString(),
          first_seen_at: nextFirstSeenAt.toISOString(),
          is_active: isActive,
          impressions_range: payload.impressionsRange ?? null
        })
        .eq('id', existingAd.id)
        .select('id')
        .single();

      if (updateError || !updatedAd) {
        request.log.error({error: updateError}, 'Failed to update ad');
        throw app.httpErrors.internalServerError('Unable to update ad');
      }

      adId = updatedAd.id;
    } else {
      const {data: createdAd, error: createError} = await app.supabase
        .from('ads')
        .insert({
          ad_library_id: payload.adLibraryId,
          advertiser_name: payload.advertiserName,
          platform: payload.platform,
          page_url: payload.pageUrl ?? null,
          primary_text: payload.primaryText,
          headline: payload.headline,
          call_to_action: payload.callToAction,
          countries: mergedCountries,
          languages: mergedLanguages,
          creative_format: payload.creativeFormat,
          spend_bucket: payload.spendBucket ?? null,
          variations_count: nextVariationsCount,
          is_active: isActive,
          first_seen_at: nextFirstSeenAt.toISOString(),
          last_seen_at: nextLastSeenAt.toISOString(),
          impressions_range: payload.impressionsRange ?? null,
          captured_by_profile: userId,
          source_type: 'EXTENSION'
        })
        .select('id')
        .single();

      if (createError || !createdAd) {
        request.log.error({error: createError}, 'Failed to create ad');
        throw app.httpErrors.internalServerError('Unable to create ad');
      }

      adId = createdAd.id;
    }

    const fallbackRaw = {
      ...payload,
      firstSeenAt: firstSeenAt.toISOString(),
      lastSeenAt: lastSeenAt.toISOString()
    };

    const serializedPayload: Json = (payload.raw as Json) ?? (fallbackRaw as Json);

    const {data: snapshot, error: snapshotError} = await app.supabase
      .from('ad_snapshots')
      .insert({
        ad_id: adId,
        ad_library_id: payload.adLibraryId,
        raw_payload: serializedPayload,
        captured_by: userId ?? null
      })
      .select('id, captured_at')
      .single();

    if (snapshotError || !snapshot) {
      request.log.error({error: snapshotError}, 'Failed to create snapshot');
      throw app.httpErrors.internalServerError('Unable to persist snapshot');
    }

    const insights: AdSnapshotInsights | undefined = payload.insights;
    const similarAdsCountFromPayload =
      insights?.similarAdsCount ?? insights?.similarAds?.length ?? 0;
    const advertiserActiveAdsFromPayload =
      insights?.advertiser?.activeAds ?? insights?.advertiserActiveAds ?? [];
    const advertiserTotalAdsFromPayload =
      insights?.advertiser?.totalAds ?? insights?.advertiserTotalAds ?? null;

    const {data: currentMetrics, error: metricsFetchError} = await app.supabase
      .from('ad_metrics')
      .select('*')
      .eq('ad_id', adId)
      .maybeSingle();

    if (metricsFetchError) {
      request.log.error({error: metricsFetchError}, 'Failed to fetch existing metrics');
      throw app.httpErrors.internalServerError('Unable to fetch ad metrics');
    }

    const metricsFirstSeen = currentMetrics
      ? new Date(
          Math.min(
            new Date(currentMetrics.first_seen_at).getTime(),
            nextFirstSeenAt.getTime()
          )
        )
      : nextFirstSeenAt;

    const metricsLastSeen = currentMetrics
      ? new Date(
          Math.max(
            new Date(currentMetrics.last_seen_at).getTime(),
            nextLastSeenAt.getTime()
          )
        )
      : nextLastSeenAt;

    const activeDays = Math.max(
      1,
      Math.ceil((metricsLastSeen.getTime() - metricsFirstSeen.getTime()) / DAY_IN_MS)
    );

    const advertiserActiveAds: string[] =
      advertiserActiveAdsFromPayload.length > 0
        ? Array.from(new Set(advertiserActiveAdsFromPayload))
        : currentMetrics?.advertiser_active_ads ?? [];

    const advertiserTotalAds =
      advertiserTotalAdsFromPayload !== null
        ? Math.max(advertiserTotalAdsFromPayload, currentMetrics?.advertiser_total_ads ?? 0)
        : currentMetrics?.advertiser_total_ads ?? advertiserActiveAds.length;

    const metricsPayload = {
      ad_id: adId,
      total_observations: (currentMetrics?.total_observations ?? 0) + 1,
      first_seen_at: metricsFirstSeen.toISOString(),
      last_seen_at: metricsLastSeen.toISOString(),
      active_days: activeDays,
      variants_count: Math.max(nextVariationsCount, currentMetrics?.variants_count ?? 1),
      country_spread: Math.max(nextCountrySpread, currentMetrics?.country_spread ?? 1),
      language_spread: Math.max(nextLanguageSpread, currentMetrics?.language_spread ?? 1),
      similar_ads_count: Math.max(
        similarAdsCountFromPayload,
        currentMetrics?.similar_ads_count ?? 0
      ),
      advertiser_total_ads: advertiserTotalAds,
      advertiser_active_ads: advertiserActiveAds
    };

    const {error: metricsUpsertError} = await app.supabase
      .from('ad_metrics')
      .upsert(metricsPayload, {onConflict: 'ad_id'});

    if (metricsUpsertError) {
      request.log.error({error: metricsUpsertError}, 'Failed to upsert metrics');
      throw app.httpErrors.internalServerError('Unable to update ad metrics');
    }

    const {error: captureError} = await app.supabase.from('extension_captures').insert({
      ad_id: adId,
      snapshot_id: snapshot.id,
      captured_by: userId ?? null,
      captured_at: snapshot.captured_at,
      similar_ads_payload: insights?.similarAds ? (insights.similarAds as Json) : null,
      advertiser_meta: insights?.advertiser ? (insights.advertiser as Json) : null,
      extension_version: payload.extensionVersion ?? null
    });

    if (captureError) {
      request.log.error({error: captureError}, 'Failed to persist extension capture metadata');
      throw app.httpErrors.internalServerError('Unable to store capture metadata');
    }

    const assetsWithMetadata = payload.assets.map((asset): {
      insert: Database['public']['Tables']['ad_assets']['Insert'];
      sourceUrl: string | null;
      mimeType?: string;
    } => {
      const storageKey = `ads/${adId}/${randomUUID()}`;
      return {
        insert: {
          ad_id: adId,
          type: asset.type,
          mime_type: asset.mimeType ?? 'application/octet-stream',
          storage_key: storageKey,
          storage_bucket: env.MINIO_BUCKET_ADS,
          width: asset.width ?? null,
          height: asset.height ?? null,
          duration_ms: asset.durationMs ?? null,
          checksum: null
        },
        sourceUrl: asset.url ?? null,
        mimeType: asset.mimeType ?? undefined
      };
    });

    if (assetsWithMetadata.length > 0) {
      const {data: createdAssets, error: assetsError} = await app.supabase
        .from('ad_assets')
        .insert(assetsWithMetadata.map((item) => item.insert))
        .select('id, storage_key, storage_bucket');

      if (assetsError || !createdAssets) {
        request.log.error({error: assetsError}, 'Failed to insert ad assets');
        throw app.httpErrors.internalServerError('Unable to create assets');
      }

      for (let index = 0; index < createdAssets.length; index += 1) {
        const created = createdAssets[index];
        const source = assetsWithMetadata[index];

        if (source.sourceUrl) {
          await app.queues.assetDownload.add('download', {
            assetId: created.id,
            sourceUrl: source.sourceUrl,
            storageKey: created.storage_key,
            storageBucket: created.storage_bucket,
            mimeType: source.mimeType
          });
        }
      }
    }

    return reply.code(202).send({
      id: adId,
      status: 'queued'
    });
  });
}

