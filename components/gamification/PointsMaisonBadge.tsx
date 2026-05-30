'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { Maison } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PointsMaisonBadgeProps {
  points: number;
  maison?: Maison;
  visible: boolean;
}

const COULEUR: Record<Maison, string> = {
  gryffondor: 'from-red-700 to-amber-500',
  serdaigle: 'from-blue-700 to-blue-300',
  serpentard: 'from-green-700 to-emerald-400',
  poufsouffle: 'from-yellow-600 to-yellow-300',
};

export function PointsMaisonBadge({
  points,
  maison = 'gryffondor',
  visible,
}: PointsMaisonBadgeProps) {
  return (
    <AnimatePresence>
      {visible && points > 0 && (
        <motion.div
          key="points-badge"
          initial={{ opacity: 0, scale: 0.5, y: 0 }}
          animate={{ opacity: 1, scale: 1, y: -30 }}
          exit={{ opacity: 0, y: -60 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={cn(
            'pointer-events-none absolute left-1/2 -translate-x-1/2 z-50',
            'px-4 py-2 rounded-full bg-gradient-to-r shadow-xl text-white font-bold',
            COULEUR[maison]
          )}
          role="status"
          aria-live="polite"
        >
          +{points} pts <span aria-hidden="true">⚡</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
