'use client';

import { useEffect, useState } from 'react';
import { pad } from '@/lib/utils';

interface ChronoExerciceProps {
  /** Si fourni → mode compte à rebours (sec). Sinon → mode chrono croissant. */
  dureeMaxSec?: number;
  /** Démarrage en pause */
  pause?: boolean;
  /** Callback temps écoulé (cas compte à rebours) */
  onTempsEcoule?: () => void;
  /** Callback à chaque tick (sec courantes) */
  onTick?: (sec: number) => void;
  /** Seuil "temps long" (sec) — au-delà, le chrono passe en orange */
  seuilTempsLongSec?: number;
}

export function ChronoExercice({
  dureeMaxSec,
  pause = false,
  onTempsEcoule,
  onTick,
  seuilTempsLongSec,
}: ChronoExerciceProps) {
  const [sec, setSec] = useState(0);

  useEffect(() => {
    if (pause) return;
    const id = setInterval(() => {
      setSec((s) => {
        const next = s + 1;
        onTick?.(next);
        if (dureeMaxSec && next >= dureeMaxSec) {
          onTempsEcoule?.();
          clearInterval(id);
          return dureeMaxSec;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [pause, dureeMaxSec, onTempsEcoule, onTick]);

  const affiche = dureeMaxSec ? Math.max(0, dureeMaxSec - sec) : sec;
  const m = Math.floor(affiche / 60);
  const s = affiche % 60;

  const tempsLong = seuilTempsLongSec ? sec >= seuilTempsLongSec : false;
  const urgent = dureeMaxSec ? affiche <= 60 : false;

  return (
    <span
      className={
        urgent
          ? 'font-mono text-red-400 text-sm tabular-nums'
          : tempsLong
            ? 'font-mono text-orange-400 text-sm tabular-nums'
            : 'font-mono text-amber-300 text-sm tabular-nums'
      }
      role="timer"
      aria-label={
        dureeMaxSec
          ? `Temps restant ${m} minutes ${s} secondes`
          : `Temps écoulé ${m} minutes ${s} secondes`
      }
    >
      <span aria-hidden="true">⏱ </span>
      {pad(m)}:{pad(s)}
    </span>
  );
}
