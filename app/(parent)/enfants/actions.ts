'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { generatePin, hashPin, deriveAuthPassword } from '@/lib/auth/pin';
import { randomBytes } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { UserRole } from '@/lib/types';

interface Supervisor {
  id: string;
  role: UserRole;
}

const MAISONS = ['gryffondor', 'serdaigle', 'poufsouffle', 'serpentard'];

/** Récupère le superviseur courant (admin ou parent) ou null. */
async function getSupervisor(): Promise<Supervisor | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .maybeSingle<Supervisor>();
  if (!profile || (profile.role !== 'admin' && profile.role !== 'parent')) return null;
  return profile;
}

/** Vérifie que le superviseur a le droit d'agir sur cet enfant. */
async function ensureOwnsChild(
  admin: SupabaseClient,
  supervisor: Supervisor,
  childId: string
): Promise<boolean> {
  const { data: child } = await admin
    .from('profiles')
    .select('id, role, parent_id')
    .eq('id', childId)
    .maybeSingle<{ id: string; role: UserRole; parent_id: string | null }>();
  if (!child || child.role !== 'child') return false;
  return supervisor.role === 'admin' || child.parent_id === supervisor.id;
}

function slugify(prenom: string): string {
  return prenom
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export type CreateChildState = {
  error?: string;
  ok?: boolean;
  prenom?: string;
  pin?: string;
};

const PrenomSchema = z
  .string()
  .trim()
  .min(1, 'Le prénom est obligatoire')
  .max(40, 'Prénom trop long');

/**
 * Crée un apprenant : prénom + PIN auto-généré (4 chiffres).
 * Le PIN est renvoyé une seule fois pour être communiqué à l'enfant.
 */
export async function createChild(
  _prevState: CreateChildState | undefined,
  formData: FormData
): Promise<CreateChildState> {
  const supervisor = await getSupervisor();
  if (!supervisor) return { error: 'Accès refusé.' };

  const parsed = PrenomSchema.safeParse(formData.get('prenom'));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Prénom invalide' };
  }
  const prenom = parsed.data;

  const maisonRaw = String(formData.get('maison_choisie') ?? '').trim();
  const maison_choisie = MAISONS.includes(maisonRaw) ? maisonRaw : null;

  const admin = createAdminClient();

  // Unicité du prénom (insensible à la casse) parmi les enfants
  const { data: existing } = await admin
    .from('profiles')
    .select('id')
    .ilike('display_name', prenom)
    .eq('role', 'child')
    .maybeSingle();
  if (existing) {
    return { error: `Un apprenant nommé « ${prenom} » existe déjà. Choisis un autre prénom.` };
  }

  const syntheticEmail = `eleve.${slugify(prenom)}.${randomBytes(3).toString('hex')}@eleves.poudlard.local`;

  // 1. Créer l'utilisateur auth (mot de passe temporaire fort)
  const { data: created, error: authError } = await admin.auth.admin.createUser({
    email: syntheticEmail,
    password: randomBytes(24).toString('hex'),
    email_confirm: true,
    user_metadata: { display_name: prenom },
  });
  if (authError || !created.user) {
    return { error: `Création échouée : ${authError?.message ?? 'inconnue'}` };
  }
  const childId = created.user.id;

  // 2. Fixer le vrai mot de passe (dérivé de l'id)
  const { error: pwError } = await admin.auth.admin.updateUserById(childId, {
    password: deriveAuthPassword(childId),
  });
  if (pwError) {
    await admin.auth.admin.deleteUser(childId);
    return { error: 'Configuration du compte échouée.' };
  }

  // 3. Profil enfant
  const { error: profileError } = await admin.from('profiles').insert({
    id: childId,
    role: 'child' as UserRole,
    display_name: prenom,
    email: syntheticEmail,
    parent_id: supervisor.id,
    maison_choisie,
  });
  if (profileError) {
    await admin.auth.admin.deleteUser(childId);
    return { error: `Profil non créé : ${profileError.message}` };
  }

  // 4. PIN
  const pin = generatePin();
  const { error: credError } = await admin.from('credentials').insert({
    profile_id: childId,
    pin_hash: hashPin(pin),
  });
  if (credError) {
    await admin.auth.admin.deleteUser(childId);
    return { error: 'Création du PIN échouée.' };
  }

  revalidatePath('/dashboard');
  return { ok: true, prenom, pin };
}

/** Régénère le PIN d'un apprenant. Renvoie le nouveau PIN. */
export async function resetChildPin(
  childId: string
): Promise<{ error?: string; pin?: string }> {
  const supervisor = await getSupervisor();
  if (!supervisor) return { error: 'Accès refusé.' };

  const admin = createAdminClient();
  if (!(await ensureOwnsChild(admin, supervisor, childId))) {
    return { error: 'Apprenant introuvable.' };
  }

  const pin = generatePin();
  const { error } = await admin.from('credentials').upsert(
    {
      profile_id: childId,
      pin_hash: hashPin(pin),
      failed_attempts: 0,
      locked_until: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'profile_id' }
  );
  if (error) return { error: 'Réinitialisation du PIN échouée.' };

  revalidatePath('/dashboard');
  return { pin };
}

/** Remet la progression d'un apprenant à zéro (exercices, tentatives, sessions, quiz). */
export async function resetChildProgress(
  childId: string
): Promise<{ error?: string; ok?: boolean }> {
  const supervisor = await getSupervisor();
  if (!supervisor) return { error: 'Accès refusé.' };

  const admin = createAdminClient();
  if (!(await ensureOwnsChild(admin, supervisor, childId))) {
    return { error: 'Apprenant introuvable.' };
  }

  for (const table of ['progress', 'attempts', 'sessions', 'quiz_results', 'blockages', 'rewards']) {
    const { error } = await admin.from(table).delete().eq('child_id', childId);
    if (error) return { error: `Échec sur ${table} : ${error.message}` };
  }

  revalidatePath('/dashboard');
  return { ok: true };
}

/** Supprime définitivement un apprenant (compte + progression en cascade). */
export async function deleteChild(
  childId: string
): Promise<{ error?: string; ok?: boolean }> {
  const supervisor = await getSupervisor();
  if (!supervisor) return { error: 'Accès refusé.' };

  const admin = createAdminClient();
  if (!(await ensureOwnsChild(admin, supervisor, childId))) {
    return { error: 'Apprenant introuvable.' };
  }

  // Supprime l'auth user → cascade profiles / credentials / progress / ...
  const { error } = await admin.auth.admin.deleteUser(childId);
  if (error) return { error: 'Suppression échouée.' };

  revalidatePath('/dashboard');
  return { ok: true };
}
