// Types spécifiques au dashboard parent/admin.
// Reposent sur les vues SQL définies dans scripts/supabase-views-dashboard.sql.

import type { Maison } from './types';

export interface KpiEnfant {
  child_id: string;
  display_name: string | null;
  maison_choisie: Maison | null;
  exercices_maitrises: number;
  exercices_tentes: number;
  exercices_total: number;
  points_totaux: number;
  minutes_totales: number;
  derniere_activite: string | null;
  note_moyenne_quiz: number | null;
  derniere_note_quiz: number | null;
  points_maison_total: number;
  badges_count: number;
  jour_courant: number;
}

export interface HeatmapCell {
  child_id: string;
  jour_semaine: number; // 0=lundi ... 6=dimanche
  heure: number; // 0-23
  total_minutes: number;
}

export interface ThemeTaux {
  child_id: string;
  theme: string;
  total: number;
  reussis: number;
  taux_pct: number;
}

export interface ResumeJour {
  child_id: string;
  jour: number;
  nb_exos_total: number;
  nb_maitrises: number;
  nb_rates: number;
  pct_maitrise: number;
}

export interface ExerciceRateRow {
  child_id: string;
  exercise_id: string;
  jour: number;
  theme: string;
  enonce: string;
  reponse_donnee: string | null;
  reponse_correcte: string | null;
  duree_sec: number | null;
  nb_indices_utilises: number;
  created_at: string;
}

export type AlertSeverite = 'info' | 'attention' | 'urgent';
export type AlertType =
  | 'blocage_prolonge'
  | 'abandon'
  | 'pic_erreurs_theme'
  | 'objectif_atteint'
  | 'quiz_faible';
