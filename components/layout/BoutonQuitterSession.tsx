'use client';

import { motion } from 'framer-motion';
import { signOutChild } from '@/app/(child)/actions';

/**
 * Bouton « Quitter » global (balai volant) : déconnecte l'apprenant.
 * Présent dans l'en-tête de TOUTES les pages élève.
 * La progression validée est déjà sauvegardée côté serveur : quitter est sûr.
 */
export function BoutonQuitterSession() {
  return (
    <form action={signOutChild}>
      <motion.button
        type="submit"
        aria-label="Quitter (ta progression est sauvegardée)"
        title="Quitter — ta progression est sauvegardée"
        whileHover={{ scale: 1.07, rotate: -8 }}
        whileTap={{ scale: 0.92, x: 6, rotate: 4 }}
        className="group inline-flex items-center gap-1.5 rounded-full bg-amber-800/50 hover:bg-amber-700/70 border border-amber-500/50 px-3 py-2 text-amber-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 shadow-lg"
      >
        <span
          className="text-xl leading-none transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          aria-hidden="true"
        >
          🧹
        </span>
        <span className="text-xs sm:text-sm font-bold uppercase tracking-wide">
          Quitter
        </span>
      </motion.button>
    </form>
  );
}
