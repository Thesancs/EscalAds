import fastifyJwt from '@fastify/jwt';
import fp from 'fastify-plugin';
import type {FastifyReply, FastifyRequest} from 'fastify';

import {env} from '../env';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: {
      id: string;
      email: string;
      role: string;
    };
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export const authPlugin = fp(async (fastify) => {
  await fastify.register(fastifyJwt, {
    secret: env.JWT_SECRET
  });

  fastify.decorate('authenticate', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (error) {
      request.log.error({error}, 'Authentication failed');
      return reply.unauthorized('Unauthorized');
    }
  });
});
