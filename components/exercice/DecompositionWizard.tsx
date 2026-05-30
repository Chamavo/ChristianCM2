'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MicroEtape, Decomposition } from '@/lib/types';
import { ExerciceQcm } from './ExerciceQcm';
import { ExerciceNumerique } from './ExerciceNumerique';
import { ExerciceRedige } from './ExerciceRedige';
import { normaliserReponse } from '@/lib/utils';

interface DecompositionWizardProps {
  decomposition: Decomposition;
  onTerminee: (succes: boolean) => void;
  onAbandon?: () => void;
}

interface EtapeResult {
  etape_id: string;
  reponse: string;
  est_correcte: boolean;
}

function validerEtape(etape: MicroEtape, reponse: string): boolean {
  const ref =
    etape.reponse_correcte ??
    etape.reponse_attendue ??
    (etape.reponse !== undefined ? String(etape.reponse) : '');
  if (!ref && !etape.regex_validation) return false;

  if (etape.regex_validation) {
    try {
      return new RegExp(etape.regex_validation, 'i').test(reponse.trim());
    } catch {
      // regex invalide → fallback
    }
  }

  if (etape.type === 'numerique') {
    const num = parseFloat(reponse.replace(',', '.'));
    const cible = parseFloat(String(ref).replace(',', '.'));
    if (Number.isNaN(num) || Number.isNaN(cible)) return false;
    return Math.abs(num - cible) < 0.001;
  }

  return normaliserReponse(reponse) === normaliserReponse(String(ref));
}

export function DecompositionWizard({
  decomposition,
  onTerminee,
  onAbandon,
}: DecompositionWizardProps) {
  const etapes = decomposition.micro_etapes;
  const [indexEtape, setIndexEtape] = useState(0);
  const [reponseCourante, setReponseCourante] = useState('');
  const [feedbackEtape, setFeedbackEtape] = useState<
    null | 'correct' | 'incorrect'
  >(null);
  const [resultats, setResultats] = useState<EtapeResult[]>([]);

  const etape = etapes[indexEtape];
  const nbEtapes = etapes.length;
  const progression = useMemo(
    () => Math.round(((indexEtape + (feedbackEtape ? 1 : 0)) / nbEtapes) * 100),
    [indexEtape, feedbackEtape, nbEtapes]
  );

  if (!etape) {
    return null;
  }

  const valider = () => {
    if (!reponseCourante.trim()) return;
    const ok = validerEtape(etape, reponseCourante);
    setFeedbackEtape(ok ? 'correct' : 'incorrect');
    setResultats((r) => [
      ...r,
      {
        etape_id: etape.id,
        reponse: reponseCourante,
        est_correcte: ok,
      },
    ]);
  };

  const passerSuivant = () => {
    if (indexEtape + 1 >= nbEtapes) {
      // Wizard terminé → succès = toutes les étapes correctes
      const succes = [...resultats].every((r) => r.est_correcte);
      onTerminee(succes);
    } else {
      setIndexEtape((i) => i + 1);
      setReponseCourante('');
      setFeedbackEtape(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-stone-900/80 backdrop-blur rounded-2xl border-2 border-purple-500/60 p-5 shadow-xl"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-purple-200 font-bold uppercase tracking-widest text-sm">
          <span aria-hidden="true">🪄</span> Décomposition · Étape{' '}
          {indexEtape + 1}/{nbEtapes}
        </h3>
        {onAbandon && (
          <button
            type="button"
            onClick={onAbandon}
            className="text-xs text-stone-400 hover:text-amber-300 underline-offset-2 hover:underline"
            aria-label="Quitter la décomposition"
          >
            Quitter
          </button>
        )}
      </div>

      <div className="w-full bg-stone-700 rounded-full h-2 mb-4 overflow-hidden">
        <motion.div
          className="bg-gradient-to-r from-purple-500 to-amber-400 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progression}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={etape.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          <div className="bg-white text-stone-900 rounded-lg p-4 mb-4 border border-stone-200">
            <p className="text-xs uppercase tracking-wider text-purple-700 mb-2">
              Question
            </p>
            <p className="text-base leading-relaxed">{etape.enonce}</p>
          </div>

          {etape.type === 'qcm' && etape.choix && (
            <ExerciceQcm
              choix={etape.choix}
              selection={reponseCourante || null}
              onSelect={(id) => setReponseCourante(id)}
              desactive={feedbackEtape !== null}
            />
          )}

          {etape.type === 'numerique' && (
            <ExerciceNumerique
              valeur={reponseCourante}
              onChange={setReponseCourante}
              desactive={feedbackEtape !== null}
            />
          )}

          {(etape.type === 'redige_court' ||
            etape.type === 'redige_libre') && (
            <ExerciceRedige
              type={etape.type}
              valeur={reponseCourante}
              onChange={setReponseCourante}
              desactive={feedbackEtape !== null}
            />
          )}

          {feedbackEtape && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={
                feedbackEtape === 'correct'
                  ? 'mt-3 rounded-lg p-3 bg-green-100 border border-green-500 text-green-800 text-sm'
                  : 'mt-3 rounded-lg p-3 bg-red-100 border border-red-500 text-red-800 text-sm'
              }
              role="status"
            >
              {feedbackEtape === 'correct'
                ? '✓ Bien vu, étape réussie !'
                : '✗ Pas tout à fait. La bonne démarche te sera montrée à la suivante.'}
            </motion.div>
          )}

          <div className="mt-4">
            {feedbackEtape === null ? (
              <button
                type="button"
                onClick={valider}
                disabled={!reponseCourante.trim()}
                className="w-full btn-gryffondor disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Valider cette étape
              </button>
            ) : (
              <button
                type="button"
                onClick={passerSuivant}
                className="w-full btn-gryffondor"
                autoFocus
              >
                {indexEtape + 1 >= nbEtapes
                  ? 'Terminer la décomposition'
                  : 'Étape suivante →'}
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
