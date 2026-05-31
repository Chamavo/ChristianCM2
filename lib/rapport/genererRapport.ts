import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Génère le rapport d'analyse d'une journée pour un apprenant.
 *
 * Source : table `attempts` (toutes les tentatives, avec durée + résultat par
 * question) jointe à `exercises` (énoncé, thème, compétence, type), plus
 * `focus_events` (sorties d'onglet = signaux anti-triche).
 *
 * IMPORTANT : le rapport rappelle l'ÉNONCÉ des questions problématiques
 * mais JAMAIS le corrigé (reponse_correcte / reponse_attendue exclues).
 */

const SEUIL_TEMPS_LONG_SEC = 180; // 3 min sur une question = signal de difficulté

export interface QuestionProblematique {
  exercise_id: string;
  ordre_jour: number | null;
  theme: string | null;
  sous_theme: string | null;
  competence: string | null;
  type: string | null;
  enonce: string; // énoncé rappelé — PAS de corrigé
  nb_tentatives: number;
  nb_echecs: number;
  duree_totale_sec: number;
  maitrise: boolean;
  reporte: boolean;
  sorties_onglet: number;
  raisons: string[]; // pourquoi c'est flaggé
}

export interface ThemeSynthese {
  theme: string;
  nb_questions: number;
  nb_echecs: number;
  taux_reussite: number; // 0..1
  duree_moyenne_sec: number;
}

export interface RapportJournee {
  child_id: string;
  display_name: string | null;
  jour: number;
  genere_le: string;
  // Synthèse globale
  total_questions_tentees: number;
  total_maitrisees: number;
  total_reportees: number;
  temps_total_sec: number;
  temps_moyen_par_question_sec: number;
  nb_sorties_onglet: number;
  duree_absence_totale_sec: number;
  // Détail
  questions_problematiques: QuestionProblematique[];
  themes: ThemeSynthese[];
  patterns: string[]; // phrases d'analyse lisibles
}

interface AttemptRow {
  exercise_id: string;
  est_correcte: boolean;
  duree_sec: number | null;
  maitrise: boolean;
  created_at: string;
  exercises: {
    ordre_jour: number | null;
    theme: string | null;
    sous_theme: string | null;
    competence: string | null;
    type: string | null;
    enonce: string;
  } | null;
}

export async function genererRapport(
  supabase: SupabaseClient,
  childId: string,
  jour: number
): Promise<RapportJournee> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', childId)
    .maybeSingle<{ display_name: string | null }>();

  // Tentatives du jour + énoncé (jamais le corrigé)
  const { data: attemptsRaw } = await supabase
    .from('attempts')
    .select(
      `exercise_id, est_correcte, duree_sec, maitrise, created_at,
       exercises!inner(ordre_jour, theme, sous_theme, competence, type, enonce)`
    )
    .eq('child_id', childId)
    .eq('jour', jour)
    .order('created_at', { ascending: true });

  const attempts = (attemptsRaw ?? []) as unknown as AttemptRow[];

  // Statut final par exercice (pour distinguer maîtrisé / reporté)
  const exIds = Array.from(new Set(attempts.map((a) => a.exercise_id)));
  const statutParExo = new Map<string, string>();
  if (exIds.length > 0) {
    const { data: prog } = await supabase
      .from('progress')
      .select('exercise_id, statut')
      .eq('child_id', childId)
      .in('exercise_id', exIds);
    (prog ?? []).forEach((p: { exercise_id: string; statut: string }) =>
      statutParExo.set(p.exercise_id, p.statut)
    );
  }

  // Sorties d'onglet du jour, par exercice
  const { data: focusRaw } = await supabase
    .from('focus_events')
    .select('exercise_id, duree_absence_sec')
    .eq('child_id', childId)
    .eq('jour', jour);
  const sortiesParExo = new Map<string, number>();
  let nbSorties = 0;
  let dureeAbsence = 0;
  (focusRaw ?? []).forEach(
    (f: { exercise_id: string | null; duree_absence_sec: number }) => {
      nbSorties += 1;
      dureeAbsence += f.duree_absence_sec ?? 0;
      if (f.exercise_id) {
        sortiesParExo.set(
          f.exercise_id,
          (sortiesParExo.get(f.exercise_id) ?? 0) + 1
        );
      }
    }
  );

  // Agrégation par exercice
  interface Agg {
    meta: AttemptRow['exercises'];
    nb: number;
    echecs: number;
    duree: number;
  }
  const parExo = new Map<string, Agg>();
  for (const a of attempts) {
    const agg = parExo.get(a.exercise_id) ?? {
      meta: a.exercises,
      nb: 0,
      echecs: 0,
      duree: 0,
    };
    agg.nb += 1;
    if (!a.est_correcte) agg.echecs += 1;
    agg.duree += a.duree_sec ?? 0;
    if (!agg.meta && a.exercises) agg.meta = a.exercises;
    parExo.set(a.exercise_id, agg);
  }

  // Questions problématiques
  const questions_problematiques: QuestionProblematique[] = [];
  let totalMaitrisees = 0;
  let totalReportees = 0;
  let tempsTotal = 0;

  for (const [exId, agg] of parExo) {
    tempsTotal += agg.duree;
    const statut = statutParExo.get(exId) ?? '';
    const maitrise = statut === 'maitrise';
    const reporte = statut === 'reporte';
    if (maitrise) totalMaitrisees += 1;
    if (reporte) totalReportees += 1;

    const sorties = sortiesParExo.get(exId) ?? 0;
    const raisons: string[] = [];
    if (agg.echecs >= 2) raisons.push(`${agg.echecs} mauvaises réponses`);
    else if (agg.echecs === 1) raisons.push('1 mauvaise réponse');
    if (agg.duree >= SEUIL_TEMPS_LONG_SEC)
      raisons.push(`temps long (${Math.round(agg.duree / 60)} min)`);
    if (reporte) raisons.push('passée définitivement (abandon)');
    if (sorties > 0)
      raisons.push(`${sorties} sortie${sorties > 1 ? 's' : ''} d'onglet`);

    if (raisons.length > 0) {
      questions_problematiques.push({
        exercise_id: exId,
        ordre_jour: agg.meta?.ordre_jour ?? null,
        theme: agg.meta?.theme ?? null,
        sous_theme: agg.meta?.sous_theme ?? null,
        competence: agg.meta?.competence ?? null,
        type: agg.meta?.type ?? null,
        enonce: agg.meta?.enonce ?? '(énoncé indisponible)',
        nb_tentatives: agg.nb,
        nb_echecs: agg.echecs,
        duree_totale_sec: agg.duree,
        maitrise,
        reporte,
        sorties_onglet: sorties,
        raisons,
      });
    }
  }
  // Tri : plus problématique d'abord (échecs puis durée)
  questions_problematiques.sort(
    (a, b) => b.nb_echecs - a.nb_echecs || b.duree_totale_sec - a.duree_totale_sec
  );

  // Synthèse par thème
  interface ThemeAgg {
    nb: number;
    echecs: number;
    duree: number;
  }
  const parTheme = new Map<string, ThemeAgg>();
  for (const a of attempts) {
    const theme = a.exercises?.theme ?? 'Autre';
    const t = parTheme.get(theme) ?? { nb: 0, echecs: 0, duree: 0 };
    t.nb += 1;
    if (!a.est_correcte) t.echecs += 1;
    t.duree += a.duree_sec ?? 0;
    parTheme.set(theme, t);
  }
  const themes: ThemeSynthese[] = Array.from(parTheme.entries())
    .map(([theme, t]) => ({
      theme,
      nb_questions: t.nb,
      nb_echecs: t.echecs,
      taux_reussite: t.nb > 0 ? (t.nb - t.echecs) / t.nb : 0,
      duree_moyenne_sec: t.nb > 0 ? Math.round(t.duree / t.nb) : 0,
    }))
    .sort((a, b) => a.taux_reussite - b.taux_reussite);

  // Détection de patterns (lisible)
  const patterns: string[] = [];
  for (const t of themes) {
    if (t.nb_questions >= 3 && t.taux_reussite < 0.6) {
      patterns.push(
        `Difficulté marquée en « ${t.theme} » : ${Math.round(
          t.taux_reussite * 100
        )}% de réussite sur ${t.nb_questions} questions.`
      );
    }
  }
  const themesLents = themes.filter(
    (t) => t.nb_questions >= 3 && t.duree_moyenne_sec >= 90
  );
  for (const t of themesLents) {
    patterns.push(
      `Lenteur sur « ${t.theme} » : ${Math.round(
        t.duree_moyenne_sec
      )} s en moyenne par question.`
    );
  }
  if (nbSorties >= 3) {
    patterns.push(
      `⚠️ ${nbSorties} sorties d'onglet/fenêtre détectées (${Math.round(
        dureeAbsence / 60
      )} min hors écran) — vigilance triche.`
    );
  }
  if (patterns.length === 0) {
    patterns.push('Aucune difficulté récurrente marquée sur cette journée.');
  }

  const nbExos = parExo.size;
  return {
    child_id: childId,
    display_name: profile?.display_name ?? null,
    jour,
    genere_le: new Date().toISOString(),
    total_questions_tentees: nbExos,
    total_maitrisees: totalMaitrisees,
    total_reportees: totalReportees,
    temps_total_sec: tempsTotal,
    temps_moyen_par_question_sec: nbExos > 0 ? Math.round(tempsTotal / nbExos) : 0,
    nb_sorties_onglet: nbSorties,
    duree_absence_totale_sec: dureeAbsence,
    questions_problematiques,
    themes,
    patterns,
  };
}
