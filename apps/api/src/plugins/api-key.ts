import {createHash} from 'crypto';

import {compareSync} from 'bcryptjs';
import fp from 'fastify-plugin';
import type {FastifyReply, FastifyRequest} from 'fastify';

import type {Database} from '../types/supabase';

declare module 'fastify' {
  interface FastifyInstance {
    verifyApiKey: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }

  interface FastifyRequest {
    apiKeyFingerprint?: string;
  }
}

export const apiKeyPlugin = fp(async (fastify) => {
  fastify.decorate('verifyApiKey', async (request, reply) => {
    const header = request.headers['x-api-key'];
    const apiKey = Array.isArray(header) ? header[0] : header;

    if (!apiKey) {
      return reply.unauthorized('Missing API key');
    }

    const userId = request.user?.id;
    if (!userId) {
      return reply.unauthorized('Missing session');
    }

    const {data, error} = await fastify.supabase
      .from('profiles')
      .select('api_key_hash')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      request.log.error({error}, 'Failed to verify API key');
      throw fastify.httpErrors.internalServerError('Unable to verify API key');
    }

    const profile = data as Pick<Database['public']['Tables']['profiles']['Row'], 'api_key_hash'> | null;

    if (!profile?.api_key_hash) {
      return reply.forbidden('API key not provisioned');
    }

    const isValid = compareSync(apiKey, profile.api_key_hash);

    if (!isValid) {
      return reply.unauthorized('Invalid API key');
    }

    request.apiKeyFingerprint = createHash('sha256').update(apiKey).digest('hex');
  });
});
