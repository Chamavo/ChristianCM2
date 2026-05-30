import 'server-only';
import type { Exercise, QuizResult } from '@/lib/types';

/**
 * Templates de prompts pour les différents appels Claude.
 *
 * Style général :
 *  - Ton bienveillant, légèrement sorcier (Dumbledore-like)
 *  - JAMAIS de fausse info mathématique : la rigueur prime sur le ton
 *  - Toujours s'adresser à un élève de CM2 (10 ans)
 *  - Sortie JSON stricte quand demandée (pas de texte autour)
 */

const SYSTEME_BASE = `Tu es un précepteur sorcier bienveillant à Poudlard, expert en mathématiques niveau CM2 (élèves de 10 ans). Tu prépares ton élève au concours d'entrée à l'institution Libermann.

Règles ABSOLUES :
- La rigueur mathématique prime TOUJOURS sur le style narratif.
- Ne valide JAMAIS une réponse fausse même si l'élève s'est donné de la peine.
- Ton encourageant mais factuel : pas de flagornerie, pas de paternalisme.
- Vocabulaire CM2 : phrases courtes, pas de jargon (sauf vocabulaire mathématique du programme).
- Quand tu emploies une métaphore Harry Potter, qu'elle soit utile à la compréhension, jamais gratuite.`;

// ============================================================
// 1. Validation d'une réponse rédigée
// ============================================================

export interface PromptValidationRedige {
  systeme: string;
  user: string;
}

export function buildPromptValidationRedige(
  exo: Exercise,
  reponse_donnee: string
): PromptValidationRedige {
  const criteres = (exo.criteres_validation_claude ?? []).map((c, i) => `  ${i + 1}. ${c}`).join('\n');
  const reponseAttendue = exo.reponse_attendue_redige ?? exo.reponse_correcte ?? '(non fournie)';

  const user = `Voici un exercice de mathématiques CM2 et la réponse d'un élève. Évalue-la.

ÉNONCÉ :
${exo.enonce}

RÉPONSE ATTENDUE (référence) :
${reponseAttendue}

${exo.explication_correcte ? `EXPLICATION DE LA RÉPONSE :\n${exo.explication_correcte}\n` : ''}
${criteres ? `CRITÈRES DE VALIDATION :\n${criteres}\n` : ''}
RÉPONSE DE L'ÉLÈVE :
"""
${reponse_donnee}
"""

Renvoie UNIQUEMENT un objet JSON, sans texte autour, sans balises markdown, au format :
{
  "correct": true | false,
  "score_partiel": 0.0 à 1.0,
  "feedback": "1 à 2 phrases courtes, ton sorcier bienveillant, factuel sur les maths"
}

- correct = true UNIQUEMENT si la réponse mathématique est juste (résultat ET raisonnement si visible).
- score_partiel : 1.0 = parfait, 0.5 = bon début mais résultat faux, 0.0 = à côté.
- feedback : si correct, félicite brièvement et confirme le résultat. Si incorrect, indique l'erreur sans donner la réponse.`;

  return { systeme: SYSTEME_BASE, user };
}

// ============================================================
// 2. Décomposition à la volée d'un exercice
// ============================================================

export function buildPromptDecomposition(exo: Exercise) {
  const user = `Un élève de CM2 bloque sur l'exercice suivant. Génère une décomposition en 3 à 5 micro-étapes pour le guider sans donner la réponse.

ÉNONCÉ :
${exo.enonce}

${exo.reponse_correcte ? `RÉPONSE CORRECTE (pour ta référence — ne pas révéler à l'élève) : ${exo.reponse_correcte}` : ''}
${exo.explication_correcte ? `EXPLICATION : ${exo.explication_correcte}` : ''}

Renvoie UNIQUEMENT un objet JSON, sans markdown, au format :
{
  "declenchee_si": "2_erreurs_OU_temps_long",
  "micro_etapes": [
    {
      "id": "auto-d1",
      "enonce": "Question courte (1 phrase) qui fait avancer d'un cran.",
      "type": "qcm" | "numerique" | "redige_court",
      "choix": [{"id":"a","texte":"..."}, ...]  // si qcm uniquement
      "reponse_correcte": "a",                   // si qcm
      "reponse": 42,                             // si numerique
      "reponse_attendue": "..."                  // si redige_court
    }
    // 3 à 5 étapes au total, progression logique
  ]
}

Règles :
- Chaque étape doit être franchissable en moins d'1 minute.
- Privilégie les QCM et les numériques (validation auto).
- La dernière étape doit ramener à la question originale.
- Adapté à un enfant de 10 ans.`;

  return { systeme: SYSTEME_BASE, user };
}

// ============================================================
// 3. Reformulation alternative
// ============================================================

export function buildPromptReformulation(exo: Exercise) {
  const user = `Un élève de CM2 bloque sur cet exercice malgré une décomposition. Reformule-le avec un angle différent (plus concret, plus visuel, ou avec une autre situation Harry Potter).

ÉNONCÉ ORIGINAL :
${exo.enonce}

${exo.narration ? `NARRATION HP ORIGINALE : ${exo.narration}` : ''}

THÈME MATHÉMATIQUE : ${exo.theme}${exo.sous_theme ? ` / ${exo.sous_theme}` : ''}

Renvoie UNIQUEMENT un objet JSON, sans markdown, au format :
{
  "narration_alt": "1-2 phrases, scène HP différente, plus concrète/visuelle",
  "enonce_alt": "Le même problème mathématique, formulé différemment (mots plus simples ou contexte alternatif)",
  "indice_visuel": "description courte d'un schéma mental utile, ou null"
}

Règles :
- Le PROBLÈME MATHÉMATIQUE reste rigoureusement identique (mêmes nombres, mêmes opérations attendues).
- Seule la formulation change.
- Pas de spoiler de la réponse.`;

  return { systeme: SYSTEME_BASE, user };
}

// ============================================================
// 4. Feedback quiz global
// ============================================================

export interface QuizDetailLigne {
  exercise_id: string;
  theme: string;
  points_obtenus: number;
  points_max: number;
  reponse_donnee?: string | null;
  reponse_correcte?: string | null;
}

export function buildPromptFeedbackQuiz(
  quizResult: Pick<QuizResult, 'jour' | 'note' | 'note_max' | 'duree_sec'>,
  details: QuizDetailLigne[]
) {
  const detailsTxt = details
    .map(
      (d, i) =>
        `  ${i + 1}. [${d.theme}] ${d.points_obtenus}/${d.points_max} pts — réponse : ${
          d.reponse_donnee ?? '—'
        }${d.reponse_correcte ? ` (attendu : ${d.reponse_correcte})` : ''}`
    )
    .join('\n');

  const user = `Un élève de CM2 vient de finir son quiz Libermann du jour ${quizResult.jour}.

NOTE : ${quizResult.note} / ${quizResult.note_max}
DURÉE : ${Math.round((quizResult.duree_sec ?? 0) / 60)} min

DÉTAIL :
${detailsTxt}

Rédige un feedback global, style Dumbledore (bienveillant, sage, ton sorcier modéré), à destination de l'élève.

Renvoie UNIQUEMENT un objet JSON, sans markdown, au format :
{
  "themes_forts": ["thème1", "thème2"],
  "themes_faibles": ["thème3"],
  "feedback_global": "Texte de 3 à 5 phrases, qui : (1) ouvre par une remarque encourageante factuelle, (2) nomme ce qui a bien marché, (3) nomme PRÉCISÉMENT ce qui demande encore du travail (sans accabler), (4) propose une mini-piste concrète pour progresser. Maximum 600 caractères."
}

Règles :
- AUCUN mensonge : si la note est faible, ne pas la magnifier.
- Pas de "très bien" générique. Du concret.
- Le ton sorcier reste léger : éviter les "mon jeune apprenti" répétés. Une touche, pas une saturation.`;

  return { systeme: SYSTEME_BASE, user };
}
