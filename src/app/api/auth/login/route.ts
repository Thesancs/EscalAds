import { authSignInSchema } from '@/lib/validators/offers';
import { createSessionResponse, signInWithPassword } from '@/lib/supabase/auth';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { email, password, rememberMe } = authSignInSchema.parse(body);

  const session = await signInWithPassword(email, password);
  return createSessionResponse(session, rememberMe ?? false);
}
