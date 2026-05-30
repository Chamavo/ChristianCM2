import 'server-only';
import type { Exercise } from '@/lib/types';

/**
 * Calcule les points gagnés pour une tentative.
 *
 * Règle métier :
 *  - Base : `exo.points_maison` (par défaut 5)
 *  - Si la réponse est incorrecte → 0 point
 *  - Sinon : on soustrait le `cout_points` cumulé des indices utilisés
 *  - Minimum 1 point si la réponse est correcte
 *  - Bonus maison : géré côté DB par trigger `update_scores_after_attempt`
 */
export function calculerPoints(
  exo: Exercise,
  nb_indices: number,
  est_correct: boolean
): number {
  if (!est_correct) return 0;

  const base = exo.points_maison ?? 5;
  if (nb_indices <= 0) return base;

  const indices = exo.indices ?? [];
  // Coût cumulé des `nb_indices` premiers indices
  let cout = 0;
  for (let i = 0; i < Math.min(nb_indices, indices.length); i++) {
    cout += indices[i].cout_points ?? 1;
  }

  return Math.max(1, base - cout);
}
