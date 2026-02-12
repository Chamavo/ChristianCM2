import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Loader2, CheckCircle2, XCircle,
    Mountain, Star, Lock, BookOpen, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useProgressionModule } from '@/hooks/useProgressionModule';
import { playLevelUpSound, playCorrectSound, playWrongSound, playAllCompleteSound } from '@/utils/sounds';
import type { ProgressionExercise } from '@/types/progression';

const AUTO_ADVANCE_DELAY = 1500;

interface ProgressionViewProps {
    studentName: string;
    onComplete: () => void;
    onBack: () => void;
}

export const ProgressionView = ({ studentName, onComplete, onBack }: ProgressionViewProps) => {
    const {
        status,
        error,
        progress,
        currentLevel,
        exercises,
        overallPercentage,
        recordAnswer,
        generateExercises,
        isSessionLocked,
        sessionTimeRemaining,
        globalLockoutRemaining,
    } = useProgressionModule(studentName);

    const [step, setStep] = useState<'intro' | 'exercise' | 'result' | 'level-complete' | 'all-complete'>('intro');
    const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [isCorrect, setIsCorrect] = useState(false);
    const [correctAnswer, setCorrectAnswer] = useState<string | undefined>();
    const [isValidating, setIsValidating] = useState(false);

    const [sessionCorrect, setSessionCorrect] = useState(0);
    const [sessionTotal, setSessionTotal] = useState(0);
    const [categoryErrors, setCategoryErrors] = useState<Record<string, number>>({});

    const [levelResult, setLevelResult] = useState<any>(null);

    const currentExercise = exercises[currentExerciseIdx] || null;

    useEffect(() => {
        if (progress.answered_indices.length > 0 && step === 'intro' && exercises.length > 0) {
            let nextIdx = 0;
            while (progress.answered_indices.includes(nextIdx) && nextIdx < exercises.length) {
                nextIdx++;
            }
            setCurrentExerciseIdx(nextIdx);
            setSessionCorrect(progress.correct_answers);
            setSessionTotal(progress.exercises_done);
        }
    }, [progress, exercises, step]);

    const isLocked = useMemo(() => {
        if (!progress.lockout_until) return false;
        return new Date(progress.lockout_until) > new Date();
    }, [progress.lockout_until]);

    const handleStart = useCallback(async () => {
        if (isLocked) return;
        setStep('exercise');
        if (progress.answered_indices.length === 0) {
            setCurrentExerciseIdx(0);
            setSessionCorrect(0);
            setSessionTotal(0);
            setCategoryErrors({});
            if (exercises.length === 0) {
                await generateExercises();
            }
        }
    }, [exercises, generateExercises, progress.answered_indices, isLocked]);

    const checkAnswer = useCallback(async (answer: string) => {
        if (!currentExercise || isValidating) return;
        setIsValidating(true);
        setUserAnswer(answer);

        const correct = answer.trim().toLowerCase() === currentExercise.correctAnswer.trim().toLowerCase();
        setIsCorrect(correct);
        if (!correct) {
            setCorrectAnswer(currentExercise.correctAnswer);
            const cat = currentExercise.category || 'general';
            setCategoryErrors(prev => ({ ...prev, [cat]: (prev[cat] || 0) + 1 }));
            playWrongSound();
        } else {
            setCorrectAnswer(undefined);
            playCorrectSound();
        }

        setSessionTotal(prev => prev + 1);
        if (correct) setSessionCorrect(prev => prev + 1);

        const result = await recordAnswer(correct, currentExerciseIdx);

        if (result) {
            setLevelResult(result);
        }

        setIsValidating(false);
        setStep('result');
    }, [currentExercise, isValidating, recordAnswer, currentExerciseIdx]);

    const handleSubmit = useCallback(async () => {
        if (userAnswer.trim()) await checkAnswer(userAnswer);
    }, [userAnswer, checkAnswer]);

    const handleOptionClick = useCallback(async (option: string) => {
        await checkAnswer(option);
    }, [checkAnswer]);

    const handleNext = useCallback(async () => {
        if (levelResult) {
            if (levelResult.allDone) {
                setStep('all-complete');
                playAllCompleteSound();
            } else {
                setStep('level-complete');
            }
            return;
        }

        const nextIdx = currentExerciseIdx + 1;
        if (nextIdx >= exercises.length) {
            await generateExercises();
        }

        setCurrentExerciseIdx(nextIdx);
        setUserAnswer('');
        setCorrectAnswer(undefined);
        setStep('exercise');
    }, [levelResult, currentExerciseIdx, exercises.length, generateExercises]);

    const handleInternalBack = useCallback(() => {
        if (step === 'intro' || step === 'all-complete') {
            onBack();
        } else {
            setStep('intro');
        }
    }, [step, onBack]);

    useEffect(() => {
        if (step === 'result' && !isValidating) {
            const timer = setTimeout(() => handleNext(), AUTO_ADVANCE_DELAY);
            return () => clearTimeout(timer);
        }
    }, [step, isValidating, handleNext]);

    if (status === 'loading_data' || status === 'fetching_progress') {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center text-slate-900">
                    <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-emerald-600" />
                    <p className="text-xl font-semibold">Chargement...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="bg-slate-50 rounded-3xl p-8 max-w-md text-center border-2 border-slate-100 shadow-xl">
                    <p className="text-destructive mb-4">Erreur : {error}</p>
                    <Button onClick={onBack}>Retour</Button>
                </div>
            </div>
        );
    }

    if (progress.all_completed) {
        return <AllCompleteScreen onBack={onBack} />;
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <AnimatePresence>
                {isSessionLocked && globalLockoutRemaining !== null && (
                    <GlobalLockoutScreen lockoutRemaining={globalLockoutRemaining} />
                )}
            </AnimatePresence>

            {sessionTimeRemaining !== null && !isSessionLocked && (
                <SessionTimer remaining={sessionTimeRemaining} />
            )}

            {isLocked && progress.lockout_until && (
                <LockoutBanner lockoutUntil={progress.lockout_until} />
            )}

            <ProgressionHeader
                onBack={handleInternalBack}
                currentLevel={progress.current_level}
                percentage={overallPercentage}
                exercisesDone={progress.exercises_done}
                totalExercises={currentLevel?.nb_exercices || 0}
                errors={sessionTotal - sessionCorrect}
                showMenu={step === 'intro' || step === 'all-complete'}
            />

            <div className="flex-1 flex items-center justify-center p-4 md:p-8 relative z-10">
                <AnimatePresence mode="wait">
                    {step === 'intro' && (
                        <ProgressionIntro
                            currentLevel={progress.current_level}
                            percentage={overallPercentage}
                            totalExercises={currentLevel?.nb_exercices || 0}
                            isRevision={currentLevel?.revision || false}
                            onStart={handleStart}
                            isGenerating={status === 'generating_pool'}
                            isLocked={isLocked}
                            hasProgress={progress.answered_indices.length > 0}
                        />
                    )}

                    {step === 'exercise' && (
                        status === 'generating_pool' && !currentExercise ? (
                            <motion.div
                                key="generating"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center text-white"
                            >
                                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
                                <p className="text-lg">Préparation des exercices...</p>
                            </motion.div>
                        ) : currentExercise ? (
                            <ExerciseCard
                                exercise={currentExercise}
                                userAnswer={userAnswer}
                                isValidating={isValidating}
                                onAnswerChange={setUserAnswer}
                                onSubmit={handleSubmit}
                                onOptionClick={handleOptionClick}
                                exerciseNumber={sessionTotal + 1}
                                totalExercises={currentLevel?.nb_exercices || 0}
                            />
                        ) : null
                    )}

                    {step === 'result' && (
                        <ResultCard
                            isCorrect={isCorrect}
                            userAnswer={userAnswer}
                            correctAnswer={correctAnswer}
                        />
                    )}

                    {step === 'level-complete' && levelResult && (
                        <LevelCompleteScreen
                            level={progress.current_level}
                            isPerfect={levelResult.perfectSession}
                            advanced={levelResult.advanced}
                            sessionCorrect={sessionCorrect}
                            sessionTotal={sessionTotal}
                            lockoutUntil={levelResult.lockoutUntil}
                            failuresCount={progress.failures_count}
                            categoryErrors={categoryErrors}
                            onContinue={() => {
                                setLevelResult(null);
                                setStep('intro');
                                if (levelResult.advanced) setCurrentExerciseIdx(0);
                            }}
                            onBack={onBack}
                        />
                    )}

                    {step === 'all-complete' && (
                        <AllCompleteScreen onBack={onBack} />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

// --- Sub-components (Simplified for brevity but functional) ---

const renderTextWithUnderline = (text: string) => {
    const parts = text.split(/(__[^_]+__|_[^_]+_)/g);
    return parts.map((part, i) => {
        if (part.startsWith('__') && part.endsWith('__')) {
            return (
                <span key={i} className="underline underline-offset-4 decoration-emerald-500 decoration-4 font-black">
                    {part.slice(2, -2)}
                </span>
            );
        }
        if (part.startsWith('_') && part.endsWith('_')) {
            return (
                <span key={i} className="underline underline-offset-4 decoration-emerald-500 decoration-2 font-black">
                    {part.slice(1, -1)}
                </span>
            );
        }
        return part;
    });
};

const LockoutBanner = ({ lockoutUntil }: { lockoutUntil: string }) => {
    return (
        <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="fixed top-0 left-0 w-full bg-red-600 z-[100] flex flex-col items-center justify-center text-white py-4 px-4 text-center shadow-2xl"
        >
            <XCircle className="w-12 h-12 mb-2 animate-pulse" />
            <h2 className="text-2xl font-black mb-1">Session bloquée temporairement</h2>
            <p className="text-white/80">Prends un peu de repos avant de recommencer !</p>
        </motion.div>
    );
};

const SessionTimer = ({ remaining }: { remaining: number }) => {
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    return (
        <div className="fixed top-4 right-4 z-50 px-4 py-2 rounded-full font-mono font-bold text-xl shadow-lg border-2 bg-white text-emerald-600 border-emerald-500">
            <Clock className="w-5 h-5 inline mr-2" />
            <span>{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</span>
        </div>
    );
};

const GlobalLockoutScreen = ({ lockoutRemaining }: { lockoutRemaining: number }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center text-slate-900 p-4 text-center"
        >
            <Lock className="w-16 h-16 text-red-500 mb-8" />
            <h1 className="text-4xl font-black mb-4 text-red-500">SESSION TERMINÉE</h1>
            <p className="text-xl text-slate-400 mb-12">La limite de temps est atteinte. Reviens plus tard !</p>
        </motion.div>
    );
};

const ProgressionHeader = ({ onBack, currentLevel, percentage, exercisesDone, totalExercises, errors, showMenu }: any) => (
    <header className="bg-white/80 backdrop-blur-md p-4 relative z-20 border-b border-slate-200 sticky top-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Button
                variant="default"
                size="lg"
                onClick={onBack}
                className={`font-bold py-6 px-8 text-xl rounded-2xl shadow-lg gap-3 transition-all ${showMenu
                        ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                        : 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/20'
                    }`}
            >
                <ArrowLeft className="w-6 h-6" /> {showMenu ? 'Menu' : 'Retour'}
            </Button>
            <div className="flex items-center gap-3">
                <Mountain className="w-6 h-6 text-emerald-600" />
                <span className="text-slate-900 font-bold text-lg">Niveau {currentLevel} / 50</span>
            </div>
            <div className="bg-emerald-100 px-4 py-2 rounded-full">
                <span className="text-emerald-700 text-sm font-bold">{percentage}%</span>
            </div>
        </div>
    </header>
);

const ProgressionIntro = ({ currentLevel, percentage, totalExercises, onStart, isGenerating, isLocked, hasProgress }: any) => (
    <motion.div className="w-full max-w-lg bg-white rounded-3xl p-8 shadow-2xl text-center">
        <div className="text-5xl mb-6">🏔️</div>
        <h2 className="text-3xl font-bold text-slate-800 mb-4">{hasProgress ? 'Continue l\'ascension !' : 'Atteins les sommets !'}</h2>
        <p className="text-slate-500 mb-8">{totalExercises} exercices pour ce niveau.</p>
        <Button onClick={onStart} disabled={isGenerating || isLocked} size="lg" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-6 text-lg">
            {isGenerating ? 'Chargement...' : 'C\'est parti !'}
        </Button>
    </motion.div>
);

const ExerciseCard = ({ exercise, userAnswer, isValidating, onAnswerChange, onSubmit, onOptionClick, exerciseNumber, totalExercises }: any) => (
    <motion.div className="w-full max-w-2xl bg-white rounded-3xl p-8 shadow-2xl">
        <div className="text-sm text-slate-400 mb-6 font-bold uppercase tracking-wider">Exercice {exerciseNumber} / {totalExercises}</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-10 text-center leading-relaxed whitespace-pre-line border-b border-slate-100 pb-8">
            {renderTextWithUnderline(exercise.question)}
        </h2>
        <div className="space-y-4">
            {exercise.options ? (
                <div className="grid grid-cols-1 gap-3">
                    {exercise.options.map((opt: string, i: number) => (
                        <Button key={i} variant="outline" onClick={() => onOptionClick(opt)} className="justify-start py-6 text-lg border-2 hover:border-emerald-500 hover:bg-emerald-50">
                            {opt}
                        </Button>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    <Input value={userAnswer} onChange={(e) => onAnswerChange(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onSubmit()} className="text-xl py-8" placeholder="Ta réponse..." />
                    <Button onClick={onSubmit} className="w-full py-6 text-xl bg-emerald-600 hover:bg-emerald-700">Valider</Button>
                </div>
            )}
        </div>
    </motion.div>
);

const ResultCard = ({ isCorrect, userAnswer, correctAnswer }: any) => (
    <motion.div className="w-full max-w-lg bg-white rounded-3xl p-8 shadow-2xl text-center">
        {isCorrect ? <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-4" /> : <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />}
        <h3 className={`text-3xl font-bold ${isCorrect ? 'text-emerald-600' : 'text-red-600'}`}>{isCorrect ? 'Bravo ! 🎉' : 'Oups...'}</h3>
        {!isCorrect && <p className="mt-4 text-xl">Bonne réponse : <span className="font-bold text-emerald-600">{correctAnswer}</span></p>}
    </motion.div>
);

const AllCompleteScreen = ({ onBack }: any) => (
    <div className="text-center bg-white rounded-3xl p-12 shadow-2xl">
        <div className="text-8xl mb-6">🎓</div>
        <h1 className="text-4xl font-black text-emerald-600 mb-4">FÉLICITATIONS !</h1>
        <p className="text-xl text-slate-600 mb-8">Tu as gravi tous les sommets de l'orthographe !</p>
        <Button onClick={onBack} size="lg">Continuer</Button>
    </div>
);

const LevelCompleteScreen = ({ advanced, sessionCorrect, sessionTotal, onContinue }: any) => (
    <div className="bg-white rounded-3xl p-8 shadow-2xl text-center">
        <div className="text-7xl mb-6">{advanced ? '🏆' : '💪'}</div>
        <h2 className="text-3xl font-bold mb-2">{advanced ? 'Niveau validé !' : 'Essaye encore !'}</h2>
        <p className="text-slate-600 mb-8 text-xl">Ton score : {sessionCorrect} / {sessionTotal}</p>
        <Button onClick={onContinue} size="lg" className="w-full bg-emerald-500 py-6 text-xl">Suivant</Button>
    </div>
);
