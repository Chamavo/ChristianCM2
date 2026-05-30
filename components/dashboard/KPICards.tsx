import { Clock, Target, ClipboardList, Trophy } from 'lucide-react';
import type { KpiEnfant } from '@/lib/types-dashboard';

function formatMinutes(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h} h ${m.toString().padStart(2, '0')}`;
}

interface KPICardsProps {
  kpi: KpiEnfant;
  badgesCount?: number;
}

export function KPICards({ kpi }: KPICardsProps) {
  const tempsCumule = formatMinutes(kpi.minutes_totales || 0);
  const tempsParJour =
    kpi.jour_courant > 0
      ? formatMinutes(Math.round((kpi.minutes_totales || 0) / Math.max(1, kpi.jour_courant)))
      : '—';

  const pctParcours =
    kpi.exercices_total > 0
      ? Math.round((kpi.exercices_maitrises * 100) / kpi.exercices_total)
      : 0;

  const moyenneQuiz =
    kpi.note_moyenne_quiz != null
      ? Number(kpi.note_moyenne_quiz).toFixed(1)
      : '—';

  const deltaQuiz =
    kpi.derniere_note_quiz != null && kpi.note_moyenne_quiz != null
      ? Number(kpi.derniere_note_quiz) - Number(kpi.note_moyenne_quiz)
      : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <article className="bg-white rounded-lg p-5 border border-stone-200 shadow-sm">
        <div className="flex items-start justify-between">
          <p className="text-stone-500 text-xs uppercase tracking-wider">
            Temps cumulé
          </p>
          <Clock className="w-4 h-4 text-stone-400" aria-hidden="true" />
        </div>
        <p className="text-3xl font-bold text-stone-900 mt-1">{tempsCumule}</p>
        <p className="text-xs text-green-600 mt-2">
          ≈ {tempsParJour} / jour de travail
        </p>
      </article>

      <article className="bg-white rounded-lg p-5 border border-stone-200 shadow-sm">
        <div className="flex items-start justify-between">
          <p className="text-stone-500 text-xs uppercase tracking-wider">
            Exercices maîtrisés
          </p>
          <Target className="w-4 h-4 text-stone-400" aria-hidden="true" />
        </div>
        <p className="text-3xl font-bold text-stone-900 mt-1">
          {kpi.exercices_maitrises}/{kpi.exercices_total || '—'}
        </p>
        <p className="text-xs text-stone-500 mt-2">
          {pctParcours} % du parcours total
        </p>
      </article>

      <article className="bg-white rounded-lg p-5 border border-stone-200 shadow-sm">
        <div className="flex items-start justify-between">
          <p className="text-stone-500 text-xs uppercase tracking-wider">
            Moyenne quiz /20
          </p>
          <ClipboardList className="w-4 h-4 text-stone-400" aria-hidden="true" />
        </div>
        <p className="text-3xl font-bold text-stone-900 mt-1">{moyenneQuiz}</p>
        {deltaQuiz != null ? (
          <p
            className={`text-xs mt-2 ${
              deltaQuiz < 0 ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {deltaQuiz >= 0 ? '↑ +' : '↓ '}
            {deltaQuiz.toFixed(1)} vs moyenne
          </p>
        ) : (
          <p className="text-xs text-stone-400 mt-2">Aucun quiz encore</p>
        )}
      </article>

      <article className="bg-white rounded-lg p-5 border border-stone-200 shadow-sm">
        <div className="flex items-start justify-between">
          <p className="text-stone-500 text-xs uppercase tracking-wider">
            Points maison
          </p>
          <Trophy className="w-4 h-4 text-amber-600" aria-hidden="true" />
        </div>
        <p className="text-3xl font-bold text-amber-700 mt-1">
          {kpi.points_maison_total}
        </p>
        <p className="text-xs text-stone-500 mt-2">
          {kpi.badges_count} badge{kpi.badges_count > 1 ? 's' : ''} débloqué
          {kpi.badges_count > 1 ? 's' : ''}
        </p>
      </article>
    </div>
  );
}
