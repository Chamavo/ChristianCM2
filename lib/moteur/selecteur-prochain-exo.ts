import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Exercise } from '@/lib/types';
import { pad } from '@/lib/utils';

export type NextExerciseResult =
  | { kind: 'exercise'; data: Exercise; raison: 'revision' | 'progression' | 'revisite' }
  | { kind: 'quiz'; data: { quiz_id: string; jour: number } }
  | { kind: 'completed'; data: { jour: number; message: string } };

/**
 * Sélection du prochain exercice — marche LINÉAIRE dans la journée.
 *
 * Règle métier (validée) :
 *   - Dans une journée, on parcourt les 30 exercices DANS L'ORDRE.
 *   - On peut avancer même si un exercice rédigé n'a pas pu être corrigé
 *     (il reste "non maîtrisé" et sera repris en fin de journée).
 *   - La journée ne se termine (et ne débloque la suivante) que lorsque
 *     TOUS ses exercices sont maîtrisés.
 *
 * Ordre de service à l'intérieur d'un jour :
 *   1. Premier exercice jamais tenté (ordre croissant).
 *   2. Sinon, premier exercice tenté mais non maîtrisé (phase de révision du jour).
 * Quand tout le jour est maîtrisé :
 *   3. Révision due (spaced repetition) éventuelle.
 *   4. Quiz du jour si jour pair et pas encore passé.
 *   5. Premier exercice du jour suivant.
 *   6. Sinon : parcours terminé.
 */
export async function nextExercise(
  childId: string,
  supabase: SupabaseClient
): Promise<NextExerciseResult> {
  const today = await currentJour(childId, supabase);

  // 1-2. Marche dans le jour courant (non tenté, puis non maîtrisé)
  const marche = await prochainDansJour(childId, today, supabase);
  if (marche) {
    return {
      kind: 'exercise',
      data: marche.exo,
      raison: marche.revisite ? 'revisite' : 'progression',
    };
  }

  // --- Le jour courant est entièrement maîtrisé ---

  // 3. Révision due (exos d'anciens jours qui ressortent)
  const revision = await getRevisionDue(childId, supabase);
  if (revision) {
    return { kind: 'exercise', data: revision, raison: 'revision' };
  }

  // 4. Quiz du jour (jour pair + pas encore passé)
  if (today % 2 === 0) {
    const dejaPasse = await quizDejaPasse(childId, today, supabase);
    if (!dejaPasse) {
      return { kind: 'quiz', data: { quiz_id: `quiz-j${pad(today)}`, jour: today } };
    }
  }

  // 5. Jour suivant
  if (today < 15) {
    const suivantJour = await prochainDansJour(childId, today + 1, supabase);
    if (suivantJour) {
      return { kind: 'exercise', data: suivantJour.exo, raison: 'progression' };
    }
  }

  // 6. Terminé
  return {
    kind: 'completed',
    data: {
      jour: today,
      message:
        today >= 15
          ? 'Bravo, le programme est terminé ! La grande coupe t\'attend.'
          : 'Tu as tout maîtrisé pour aujourd\'hui. Reviens pour la suite de l\'aventure.',
    },
  };
}

// ============================================================
// Helpers internes
// ============================================================

/**
 * Jour courant = plus grand jour parmi les tentatives (défaut 1, plafonné à 15).
 */
async function currentJour(childId: string, supabase: SupabaseClient): Promise<number> {
  const { data } = await supabase
    .from('attempts')
    .select('jour')
    .eq('child_id', childId)
    .order('jour', { ascending: false })
    .limit(1)
    .maybeSingle();

  const j = (data as { jour: number } | null)?.jour;
  return typeof j === 'number' && j > 0 ? Math.min(15, j) : 1;
}

/**
 * Prochain exercice à servir dans un jour donné :
 *   - phase 1 : premier exo jamais tenté (ordre croissant) ;
 *   - phase 2 : premier exo tenté mais non maîtrisé (revisite).
 * Retourne null si tous les exos du jour sont maîtrisés.
 */
async function prochainDansJour(
  childId: string,
  jour: number,
  supabase: SupabaseClient
): Promise<{ exo: Exercise; revisite: boolean } | null> {
  const { data: exos } = await supabase
    .from('exercises')
    .select('*')
    .eq('jour', jour)
    .order('ordre_jour', { ascending: true });

  if (!exos || exos.length === 0) return null;

  const ids = exos.map((e) => e.id as string);
  const { data: progresses } = await supabase
    .from('progress')
    .select('exercise_id, statut')
    .eq('child_id', childId)
    .in('exercise_id', ids);

  const statuts = new Map<string, string>();
  (progresses ?? []).forEach((p: { exercise_id: string; statut: string }) =>
    statuts.set(p.exercise_id, p.statut)
  );

  // Phase 1 : jamais tenté (aucune ligne de progress)
  for (const e of exos as Exercise[]) {
    if (!statuts.has(e.id)) return { exo: e, revisite: false };
  }
  // Phase 2 : tenté mais ni maîtrisé ni passé définitivement ('reporte')
  for (const e of exos as Exercise[]) {
    const s = statuts.get(e.id);
    if (s !== 'maitrise' && s !== 'reporte') return { exo: e, revisite: true };
  }
  // Jour réglé : tout est maîtrisé ou passé définitivement
  return null;
}

async function quizDejaPasse(
  childId: string,
  jour: number,
  supabase: SupabaseClient
): Promise<boolean> {
  const { count } = await supabase
    .from('quiz_results')
    .select('id', { count: 'exact', head: true })
    .eq('child_id', childId)
    .eq('jour', jour);
  return (count ?? 0) > 0;
}

async function getRevisionDue(
  childId: string,
  supabase: SupabaseClient
): Promise<Exercise | null> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('progress')
    .select('exercise_id, exercises:exercise_id(*)')
    .eq('child_id', childId)
    .neq('statut', 'maitrise')
    .not('prochaine_revision_at', 'is', null)
    .lte('prochaine_revision_at', now)
    .order('prochaine_revision_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  const exo = (data as unknown as { exercises: Exercise | null }).exercises;
  return exo ?? null;
}
