'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface BoutonQuitterProps {
  /** Où retourner en quittant (défaut: accueil). */
  href?: string;
  /** Message de confirmation. Si absent, on quitte directement (travail déjà sauvegardé). */
  confirmMessage?: string;
  /** Libellé affiché à côté du balai. */
  label?: string;
  className?: string;
}

/**
 * Bouton « Quitter » en forme de balai volant.
 * Le travail validé est déjà sauvegardé côté serveur : quitter est sûr.
 * (Pour le quiz, on passe un confirmMessage car les réponses non soumises seraient perdues.)
 */
export function BoutonQuitter({
  href = '/accueil',
  confirmMessage,
  label = 'Quitter',
  className = '',
}: BoutonQuitterProps) {
  const router = useRouter();
  const [partir, setPartir] = useState(false);

  const quitter = () => {
    if (partir) return;
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    setPartir(true);
    router.push(href);
  };

  return (
    <motion.button
      type="button"
      onClick={quitter}
      disabled={partir}
      aria-busy={partir}
      aria-label={`${label} (ta progression est sauvegardée)`}
      title="Quitter — ta progression est sauvegardée"
      whileHover={partir ? undefined : { scale: 1.08, rotate: -8 }}
      whileTap={partir ? undefined : { scale: 0.92, x: 6, rotate: 4 }}
      className={`group inline-flex items-center gap-1.5 rounded-full bg-amber-900/40 hover:bg-amber-800/60 border border-amber-600/40 px-3 py-1.5 text-amber-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:cursor-wait ${className}`}
    >
      {partir ? (
        <span
          className="inline-block w-4 h-4 rounded-full border-2 border-amber-200/40 border-t-amber-100 animate-spin"
          aria-hidden="true"
        />
      ) : (
        <span
          className="text-xl leading-none transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          aria-hidden="true"
        >
          🧹
        </span>
      )}
      <span className="text-xs font-semibold uppercase tracking-wide">
        {partir ? 'Sortie…' : label}
      </span>
    </motion.button>
  );
}
