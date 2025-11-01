import type {FastifyInstance} from 'fastify';

import {
  loginRequestSchema,
  loginResponseSchema,
  registerRequestSchema
} from '@escalads/shared';

import {env} from '../env';

const DEV_USER = {
  id: 'dev-user',
  email: env.DEFAULT_LOGIN_EMAIL,
  fullName: 'Developer Access',
  role: 'OWNER' as const
};

export async function registerAuthRoutes(app: FastifyInstance) {
  app.post('/register', async (request, reply) => {
    registerRequestSchema.parse(request.body);
    return reply.status(501).send({
      message:
        'Account creation is disabled in the current environment. Use the default credentials to sign in.'
    });
  });

  app.post('/login', async (request, reply) => {
    const credentials = loginRequestSchema.parse(request.body);

    if (
      credentials.email !== env.DEFAULT_LOGIN_EMAIL ||
      credentials.password !== env.DEFAULT_LOGIN_PASSWORD
    ) {
      return reply.unauthorized('Invalid credentials');
    }

    const token = await reply.jwtSign({
      id: DEV_USER.id,
      email: DEV_USER.email,
      role: DEV_USER.role
    });

    const response = {
      token,
      user: {
        id: DEV_USER.id,
        email: DEV_USER.email,
        fullName: DEV_USER.fullName,
        role: DEV_USER.role
      }
    };

    return loginResponseSchema.parse(response);
  });

  app.get('/me', {preHandler: [app.authenticate]}, async (request) => {
    const payload = request.user;
    if (!payload) {
      throw new Error('Missing JWT payload');
    }

    return {
      id: payload.id ?? DEV_USER.id,
      email: payload.email ?? DEV_USER.email,
      fullName: DEV_USER.fullName,
      role: (payload.role ?? DEV_USER.role) as typeof DEV_USER.role,
      createdAt: new Date().toISOString()
    };
  });
}
