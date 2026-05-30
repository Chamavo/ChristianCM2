import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface ResultatRattrapage {
  /** Jour théorique courant (calé sur date_inscription). */
  jour_theorique: number;
  /** Jour réel courant (dernier jour avec activité). */
  jour_reel: number;
  /** Retard cumulé exprimé en "jours de programme" (peut être décimal). */
  jours_de_retard: number;
  /** Nombre d'exos à retirer du jour suivant pour rattraper. */
  exos_a_reduire: number;
}

/**
 * Calcule le retard cumulé d'un enfant et le nombre d'exos à retirer
 * du prochain jour pour rattraper.
 *
 * Hypothèses :
 *  - Programme = 15 jours.
 *  - Jour théorique = nb de jours depuis date_inscription (cap à 15).
 *  - Jour réel = max(jour) parmi les attempts ; à défaut, 1.
 *  - Si jours_de_retard > 0.5 : on réduit les exos suivants proportionnellement
 *    (1 exo retiré par 0.5 jour de retard, plafonné à 5).
 */
export async function calculerRattrapage(
  childId: string,
  supabase: SupabaseClient
): Promise<ResultatRattrapage> {
  // 1. Date d'inscription
  const { data: profile } = await supabase
    .from('profiles')
    .select('date_inscription')
    .eq('id', childId)
    .single();

  const dateInscription = profile?.date_inscription
    ? new Date(profile.date_inscription)
    : new Date();
  const diffMs = Date.now() - dateInscription.getTime();
  const joursEcoules = Math.max(1, Math.floor(diffMs / (24 * 3600 * 1000)) + 1);
  const jour_theorique = Math.min(15, joursEcoules);

  // 2. Jour réel = max(jour) parmi attempts ayant des exos maîtrisés
  const { data: progressRows } = await supabase
    .from('progress')
    .select('exercise_id, statut, exercises:exercise_id(jour)')
    .eq('child_id', childId)
    .eq('statut', 'maitrise');

  let jour_reel = 1;
  if (progressRows && progressRows.length > 0) {
    for (const row of progressRows as unknown as Array<{ exercises: { jour: number } | null }>) {
      const j = row.exercises?.jour;
      if (typeof j === 'number' && j > jour_reel) jour_reel = j;
    }
  }

  // 3. Calcul finesse retard : on tient compte du taux de maîtrise du jour courant
  const { data: exosJourCourant } = await supabase
    .from('exercises')
    .select('id')
    .eq('jour', jour_reel);
  const totalJourCourant = exosJourCourant?.length ?? 0;

  let tauxJourCourant = 0;
  if (totalJourCourant > 0 && progressRows) {
    const idsJour = new Set(exosJourCourant!.map((e) => e.id as string));
    const maitrisesJour = (progressRows as Array<{ exercise_id: string }>).filter(
      (r) => idsJour.has(r.exercise_id)
    ).length;
    tauxJourCourant = maitrisesJour / totalJourCourant;
  }

  // jour réel "ajusté" = jour_reel - (1 - taux) ; ex: jour 3 à 60% → 2.4
  const jourReelAjuste = jour_reel - (1 - tauxJourCourant);
  const jours_de_retard = Math.max(0, jour_theorique - jourReelAjuste);

  // 4. Combien d'exos retirer du prochain jour
  let exos_a_reduire = 0;
  if (jours_de_retard > 0.5) {
    exos_a_reduire = Math.min(5, Math.floor(jours_de_retard / 0.5));
  }

  return {
    jour_theorique,
    jour_reel,
    jours_de_retard: Math.round(jours_de_retard * 100) / 100,
    exos_a_reduire,
  };
}
