import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Maison } from '@/lib/types';
import type { ExerciceRateRow } from '@/lib/types-dashboard';
import { formatDuree } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { id: string };
  searchParams: {
    jour?: string;
    theme?: string;
    statut?: string;
    page?: string;
  };
}

const PAGE_SIZE = 50;

const EMOJI_MAISON: Record<Maison, string> = {
  gryffondor: '🦁',
  serdaigle: '🦅',
  poufsouffle: '🦡',
  serpentard: '🐍',
};

function statutColor(s: string): string {
  switch (s) {
    case 'maitrise':
      return 'bg-green-100 text-green-700';
    case 'en_cours':
      return 'bg-blue-100 text-blue-700';
    case 'bloque':
      return 'bg-red-100 text-red-700';
    case 'reporte':
      return 'bg-amber-100 text-amber-700';
    default:
      return 'bg-stone-100 text-stone-600';
  }
}

export default async function ExercicesPage({ params, searchParams }: PageProps) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: enfant } = await supabase
    .from('profiles')
    .select('id, display_name, maison_choisie, role')
    .eq('id', params.id)
    .single<{
      id: string;
      display_name: string | null;
      maison_choisie: Maison | null;
      role: string;
    }>();
  if (!enfant || enfant.role !== 'child') notFound();

  const page = Math.max(1, Number(searchParams.page) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const jourFilter = searchParams.jour ? Number(searchParams.jour) : undefined;
  const themeFilter = searchParams.theme;
  const statutFilter = searchParams.statut;

  // Récupère les attempts joints aux exercises pour avoir énoncé/thème
  let query = supabase
    .from('attempts')
    .select(
      `id, child_id, exercise_id, jour, reponse_donnee, est_correcte, duree_sec,
       nb_indices_utilises, created_at,
       exercises!inner(theme, enonce, reponse_correcte, reponse_attendue_redige)`,
      { count: 'exact' }
    )
    .eq('child_id', params.id);

  if (jourFilter && jourFilter >= 1 && jourFilter <= 15) {
    query = query.eq('jour', jourFilter);
  }
  if (themeFilter) {
    query = query.eq('exercises.theme', themeFilter);
  }
  if (statutFilter === 'rate') query = query.eq('est_correcte', false);
  if (statutFilter === 'maitrise') query = query.eq('maitrise', true);

  const { data: attempts, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  // Liste des thèmes pour le filtre
  const { data: themesData } = await supabase
    .from('v_themes_taux_reussite')
    .select('theme')
    .eq('child_id', params.id);
  const themesList = Array.from(
    new Set((themesData ?? []).map((t: { theme: string }) => t.theme))
  ).sort();

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 flex items-center gap-2 flex-wrap">
          <span aria-hidden="true">
            {enfant.maison_choisie ? EMOJI_MAISON[enfant.maison_choisie] : '👤'}
          </span>
          {enfant.display_name} · Exercices
        </h2>
        <p className="text-stone-500 text-sm">
          {total} tentative{total > 1 ? 's' : ''} enregistrée
          {total > 1 ? 's' : ''}
        </p>
        <Link
          href={`/enfants/${params.id}`}
          className="text-amber-700 text-sm hover:underline"
        >
          ← Retour au tableau de bord
        </Link>
      </div>

      {/* Filtres */}
      <form
        method="get"
        className="bg-white rounded-lg p-4 border border-stone-200 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
      >
        <div>
          <label htmlFor="f-jour" className="block text-xs font-medium text-stone-600 mb-1">
            Jour
          </label>
          <select
            id="f-jour"
            name="jour"
            defaultValue={searchParams.jour ?? ''}
            className="w-full border border-stone-300 rounded px-2 py-1 text-sm"
          >
            <option value="">Tous</option>
            {Array.from({ length: 15 }, (_, i) => i + 1).map((j) => (
              <option key={j} value={j}>
                J{j}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-theme" className="block text-xs font-medium text-stone-600 mb-1">
            Thème
          </label>
          <select
            id="f-theme"
            name="theme"
            defaultValue={searchParams.theme ?? ''}
            className="w-full border border-stone-300 rounded px-2 py-1 text-sm"
          >
            <option value="">Tous</option>
            {themesList.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-statut" className="block text-xs font-medium text-stone-600 mb-1">
            Statut
          </label>
          <select
            id="f-statut"
            name="statut"
            defaultValue={searchParams.statut ?? ''}
            className="w-full border border-stone-300 rounded px-2 py-1 text-sm"
          >
            <option value="">Toutes les tentatives</option>
            <option value="rate">Ratées</option>
            <option value="maitrise">Maîtrisées</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded text-sm font-semibold"
        >
          Filtrer
        </button>
      </form>

      {/* Tableau */}
      <div className="bg-white rounded-lg border border-stone-200 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-stone-500 text-xs uppercase border-b border-stone-200 bg-stone-50">
            <tr>
              <th className="text-left py-2 px-3">Jour</th>
              <th className="text-left py-2 px-3">Thème</th>
              <th className="text-left py-2 px-3">Énoncé</th>
              <th className="text-left py-2 px-3">Réponse</th>
              <th className="text-left py-2 px-3">Bonne réponse</th>
              <th className="text-left py-2 px-3">Statut</th>
              <th className="text-left py-2 px-3">Durée</th>
              <th className="text-left py-2 px-3">Indices</th>
              <th className="text-left py-2 px-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {(attempts ?? []).length === 0 && (
              <tr>
                <td colSpan={9} className="text-center text-stone-400 py-8 italic">
                  Aucun exercice ne correspond aux filtres.
                </td>
              </tr>
            )}
            {(attempts ?? []).map((a: any) => {
              const ex = Array.isArray(a.exercises) ? a.exercises[0] : a.exercises;
              const statut = a.est_correcte ? 'maitrise' : 'bloque';
              return (
                <tr key={a.id} className="hover:bg-stone-50">
                  <td className="py-2 px-3 text-stone-700">J{a.jour}</td>
                  <td className="py-2 px-3 text-stone-700">{ex?.theme ?? '—'}</td>
                  <td className="py-2 px-3 text-stone-600 max-w-xs truncate" title={ex?.enonce}>
                    {ex?.enonce ?? a.exercise_id}
                  </td>
                  <td
                    className={`py-2 px-3 font-medium ${a.est_correcte ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {a.reponse_donnee ?? <em className="text-stone-400">vide</em>}
                  </td>
                  <td className="py-2 px-3 text-green-700">
                    {ex?.reponse_correcte ?? ex?.reponse_attendue_redige ?? '—'}
                  </td>
                  <td className="py-2 px-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${statutColor(statut)}`}>
                      {statut === 'maitrise' ? 'OK' : 'Raté'}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-stone-500">
                    {a.duree_sec ? formatDuree(a.duree_sec) : '—'}
                  </td>
                  <td className="py-2 px-3 text-stone-500">{a.nb_indices_utilises}</td>
                  <td className="py-2 px-3 text-stone-400 text-xs">
                    {new Date(a.created_at).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-stone-500">
            Page {page} / {totalPages} ({total} résultats)
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={{
                  pathname: `/enfants/${params.id}/exercices`,
                  query: { ...searchParams, page: page - 1 },
                }}
                className="px-3 py-1 border border-stone-300 rounded hover:bg-stone-100"
              >
                ← Préc.
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={{
                  pathname: `/enfants/${params.id}/exercices`,
                  query: { ...searchParams, page: page + 1 },
                }}
                className="px-3 py-1 border border-stone-300 rounded hover:bg-stone-100"
              >
                Suiv. →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
