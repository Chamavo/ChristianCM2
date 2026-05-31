'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import type { Exercise, ValidationResult, Decomposition } from '@/lib/types';
import { ChronoExercice } from './ChronoExercice';
import { ExerciceQcm } from './ExerciceQcm';
import { ExerciceRedige } from './ExerciceRedige';
import { ExerciceNumerique } from './ExerciceNumerique';
import { DecompositionWizard } from './DecompositionWizard';
import { FeedbackPanel } from './FeedbackPanel';
import { PointsMaisonBadge } from '@/components/gamification/PointsMaisonBadge';
import { BoutonQuitter } from '@/components/layout/BoutonQuitter';
import { DetecteurFocus } from './DetecteurFocus';
import { skipExercise } from '@/app/(child)/actions';
import { celebrerPalier, celebrerFinJournee } from '@/lib/celebration';
import { cn } from '@/lib/utils';

interface ExerciceClientProps {
  exercise: Exercise;
  jourActuel: number;
  ordreAffiche: number;
  totalExosJour: number;
  nbMaitrisesJour: number;
  retourHref?: string;
}

type Etape = 'enonce' | 'decomposition' | 'fin_decomposition';

const SEUIL_TEMPS_LONG = 240; // 4 min

export function ExerciceClient({
  exercise,
  jourActuel,
  ordreAffiche,
  totalExosJour,
  nbMaitrisesJour,
  retourHref = '/accueil',
}: ExerciceClientProps) {
  const router = useRouter();

  const [reponse, setReponse] = useState<string>('');
  const [nbIndices, setNbIndices] = useState(0);
  const [nbErreurs, setNbErreurs] = useState(0);
  const [tempsEcoule, setTempsEcoule] = useState(0);
  const [etape, setEtape] = useState<Etape>('enonce');
  const [enCoursValidation, setEnCoursValidation] = useState(false);
  const [reussi, setReussi] = useState(false);
  const [finJourneeFete, setFinJourneeFete] = useState(false);
  const [pointsGagnes, setPointsGagnes] = useState(0);
  const [flashErreur, setFlashErreur] = useState<string | null>(null);
  const [decomposition, setDecomposition] = useState<Decomposition | null>(null);
  const [erreurApi, setErreurApi] = useState<string | null>(null);

  const indices = exercise.indices ?? [];
  const peutDecomposer = nbErreurs >= 2 || tempsEcoule >= SEUIL_TEMPS_LONG;
  const progressionPct = Math.round((nbMaitrisesJour / totalExosJour) * 100);

  const suivant = useCallback(async () => {
    try {
      const res = await fetch('/api/progress/next-exercise', { method: 'GET' });
      if (!res.ok) {
        router.push(retourHref);
        return;
      }
      const data = (await res.json()) as
        | { kind: 'exercise'; data: { id: string } }
        | { kind: 'quiz'; data: { quiz_id: string; jour: number } }
        | { kind: 'completed'; data: unknown };

      if (data.kind === 'exercise' && data.data?.id) {
        router.push(`/exercice/${data.data.id}`);
      } else if (data.kind === 'quiz' && data.data?.jour) {
        router.push(`/quiz/J${data.data.jour}`);
      } else {
        router.push(retourHref);
      }
    } catch {
      router.push(retourHref);
    }
  }, [router, retourHref]);

  const valider = useCallback(async () => {
    if (!reponse || enCoursValidation || reussi) return;
    setEnCoursValidation(true);
    setErreurApi(null);
    setFlashErreur(null);

    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exercise_id: exercise.id,
          reponse_donnee: reponse,
          duree_sec: tempsEcoule,
          nb_indices_utilises: nbIndices,
          est_decomposition: false,
          device: 'mobile',
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as ValidationResult;

      if (data.correct) {
        // #1 + #3 : bonne réponse → on félicite brièvement et on enchaîne
        // automatiquement, SANS afficher d'explication.
        setReussi(true);
        setPointsGagnes(data.points_gagnes || 0);

        // Célébrations : fin de journée (30e) = pluie de confettis + sirène ;
        // palier (10e, 20e) = petit signe visuel + sonore.
        const finJournee = ordreAffiche >= totalExosJour;
        const palier = !finJournee && ordreAffiche % 10 === 0;
        if (finJournee) {
          setFinJourneeFete(true);
          celebrerFinJournee();
          setTimeout(() => suivant(), 3500); // on laisse profiter de la fête
        } else {
          if (palier) celebrerPalier();
          setTimeout(() => suivant(), 1100);
        }
      } else {
        // #4 : mauvaise réponse → on révèle UN indice, sans montrer la bonne réponse.
        const indiceDispo = nbIndices < indices.length;
        setNbErreurs((n) => n + 1);
        if (indiceDispo) setNbIndices((n) => Math.min(n + 1, indices.length));
        setFlashErreur(
          indiceDispo
            ? 'Pas tout à fait… 💡 Regarde l’indice et réessaie.'
            : 'Pas tout à fait… relis bien l’énoncé et réessaie.'
        );
      }
    } catch {
      setErreurApi(
        'Impossible de valider ta réponse. Vérifie ta connexion et réessaie.'
      );
    } finally {
      setEnCoursValidation(false);
    }
  }, [
    reponse,
    enCoursValidation,
    reussi,
    exercise.id,
    tempsEcoule,
    nbIndices,
    indices.length,
    suivant,
  ]);

  const lancerDecomposition = useCallback(async () => {
    setErreurApi(null);
    if (exercise.decomposition) {
      setDecomposition(exercise.decomposition);
      setEtape('decomposition');
      return;
    }
    try {
      const res = await fetch('/api/claude/decomposer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exercise_id: exercise.id }),
      });
      if (!res.ok) throw new Error('decompose-fail');
      const data = (await res.json()) as { decomposition: Decomposition };
      setDecomposition(data.decomposition);
      setEtape('decomposition');
    } catch {
      setErreurApi('Impossible de générer la décomposition. Réessaie plus tard.');
    }
  }, [exercise.id, exercise.decomposition]);

  const decompositionTerminee = useCallback(
    async (succes: boolean) => {
      try {
        await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            exercise_id: exercise.id,
            reponse_donnee: '__decomposition__',
            duree_sec: tempsEcoule,
            nb_indices_utilises: nbIndices,
            est_decomposition: true,
            est_correcte_override: succes,
            device: 'mobile',
          }),
        });
      } catch {
        /* tolère l'échec */
      }
      setEtape('fin_decomposition');
    },
    [exercise.id, tempsEcoule, nbIndices]
  );

  const passerDefinitivement = useCallback(async () => {
    const ok = window.confirm(
      'Passer définitivement cette question ?\n\n' +
        'Elle ne te sera plus reposée et ne comptera pas comme réussie. ' +
        'À utiliser seulement si tu es vraiment bloqué.'
    );
    if (!ok) return;
    try {
      await skipExercise(exercise.id);
    } catch {
      /* on avance quand même */
    }
    suivant();
  }, [exercise.id, suivant]);

  // Ctrl/Cmd + Entrée → valider
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (etape !== 'enonce' || reussi) return;
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && reponse && !enCoursValidation) {
        valider();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [etape, reponse, valider, enCoursValidation, reussi]);

  const renduFormulaire = () => {
    switch (exercise.type) {
      case 'qcm':
      case 'vrai_faux':
        return (
          <ExerciceQcm
            choix={
              exercise.choix ?? [
                { id: 'vrai', texte: 'Vrai' },
                { id: 'faux', texte: 'Faux' },
              ]
            }
            selection={reponse || null}
            onSelect={setReponse}
            desactive={reussi}
            modeRevue={false}
          />
        );
      case 'numerique':
        return (
          <ExerciceNumerique valeur={reponse} onChange={setReponse} desactive={reussi} />
        );
      case 'redige_court':
      case 'redige_libre':
        return (
          <ExerciceRedige
            type={exercise.type}
            valeur={reponse}
            onChange={setReponse}
            desactive={reussi}
          />
        );
      default:
        return (
          <p className="text-amber-200 italic">
            Type d&apos;exercice « {exercise.type} » non encore supporté.
          </p>
        );
    }
  };

  return (
    <div className="relative flex flex-col">
      {/* HEADER spécifique exercice */}
      <div className="bg-stone-900/90 backdrop-blur text-amber-100 px-4 py-2 flex items-center justify-between border-b-2 border-amber-700 sticky top-0 z-30">
        <BoutonQuitter href={retourHref} />
        <span className="text-xs uppercase tracking-wider opacity-80">
          Jour {jourActuel} — Ex. {ordreAffiche}/{totalExosJour}
        </span>
        <ChronoExercice
          pause={etape !== 'enonce' || reussi}
          onTick={setTempsEcoule}
          seuilTempsLongSec={SEUIL_TEMPS_LONG}
        />
      </div>

      {/* Anti-triche : journalise les sorties d'onglet/fenêtre */}
      <DetecteurFocus exerciseId={exercise.id} jour={jourActuel} />

      {/* PROGRESSION (barre fine) */}
      <div className="bg-stone-800 px-4 py-1.5">
        <div className="w-full bg-stone-700 rounded-full h-1.5 overflow-hidden">
          <motion.div
            className="bg-gradient-to-r from-amber-500 to-amber-300 h-1.5 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressionPct}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
      </div>

      <PointsMaisonBadge
        points={pointsGagnes}
        maison={exercise.maison_bonus}
        visible={reussi}
      />

      <section className="w-full max-w-2xl mx-auto px-4 py-3 space-y-3">
        {/* NARRATION (compacte) */}
        {(exercise.scene_hp || exercise.narration) && etape === 'enonce' && (
          <div className="parchemin rounded-lg px-3 py-2 border border-amber-800/30">
            {exercise.scene_hp && (
              <span className="text-amber-900 font-bold uppercase text-[10px] tracking-widest">
                🪄 {exercise.scene_hp}
              </span>
            )}
            {exercise.narration && (
              <p className="text-stone-800 text-2xl leading-snug">
                {exercise.narration}
              </p>
            )}
          </div>
        )}

        {/* ÉNONCÉ */}
        {etape === 'enonce' && (
          <div className="bg-white rounded-lg p-4 shadow-lg border border-stone-200">
            <div className="flex items-start justify-between mb-2 gap-2">
              <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2 py-0.5 rounded">
                {exercise.theme}
              </span>
              <span className="text-xs text-stone-500 shrink-0">
                +{exercise.points_maison || 5} pts maison
              </span>
            </div>
            <p className="text-base leading-relaxed text-stone-900">
              {exercise.enonce}
            </p>
            {exercise.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={exercise.image_url}
                alt=""
                className="mt-2 rounded-lg max-h-44 mx-auto"
              />
            )}
          </div>
        )}

        {/* Indices révélés (sur erreur) */}
        {nbIndices > 0 && etape === 'enonce' && !reussi && (
          <div className="bg-amber-900/30 border border-amber-700/40 rounded-lg px-3 py-2">
            <p className="text-[10px] uppercase tracking-wider text-amber-300 mb-1">
              <span aria-hidden="true">💡</span> Indice{nbIndices > 1 ? 's' : ''}
            </p>
            <ul className="space-y-0.5">
              {indices.slice(0, nbIndices).map((ind, i) => (
                <li key={i} className="text-sm text-amber-100">
                  <strong>{i + 1}.</strong> {ind.texte}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ÉTAT : bonne réponse → félicitation + enchaînement auto */}
        {reussi && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl p-5 border-2 border-green-500 bg-gradient-to-br from-green-100 to-emerald-50 text-center shadow-xl"
            role="status"
            aria-live="polite"
          >
            <div className="text-4xl mb-1" aria-hidden="true">
              ✨
            </div>
            <p className="font-bold text-lg text-green-800">Bravo !</p>
            {pointsGagnes > 0 && (
              <p className="text-amber-700 font-bold">
                +{pointsGagnes} point{pointsGagnes > 1 ? 's' : ''} pour ta maison ⚡
              </p>
            )}
            <p className="mt-2 text-sm text-green-700 inline-flex items-center gap-2">
              <span className="inline-block w-4 h-4 rounded-full border-2 border-green-300 border-t-green-700 animate-spin" />
              Question suivante…
            </p>
          </motion.div>
        )}

        {/* CORPS interactif (tant qu'on n'a pas réussi) */}
        {etape === 'enonce' && !reussi && (
          <>
            {renduFormulaire()}

            {flashErreur && (
              <p
                role="status"
                aria-live="polite"
                className="text-amber-100 text-sm bg-amber-900/40 border border-amber-600/50 rounded-lg px-3 py-2"
              >
                {flashErreur}
              </p>
            )}
            {erreurApi && (
              <p
                role="alert"
                className="text-red-200 text-sm bg-red-900/40 border border-red-700/50 rounded px-3 py-2"
              >
                {erreurApi}
              </p>
            )}

            <button
              type="button"
              onClick={valider}
              disabled={!reponse || enCoursValidation}
              className="w-full btn-gryffondor py-3 text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {enCoursValidation ? 'Validation…' : 'Valider ✓'}
            </button>

            {/* Anti-blocage : visible seulement après 2 erreurs / temps long */}
            {peutDecomposer && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={lancerDecomposition}
                  className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2.5 rounded-lg text-sm"
                >
                  🪄 Voir les étapes
                </button>
                <button
                  type="button"
                  onClick={passerDefinitivement}
                  className="flex-1 bg-stone-700 hover:bg-stone-600 text-amber-100 font-semibold py-2.5 rounded-lg text-sm"
                >
                  Passer →
                </button>
              </div>
            )}
          </>
        )}

        {etape === 'decomposition' && decomposition && (
          <DecompositionWizard
            decomposition={decomposition}
            onTerminee={decompositionTerminee}
            onAbandon={() => setEtape('enonce')}
          />
        )}

        {etape === 'fin_decomposition' && (
          <FeedbackPanel
            estCorrecte
            pointsGagnes={1}
            maitrise={false}
            explication={
              exercise.explication_correcte ??
              'Tu as suivi toutes les étapes. La maîtrise viendra à la prochaine occasion sans aide.'
            }
            onSuivant={suivant}
          />
        )}
      </section>
    </div>
  );
}
