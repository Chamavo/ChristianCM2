import 'server-only';
import type { Attempt, Exercise, StrategieAide } from '@/lib/types';

/**
 * Détection de blocage (règle métier validée) :
 *  Blocage déclenché si :
 *    - 1 erreur ET (durée > 2× durée_estimée_sec)
 *    - OU 2 erreurs consécutives
 *    - OU clic "Aide" explicite
 *
 * Stratégies d'aide successives :
 *    indice → décomposition → reformulation → report J+1
 */
export interface ContexteBlocage {
  /** Tentative qu'on vient de soumettre (la dernière). */
  attempt: Pick<
    Attempt,
    'est_correcte' | 'duree_sec' | 'nb_indices_utilises' | 'est_decomposition' | 'est_reformulation'
  >;
  /** Nombre d'échecs consécutifs (incluant la tentative courante). */
  nb_echecs_consecutifs: number;
  /** L'enfant a-t-il explicitement cliqué sur "Aide" ? */
  aide_demandee?: boolean;
}

export interface ResultatBlocage {
  bloque: boolean;
  declencheur: '2_erreurs' | 'temps_long' | 'aide_demandee' | null;
  strategie: StrategieAide | null;
}

export function detecterBlocage(ctx: ContexteBlocage, exo: Exercise): ResultatBlocage {
  const { attempt, nb_echecs_consecutifs, aide_demandee } = ctx;
  const dureeEstimee = exo.duree_estimee_sec ?? 90;
  const seuilTemps = dureeEstimee * 2;

  // Pas de blocage si tentative correcte
  if (attempt.est_correcte) {
    return { bloque: false, declencheur: null, strategie: null };
  }

  // Détermine quelle stratégie a déjà été tentée pour choisir la suivante
  // Ordre : indice → décomposition → reformulation → report
  const dejaIndices = (attempt.nb_indices_utilises ?? 0) > 0;
  const dejaDecomposition = !!attempt.est_decomposition;
  const dejaReformulation = !!attempt.est_reformulation;

  const prochaineStrategie = (): StrategieAide => {
    if (dejaReformulation) return 'report';
    if (dejaDecomposition) return 'reformulation';
    // si l'enfant a déjà eu au moins 2 indices, on passe à la décomposition
    if ((attempt.nb_indices_utilises ?? 0) >= 2) return 'decomposition';
    if (dejaIndices) return 'decomposition';
    return 'indice';
  };

  // 2 erreurs consécutives → décomposition direct
  if (nb_echecs_consecutifs >= 2) {
    return {
      bloque: true,
      declencheur: '2_erreurs',
      strategie: dejaDecomposition
        ? dejaReformulation
          ? 'report'
          : 'reformulation'
        : 'decomposition',
    };
  }

  // Aide demandée explicitement
  if (aide_demandee) {
    return {
      bloque: true,
      declencheur: 'aide_demandee',
      strategie: prochaineStrategie(),
    };
  }

  // 1 erreur + temps > 2× durée estimée
  if (!attempt.est_correcte && attempt.duree_sec > seuilTemps) {
    return {
      bloque: true,
      declencheur: 'temps_long',
      strategie: prochaineStrategie(),
    };
  }

  return { bloque: false, declencheur: null, strategie: null };
}
