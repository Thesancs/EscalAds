import {randomBytes} from 'crypto';

import {hashSync} from 'bcryptjs';
import type {FastifyInstance} from 'fastify';

import {
  currentUserSchema,
  loginRequestSchema,
  loginResponseSchema,
  registerRequestSchema
} from '@escalads/shared';

import type {Database} from '../types/supabase';

import {env} from '../env';

const DEV_USER = {
  id: 'dev-user',
  email: env.DEFAULT_LOGIN_EMAIL,
  fullName: 'Developer Access',
  role: 'OWNER' as const
};

export async function registerAuthRoutes(app: FastifyInstance) {
  const loadProfile = async (id: string) => {
    const {data, error} = await app.supabase
      .from('profiles')
      .select('id, email, full_name, role, api_key_last_rotated_at, api_key_hash')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      app.log.error({error}, 'Failed to load profile for auth response');
      return null;
    }

    return data as Database['public']['Tables']['profiles']['Row'] | null;
  };

  const mapProfileToUser = (
    profile: Database['public']['Tables']['profiles']['Row'] | null,
    fallback: {id: string; email: string; fullName: string; role: typeof DEV_USER.role}
  ) => {
    if (!profile) {
      return {
        id: fallback.id,
        email: fallback.email,
        fullName: fallback.fullName,
        role: fallback.role,
        apiKeyLastRotatedAt: null,
        hasApiKey: false
      };
    }

    return {
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      role: profile.role,
      apiKeyLastRotatedAt: profile.api_key_last_rotated_at,
      hasApiKey: Boolean(profile.api_key_hash)
    };
  };

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

    const profile = await loadProfile(DEV_USER.id);
    const response = {
      token,
      user: mapProfileToUser(profile, {
        id: DEV_USER.id,
        email: DEV_USER.email,
        fullName: DEV_USER.fullName,
        role: DEV_USER.role
      })
    };

    return loginResponseSchema.parse(response);
  });

  app.get('/me', {preHandler: [app.authenticate]}, async (request) => {
    const payload = request.user;
    if (!payload) {
      throw new Error('Missing JWT payload');
    }

    const fallback = {
      id: payload.id ?? DEV_USER.id,
      email: payload.email ?? DEV_USER.email,
      fullName: DEV_USER.fullName,
      role: (payload.role ?? DEV_USER.role) as typeof DEV_USER.role
    };

    const profile = await loadProfile(fallback.id);
    const mapped = mapProfileToUser(profile, fallback);

    return currentUserSchema.parse({
      ...mapped,
      createdAt: profile?.created_at ?? new Date().toISOString()
    });
  });

  app.post('/api-key/rotate', {preHandler: [app.authenticate]}, async (request, reply) => {
    const fallback = {
      id: request.user?.id ?? DEV_USER.id,
      email: request.user?.email ?? DEV_USER.email,
      fullName: DEV_USER.fullName,
      role: (request.user?.role ?? DEV_USER.role) as typeof DEV_USER.role
    };

    const profile = await loadProfile(fallback.id);

    const plainKey = randomBytes(24).toString('base64url');
    const hashedKey = hashSync(plainKey, 12);
    const rotatedAt = new Date().toISOString();

    const {error: upsertError} = await app.supabase.from('profiles').upsert(
      {
        id: fallback.id,
        email: profile?.email ?? fallback.email,
        full_name: profile?.full_name ?? fallback.fullName,
        role: profile?.role ?? fallback.role,
        api_key_hash: hashedKey,
        api_key_last_rotated_at: rotatedAt
      },
      {onConflict: 'id'}
    );

    if (upsertError) {
      request.log.error({error: upsertError}, 'Failed to rotate API key');
      throw app.httpErrors.internalServerError('Unable to rotate API key');
    }

    const event: Database['public']['Tables']['api_key_audit']['Row']['event'] = profile?.api_key_hash
      ? 'ROTATED'
      : 'ISSUED';

    const {error: auditError} = await app.supabase.from('api_key_audit').insert({
      profile_id: fallback.id,
      event,
      api_key_prefix: plainKey.slice(0, 6),
      performed_by: fallback.id
    });

    if (auditError) {
      request.log.warn({error: auditError}, 'Failed to record API key audit event');
    }

    return reply.code(201).send({
      apiKey: plainKey,
      lastRotatedAt: rotatedAt
    });
  });
}
