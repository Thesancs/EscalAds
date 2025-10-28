import 'server-only';

type SupabaseEnv = {
  url: string;
  anonKey: string;
  serviceKey?: string;
};

let cachedEnv: SupabaseEnv | null = null;

const urlEnvKeys = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_URL'];
const anonEnvKeys = ['NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY'];
const serviceEnvKeys = ['SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SERVICE_KEY'];

export function getSupabaseEnv(): SupabaseEnv | null {
  if (cachedEnv) {
    return cachedEnv;
  }

  const url = urlEnvKeys.map((key) => process.env[key]).find(Boolean);
  const anonKey = anonEnvKeys.map((key) => process.env[key]).find(Boolean);
  const serviceKey = serviceEnvKeys.map((key) => process.env[key]).find(Boolean);

  if (!url || !anonKey) {
    return null;
  }

  cachedEnv = {
    url,
    anonKey,
    serviceKey: serviceKey ?? undefined,
  } satisfies SupabaseEnv;

  return cachedEnv;
}

export function assertSupabaseEnv(): SupabaseEnv {
  const env = getSupabaseEnv();

  if (!env) {
    throw new Error('Supabase environment variables are not configured.');
  }

  return env;
}
