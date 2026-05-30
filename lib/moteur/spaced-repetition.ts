import 'server-only';

/**
 * Algorithme simple de spaced repetition.
 *
 * Stratégie (volontairement simple, adaptée CM2) :
 *  - 0 échec  : pas de révision programmée (return null)
 *  - 1 échec  : revoir dans 1 jour
 *  - 2 échecs : revoir dans 3 jours
 *  - 3 échecs : revoir dans 7 jours
 *  - 4+ échecs : revoir dans 14 jours
 *
 * Quand l'enfant maîtrise enfin l'exo lors d'une révision, on l'efface
 * (champ progress.prochaine_revision_at remis à null par le caller).
 */
export function prochaineRevision(nb_echecs: number): Date | null {
  if (nb_echecs <= 0) return null;

  const delaisJours: Record<number, number> = {
    1: 1,
    2: 3,
    3: 7,
  };
  const jours = delaisJours[nb_echecs] ?? 14;

  const d = new Date();
  d.setDate(d.getDate() + jours);
  // Normaliser à 06h du matin (heure "rentrée")
  d.setHours(6, 0, 0, 0);
  return d;
}
