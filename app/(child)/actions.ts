'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/** Déconnecte l'apprenant et revient à l'écran de connexion. */
export async function signOutChild() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

/**
 * Anti-blocage du marathon : passe DÉFINITIVEMENT un exercice (statut 'reporte').
 * Le moteur le considère alors comme "réglé" pour le déblocage du jour suivant,
 * sans le compter comme maîtrisé. Utile quand un exercice rédigé reste invalidable
 * (correction IA indisponible, énoncé trop dur) et bloquerait sinon tout le parcours.
 *
 * Garde-fou : l'exercice doit avoir été tenté au moins une fois.
 */
export async function skipExercise(
  exerciseId: string
): Promise<{ ok?: boolean; error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Session expirée.' };

  const { data: existing } = await supabase
    .from('progress')
    .select('statut')
    .eq('child_id', user.id)
    .eq('exercise_id', exerciseId)
    .maybeSingle<{ statut: string }>();

  if (!existing) {
    return { error: 'Réponds au moins une fois avant de passer cette question.' };
  }
  if (existing.statut === 'maitrise') return { ok: true };

  const { error } = await supabase
    .from('progress')
    .update({ statut: 'reporte' })
    .eq('child_id', user.id)
    .eq('exercise_id', exerciseId);
  if (error) return { error: 'Impossible de passer la question pour le moment.' };

  return { ok: true };
}
