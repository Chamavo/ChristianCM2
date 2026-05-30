import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/server';
import type { Maison, Blockage, DeclencheurBlocage, StrategieAide } from '@/lib/types';
import { formatDuree } from '@/lib/utils';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

const BlocagesParThemeChart = dynamic(
  () => import('@/components/dashboard/BlocagesParThemeChart'),
  { ssr: false, loading: () => <div className="h-40 bg-stone-100 rounded animate-pulse" /> }
);

export const dynamicParams = true;
export const revalidate = 0;

const EMOJI_MAISON: Record<Maison, string> = {
  gryffondor: '🦁',
  serdaigle: '🦅',
  poufsouffle: '🦡',
  serpentard: '🐍',
};

const DECLENCHEURS_LABEL: Record<DeclencheurBlocage, string> = {
  '2_erreurs': '2 erreurs consécutives',
  temps_long: 'Temps trop long',
  aide_demandee: 'Aide demandée',
  echec_decomposition: 'Échec de la décomposition',
};

const STRATEGIES_LABEL: Record<StrategieAide, string> = {
  indice: 'Indice fourni',
  decomposition: 'Décomposition micro-étapes',
  reformulation: 'Reformulation',
  report: 'Reporté au lendemain',
};

export default async function BlocagesPage({ params }: { params: { id: string } }) {
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

  // Tous les blocages
  const { data: blocagesRaw } = await supabase
    .from('blockages')
    .select(
      `id, child_id, exercise_id, declencheur, strategie_appliquee, resolu,
       duree_blocage_sec, created_at, resolu_at,
       exercises!inner(theme, enonce)`
    )
    .eq('child_id', params.id)
    .order('created_at', { ascending: false });

  const blocages = (blocagesRaw ?? []) as Array<
    Blockage & { exercises: { theme: string; enonce: string } | { theme: string; enonce: string }[] }
  >;

  // Stats par thème
  const themeCount = new Map<string, number>();
  for (const b of blocages) {
    const ex = Array.isArray(b.exercises) ? b.exercises[0] : b.exercises;
    const theme = ex?.theme ?? 'inconnu';
    themeCount.set(theme, (themeCount.get(theme) ?? 0) + 1);
  }
  const themeChartData = Array.from(themeCount.entries())
    .map(([theme, count]) => ({ theme, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const totalBlocages = blocages.length;
  const resolus = blocages.filter((b) => b.resolu).length;
  const enCours = totalBlocages - resolus;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 flex items-center gap-2 flex-wrap">
          <span aria-hidden="true">
            {enfant.maison_choisie ? EMOJI_MAISON[enfant.maison_choisie] : '👤'}
          </span>
          {enfant.display_name} · Blocages
        </h2>
        <Link
          href={`/enfants/${params.id}`}
          className="text-amber-700 text-sm hover:underline"
        >
          ← Retour au tableau de bord
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-5 border border-stone-200 shadow-sm">
          <p className="text-stone-500 text-xs uppercase tracking-wider">
            Total blocages
          </p>
          <p className="text-3xl font-bold text-stone-900 mt-1">{totalBlocages}</p>
        </div>
        <div className="bg-white rounded-lg p-5 border border-stone-200 shadow-sm">
          <p className="text-stone-500 text-xs uppercase tracking-wider inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-green-500" /> Résolus
          </p>
          <p className="text-3xl font-bold text-green-700 mt-1">{resolus}</p>
        </div>
        <div className="bg-white rounded-lg p-5 border border-stone-200 shadow-sm">
          <p className="text-stone-500 text-xs uppercase tracking-wider inline-flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-red-500" /> En cours
          </p>
          <p className="text-3xl font-bold text-red-700 mt-1">{enCours}</p>
        </div>
      </div>

      {/* Chart par thème */}
      <section className="bg-white rounded-lg p-4 sm:p-6 border border-stone-200 shadow-sm">
        <h3 className="font-bold text-lg mb-4">Blocages par thème</h3>
        <BlocagesParThemeChart data={themeChartData} />
      </section>

      {/* Liste chronologique */}
      <section className="bg-white rounded-lg p-4 sm:p-6 border border-stone-200 shadow-sm">
        <h3 className="font-bold text-lg mb-4">Détail chronologique</h3>
        {blocages.length === 0 ? (
          <p className="text-stone-400 text-sm py-6 text-center italic">
            Aucun blocage enregistré — tout va bien !
          </p>
        ) : (
          <ul className="space-y-3">
            {blocages.map((b) => {
              const ex = Array.isArray(b.exercises) ? b.exercises[0] : b.exercises;
              return (
                <li
                  key={b.id}
                  className={`border-l-4 pl-4 py-3 ${
                    b.resolu ? 'border-green-400 bg-green-50/50' : 'border-red-500 bg-red-50/50'
                  } rounded-r`}
                >
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-stone-900">
                        {ex?.theme ?? 'Thème inconnu'} ·{' '}
                        <span className="text-stone-500 font-normal text-sm">
                          {b.exercise_id}
                        </span>
                      </p>
                      <p className="text-sm text-stone-600 truncate" title={ex?.enonce}>
                        {ex?.enonce ?? '—'}
                      </p>
                      <p className="text-xs text-stone-500 mt-1">
                        <strong>Déclencheur :</strong>{' '}
                        {DECLENCHEURS_LABEL[b.declencheur]} ·{' '}
                        <strong>Stratégie :</strong>{' '}
                        {b.strategie_appliquee
                          ? STRATEGIES_LABEL[b.strategie_appliquee]
                          : '—'}
                      </p>
                    </div>
                    <div className="text-right text-xs">
                      <p
                        className={`font-semibold ${b.resolu ? 'text-green-700' : 'text-red-700'}`}
                      >
                        {b.resolu ? 'Résolu' : 'En cours'}
                      </p>
                      <p className="text-stone-400">
                        {new Date(b.created_at).toLocaleString('fr-FR')}
                      </p>
                      {b.duree_blocage_sec && (
                        <p className="text-stone-500">
                          {formatDuree(b.duree_blocage_sec)}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
