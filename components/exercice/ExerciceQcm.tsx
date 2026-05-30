'use client';

import type { Choix } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ExerciceQcmProps {
  choix: Choix[];
  selection: string | null;
  onSelect: (id: string) => void;
  desactive?: boolean;
  reponseCorrecte?: string;
  /** Si non-null on est en mode revue (post-validation) */
  modeRevue?: boolean;
}

const LETTRES = ['A', 'B', 'C', 'D', 'E', 'F'];

export function ExerciceQcm({
  choix,
  selection,
  onSelect,
  desactive = false,
  reponseCorrecte,
  modeRevue = false,
}: ExerciceQcmProps) {
  return (
    <div className="space-y-3" role="radiogroup" aria-label="Choix de réponse">
      {choix.map((c, idx) => {
        const lettre = LETTRES[idx] ?? String(idx + 1);
        const estSelectionne = selection === c.id;
        const estBonne = modeRevue && reponseCorrecte === c.id;
        const estMauvaise =
          modeRevue && estSelectionne && reponseCorrecte !== c.id;

        return (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={estSelectionne}
            disabled={desactive}
            onClick={() => onSelect(c.id)}
            className={cn(
              'choix-card w-full bg-white text-left rounded-lg p-4 border-2 flex items-center gap-3 transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500',
              'disabled:cursor-not-allowed',
              estSelectionne && !modeRevue
                ? 'border-amber-500 bg-amber-50 shadow-md'
                : 'border-stone-200',
              estBonne && 'border-green-500 bg-green-50',
              estMauvaise && 'border-red-500 bg-red-50',
              !modeRevue && !desactive && 'hover:border-amber-500'
            )}
          >
            <span
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0',
                estSelectionne && !modeRevue
                  ? 'bg-amber-500 text-white'
                  : estBonne
                    ? 'bg-green-500 text-white'
                    : estMauvaise
                      ? 'bg-red-500 text-white'
                      : 'bg-stone-100 text-stone-600'
              )}
              aria-hidden="true"
            >
              {lettre}
            </span>
            <span className="text-stone-800 flex-1">{c.texte}</span>
            {estBonne && (
              <span className="text-green-600 text-xl" aria-hidden="true">
                ✓
              </span>
            )}
            {estMauvaise && (
              <span className="text-red-600 text-xl" aria-hidden="true">
                ✗
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
