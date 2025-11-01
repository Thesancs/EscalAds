import {createHash} from 'crypto';

import {createClient} from '@supabase/supabase-js';
import {QueueEvents, Worker} from 'bullmq';
import Redis from 'ioredis';
import {Client as MinioClient} from 'minio';

import {env} from '../env';
import type {Database} from '../types/supabase';

type AssetDownloadJob = {
  assetId: string;
  sourceUrl: string;
  storageKey: string;
  storageBucket: string;
  mimeType?: string;
};

const supabase = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false
  },
  global: {
    headers: {
      'X-Client-Info': 'escalads-asset-worker'
    }
  }
});
const redis = new Redis(env.REDIS_URL);
const minio = new MinioClient({
  endPoint: env.MINIO_ENDPOINT,
  port: env.MINIO_PORT,
  useSSL: env.MINIO_USE_SSL,
  accessKey: env.MINIO_ACCESS_KEY,
  secretKey: env.MINIO_SECRET_KEY
});

const queueEvents = new QueueEvents(env.ASSET_QUEUE_NAME, {connection: redis});

const worker = new Worker<AssetDownloadJob>(
  env.ASSET_QUEUE_NAME,
  async (job) => {
    const {assetId, sourceUrl, storageKey, storageBucket, mimeType} = job.data;

    const {data: asset, error: fetchError} = await supabase
      .from('ad_assets')
      .select('id, storage_bucket, storage_key')
      .eq('id', assetId)
      .maybeSingle();

    if (fetchError || !asset) {
      throw new Error(`Asset ${assetId} not found`);
    }

    const response = await fetch(sourceUrl);
    if (!response.ok) {
      throw new Error(`Failed to download asset from ${sourceUrl}: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const detectedMime = mimeType ?? response.headers.get('content-type') ?? 'application/octet-stream';
    const checksum = createHash('sha256').update(buffer).digest('hex');

    await minio.putObject(storageBucket, storageKey, buffer, buffer.length, {
      'Content-Type': detectedMime
    });

    const {error: updateError} = await supabase
      .from('ad_assets')
      .update({
        mime_type: detectedMime,
        checksum
      })
      .eq('id', assetId);

    if (updateError) {
      throw new Error(`Failed to update asset ${assetId}: ${updateError.message}`);
    }
  },
  {
    connection: redis,
    concurrency: 3
  }
);

queueEvents.on('failed', ({jobId, failedReason}) => {
  console.error(`[asset-downloader] Job ${jobId} failed: ${failedReason}`);
});

queueEvents.on('completed', ({jobId}) => {
  console.info(`[asset-downloader] Job ${jobId} completed`);
});

const shutdown = async () => {
  await worker.close();
  await queueEvents.close();
  redis.disconnect();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
