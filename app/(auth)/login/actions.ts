'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import type { UserRole } from '@/lib/types';

const SignInSchema = z.object({
  email: z.string().trim().min(1, 'L’adresse e-mail est obligatoire').email('Adresse e-mail invalide'),
  password: z.string().min(6, 'Le mot de passe doit faire au moins 6 caractères'),
});

export type SignInState = {
  error?: string;
  fieldErrors?: Partial<Record<'email' | 'password', string>>;
};

export async function signIn(
  _prevState: SignInState,
  formData: FormData
): Promise<SignInState> {
  const raw = {
    email: String(formData.get('email') ?? ''),
    password: String(formData.get('password') ?? ''),
  };

  const parsed = SignInSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: SignInState['fieldErrors'] = {};
    for (const issue of parsed.error.issues) {
      const k = issue.path[0] as 'email' | 'password' | undefined;
      if (k && !fieldErrors[k]) fieldErrors[k] = issue.message;
    }
    return { error: 'Formulaire invalide', fieldErrors };
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    return { error: 'Identifiants incorrects. Vérifie ton e-mail et ton mot de passe.' };
  }

  // Récupération du rôle pour redirection
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .maybeSingle<{ role: UserRole }>();

  const role: UserRole = profile?.role ?? 'child';
  redirect(role === 'child' ? '/accueil' : '/dashboard');
}
