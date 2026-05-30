import 'server-only';
import type { Exercise } from '@/lib/types';
import { normaliserReponse } from '@/lib/utils';

export interface ValidationLocale {
  /** True si la réponse est jugée correcte par la logique locale (pas Claude). */
  correct: boolean;
  /** Score partiel (0-1) — utilisé pour les rédigés (par défaut 0 ou 1). */
  score_partiel?: number;
  /** Si true, le caller doit déléguer à Claude pour trancher. */
  needs_claude?: boolean;
  /** Message court pour expliquer la décision locale (debug). */
  raison?: string;
}

/**
 * Valide une réponse en local (sans appel Claude).
 * Si la validation nécessite Claude (redige_libre ou validation_par_claude=true
 * sur un exo avec regex absente), on renvoie `needs_claude: true`.
 */
export function validerReponse(exo: Exercise, reponse: string): ValidationLocale {
  const r = (reponse ?? '').trim();
  if (!r) return { correct: false, score_partiel: 0, raison: 'reponse_vide' };

  switch (exo.type) {
    case 'qcm':
    case 'vrai_faux': {
      const expected = (exo.reponse_correcte ?? '').toString().trim().toLowerCase();
      const given = r.toLowerCase();
      const ok = expected.length > 0 && given === expected;
      return { correct: ok, score_partiel: ok ? 1 : 0 };
    }

    case 'numerique': {
      const attendu = (exo.reponse_correcte ?? exo.reponse_attendue_redige ?? '').toString();
      const tol = exo.tolerance_numerique ?? 0;
      const numAttendu = parseNumero(attendu);
      const numDonne = parseNumero(r);
      if (numAttendu === null || numDonne === null) {
        return { correct: false, score_partiel: 0, raison: 'parse_impossible' };
      }
      const ok = Math.abs(numDonne - numAttendu) <= tol;
      return { correct: ok, score_partiel: ok ? 1 : 0 };
    }

    case 'redige_court': {
      // Priorité 1 : regex_validation
      if (exo.regex_validation) {
        try {
          const re = new RegExp(exo.regex_validation, 'i');
          const ok = re.test(r);
          return { correct: ok, score_partiel: ok ? 1 : 0 };
        } catch {
          // regex invalide : fallback comparaison normalisée
        }
      }
      // Priorité 2 : validation par Claude si demandée
      if (exo.validation_par_claude) {
        return { correct: false, needs_claude: true };
      }
      // Priorité 3 : comparaison normalisée stricte
      if (exo.reponse_attendue_redige) {
        const ok =
          normaliserReponse(r) === normaliserReponse(exo.reponse_attendue_redige);
        return { correct: ok, score_partiel: ok ? 1 : 0 };
      }
      return { correct: false, needs_claude: true, raison: 'fallback_claude' };
    }

    case 'redige_libre':
      // Toujours Claude pour les rédigés libres
      return { correct: false, needs_claude: true };

    case 'appariement':
    case 'ordre': {
      // Réponse attendue : chaîne JSON sérialisée (côté client)
      try {
        const attendu = JSON.parse(exo.reponse_correcte ?? '[]');
        const donne = JSON.parse(r);
        const ok = JSON.stringify(attendu) === JSON.stringify(donne);
        return { correct: ok, score_partiel: ok ? 1 : 0 };
      } catch {
        return { correct: false, score_partiel: 0, raison: 'json_invalide' };
      }
    }

    default:
      return { correct: false, score_partiel: 0, raison: 'type_inconnu' };
  }
}

/**
 * Parse un nombre français (virgule décimale tolérée, espaces ignorés).
 * Renvoie null si la chaîne ne représente pas un nombre.
 */
function parseNumero(s: string): number | null {
  if (s == null) return null;
  const clean = s.toString().replace(/\s+/g, '').replace(',', '.');
  if (!/^-?\d+(\.\d+)?$/.test(clean)) return null;
  const n = Number(clean);
  return Number.isFinite(n) ? n : null;
}
