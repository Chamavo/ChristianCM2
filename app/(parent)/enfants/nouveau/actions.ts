'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import type { Maison } from '@/lib/types';

const MAISONS = ['gryffondor', 'serdaigle', 'poufsouffle', 'serpentard'] as const;

const NouvelEnfantSchema = z.object({
  display_name: z
    .string()
    .trim()
    .min(2, 'Le prénom doit faire au moins 2 caractères')
    .max(40, 'Prénom trop long')
    .regex(/^[\p{L}\p{M}\-' ]+$/u, 'Caractères non autorisés dans le prénom'),
  maison_choisie: z.enum(MAISONS, {
    errorMap: () => ({ message: 'Choisis une maison valide' }),
  }),
});

export type NouvelEnfantState = {
  error?: string;
  fieldErrors?: Partial<Record<'display_name' | 'maison_choisie', string>>;
  success?: {
    display_name: string;
    email: string;
    password: string;
    maison_choisie: Maison;
  };
};

/**
 * Normalise un display_name pour en faire un slug d'e-mail.
 * - minuscules
 * - retire les accents
 * - garde lettres/chiffres, remplace tout le reste par '-'
 */
function slugify(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30);
}

function genererMotDePasse(): string {
  // Mot de passe lisible : 3 syllabes + chiffres. Pas top-cryptographique mais
  // suffisant pour un premier mot de passe enfant communiqué au parent.
  const cons = 'bcdfghjklmnprstv';
  const voy = 'aeiou';
  let pwd = '';
  for (let i = 0; i < 3; i++) {
    pwd += cons[Math.floor(Math.random() * cons.length)];
    pwd += voy[Math.floor(Math.random() * voy.length)];
  }
  pwd = pwd[0].toUpperCase() + pwd.slice(1);
  pwd += '-' + Math.floor(100 + Math.random() * 900); // 3 chiffres
  return pwd; // ex: "Bopila-742"
}

export async function creerEnfant(
  _prevState: NouvelEnfantState,
  formData: FormData
): Promise<NouvelEnfantState> {
  const raw = {
    display_name: String(formData.get('display_name') ?? ''),
    maison_choisie: String(formData.get('maison_choisie') ?? ''),
  };
  const parsed = NouvelEnfantSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: NouvelEnfantState['fieldErrors'] = {};
    for (const issue of parsed.error.issues) {
      const k = issue.path[0] as 'display_name' | 'maison_choisie' | undefined;
      if (k && !fieldErrors[k]) fieldErrors[k] = issue.message;
    }
    return { error: 'Formulaire invalide', fieldErrors };
  }

  const { display_name, maison_choisie } = parsed.data;

  // 1. Vérifier que l'utilisateur courant est bien parent ou admin
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Tu dois être connecté.' };
  }
  const { data: parentProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle<{ role: 'admin' | 'parent' | 'child' }>();

  if (!parentProfile || (parentProfile.role !== 'parent' && parentProfile.role !== 'admin')) {
    return { error: 'Action réservée aux comptes parents.' };
  }

  // 2. Génération credentials
  const slug = slugify(display_name);
  const parentShort = user.id.replace(/-/g, '').slice(0, 8);
  const email = `${slug}.${parentShort}@poudlard.local`;
  const password = genererMotDePasse();

  // 3. Création via service role (admin API) — bypasse confirmation e-mail
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return {
      error:
        'Configuration serveur incomplète (SUPABASE_SERVICE_ROLE_KEY manquant). Contacte l’administrateur.',
    };
  }

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name, role: 'child' },
  });

  if (createErr || !created.user) {
    const msg = createErr?.message ?? '';
    if (msg.toLowerCase().includes('already')) {
      return {
        error:
          'Un enfant avec ce prénom existe déjà sous ton compte. Choisis un prénom légèrement différent.',
      };
    }
    return { error: 'Impossible de créer le compte enfant pour le moment.' };
  }

  // 4. Création du profil (role=child + parent_id)
  const { error: profileErr } = await admin.from('profiles').insert({
    id: created.user.id,
    email,
    display_name,
    role: 'child',
    parent_id: user.id,
    maison_choisie,
  });

  if (profileErr) {
    // Nettoyage : on supprime le user auth pour éviter les orphelins
    await admin.auth.admin.deleteUser(created.user.id);
    return {
      error:
        'Le profil de l’enfant n’a pas pu être enregistré. Réessaie ou contacte le support.',
    };
  }

  revalidatePath('/dashboard');
  revalidatePath('/enfants');

  return {
    success: { display_name, email, password, maison_choisie },
  };
}
