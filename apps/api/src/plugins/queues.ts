import {Queue} from 'bullmq';
import fp from 'fastify-plugin';

import {env} from '../env';

declare module 'fastify' {
  interface FastifyInstance {
    queues: {
      assetDownload: Queue;
    };
  }
}

export const queuesPlugin = fp(async (fastify) => {
  const connection = fastify.redis.duplicate({lazyConnect: true});
  await connection.connect();

  const assetDownload = new Queue(env.ASSET_QUEUE_NAME, {
    connection,
    defaultJobOptions: {
      removeOnComplete: 100,
      removeOnFail: 500,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000
      }
    }
  });

  fastify.decorate('queues', {
    assetDownload
  });

  fastify.addHook('onClose', async () => {
    await assetDownload.close();
    connection.disconnect();
  });
});
