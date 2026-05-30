'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import type { Exercise, ValidationResult, Decomposition } from '@/lib/types';
import { ChronoExercice } from './ChronoExercice';
import { ExerciceQcm } from './ExerciceQcm';
import { ExerciceRedige } from './ExerciceRedige';
import { ExerciceNumerique } from './ExerciceNumerique';
import { IndiceModal } from './IndiceModal';
import { DecompositionWizard } from './DecompositionWizard';
import { FeedbackPanel } from './FeedbackPanel';
import { PointsMaisonBadge } from '@/components/gamification/PointsMaisonBadge';
import { BoutonQuitter } from '@/components/layout/BoutonQuitter';
import { cn } from '@/lib/utils';

interface ExerciceClientProps {
  exercise: Exercise;
  jourActuel: number;
  ordreAffiche: number;
  totalExosJour: number;
  nbMaitrisesJour: number;
  retourHref?: string;
}

type Etape = 'enonce' | 'feedback' | 'decomposition' | 'fin_decomposition';

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
  const [resultat, setResultat] = useState<ValidationResult | null>(null);
  const [indiceOuvert, setIndiceOuvert] = useState(false);
  const [showPoints, setShowPoints] = useState(false);
  const [enCoursValidation, setEnCoursValidation] = useState(false);
  const [decomposition, setDecomposition] = useState<Decomposition | null>(
    null
  );
  const [erreurApi, setErreurApi] = useState<string | null>(null);

  const indices = exercise.indices ?? [];
  const peutIndice = nbIndices < indices.length;
  const peutDecomposer =
    nbErreurs >= 2 || tempsEcoule >= SEUIL_TEMPS_LONG;

  const progressionPct = Math.round((nbMaitrisesJour / totalExosJour) * 100);

  const utiliserIndice = useCallback(() => {
    setNbIndices((n) => Math.min(n + 1, indices.length));
    setIndiceOuvert(false);
  }, [indices.length]);

  const valider = useCallback(async () => {
    if (!reponse || enCoursValidation) return;
    setEnCoursValidation(true);
    setErreurApi(null);

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

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = (await res.json()) as ValidationResult;
      setResultat(data);
      setEtape('feedback');
      if (!data.correct) {
        setNbErreurs((n) => n + 1);
      } else {
        setShowPoints(true);
        setTimeout(() => setShowPoints(false), 1800);
      }
    } catch (e) {
      setErreurApi(
        "Impossible de valider ta réponse. Vérifie ta connexion et réessaie."
      );
    } finally {
      setEnCoursValidation(false);
    }
  }, [reponse, exercise.id, tempsEcoule, nbIndices, enCoursValidation]);

  const reessayer = useCallback(() => {
    setEtape('enonce');
    setResultat(null);
    setReponse('');
  }, []);

  const lancerDecomposition = useCallback(async () => {
    setErreurApi(null);
    if (exercise.decomposition) {
      setDecomposition(exercise.decomposition);
      setEtape('decomposition');
      return;
    }
    // Sinon on demande à Claude
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
      // On enregistre la tentative en mode décomposition
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
        // Tolère l'échec — la décomp a été affichée
      }
      setEtape('fin_decomposition');
    },
    [exercise.id, tempsEcoule, nbIndices]
  );

  const suivant = useCallback(async () => {
    try {
      const res = await fetch('/api/progress/next-exercise', {
        method: 'GET',
      });
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
        // 'completed' ou réponse inattendue → retour à l'accueil
        router.push(retourHref);
      }
    } catch {
      router.push(retourHref);
    }
  }, [router, retourHref]);

  // Touche Entrée → valider si réponse remplie et pas en feedback
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (etape !== 'enonce') return;
      if (
        e.key === 'Enter' &&
        (e.metaKey || e.ctrlKey) &&
        reponse &&
        !enCoursValidation
      ) {
        valider();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [etape, reponse, valider, enCoursValidation]);

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
            modeRevue={etape === 'feedback'}
            reponseCorrecte={exercise.reponse_correcte}
          />
        );
      case 'numerique':
        return (
          <ExerciceNumerique
            valeur={reponse}
            onChange={setReponse}
            desactive={etape === 'feedback'}
          />
        );
      case 'redige_court':
      case 'redige_libre':
        return (
          <ExerciceRedige
            type={exercise.type}
            valeur={reponse}
            onChange={setReponse}
            desactive={etape === 'feedback'}
          />
        );
      default:
        return (
          <p className="text-amber-200 italic">
            Type d'exercice « {exercise.type} » non encore supporté.
          </p>
        );
    }
  };

  return (
    <div className="relative">
      {/* HEADER spécifique exercice */}
      <div className="bg-stone-900/90 backdrop-blur text-amber-100 px-4 py-3 flex items-center justify-between border-b-2 border-amber-700 sticky top-0 z-30">
        <BoutonQuitter href={retourHref} />
        <span className="text-xs uppercase tracking-wider opacity-80">
          Jour {jourActuel} — Exercice {ordreAffiche}/{totalExosJour}
        </span>
        <div className="flex items-center gap-3">
          <ChronoExercice
            pause={etape !== 'enonce'}
            onTick={setTempsEcoule}
            seuilTempsLongSec={SEUIL_TEMPS_LONG}
          />
          {/* Lampe indice — s'allume quand un indice est utilisé */}
          <span
            className={cn(
              'text-lg transition-all',
              nbIndices > 0
                ? 'opacity-100 drop-shadow-[0_0_4px_rgba(252,211,77,0.9)]'
                : 'opacity-30'
            )}
            title={`${nbIndices} indice(s) utilisé(s)`}
            aria-label={`${nbIndices} indices utilisés`}
          >
            💡
          </span>
        </div>
      </div>

      {/* PROGRESSION */}
      <div className="bg-stone-800 px-4 py-2">
        <div className="w-full bg-stone-700 rounded-full h-2 overflow-hidden">
          <motion.div
            className="bg-gradient-to-r from-amber-500 to-amber-300 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressionPct}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
        <p className="text-amber-200 text-xs mt-1 text-center">
          {nbMaitrisesJour} maîtrisé{nbMaitrisesJour > 1 ? 's' : ''} sur{' '}
          {totalExosJour}
        </p>
      </div>

      <PointsMaisonBadge
        points={resultat?.points_gagnes ?? 0}
        maison={exercise.maison_bonus}
        visible={showPoints}
      />

      <section className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* NARRATION SCÈNE */}
        {(exercise.scene_hp || exercise.narration) && (
          <div className="parchemin rounded-lg p-4 border-2 border-amber-800/30">
            {exercise.scene_hp && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl" aria-hidden="true">
                  🪄
                </span>
                <h2 className="text-amber-900 font-bold uppercase text-xs tracking-widest">
                  {exercise.scene_hp}
                </h2>
              </div>
            )}
            {exercise.narration && (
              <p className="text-stone-700 italic text-sm leading-relaxed">
                {exercise.narration}
              </p>
            )}
          </div>
        )}

        {/* ÉNONCÉ */}
        <div className="bg-white rounded-lg p-5 shadow-lg border border-stone-200">
          <div className="flex items-start justify-between mb-3 gap-2">
            <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2 py-1 rounded">
              {exercise.theme}
            </span>
            <span className="text-xs text-stone-500 shrink-0">
              +{exercise.points_maison ?? 5} pts maison
            </span>
          </div>
          <p className="text-lg leading-relaxed text-stone-900">
            {exercise.enonce}
          </p>
          {exercise.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={exercise.image_url}
              alt=""
              className="mt-3 rounded-lg max-h-64 mx-auto"
            />
          )}
        </div>

        {/* Indices déjà révélés (inline) */}
        {nbIndices > 0 && etape === 'enonce' && (
          <div className="bg-amber-900/30 border border-amber-700/40 rounded-lg p-3">
            <p className="text-xs uppercase tracking-wider text-amber-300 mb-2">
              <span aria-hidden="true">💡</span> Indice
              {nbIndices > 1 ? 's' : ''} ({nbIndices})
            </p>
            <ul className="space-y-1">
              {indices.slice(0, nbIndices).map((ind, i) => (
                <li key={i} className="text-sm text-amber-100">
                  <strong>{i + 1}.</strong> {ind.texte}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CORPS — formulaire OU décomposition OU feedback */}
        {etape === 'enonce' && (
          <>
            {renduFormulaire()}

            {erreurApi && (
              <p
                role="alert"
                className="text-red-300 text-sm bg-red-900/40 border border-red-700/50 rounded p-2"
              >
                {erreurApi}
              </p>
            )}

            {/* ACTIONS */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIndiceOuvert(true)}
                disabled={!peutIndice}
                className="flex-1 bg-stone-200 hover:bg-stone-300 disabled:opacity-50 disabled:cursor-not-allowed text-stone-700 font-semibold py-3 rounded-lg flex items-center justify-center gap-2 text-sm"
                aria-label={
                  peutIndice
                    ? `Demander un indice (${indices[nbIndices]?.cout_points ?? 1} point)`
                    : 'Plus d\'indice disponible'
                }
              >
                <span aria-hidden="true">💡</span> Indice
                {peutIndice && (
                  <span className="text-xs opacity-70">
                    (-{indices[nbIndices]?.cout_points ?? 1} pt)
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={lancerDecomposition}
                disabled={!peutDecomposer}
                className={cn(
                  'flex-1 font-semibold py-3 rounded-lg flex items-center justify-center gap-2 text-sm transition-all',
                  peutDecomposer
                    ? 'bg-purple-600 hover:bg-purple-500 text-white animate-pulse'
                    : 'bg-stone-200 text-stone-500 cursor-not-allowed opacity-50'
                )}
                aria-label={
                  peutDecomposer
                    ? 'Décomposer l\'exercice en étapes'
                    : 'Décomposition disponible après 2 erreurs ou 4 minutes'
                }
              >
                <span aria-hidden="true">🪄</span>
                {peutDecomposer
                  ? 'Décomposer en étapes'
                  : 'Aide (bientôt)'}
              </button>
            </div>

            <button
              type="button"
              onClick={valider}
              disabled={!reponse || enCoursValidation}
              className="w-full btn-gryffondor py-4 text-lg mt-4 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {enCoursValidation
                ? 'Validation…'
                : 'Valider ma réponse ✓'}
            </button>
          </>
        )}

        {etape === 'feedback' && resultat && (
          <FeedbackPanel
            estCorrecte={resultat.correct}
            indetermine={resultat.indetermine}
            pointsGagnes={resultat.points_gagnes}
            maitrise={resultat.maitrise}
            explication={exercise.explication_correcte}
            feedbackClaude={resultat.feedback ?? null}
            onSuivant={suivant}
            onReessayer={reessayer}
            proposerDecomposition={nbErreurs >= 1}
            onDecomposer={lancerDecomposition}
          />
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

      <IndiceModal
        ouvert={indiceOuvert}
        indices={indices}
        nbUtilises={nbIndices}
        onConfirmerProchain={utiliserIndice}
        onFermer={() => setIndiceOuvert(false)}
      />
    </div>
  );
}
