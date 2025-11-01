import {createClient, type SupabaseClient} from '@supabase/supabase-js';
import fp from 'fastify-plugin';

import {env} from '../env';
import type {Database} from '../types/supabase';

declare module 'fastify' {
  interface FastifyInstance {
    supabase: SupabaseClient<Database>;
  }
}

export const supabasePlugin = fp(async (fastify) => {
  const client = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false
    },
    global: {
      headers: {
        'X-Client-Info': 'escalads-api'
      }
    }
  });

  fastify.decorate('supabase', client);
});
