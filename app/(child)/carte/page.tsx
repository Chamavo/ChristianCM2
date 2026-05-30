import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { cn } from '@/lib/utils';
import type { Progress } from '@/lib/types';

export const dynamic = 'force-dynamic';

const NB_EXOS_PAR_JOUR = 30;
const NB_JOURS_TOTAL = 15;

const SCENES: Record<
  number,
  { emoji: string; titre: string; lieu: string }
> = {
  1: { emoji: '🏠', titre: 'Privet Drive', lieu: 'La vie chez les Dursley' },
  2: { emoji: '🛒', titre: 'Chemin de Traverse', lieu: 'Les achats magiques' },
  3: { emoji: '🚂', titre: 'Poudlard Express', lieu: 'Le train de la voie 9¾' },
  4: { emoji: '🎩', titre: 'Choixpeau magique', lieu: 'La répartition' },
  5: { emoji: '🧪', titre: 'Cours de Potions', lieu: 'Les cachots de Rogue' },
  6: { emoji: '📜', titre: 'Bibliothèque', lieu: 'Les recherches secrètes' },
  7: { emoji: '🪶', titre: 'Sortilèges', lieu: 'Wingardium Leviosa' },
  8: { emoji: '🧹', titre: 'Match de Quidditch', lieu: 'Vif d\'or en vue' },
  9: { emoji: '🐉', titre: 'Norbert le dragon', lieu: 'Hagrid et son œuf' },
  10: { emoji: '🦉', titre: 'Volière', lieu: 'Hedwige et les lettres' },
  11: { emoji: '⚔️', titre: 'Duel de baguettes', lieu: 'Salle commune' },
  12: { emoji: '🪞', titre: 'Miroir du Riséd', lieu: 'Les désirs cachés' },
  13: { emoji: '🏆', titre: 'Coupe des 4 Maisons', lieu: 'Grande Salle' },
  14: { emoji: '👑', titre: 'Salle sur Demande', lieu: 'Le défi ultime' },
  15: { emoji: '⭐', titre: 'Diplôme de Sorcier', lieu: 'Cérémonie finale' },
};

export default async function CartePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

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

  let jourActuel = 1;
  for (let j = 1; j <= NB_JOURS_TOTAL; j++) {
    if ((reglesParJour.get(j) ?? 0) < NB_EXOS_PAR_JOUR) {
      jourActuel = j;
      break;
    }
    jourActuel = j;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="parchemin rounded-2xl p-5 border-2 border-amber-800/40 mb-6 text-center">
        <h1 className="text-amber-900 font-bold uppercase tracking-widest text-sm mb-1">
          <span aria-hidden="true">🗺</span> Carte du Maraudeur
        </h1>
        <p className="text-stone-700 italic text-sm">
          « Je jure solennellement que mes intentions sont mauvaises… »
        </p>
      </div>

      <ol className="space-y-3" aria-label="Progression des 15 jours">
        {Array.from({ length: NB_JOURS_TOTAL }, (_, i) => i + 1).map((j) => {
          const maitrises = maitrisesParJour.get(j) ?? 0;
          const termine = (reglesParJour.get(j) ?? 0) >= NB_EXOS_PAR_JOUR;
          const actuel = j === jourActuel && !termine;
          const verrouille = j > jourActuel;
          const scene = SCENES[j];
          const pct = Math.round((maitrises / NB_EXOS_PAR_JOUR) * 100);

          return (
            <li key={j}>
              <Link
                href={verrouille ? '#' : `/exercice/J${j}`}
                aria-disabled={verrouille}
                tabIndex={verrouille ? -1 : 0}
                className={cn(
                  'flex items-center gap-4 rounded-xl p-4 border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500',
                  termine && 'bg-green-900/30 border-green-500/50',
                  actuel &&
                    'bg-amber-900/40 border-amber-400 shadow-[0_0_24px_rgba(252,211,77,0.35)]',
                  verrouille &&
                    'bg-stone-800/60 border-stone-700 opacity-50 grayscale pointer-events-none',
                  !termine &&
                    !actuel &&
                    !verrouille &&
                    'bg-stone-800/40 border-amber-900/40'
                )}
              >
                <div
                  className={cn(
                    'w-16 h-16 rounded-full flex items-center justify-center text-3xl shrink-0',
                    termine
                      ? 'bg-green-700/60'
                      : actuel
                        ? 'bg-amber-600'
                        : 'bg-stone-700/70'
                  )}
                  aria-hidden="true"
                >
                  {verrouille ? '🔒' : scene?.emoji ?? '✨'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs uppercase tracking-wider opacity-70">
                    Jour {j}
                  </p>
                  <p className="font-bold text-amber-100 truncate">
                    {scene?.titre ?? `Jour ${j}`}
                  </p>
                  {scene?.lieu && (
                    <p className="text-xs text-amber-200/70 truncate italic">
                      {scene.lieu}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 bg-stone-800 rounded-full h-1.5">
                      <div
                        className={cn(
                          'h-1.5 rounded-full',
                          termine
                            ? 'bg-green-500'
                            : actuel
                              ? 'bg-amber-400'
                              : 'bg-stone-600'
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-amber-200/80">
                      {maitrises}/{NB_EXOS_PAR_JOUR}
                    </span>
                  </div>
                </div>
                {!verrouille && (
                  <span
                    className="text-amber-300 text-xl"
                    aria-hidden="true"
                  >
                    →
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
