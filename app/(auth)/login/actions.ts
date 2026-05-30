'use server';

import { redirect } from 'next/navigation';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { checkPin } from '@/lib/auth/pin-auth';
import { deriveAuthPassword, isValidPinFormat } from '@/lib/auth/pin';
import type { UserRole } from '@/lib/types';

export type SignInState = {
  error?: string;
};

/**
 * Connexion ADMINISTRATEUR / PARENT : e-mail + PIN (4 chiffres).
 */
export async function signInAdmin(
  _prevState: SignInState | undefined,
  formData: FormData
): Promise<SignInState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const pin = String(formData.get('pin') ?? '').trim();

  if (!email || !isValidPinFormat(pin)) {
    return { error: 'E-mail et PIN à 4 chiffres requis.' };
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from('profiles')
    .select('id, role, email')
    .eq('email', email)
    .in('role', ['admin', 'parent'])
    .maybeSingle<{ id: string; role: UserRole; email: string }>();

  if (!profile) {
    return { error: 'Identifiants incorrects.' };
  }

  const check = await checkPin(admin, profile.id, pin);
  if (!check.ok) {
    return { error: check.error };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: profile.email,
    password: deriveAuthPassword(profile.id),
  });
  if (error) {
    return { error: 'Connexion impossible. Réessaie.' };
  }

  redirect('/dashboard');
}

/**
 * Connexion ÉLÈVE : prénom + PIN (4 chiffres).
 */
export async function signInChild(
  _prevState: SignInState | undefined,
  formData: FormData
): Promise<SignInState> {
  const prenom = String(formData.get('prenom') ?? '').trim();
  const pin = String(formData.get('pin') ?? '').trim();

  if (!prenom || !isValidPinFormat(pin)) {
    return { error: 'Prénom et PIN à 4 chiffres requis.' };
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from('profiles')
    .select('id, email')
    .ilike('display_name', prenom)
    .eq('role', 'child')
    .maybeSingle<{ id: string; email: string | null }>();

  if (!profile || !profile.email) {
    return { error: 'Prénom ou PIN incorrect.' };
  }

  const check = await checkPin(admin, profile.id, pin);
  if (!check.ok) {
    return { error: check.error };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: profile.email,
    password: deriveAuthPassword(profile.id),
  });
  if (error) {
    return { error: 'Connexion impossible. Réessaie.' };
  }

  redirect('/accueil');
}
