import Redis from 'ioredis';
import fp from 'fastify-plugin';

import {env} from '../env';

declare module 'fastify' {
  interface FastifyInstance {
    redis: Redis;
  }
}

export const redisPlugin = fp(async (fastify) => {
  const client = new Redis(env.REDIS_URL, {lazyConnect: true});
  await client.connect();

  fastify.decorate('redis', client);

  fastify.addHook('onClose', async () => {
    client.disconnect();
  });
});
