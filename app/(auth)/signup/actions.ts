'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const SignUpSchema = z
  .object({
    display_name: z
      .string()
      .trim()
      .min(2, 'Le nom doit faire au moins 2 caractères')
      .max(60, 'Le nom est trop long'),
    email: z.string().trim().email('Adresse e-mail invalide'),
    password: z.string().min(8, 'Le mot de passe doit faire au moins 8 caractères'),
    confirm: z.string().min(1, 'Confirme le mot de passe'),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirm'],
  });

export type SignUpState = {
  error?: string;
  fieldErrors?: Partial<Record<'display_name' | 'email' | 'password' | 'confirm', string>>;
  success?: boolean;
};

export async function signUp(
  _prevState: SignUpState,
  formData: FormData
): Promise<SignUpState> {
  const raw = {
    display_name: String(formData.get('display_name') ?? ''),
    email: String(formData.get('email') ?? ''),
    password: String(formData.get('password') ?? ''),
    confirm: String(formData.get('confirm') ?? ''),
  };

  const parsed = SignUpSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: SignUpState['fieldErrors'] = {};
    for (const issue of parsed.error.issues) {
      const k = issue.path[0] as keyof NonNullable<SignUpState['fieldErrors']> | undefined;
      if (k && !fieldErrors[k]) fieldErrors[k] = issue.message;
    }
    return { error: 'Formulaire invalide', fieldErrors };
  }

  const { display_name, email, password } = parsed.data;
  const supabase = createClient();

  // 1. Création du compte auth
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name },
    },
  });

  if (signUpError || !signUpData.user) {
    const msg = signUpError?.message ?? '';
    if (msg.toLowerCase().includes('already')) {
      return { error: 'Un compte existe déjà avec cette adresse e-mail.' };
    }
    return { error: "Impossible de créer le compte pour le moment. Réessaie plus tard." };
  }

  // 2. Création du profil avec role='parent' (force le rôle côté serveur)
  const { error: profileError } = await supabase.from('profiles').insert({
    id: signUpData.user.id,
    email,
    display_name,
    role: 'parent',
  });

  if (profileError) {
    return {
      error:
        'Compte créé mais le profil n’a pas pu être enregistré. Contacte le support si le problème persiste.',
    };
  }

  // 3. Si confirmation email désactivée, la session existe déjà → on redirige.
  //    Sinon on affiche un message demandant de confirmer l'e-mail.
  if (signUpData.session) {
    redirect('/dashboard');
  }

  return { success: true };
}
