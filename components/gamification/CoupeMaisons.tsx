'use client';

import { motion } from 'framer-motion';
import type { Maison } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ScoreInput {
  maison: Maison;
  points: number;
}

interface CoupeMaisonsProps {
  scores: ScoreInput[];
  maisonEnfant?: Maison | null;
  /** "barres" (par défaut) ou "sabliers" pour la version verticale */
  variante?: 'barres' | 'sabliers';
}

const META: Record<
  Maison,
  { libelle: string; emoji: string; barre: string; bg: string }
> = {
  gryffondor: {
    libelle: 'Gryffondor',
    emoji: '🦁',
    barre: 'bg-red-600',
    bg: 'from-red-700/40 to-red-900/40',
  },
  serdaigle: {
    libelle: 'Serdaigle',
    emoji: '🦅',
    barre: 'bg-blue-500',
    bg: 'from-blue-700/40 to-blue-900/40',
  },
  serpentard: {
    libelle: 'Serpentard',
    emoji: '🐍',
    barre: 'bg-green-600',
    bg: 'from-green-700/40 to-green-900/40',
  },
  poufsouffle: {
    libelle: 'Poufsouffle',
    emoji: '🦡',
    barre: 'bg-yellow-500',
    bg: 'from-yellow-600/40 to-yellow-800/40',
  },
};

const ORDRE: Maison[] = [
  'gryffondor',
  'serdaigle',
  'serpentard',
  'poufsouffle',
];

export function CoupeMaisons({
  scores,
  maisonEnfant,
  variante = 'barres',
}: CoupeMaisonsProps) {
  const dict = new Map<Maison, number>();
  for (const m of ORDRE) dict.set(m, 0);
  for (const s of scores) dict.set(s.maison, s.points);

  const max = Math.max(1, ...Array.from(dict.values()));

  if (variante === 'sabliers') {
    return (
      <div className="grid grid-cols-4 gap-2">
        {ORDRE.map((m) => {
          const points = dict.get(m) ?? 0;
          const hauteur = Math.max(8, (points / max) * 100);
          const meta = META[m];
          const estMienne = m === maisonEnfant;
          return (
            <div
              key={m}
              className={cn(
                'flex flex-col items-center rounded-lg p-2 bg-gradient-to-b border',
                meta.bg,
                estMienne
                  ? 'border-amber-400 ring-2 ring-amber-400/40'
                  : 'border-stone-700'
              )}
            >
              <span className="text-xl" aria-hidden="true">
                {meta.emoji}
              </span>
              <div className="relative h-28 w-3 mt-2 bg-stone-800/70 rounded-full overflow-hidden">
                <motion.div
                  className={cn('absolute bottom-0 left-0 right-0', meta.barre)}
                  initial={{ height: 0 }}
                  animate={{ height: `${hauteur}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
              <p className="text-xs font-bold mt-1 text-amber-100">{points}</p>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {ORDRE.map((m) => {
        const points = dict.get(m) ?? 0;
        const meta = META[m];
        const estMienne = m === maisonEnfant;
        const largeur = Math.max(2, (points / max) * 100);
        return (
          <div key={m}>
            <div className="flex justify-between text-xs mb-1">
              <span>
                <span aria-hidden="true">{meta.emoji}</span> {meta.libelle}
                {estMienne && (
                  <span className="text-amber-300"> (toi)</span>
                )}
              </span>
              <span className={cn(estMienne && 'font-bold text-amber-300')}>
                {points}
              </span>
            </div>
            <div className="bg-stone-800 rounded-full h-2 overflow-hidden">
              <motion.div
                className={cn('h-2 rounded-full', meta.barre)}
                initial={{ width: 0 }}
                animate={{ width: `${largeur}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
