import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/server';
import { KPICards } from '@/components/dashboard/KPICards';
import { HeatmapHoraires } from '@/components/dashboard/HeatmapHoraires';
import { ListeExercicesRates } from '@/components/dashboard/ListeExercicesRates';
import { AlertesPanel } from '@/components/dashboard/AlertesPanel';
import { ThemesFaiblesForts } from '@/components/dashboard/ThemesFaiblesForts';
import type { Alert, Maison, QuizResult } from '@/lib/types';
import type {
  KpiEnfant,
  HeatmapCell,
  ThemeTaux,
  ExerciceRateRow,
} from '@/lib/types-dashboard';
import { FileDown, Clock, BarChart3, ClipboardList, AlertTriangle, FileText } from 'lucide-react';

// Recharts via dynamic import (évite les soucis SSR)
const ProgressionChart = dynamic(
  () => import('@/components/dashboard/ProgressionChart'),
  { ssr: false, loading: () => <div className="h-64 bg-stone-100 rounded animate-pulse" /> }
);

export const dynamicParams = true;
export const revalidate = 0;

const EMOJI_MAISON: Record<Maison, string> = {
  gryffondor: '🦁',
  serdaigle: '🦅',
  poufsouffle: '🦡',
  serpentard: '🐍',
};

interface PageProps {
  params: { id: string };
}

export default async function EnfantDetailPage({ params }: PageProps) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Récupère le profil enfant (RLS valide l'accès)
  const { data: enfant } = await supabase
    .from('profiles')
    .select('id, display_name, maison_choisie, date_inscription, parent_id, role')
    .eq('id', params.id)
    .single<{
      id: string;
      display_name: string | null;
      maison_choisie: Maison | null;
      date_inscription: string;
      parent_id: string | null;
      role: string;
    }>();

  if (!enfant || enfant.role !== 'child') notFound();

  // KPI
  const { data: kpiRow } = await supabase
    .from('v_kpi_enfant')
    .select('*')
    .eq('child_id', params.id)
    .maybeSingle<KpiEnfant>();

  const kpi: KpiEnfant = kpiRow ?? {
    child_id: params.id,
    display_name: enfant.display_name,
    maison_choisie: enfant.maison_choisie,
    exercices_maitrises: 0,
    exercices_tentes: 0,
    exercices_total: 0,
    points_totaux: 0,
    minutes_totales: 0,
    derniere_activite: null,
    note_moyenne_quiz: null,
    derniere_note_quiz: null,
    points_maison_total: 0,
    badges_count: 0,
    jour_courant: 1,
  };

  // Alertes non lues
  const { data: alertes } = await supabase
    .from('alerts')
    .select('*')
    .eq('child_id', params.id)
    .eq('lu', false)
    .order('severite', { ascending: true })
    .order('created_at', { ascending: false })
    .returns<Alert[]>();

  // Quiz résultats
  const { data: quizResults } = await supabase
    .from('quiz_results')
    .select('id, child_id, quiz_id, jour, note, note_max, duree_sec, details, themes_faibles, themes_forts, feedback_global, created_at')
    .eq('child_id', params.id)
    .order('jour', { ascending: true })
    .returns<QuizResult[]>();

  const progressionPoints =
    quizResults?.map((q) => ({
      jour: q.jour,
      note: Number(q.note),
      quiz_id: q.quiz_id,
    })) ?? [];

  // Heatmap
  const { data: heatmap } = await supabase
    .from('v_heatmap_horaires')
    .select('*')
    .eq('child_id', params.id)
    .returns<HeatmapCell[]>();

  // Thèmes
  const { data: themes } = await supabase
    .from('v_themes_taux_reussite')
    .select('*')
    .eq('child_id', params.id)
    .returns<ThemeTaux[]>();

  // 10 derniers exos ratés
  const { data: ratesRaw } = await supabase
    .from('v_exercices_rates_detail')
    .select('child_id, exercise_id, jour, theme, enonce, reponse_donnee, reponse_correcte, duree_sec, nb_indices_utilises, created_at')
    .eq('child_id', params.id)
    .order('created_at', { ascending: false })
    .limit(10)
    .returns<ExerciceRateRow[]>();

  const rates = ratesRaw ?? [];

  const jourDepuis = Math.floor(
    (Date.now() - new Date(enfant.date_inscription).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-6">
      {/* Header enfant */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 flex items-center gap-2 flex-wrap">
            <span aria-hidden="true">
              {enfant.maison_choisie ? EMOJI_MAISON[enfant.maison_choisie] : '👤'}
            </span>
            {enfant.display_name ?? 'Enfant'}{' '}
            <span className="text-stone-400 text-lg font-normal">
              · Suivi du parcours
            </span>
          </h2>
          <p className="text-stone-500 text-sm capitalize">
            Maison : {enfant.maison_choisie ?? '—'} · Démarré il y a{' '}
            {jourDepuis} jour{jourDepuis > 1 ? 's' : ''} · Jour{' '}
            {kpi.jour_courant}/15
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            disabled
            title="Bientôt disponible"
            className="bg-stone-200 hover:bg-stone-300 px-4 py-2 rounded text-sm inline-flex items-center gap-1 disabled:opacity-50"
          >
            <FileDown className="w-4 h-4" /> Exporter PDF
          </button>
        </div>
      </div>

      {/* Onglets/Nav rapide */}
      <nav className="flex flex-wrap gap-2 text-sm border-b border-stone-200" aria-label="Sections enfant">
        <Link
          href={`/enfants/${params.id}`}
          className="px-3 py-2 border-b-2 border-amber-600 text-amber-700 font-semibold inline-flex items-center gap-1"
        >
          <BarChart3 className="w-4 h-4" /> Vue d&apos;ensemble
        </Link>
        <Link
          href={`/enfants/${params.id}/exercices`}
          className="px-3 py-2 text-stone-600 hover:text-amber-700 inline-flex items-center gap-1"
        >
          <ClipboardList className="w-4 h-4" /> Exercices
        </Link>
        <Link
          href={`/enfants/${params.id}/temps`}
          className="px-3 py-2 text-stone-600 hover:text-amber-700 inline-flex items-center gap-1"
        >
          <Clock className="w-4 h-4" /> Temps
        </Link>
        <Link
          href={`/enfants/${params.id}/blocages`}
          className="px-3 py-2 text-stone-600 hover:text-amber-700 inline-flex items-center gap-1"
        >
          <AlertTriangle className="w-4 h-4" /> Blocages
        </Link>
        <Link
          href={`/enfants/${params.id}/quiz`}
          className="px-3 py-2 text-stone-600 hover:text-amber-700 inline-flex items-center gap-1"
        >
          Quiz
        </Link>
        <Link
          href={`/enfants/${params.id}/rapport`}
          className="px-3 py-2 text-stone-600 hover:text-amber-700 inline-flex items-center gap-1"
        >
          <FileText className="w-4 h-4" /> Rapport du jour
        </Link>
      </nav>

      {/* Alertes */}
      {alertes && alertes.length > 0 && <AlertesPanel alertes={alertes} />}

      {/* KPIs */}
      <KPICards kpi={kpi} />

      {/* Courbe quiz */}
      <section className="bg-white rounded-lg p-4 sm:p-6 border border-stone-200 shadow-sm">
        <h3 className="font-bold text-lg mb-4">Notes des quiz /20</h3>
        <ProgressionChart data={progressionPoints} />
      </section>

      {/* Heatmap */}
      <section className="bg-white rounded-lg p-4 sm:p-6 border border-stone-200 shadow-sm">
        <h3 className="font-bold text-lg mb-4">Horaires de connexion</h3>
        <HeatmapHoraires data={heatmap ?? []} />
      </section>

      {/* Exos ratés récents */}
      <section className="bg-white rounded-lg p-4 sm:p-6 border border-stone-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Exercices ratés récents</h3>
          <Link
            href={`/enfants/${params.id}/exercices`}
            className="text-amber-700 text-sm hover:underline"
          >
            Voir tout →
          </Link>
        </div>
        <ListeExercicesRates rows={rates} compact />
      </section>

      {/* Thèmes */}
      <ThemesFaiblesForts themes={themes ?? []} />
    </div>
  );
}
