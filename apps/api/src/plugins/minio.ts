import {Client} from 'minio';
import fp from 'fastify-plugin';

import {env} from '../env';

declare module 'fastify' {
  interface FastifyInstance {
    minio: Client;
  }
}

export const minioPlugin = fp(async (fastify) => {
  const client = new Client({
    endPoint: env.MINIO_ENDPOINT,
    port: env.MINIO_PORT,
    useSSL: env.MINIO_USE_SSL,
    accessKey: env.MINIO_ACCESS_KEY,
    secretKey: env.MINIO_SECRET_KEY
  });

  fastify.decorate('minio', client);

  try {
    const exists = await client.bucketExists(env.MINIO_BUCKET_ADS);
    if (!exists) {
      await client.makeBucket(env.MINIO_BUCKET_ADS, '');
    }
  } catch (error) {
    fastify.log.error(
      {error},
      `Failed to ensure bucket ${env.MINIO_BUCKET_ADS} exists in MinIO`
    );
    throw error;
  }

  fastify.addHook('onClose', async () => {
    // minio client does not expose a disconnect method, noop hook to keep API symmetrical
  });
});
