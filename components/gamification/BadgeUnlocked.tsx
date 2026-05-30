'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface BadgeUnlockedProps {
  visible: boolean;
  emoji?: string;
  libelle: string;
  description?: string | null;
  onClose: () => void;
  autoCloseMs?: number;
}

export function BadgeUnlocked({
  visible,
  emoji = '🏆',
  libelle,
  description,
  onClose,
  autoCloseMs = 4500,
}: BadgeUnlockedProps) {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(onClose, autoCloseMs);
    return () => clearTimeout(t);
  }, [visible, autoCloseMs, onClose]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="badge-unlock"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          role="alertdialog"
          aria-labelledby="badge-titre"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            className="parchemin rounded-2xl p-8 max-w-xs text-center shadow-2xl border-4 border-amber-700/60"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-6xl mb-3" aria-hidden="true">
              {emoji}
            </div>
            <p className="text-amber-900 uppercase tracking-widest text-xs font-bold mb-2">
              Nouveau badge !
            </p>
            <h3
              id="badge-titre"
              className="text-2xl font-bold text-stone-800 mb-2"
            >
              {libelle}
            </h3>
            {description && (
              <p className="text-sm text-stone-600 italic">{description}</p>
            )}
            <button
              type="button"
              onClick={onClose}
              className="mt-5 btn-gryffondor"
              aria-label="Fermer le badge"
            >
              Continuer
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
