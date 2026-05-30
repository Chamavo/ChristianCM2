import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Exercise } from '@/lib/types';
import { tauxMaitriseJour } from '@/lib/moteur/calcul-maitrise';
import { calculerRattrapage } from '@/lib/moteur/rattrapage';
import { pad } from '@/lib/utils';

export type NextExerciseResult =
  | { kind: 'exercise'; data: Exercise; raison: 'revision' | 'en_cours' | 'progression' | 'rattrapage' }
  | { kind: 'quiz'; data: { quiz_id: string; jour: number } }
  | { kind: 'completed'; data: { jour: number; message: string } };

const SEUIL_MAITRISE_JOUR = 0.8;

/**
 * Sélection du prochain exercice selon le moteur adaptatif.
 * Voir architecture-nextjs.md → section "Sélecteur du prochain exercice".
 *
 * Ordre de priorité :
 *   1. Quiz à passer aujourd'hui (jour pair + pas encore passé)
 *   2. Exercice de révision dû (spaced repetition)
 *   3. Exercice en cours non maîtrisé
 *   4. Prochain exo dans l'ordre du jour
 *   5. Jour terminé à 80%+ → passer au jour suivant
 */
export async function nextExercise(
  childId: string,
  supabase: SupabaseClient
): Promise<NextExerciseResult> {
  // Déterminer le jour courant (basé sur max(jour) parmi attempts ; défaut 1)
  const today = await currentJour(childId, supabase);

  // 1. QUIZ DU JOUR (jour pair + pas encore passé)
  if (today % 2 === 0) {
    const quizId = `quiz-j${pad(today)}`;
    const dejaPasse = await quizPasseAujourdhui(childId, today, supabase);
    if (!dejaPasse) {
      // On s'assure aussi que le jour courant est terminé à 80%+
      const taux = await tauxMaitriseJour(childId, today, supabase);
      if (taux >= SEUIL_MAITRISE_JOUR) {
        return { kind: 'quiz', data: { quiz_id: quizId, jour: today } };
      }
    }
  }

  // 2. RÉVISION DUE
  const revision = await getRevisionDue(childId, supabase);
  if (revision) {
    return { kind: 'exercise', data: revision, raison: 'revision' };
  }

  // 3. EXERCICE EN COURS NON MAÎTRISÉ
  const enCours = await getCurrentNonMaitrise(childId, today, supabase);
  if (enCours) {
    return { kind: 'exercise', data: enCours, raison: 'en_cours' };
  }

  // 4. PROCHAIN EXO DANS L'ORDRE DU JOUR
  const prochain = await getNextInJour(childId, today, supabase);
  if (prochain) {
    return { kind: 'exercise', data: prochain, raison: 'progression' };
  }

  // 5. JOUR TERMINÉ ? On regarde le taux de maîtrise
  const taux = await tauxMaitriseJour(childId, today, supabase);
  if (taux >= SEUIL_MAITRISE_JOUR && today < 15) {
    // Rattrapage éventuel : on saute des exos si retard
    const rattrapage = await calculerRattrapage(childId, supabase);
    const offset = rattrapage.exos_a_reduire;
    const premier = await getFirstOfJour(today + 1, supabase, offset);
    if (premier) {
      return { kind: 'exercise', data: premier, raison: offset > 0 ? 'rattrapage' : 'progression' };
    }
  }

  // 6. Plus rien à faire aujourd'hui
  return {
    kind: 'completed',
    data: {
      jour: today,
      message:
        taux >= SEUIL_MAITRISE_JOUR
          ? 'Bravo, le programme est terminé ! La grande coupe t\'attend.'
          : 'Tu as bien travaillé. Reviens demain pour la suite de l\'aventure.',
    },
  };
}

// ============================================================
// Helpers internes
// ============================================================

/**
 * Détermine le "jour courant" pour l'enfant.
 * = max(jour) parmi les attempts (ou 1 si aucun attempt).
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

async function quizPasseAujourdhui(
  childId: string,
  jour: number,
  supabase: SupabaseClient
): Promise<boolean> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const { count } = await supabase
    .from('quiz_results')
    .select('id', { count: 'exact', head: true })
    .eq('child_id', childId)
    .eq('jour', jour)
    .gte('created_at', startOfDay.toISOString());
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
  const exo = (data as any).exercises as Exercise | null;
  return exo ?? null;
}

async function getCurrentNonMaitrise(
  childId: string,
  jour: number,
  supabase: SupabaseClient
): Promise<Exercise | null> {
  const { data, error } = await supabase
    .from('progress')
    .select('exercise_id, exercises:exercise_id(*)')
    .eq('child_id', childId)
    .in('statut', ['en_cours', 'bloque'])
    .order('exercise_id', { ascending: true })
    .limit(20);

  if (error || !data) return null;
  // On préfère un exo du jour courant
  const rows = data as unknown as Array<{ exercises: Exercise | null }>;
  const candidats = rows.map((r) => r.exercises).filter((e): e is Exercise => !!e);
  const duJour = candidats.find((e) => e.jour === jour);
  return duJour ?? candidats[0] ?? null;
}

async function getNextInJour(
  childId: string,
  jour: number,
  supabase: SupabaseClient
): Promise<Exercise | null> {
  // Récupérer tous les exos du jour, ordonnés
  const { data: exos } = await supabase
    .from('exercises')
    .select('*')
    .eq('jour', jour)
    .order('ordre_jour', { ascending: true });

  if (!exos || exos.length === 0) return null;

  // Récupérer les progress pour ces exos
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

  // Premier exo non terminé ('non_commence' OU pas de progress du tout)
  for (const e of exos as Exercise[]) {
    const s = statuts.get(e.id);
    if (!s || s === 'non_commence') return e;
  }
  return null;
}

async function getFirstOfJour(
  jour: number,
  supabase: SupabaseClient,
  offset: number = 0
): Promise<Exercise | null> {
  const { data } = await supabase
    .from('exercises')
    .select('*')
    .eq('jour', jour)
    .order('ordre_jour', { ascending: true })
    .range(offset, offset);

  return ((data?.[0] as Exercise | undefined) ?? null) || null;
}
