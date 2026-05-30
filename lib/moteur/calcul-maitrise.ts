import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Attempt, Exercise } from '@/lib/types';

/**
 * Critère de maîtrise (règle métier validée) :
 *  Maîtrise = bonne réponse + max 1 indice utilisé + pas de décomposition
 *
 * On ne prend PAS en compte est_reformulation / est_replay ici :
 *  c'est un compromis pédagogique pour permettre la maîtrise post-blocage
 *  uniquement si l'enfant a vraiment compris (peu d'indices, pas de
 *  décomposition guidée).
 */
export function estMaitrise(
  attempt: Pick<Attempt, 'est_correcte' | 'nb_indices_utilises' | 'est_decomposition'>,
  _exo?: Exercise
): boolean {
  return (
    attempt.est_correcte &&
    (attempt.nb_indices_utilises ?? 0) <= 1 &&
    !attempt.est_decomposition
  );
}

/**
 * Taux de maîtrise d'un jour pour un enfant.
 * = nombre d'exos du jour avec statut 'maitrise' / total d'exos du jour
 * Retourne un nombre entre 0 et 1.
 */
export async function tauxMaitriseJour(
  childId: string,
  jour: number,
  supabase: SupabaseClient
): Promise<number> {
  // 1. Récupérer la liste des exos du jour
  const { data: exosDuJour, error: e1 } = await supabase
    .from('exercises')
    .select('id')
    .eq('jour', jour);

  if (e1 || !exosDuJour || exosDuJour.length === 0) return 0;

  const ids = exosDuJour.map((e) => e.id as string);

  // 2. Compter ceux où progress.statut = 'maitrise'
  const { data: progresses, error: e2 } = await supabase
    .from('progress')
    .select('exercise_id, statut')
    .eq('child_id', childId)
    .in('exercise_id', ids)
    .eq('statut', 'maitrise');

  if (e2 || !progresses) return 0;

  return progresses.length / exosDuJour.length;
}

/**
 * Compte le nombre d'échecs récents (dernières 24h) pour un exercice donné.
 */
export async function countEchecsRecents(
  childId: string,
  exerciseId: string,
  supabase: SupabaseClient
): Promise<number> {
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { count, error } = await supabase
    .from('attempts')
    .select('id', { count: 'exact', head: true })
    .eq('child_id', childId)
    .eq('exercise_id', exerciseId)
    .eq('est_correcte', false)
    .gte('created_at', since);

  if (error || count == null) return 0;
  return count;
}
