'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import type { Indice } from '@/lib/types';

interface IndiceModalProps {
  ouvert: boolean;
  indices: Indice[];
  /** Combien d'indices déjà utilisés (0..indices.length) */
  nbUtilises: number;
  onConfirmerProchain: () => void;
  onFermer: () => void;
}

export function IndiceModal({
  ouvert,
  indices,
  nbUtilises,
  onConfirmerProchain,
  onFermer,
}: IndiceModalProps) {
  const prochainIndice =
    nbUtilises < indices.length ? indices[nbUtilises] : null;

  // Échap pour fermer
  useEffect(() => {
    if (!ouvert) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFermer();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [ouvert, onFermer]);

  return (
    <AnimatePresence>
      {ouvert && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-3"
          onClick={onFermer}
          role="dialog"
          aria-modal="true"
          aria-labelledby="indice-titre"
        >
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 220 }}
            onClick={(e) => e.stopPropagation()}
            className="parchemin rounded-2xl w-full max-w-md p-6 border-2 border-amber-700/50 shadow-2xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl" aria-hidden="true">
                💡
              </span>
              <h2
                id="indice-titre"
                className="text-amber-900 font-bold uppercase tracking-widest text-sm"
              >
                Indice {nbUtilises + 1}
                {indices.length > 0 && (
                  <span className="text-stone-600 font-normal">
                    {' '}
                    / {indices.length}
                  </span>
                )}
              </h2>
            </div>

            {/* Indices déjà révélés */}
            {nbUtilises > 0 && (
              <div className="mb-4 space-y-2">
                {indices.slice(0, nbUtilises).map((ind, i) => (
                  <div
                    key={i}
                    className="bg-amber-100/50 border border-amber-700/30 rounded-lg p-3"
                  >
                    <p className="text-xs uppercase tracking-wider text-amber-900/70 mb-1">
                      Indice {i + 1} (déjà utilisé)
                    </p>
                    <p className="text-sm text-stone-700">{ind.texte}</p>
                  </div>
                ))}
              </div>
            )}

            {prochainIndice ? (
              <>
                <div className="bg-amber-200/40 border-2 border-amber-700 rounded-lg p-4 mb-4">
                  <p className="text-xs uppercase tracking-wider text-amber-900 mb-2">
                    Prochain indice — coût{' '}
                    <span className="font-bold">
                      -{prochainIndice.cout_points} pt
                      {prochainIndice.cout_points > 1 ? 's' : ''}
                    </span>
                  </p>
                  <p className="text-stone-800 italic leading-relaxed">
                    L'indice apparaîtra dès que tu confirmes.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onFermer}
                    className="flex-1 bg-stone-300 hover:bg-stone-400 text-stone-800 font-semibold py-3 rounded-lg"
                  >
                    Plus tard
                  </button>
                  <button
                    type="button"
                    onClick={onConfirmerProchain}
                    className="flex-1 btn-gryffondor"
                    aria-label={`Utiliser l'indice ${nbUtilises + 1} pour ${prochainIndice.cout_points} points`}
                  >
                    Utiliser
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="bg-stone-200/60 border border-stone-400 rounded-lg p-4 mb-4">
                  <p className="text-stone-700 italic text-center">
                    Tu as déjà utilisé tous les indices disponibles.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onFermer}
                  className="w-full btn-gryffondor"
                >
                  Fermer
                </button>
              </>
            )}

            <p className="text-xs text-stone-600 mt-4 text-center italic">
              Astuce : utiliser au plus 1 indice te permet quand même de
              « maîtriser » l'exercice.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
