'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FeedbackPanelProps {
  estCorrecte: boolean;
  pointsGagnes: number;
  maitrise: boolean;
  explication?: string;
  feedbackClaude?: string | null;
  onSuivant: () => void;
  onReessayer?: () => void;
  /** Affiché si l'enfant a échoué 2 fois ou plus → suggestion décomposition */
  proposerDecomposition?: boolean;
  onDecomposer?: () => void;
}

export function FeedbackPanel({
  estCorrecte,
  pointsGagnes,
  maitrise,
  explication,
  feedbackClaude,
  onSuivant,
  onReessayer,
  proposerDecomposition = false,
  onDecomposer,
}: FeedbackPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn(
        'rounded-2xl p-5 border-2 shadow-xl',
        estCorrecte
          ? 'bg-gradient-to-br from-green-100 to-emerald-50 border-green-500'
          : 'bg-gradient-to-br from-red-100 to-rose-50 border-red-500'
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 mb-3">
        <motion.span
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 16 }}
          className="text-4xl"
          aria-hidden="true"
        >
          {estCorrecte ? (maitrise ? '✨' : '✓') : '✗'}
        </motion.span>
        <div className="flex-1">
          <p
            className={cn(
              'font-bold text-lg',
              estCorrecte ? 'text-green-800' : 'text-red-800'
            )}
          >
            {estCorrecte
              ? maitrise
                ? 'Maîtrisé, bravo !'
                : 'Bonne réponse !'
              : 'Pas tout à fait…'}
          </p>
          {estCorrecte && pointsGagnes > 0 && (
            <motion.p
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-amber-700 font-bold"
            >
              +{pointsGagnes} point{pointsGagnes > 1 ? 's' : ''} pour ta maison{' '}
              <span aria-hidden="true">⚡</span>
            </motion.p>
          )}
        </div>
      </div>

      {explication && (
        <div className="bg-white/70 rounded-lg p-3 mb-3 border border-stone-200">
          <p className="text-xs uppercase tracking-wider text-stone-500 mb-1">
            Explication
          </p>
          <p className="text-stone-800 text-sm leading-relaxed">
            {explication}
          </p>
        </div>
      )}

      {feedbackClaude && (
        <div className="bg-amber-50 rounded-lg p-3 mb-3 border border-amber-200">
          <p className="text-xs uppercase tracking-wider text-amber-700 mb-1">
            <span aria-hidden="true">🦉</span> Conseil du Choixpeau
          </p>
          <p className="text-stone-800 text-sm italic leading-relaxed">
            {feedbackClaude}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2 mt-4">
        {estCorrecte ? (
          <button
            type="button"
            onClick={onSuivant}
            className="w-full btn-gryffondor"
            autoFocus
          >
            Exercice suivant →
          </button>
        ) : (
          <>
            {proposerDecomposition && onDecomposer && (
              <button
                type="button"
                onClick={onDecomposer}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg shadow-md"
              >
                <span aria-hidden="true">🪄</span> Décomposer en étapes
              </button>
            )}
            {onReessayer && (
              <button
                type="button"
                onClick={onReessayer}
                className="w-full bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold py-3 rounded-lg"
                autoFocus
              >
                Réessayer
              </button>
            )}
            <button
              type="button"
              onClick={onSuivant}
              className="w-full text-stone-600 text-sm underline-offset-2 hover:underline py-2"
            >
              Passer à l'exercice suivant
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}
