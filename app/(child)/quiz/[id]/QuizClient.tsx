'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import type { Quiz, Exercise } from '@/lib/types';
import { ChronoExercice } from '@/components/exercice/ChronoExercice';
import { ExerciceQcm } from '@/components/exercice/ExerciceQcm';
import { ExerciceNumerique } from '@/components/exercice/ExerciceNumerique';
import { ExerciceRedige } from '@/components/exercice/ExerciceRedige';
import { BoutonQuitter } from '@/components/layout/BoutonQuitter';
import { cn } from '@/lib/utils';

interface QuizClientProps {
  quiz: Quiz;
  exercises: Exercise[];
}

export function QuizClient({ quiz, exercises }: QuizClientProps) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [reponses, setReponses] = useState<Record<string, string>>({});
  const [enCoursEnvoi, setEnCoursEnvoi] = useState(false);
  const [resultat, setResultat] = useState<null | {
    note: number;
    note_max: number;
    feedback_global?: string;
  }>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const exo = exercises[index];
  const total = exercises.length;
  const dureeSec = (quiz.duree_min ?? 45) * 60;
  const aRepondu = !!reponses[exo?.id ?? ''];
  const reponseExo = reponses[exo?.id ?? ''] ?? '';
  const tousRepondus = exercises.every((e) => reponses[e.id]);

  const setReponse = useCallback(
    (v: string) => {
      if (!exo) return;
      setReponses((r) => ({ ...r, [exo.id]: v }));
    },
    [exo]
  );

  const envoyer = useCallback(async () => {
    if (enCoursEnvoi) return;
    setEnCoursEnvoi(true);
    setErreur(null);
    try {
      const res = await fetch(`/api/quiz/${quiz.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reponses }),
      });
      if (!res.ok) throw new Error('submit-fail');
      const data = (await res.json()) as {
        note: number;
        note_max: number;
        feedback_global?: string;
      };
      setResultat(data);
    } catch {
      setErreur(
        'Impossible d\'envoyer le quiz. Vérifie ta connexion et réessaie.'
      );
    } finally {
      setEnCoursEnvoi(false);
    }
  }, [enCoursEnvoi, quiz.id, reponses]);

  const onTempsEcoule = useCallback(() => {
    // Auto-submit
    envoyer();
  }, [envoyer]);

  const navigation = useMemo(
    () => (
      <div className="grid grid-cols-6 sm:grid-cols-10 gap-2 mb-3">
        {exercises.map((e, i) => {
          const fait = !!reponses[e.id];
          const actif = i === index;
          return (
            <button
              key={e.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-current={actif ? 'step' : undefined}
              aria-label={`Question ${i + 1}${fait ? ' (répondue)' : ''}`}
              className={cn(
                'h-8 rounded text-xs font-bold transition-all',
                actif
                  ? 'bg-amber-400 text-stone-900 ring-2 ring-amber-300'
                  : fait
                    ? 'bg-green-700/70 text-white'
                    : 'bg-stone-700 text-stone-300 hover:bg-stone-600'
              )}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    ),
    [exercises, reponses, index]
  );

  if (resultat) {
    const pct = Math.round((resultat.note / resultat.note_max) * 100);
    return (
      <div className="max-w-md mx-auto px-4 py-10">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="parchemin rounded-2xl p-6 text-center shadow-2xl border-2 border-amber-700/50"
        >
          <div className="text-5xl mb-3" aria-hidden="true">
            🏆
          </div>
          <h2 className="text-amber-900 font-bold uppercase tracking-widest text-sm mb-2">
            Quiz terminé
          </h2>
          <p className="text-5xl font-bold text-stone-800 mb-1">
            {resultat.note.toFixed(1)}
            <span className="text-stone-500 text-2xl">
              {' '}
              / {resultat.note_max}
            </span>
          </p>
          <p className="text-stone-700 mb-4">{pct} % de réussite</p>
          {resultat.feedback_global && (
            <p className="text-sm italic text-stone-700 mb-4">
              {resultat.feedback_global}
            </p>
          )}
          <button
            type="button"
            onClick={() => router.push('/accueil')}
            className="btn-gryffondor w-full"
          >
            Retour à la carte
          </button>
        </motion.div>
      </div>
    );
  }

  if (!exo) return null;

  const renduFormulaire = () => {
    switch (exo.type) {
      case 'qcm':
      case 'vrai_faux':
        return (
          <ExerciceQcm
            choix={
              exo.choix ?? [
                { id: 'vrai', texte: 'Vrai' },
                { id: 'faux', texte: 'Faux' },
              ]
            }
            selection={reponseExo || null}
            onSelect={setReponse}
          />
        );
      case 'numerique':
        return (
          <ExerciceNumerique valeur={reponseExo} onChange={setReponse} />
        );
      case 'redige_court':
      case 'redige_libre':
        return (
          <ExerciceRedige
            type={exo.type}
            valeur={reponseExo}
            onChange={setReponse}
          />
        );
      default:
        return (
          <p className="text-amber-200 italic">Type non supporté en quiz.</p>
        );
    }
  };

  return (
    <div>
      <div className="bg-purple-900/80 text-amber-100 px-4 py-3 flex items-center justify-between border-b-2 border-purple-500 sticky top-0 z-30">
        <BoutonQuitter
          confirmMessage="Quitter le quiz ? Tes réponses non envoyées ne seront pas enregistrées."
        />
        <span className="text-xs uppercase tracking-wider">
          Quiz J{quiz.jour} · Question {index + 1}/{total}
        </span>
        <ChronoExercice
          dureeMaxSec={dureeSec}
          pause={enCoursEnvoi}
          onTempsEcoule={onTempsEcoule}
        />
      </div>

      <section className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {navigation}

        {exo.narration && (
          <div className="parchemin rounded-lg p-4 border border-amber-800/30">
            <p className="text-stone-700 italic text-sm leading-relaxed">
              {exo.narration}
            </p>
          </div>
        )}

        <div className="bg-white rounded-lg p-5 shadow-lg border border-stone-200">
          <span className="bg-purple-100 text-purple-900 text-xs font-bold px-2 py-1 rounded">
            {exo.theme}
          </span>
          <p className="text-lg leading-relaxed text-stone-900 mt-3">
            {exo.enonce}
          </p>
        </div>

        {renduFormulaire()}

        {erreur && (
          <p
            role="alert"
            className="text-red-300 text-sm bg-red-900/40 border border-red-700/50 rounded p-2"
          >
            {erreur}
          </p>
        )}

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
            className="flex-1 bg-stone-700 hover:bg-stone-600 text-amber-100 font-semibold py-3 rounded-lg disabled:opacity-50"
          >
            ← Précédent
          </button>
          {index < total - 1 ? (
            <button
              type="button"
              onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
              disabled={!aRepondu}
              className="flex-1 btn-gryffondor disabled:opacity-50"
            >
              Suivant →
            </button>
          ) : (
            <button
              type="button"
              onClick={envoyer}
              disabled={!tousRepondus || enCoursEnvoi}
              className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg disabled:opacity-50"
            >
              {enCoursEnvoi ? 'Envoi…' : 'Terminer le quiz'}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
