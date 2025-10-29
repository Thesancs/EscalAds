import { authSignUpSchema } from '@/lib/validators/offers';
import { createSessionResponse, hydrateSessionWithProfile, signUpWithPassword } from '@/lib/supabase/auth';
import { upsertProfileForUser } from '@/lib/supabase/profiles';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { email, password, full_name } = authSignUpSchema.parse(body);

  const session = await signUpWithPassword(email, password, {
    full_name,
  });

  await upsertProfileForUser({
    id: session.user.id,
    full_name: full_name ?? null,
    role: session.user.role,
  });

  const hydrated = await hydrateSessionWithProfile(session);

  return createSessionResponse(hydrated, true);
}
