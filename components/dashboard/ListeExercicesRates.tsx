import type { ExerciceRateRow } from '@/lib/types-dashboard';
import { formatDuree } from '@/lib/utils';

interface ListeExercicesRatesProps {
  rows: ExerciceRateRow[];
  /** Si vrai, on cache la colonne "enfant" (déjà ciblé) */
  compact?: boolean;
}

export function ListeExercicesRates({
  rows,
  compact = false,
}: ListeExercicesRatesProps) {
  if (rows.length === 0) {
    return (
      <p className="text-stone-400 text-sm py-6 text-center italic">
        Aucun exercice raté pour l&apos;instant. Bravo !
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-stone-500 text-xs uppercase border-b border-stone-200">
          <tr>
            <th className="text-left py-2 px-2">Jour</th>
            <th className="text-left py-2 px-2">Thème</th>
            <th className="text-left py-2 px-2">Énoncé</th>
            <th className="text-left py-2 px-2">Réponse enfant</th>
            <th className="text-left py-2 px-2">Bonne réponse</th>
            {!compact && <th className="text-left py-2 px-2">Durée</th>}
            {!compact && <th className="text-left py-2 px-2">Indices</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {rows.map((r) => (
            <tr key={`${r.exercise_id}-${r.created_at}`} className="hover:bg-stone-50">
              <td className="py-2 px-2 text-stone-700">J{r.jour}</td>
              <td className="py-2 px-2 text-stone-700">{r.theme}</td>
              <td className="py-2 px-2 text-stone-600 max-w-xs truncate" title={r.enonce}>
                {r.enonce}
              </td>
              <td className="py-2 px-2 text-red-600 font-medium">
                {r.reponse_donnee ?? <em className="text-stone-400">vide</em>}
              </td>
              <td className="py-2 px-2 text-green-600 font-medium">
                {r.reponse_correcte ?? '—'}
              </td>
              {!compact && (
                <td className="py-2 px-2 text-stone-500">
                  {r.duree_sec ? formatDuree(r.duree_sec) : '—'}
                </td>
              )}
              {!compact && (
                <td className="py-2 px-2 text-stone-500">
                  {r.nb_indices_utilises}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
