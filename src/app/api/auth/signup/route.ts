import { authSignUpSchema } from '@/lib/validators/offers';
import { createSessionResponse, signUpWithPassword } from '@/lib/supabase/auth';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { email, password, full_name } = authSignUpSchema.parse(body);

  const session = await signUpWithPassword(email, password, {
    full_name,
  });

  return createSessionResponse(session, true);
}
