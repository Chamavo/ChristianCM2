'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const ResetSchema = z.object({
  email: z.string().trim().email('Adresse e-mail invalide'),
});

export type ResetState = {
  error?: string;
  success?: boolean;
};

export async function requestReset(
  _prevState: ResetState,
  formData: FormData
): Promise<ResetState> {
  const raw = { email: String(formData.get('email') ?? '') };
  const parsed = ResetSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Adresse e-mail invalide' };
  }

  const supabase = createClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';
  const redirectTo = appUrl ? `${appUrl}/login` : undefined;

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo,
  });

  // On ne révèle PAS l'existence du compte : message identique succès/erreur.
  if (error) {
    // eslint-disable-next-line no-console
    console.error('[reset password]', error);
  }
  return { success: true };
}
