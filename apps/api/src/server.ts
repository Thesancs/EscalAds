import fastifyCors from '@fastify/cors';
import fastifySensible from '@fastify/sensible';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import Fastify from 'fastify';

import {env} from './env';
import {authPlugin} from './plugins/auth';
import {minioPlugin} from './plugins/minio';
import {supabasePlugin} from './plugins/supabase';
import {queuesPlugin} from './plugins/queues';
import {redisPlugin} from './plugins/redis';
import {registerAdsRoutes} from './routes/ads.routes';
import {registerAuthRoutes} from './routes/auth.routes';
import {registerHealthRoutes} from './routes/health.routes';

export async function buildServer() {
  const app = Fastify({
    logger:
      env.NODE_ENV === 'development'
        ? {
            transport: {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'HH:MM:ss'
              }
            }
          }
        : true
  });

  await app.register(fastifyCors, {
    origin: true,
    credentials: true
  });

  await app.register(fastifySensible);

  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'EscalAds API',
        description: 'API para ingestão e análise de anúncios capturados via extensão.',
        version: '0.1.0'
      }
    }
  });

  await app.register(fastifySwaggerUi, {
    routePrefix: '/docs'
  });

  await app.register(supabasePlugin);
  await app.register(redisPlugin);
  await app.register(queuesPlugin);
  await app.register(minioPlugin);
  await app.register(authPlugin);

  await app.register(registerHealthRoutes, {prefix: '/health'});
  await app.register(registerAuthRoutes, {prefix: '/auth'});
  await app.register(registerAdsRoutes, {prefix: '/ads'});

  return app;
}
