import { authSignInSchema } from '@/lib/validators/offers';
import { createSessionResponse, hydrateSessionWithProfile, signInWithPassword } from '@/lib/supabase/auth';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { email, password, rememberMe } = authSignInSchema.parse(body);

  const session = await signInWithPassword(email, password);
  const hydrated = await hydrateSessionWithProfile(session);
  return createSessionResponse(hydrated, rememberMe ?? false);
}
