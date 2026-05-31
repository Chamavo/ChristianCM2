'use client';

import { useEffect, useRef } from 'react';

interface DetecteurFocusProps {
  exerciseId?: string;
  jour?: number;
}

/**
 * Détecteur anti-triche : enregistre les sorties d'onglet/fenêtre pendant
 * un exercice (l'apprenant pourrait aller chercher la réponse ailleurs).
 *
 * - `visibilitychange` → onglet caché / fenêtre minimisée
 * - `blur` window → focus parti (autre app, autre fenêtre)
 *
 * On mesure la durée d'absence et on POST une ligne à `/api/triche` au retour
 * (uniquement si l'absence dépasse ~2 s, pour éviter le bruit).
 */
export function DetecteurFocus({ exerciseId, jour }: DetecteurFocusProps) {
  const partAt = useRef<number | null>(null);
  const typeRef = useRef<'blur' | 'hidden'>('blur');

  useEffect(() => {
    const SEUIL_MS = 2000;

    const envoyer = (type: 'blur' | 'hidden', dureeMs: number) => {
      const payload = JSON.stringify({
        exercise_id: exerciseId,
        jour,
        type,
        duree_absence_sec: Math.round(dureeMs / 1000),
      });
      // sendBeacon survit à un changement de page ; fallback fetch keepalive
      try {
        const blob = new Blob([payload], { type: 'application/json' });
        if (!navigator.sendBeacon('/api/triche', blob)) {
          fetch('/api/triche', { method: 'POST', body: payload, keepalive: true });
        }
      } catch {
        /* on n'interrompt jamais l'apprenant pour du tracking */
      }
    };

    const partir = (type: 'blur' | 'hidden') => {
      if (partAt.current === null) {
        partAt.current = Date.now();
        typeRef.current = type;
      }
    };
    const revenir = () => {
      if (partAt.current !== null) {
        const dureeMs = Date.now() - partAt.current;
        partAt.current = null;
        if (dureeMs >= SEUIL_MS) envoyer(typeRef.current, dureeMs);
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') partir('hidden');
      else revenir();
    };
    const onBlur = () => partir('blur');
    const onFocus = () => revenir();

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
    };
  }, [exerciseId, jour]);

  return null;
}
