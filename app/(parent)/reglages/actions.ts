'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

const ProfilSchema = z.object({
  display_name: z
    .string()
    .trim()
    .min(2, 'Nom trop court')
    .max(60, 'Nom trop long'),
  email: z.string().trim().email('Adresse e-mail invalide'),
});

export type ReglagesProfilState = {
  error?: string;
  success?: string;
  fieldErrors?: Partial<Record<'display_name' | 'email', string>>;
};

export async function modifierProfil(
  _prev: ReglagesProfilState,
  formData: FormData
): Promise<ReglagesProfilState> {
  const raw = {
    display_name: String(formData.get('display_name') ?? ''),
    email: String(formData.get('email') ?? ''),
  };
  const parsed = ProfilSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: ReglagesProfilState['fieldErrors'] = {};
    for (const issue of parsed.error.issues) {
      const k = issue.path[0] as 'display_name' | 'email' | undefined;
      if (k && !fieldErrors[k]) fieldErrors[k] = issue.message;
    }
    return { error: 'Formulaire invalide', fieldErrors };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Non authentifié' };

  // Mise à jour du profil (auth.users géré séparément côté Supabase)
  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: parsed.data.display_name,
      email: parsed.data.email,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);
  if (error) return { error: error.message };

  // Mise à jour de l'e-mail dans auth (déclenche confirmation Supabase)
  if (user.email !== parsed.data.email) {
    const { error: authErr } = await supabase.auth.updateUser({
      email: parsed.data.email,
    });
    if (authErr) {
      return {
        error: `Profil enregistré, mais changement d'e-mail impossible : ${authErr.message}`,
      };
    }
  }

  revalidatePath('/reglages');
  return { success: 'Profil mis à jour.' };
}

const MotDePasseSchema = z.object({
  password: z
    .string()
    .min(8, 'Au moins 8 caractères')
    .max(128, 'Trop long'),
});

export type MotDePasseState = {
  error?: string;
  success?: string;
};

export async function changerMotDePasse(
  _prev: MotDePasseState,
  formData: FormData
): Promise<MotDePasseState> {
  const parsed = MotDePasseSchema.safeParse({
    password: String(formData.get('password') ?? ''),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalide' };
  }
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) return { error: error.message };
  return { success: 'Mot de passe mis à jour.' };
}
