// Types partagés Poudlard Maths
// Dérivés du schéma JSON (schema-exercice.md) et Supabase (supabase-schema.sql)

export type Maison = 'gryffondor' | 'serdaigle' | 'poufsouffle' | 'serpentard';
export type UserRole = 'admin' | 'parent' | 'child';
export type ExerciceType = 'qcm' | 'vrai_faux' | 'numerique' | 'redige_court' | 'redige_libre' | 'appariement' | 'ordre';
export type Statut = 'non_commence' | 'en_cours' | 'bloque' | 'maitrise' | 'reporte';
export type DeclencheurBlocage = '2_erreurs' | 'temps_long' | 'aide_demandee' | 'echec_decomposition';
export type StrategieAide = 'indice' | 'decomposition' | 'reformulation' | 'report';

export interface Choix {
  id: string;
  texte: string;
}

export interface Indice {
  niveau: number;
  texte: string;
  cout_points: number;
}

export interface MicroEtape {
  id: string;
  enonce: string;
  type: ExerciceType;
  choix?: Choix[];
  reponse_correcte?: string;
  reponse?: number | string;
  reponse_attendue?: string;
  regex_validation?: string;
  validation_par_claude?: boolean;
}

export interface Decomposition {
  declenchee_si: string;
  micro_etapes: MicroEtape[];
}

export interface ReformulationAlt {
  declenchee_si: string;
  narration_alt: string;
  enonce_alt: string;
  indice_visuel?: string;
}

export interface ReportJourSuivant {
  declenchee_si: string;
  exercice_replay_id: string;
  delai_jours: number;
}

export interface Exercise {
  id: string;
  jour: number;
  ordre_jour: number;
  theme: string;
  sous_theme?: string;
  scene_hp?: string;
  narration?: string;
  type: ExerciceType;
  competence?: string;
  competences_prerequises?: string[];
  difficulte_relative?: number;
  duree_estimee_sec?: number;
  points_maison?: number;
  maison_bonus?: Maison;

  enonce: string;
  image_url?: string | null;
  donnees_supplementaires?: any;

  choix?: Choix[];
  reponse_correcte?: string;
  reponse_attendue_redige?: string;
  tolerance_numerique?: number;
  regex_validation?: string;

  explication_correcte?: string;
  explications_erreurs?: Record<string, string>;

  indices?: Indice[];
  decomposition?: Decomposition;
  reformulation_alternative?: ReformulationAlt;
  report_jour_suivant?: ReportJourSuivant;

  validation_par_claude?: boolean;
  criteres_validation_claude?: string[];

  tags?: string[];
  source_inspiration?: string;
}

export interface JourFichier {
  jour: number;
  titre: string;
  theme_principal: string;
  scene_globale: string;
  mix_qcm_redige: string;
  duree_estimee_min: number;
  exercices: Exercise[];
}

export interface Quiz {
  id: string;
  jour: number;
  duree_min: number;
  note_max: number;
  exercices: Exercise[];
  ponderations?: Record<string, number>;
  themes_couverts?: string[];
}

export interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  role: UserRole;
  parent_id: string | null;
  maison_choisie: Maison | null;
  date_inscription: string;
}

export interface Attempt {
  id: number;
  child_id: string;
  exercise_id: string;
  jour: number;
  reponse_donnee: string | null;
  est_correcte: boolean;
  duree_sec: number;
  nb_indices_utilises: number;
  est_decomposition: boolean;
  est_reformulation: boolean;
  est_replay: boolean;
  points_gagnes: number;
  maitrise: boolean;
  feedback_claude: string | null;
  cout_tokens_claude: number;
  device: 'mobile' | 'desktop' | 'tablette' | null;
  created_at: string;
}

export interface Progress {
  child_id: string;
  exercise_id: string;
  statut: Statut;
  nb_tentatives: number;
  premiere_tentative_at: string | null;
  maitrise_at: string | null;
  prochaine_revision_at: string | null;
}

export interface QuizResult {
  id: number;
  child_id: string;
  quiz_id: string;
  jour: number;
  note: number;
  note_max: number;
  duree_sec: number;
  details: any;
  themes_faibles: string[];
  themes_forts: string[];
  feedback_global: string | null;
  created_at: string;
}

export interface Blockage {
  id: number;
  child_id: string;
  exercise_id: string;
  declencheur: DeclencheurBlocage;
  strategie_appliquee: StrategieAide | null;
  resolu: boolean;
  duree_blocage_sec: number;
  created_at: string;
  resolu_at: string | null;
}

export interface Reward {
  id: number;
  child_id: string;
  type: 'badge' | 'palier' | 'chapitre_debloque';
  code: string;
  libelle: string;
  description: string | null;
  points_associes: number;
  date_obtention: string;
}

export interface ScoreMaison {
  child_id: string;
  maison: Maison;
  points: number;
}

export interface Session {
  id: number;
  child_id: string;
  debut_at: string;
  fin_at: string | null;
  duree_sec: number;
  jour_travaille: number | null;
  nb_exercices_tentes: number;
  nb_exercices_maitrises: number;
  device: string | null;
}

export interface Alert {
  id: number;
  child_id: string;
  parent_id: string | null;
  type: 'blocage_prolonge' | 'abandon' | 'pic_erreurs_theme' | 'objectif_atteint' | 'quiz_faible';
  severite: 'info' | 'attention' | 'urgent';
  message: string;
  metadata: any;
  lu: boolean;
  created_at: string;
}

// Réponse de validation (côté API)
export interface ValidationResult {
  correct: boolean;
  score_partiel?: number; // 0-1 pour réponses rédigées
  feedback?: string;
  points_gagnes: number;
  maitrise: boolean;
  nouvelle_strategie?: StrategieAide;
}
