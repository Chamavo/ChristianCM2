import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CoupeMaisons } from '@/components/gamification/CoupeMaisons';
import type {
  Profile,
  Progress,
  ScoreMaison,
  Reward,
  Maison,
} from '@/lib/types';
import { cn, formatDuree } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const SCENES_PAR_JOUR: Record<number, string> = {
  1: '🏠',
  2: '🛒',
  3: '🚂',
  4: '🎩',
  5: '🧪',
  6: '📜',
  7: '🪶',
  8: '🧹',
  9: '🐉',
  10: '🦉',
  11: '⚔️',
  12: '🪞',
  13: '🏆',
  14: '👑',
  15: '⭐',
};

const NB_EXOS_PAR_JOUR = 30;
const NB_JOURS_TOTAL = 15;

export default async function AccueilEnfantPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>();
  if (!profile) redirect('/login');

  // Progress agrégée par jour
  const { data: progressRows } = await supabase
    .from('progress')
    .select('exercise_id, statut, exercises!inner(jour)')
    .eq('child_id', user.id)
    .returns<(Progress & { exercises: { jour: number } })[]>();

  const maitrisesParJour = new Map<number, number>();
  // « Réglés » = maîtrisés OU passés définitivement ('reporte') : sert au déblocage.
  const reglesParJour = new Map<number, number>();
  if (progressRows) {
    for (const row of progressRows) {
      const j = row.exercises.jour;
      if (row.statut === 'maitrise') {
        maitrisesParJour.set(j, (maitrisesParJour.get(j) ?? 0) + 1);
      }
      if (row.statut === 'maitrise' || row.statut === 'reporte') {
        reglesParJour.set(j, (reglesParJour.get(j) ?? 0) + 1);
      }
    }
  }

  // Détermine le jour actuel = premier jour non entièrement réglé
  let jourActuel = 1;
  for (let j = 1; j <= NB_JOURS_TOTAL; j++) {
    if ((reglesParJour.get(j) ?? 0) < NB_EXOS_PAR_JOUR) {
      jourActuel = j;
      break;
    }
    jourActuel = j;
  }
  const ordreEnCours = (maitrisesParJour.get(jourActuel) ?? 0) + 1;

  // Scores maisons (toutes les maisons cumulées chez tous les enfants ? ici on s'en tient à ce qu'a l'enfant)
  const { data: scoresRows } = await supabase
    .from('scores_maison')
    .select('maison, points')
    .eq('child_id', user.id)
    .returns<ScoreMaison[]>();
  const scores = scoresRows ?? [];

  // Derniers badges (rewards)
  const { data: rewards } = await supabase
    .from('rewards')
    .select('*')
    .eq('child_id', user.id)
    .order('date_obtention', { ascending: false })
    .limit(6)
    .returns<Reward[]>();

  // Session précédente (durée)
  const { data: sessionPrec } = await supabase
    .from('sessions')
    .select('duree_sec, jour_travaille, nb_exercices_maitrises')
    .eq('child_id', user.id)
    .order('debut_at', { ascending: false })
    .limit(1)
    .maybeSingle<{
      duree_sec: number;
      jour_travaille: number | null;
      nb_exercices_maitrises: number;
    }>();

  // Quiz dispo si jour actuel pair
  const quizDispo = jourActuel % 2 === 0;

  const maison: Maison = profile.maison_choisie ?? 'gryffondor';
  const messageDumbledore =
    'Bienvenue à Poudlard. Aujourd\'hui, de nouveaux défis t\'attendent. Concentre-toi, et la magie des nombres t\'ouvrira ses portes.';

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      {/* MESSAGE DUMBLEDORE */}
      <div className="bg-gradient-to-br from-amber-900/40 to-stone-900/40 backdrop-blur rounded-2xl p-5 border border-amber-700/30 mb-6">
        <div className="flex items-start gap-3">
          <span className="text-3xl" aria-hidden="true">
            🧙‍♂️
          </span>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wider text-amber-300 mb-1">
              Dumbledore
            </p>
            <p className="text-sm leading-relaxed italic">
              « {messageDumbledore} »
            </p>
          </div>
        </div>
      </div>

      {/* REPRENDRE */}
      <Link
        href={`/exercice/next`}
        className="block w-full bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-white font-bold py-4 rounded-xl text-lg shadow-lg mb-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900"
        style={{
          boxShadow: '0 0 30px rgba(252,211,77,0.4)',
        }}
        aria-label={`Reprendre le jour ${jourActuel}, exercice ${ordreEnCours}`}
      >
        <div className="flex items-center justify-center gap-3">
          <span aria-hidden="true">⚡</span>
          <div className="text-left">
            <div className="text-xs font-normal opacity-90">
              Reprendre — Jour {jourActuel}
            </div>
            <div>
              Exercice {ordreEnCours}/{NB_EXOS_PAR_JOUR}
            </div>
          </div>
          <span aria-hidden="true">→</span>
        </div>
      </Link>
      {sessionPrec && (
        <p className="text-center text-xs text-amber-200/60 mb-6">
          Hier tu as travaillé {formatDuree(sessionPrec.duree_sec)}
          {sessionPrec.jour_travaille
            ? ` · Maîtrise ${sessionPrec.nb_exercices_maitrises}/${NB_EXOS_PAR_JOUR} du J${sessionPrec.jour_travaille}`
            : ''}
        </p>
      )}
      {!sessionPrec && <div className="mb-6" />}

      {/* QUIZ DU JOUR */}
      {quizDispo && (
        <div className="bg-purple-900/30 border border-purple-500/40 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-purple-300">
                Aujourd'hui = jour pair
              </p>
              <p className="font-bold text-purple-100">
                Quiz J{jourActuel} disponible
              </p>
              <p className="text-xs text-purple-200/70">
                3 problèmes · 45 min · Note /20
              </p>
            </div>
            <Link
              href={`/quiz/J${jourActuel}`}
              className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg text-sm font-bold shrink-0"
            >
              Lancer
            </Link>
          </div>
        </div>
      )}

      {/* CARTE DES JOURS */}
      <h2 className="text-xs uppercase tracking-wider text-amber-300/70 mb-3 px-1">
        Carte du Maraudeur · 15 jours
      </h2>
      <div className="grid grid-cols-3 gap-3 mb-8">
        {Array.from({ length: NB_JOURS_TOTAL }, (_, i) => i + 1).map((j) => {
          const maitrises = maitrisesParJour.get(j) ?? 0;
          const termine = (reglesParJour.get(j) ?? 0) >= NB_EXOS_PAR_JOUR;
          const actuel = j === jourActuel && !termine;
          const verrouille = j > jourActuel;
          const emoji = verrouille ? '🔒' : (SCENES_PAR_JOUR[j] ?? '✨');
          return (
            <Link
              key={j}
              href={verrouille ? '#' : `/exercice/J${j}`}
              aria-disabled={verrouille}
              tabIndex={verrouille ? -1 : 0}
              aria-label={
                verrouille
                  ? `Jour ${j} verrouillé`
                  : termine
                    ? `Jour ${j} terminé`
                    : `Jour ${j}, ${maitrises} sur ${NB_EXOS_PAR_JOUR}`
              }
              className={cn(
                'carte-jour rounded-lg p-3 text-center transition-all',
                termine && 'bg-green-900/40 border border-green-500/50',
                actuel &&
                  'bg-amber-700/50 border-2 border-amber-400 shadow-[0_0_20px_rgba(252,211,77,0.4)]',
                verrouille &&
                  'bg-stone-800 border border-stone-700 opacity-50 grayscale pointer-events-none',
                !termine &&
                  !actuel &&
                  !verrouille &&
                  'bg-stone-800/60 border border-amber-700/40'
              )}
            >
              <div className="text-2xl mb-1" aria-hidden="true">
                {emoji}
              </div>
              <p
                className={cn(
                  'text-xs uppercase',
                  actuel ? 'font-bold' : 'opacity-70'
                )}
              >
                Jour {j}
              </p>
              {termine && (
                <p className="text-xs text-green-300">
                  ✓ {maitrises}/{NB_EXOS_PAR_JOUR}
                </p>
              )}
              {actuel && (
                <p className="text-xs text-amber-200">
                  {maitrises}/{NB_EXOS_PAR_JOUR}
                </p>
              )}
            </Link>
          );
        })}
      </div>

      {/* COUPE DES MAISONS */}
      <h2 className="text-xs uppercase tracking-wider text-amber-300/70 mb-3 px-1">
        Coupe des 4 Maisons
      </h2>
      <div className="bg-stone-900/60 rounded-xl p-4 mb-6 border border-amber-900/30">
        <CoupeMaisons scores={scores} maisonEnfant={maison} />
      </div>

      {/* BADGES RÉCENTS */}
      <h2 className="text-xs uppercase tracking-wider text-amber-300/70 mb-3 px-1">
        Derniers exploits
      </h2>
      {rewards && rewards.length > 0 ? (
        <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4">
          {rewards.map((r) => (
            <div
              key={r.id}
              className="bg-stone-900/70 border border-amber-700/30 rounded-lg p-3 min-w-[110px] text-center shrink-0"
            >
              <div className="text-3xl" aria-hidden="true">
                {r.type === 'badge'
                  ? '🏆'
                  : r.type === 'palier'
                    ? '⭐'
                    : '📖'}
              </div>
              <p className="text-xs mt-1 leading-tight">{r.libelle}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-amber-200/60 italic">
          Tu n'as pas encore débloqué de badge. Continue, ils arrivent !
        </p>
      )}
    </div>
  );
}
