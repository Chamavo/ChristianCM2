import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Loader2, CheckCircle2, XCircle,
    Mountain, Star, Lock, Clock, ChevronRight, Award, Trophy, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProgressionModule } from '@/hooks/useProgressionModule';
import { playCorrectSound, playWrongSound, playAllCompleteSound } from '@/utils/sounds';
import ModuleHeader from '../shared/ModuleHeader';

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
            if (exercises.length === 0) {
                await generateExercises();
            }
        }
    }, [exercises, generateExercises, progress.answered_indices, isLocked]);

    const checkAnswer = useCallback((answer: string) => {
        if (!currentExercise || isValidating) return;
        setIsValidating(true);
        setUserAnswer(answer);

        const correct = answer.trim().toLowerCase() === currentExercise.correctAnswer.trim().toLowerCase();
        setIsCorrect(correct);
        if (!correct) {
            setCorrectAnswer(currentExercise.correctAnswer);
            playWrongSound();
        } else {
            setCorrectAnswer(undefined);
            playCorrectSound();
        }

        setSessionTotal(prev => prev + 1);
        if (correct) setSessionCorrect(prev => prev + 1);

        const result = recordAnswer(correct, currentExerciseIdx);
        if (result) setLevelResult(result);

        setIsValidating(false);
        setStep('result');
    }, [currentExercise, isValidating, recordAnswer, currentExerciseIdx]);

    const handleSubmit = useCallback(() => {
        if (userAnswer.trim()) checkAnswer(userAnswer);
    }, [userAnswer, checkAnswer]);

    const handleOptionClick = useCallback((option: string) => {
        checkAnswer(option);
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
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-16 h-16 animate-spin text-orange-500 mb-4" />
                <p className="text-xl font-black text-slate-800 uppercase tracking-tight">Chargement du parcours...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-white/40 backdrop-blur-md rounded-[48px] border-4 border-white shadow-2xl max-w-2xl mx-auto">
                <XCircle className="w-16 h-16 text-rose-500 mb-6" />
                <h2 className="text-3xl font-black text-slate-800 mb-4 uppercase">Une erreur est survenue</h2>
                <p className="text-slate-500 font-bold mb-8">{error}</p>
                <Button onClick={onBack} size="lg" className="bg-orange-500 hover:bg-orange-600 text-white font-black py-6 px-10 rounded-[28px] shadow-xl border-b-8 border-orange-700 active:translate-y-1 active:border-b-4">
                    RETOUR AU MENU
                </Button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-5xl mx-auto px-6 py-8 flex flex-col min-h-[90vh]">
            <AnimatePresence>
                {isSessionLocked && globalLockoutRemaining !== null && (
                    <GlobalLockoutScreen lockoutRemaining={globalLockoutRemaining} />
                )}
            </AnimatePresence>

            {isLocked && progress.lockout_until && (
                <div className="fixed top-0 left-0 w-full bg-rose-600 z-[100] flex flex-col items-center justify-center text-white py-4 px-4 text-center shadow-2xl border-b-4 border-rose-800">
                    <Lock className="w-8 h-8 mb-2 animate-pulse" />
                    <h2 className="text-xl font-black uppercase tracking-tight">Pause obligatoire</h2>
                    <p className="font-bold text-rose-100">Repose-toi un peu ! Ta progression reprendra bientôt.</p>
                </div>
            )}

            <ModuleHeader
                title="Mon Parcours"
                subtitle={`Niveau ${progress.current_level} sur 50`}
                icon={Mountain}
                onBack={handleInternalBack}
                variant="orthographe"
            />

            <div className="flex-1 flex flex-col items-center justify-center relative">
                <AnimatePresence mode="wait">
                    {step === 'intro' && (
                        <ProgressionIntro
                            currentLevel={progress.current_level}
                            percentage={overallPercentage}
                            totalExercises={currentLevel?.nb_exercices || 0}
                            onStart={handleStart}
                            isGenerating={status === 'generating_pool'}
                            isLocked={isLocked}
                            hasProgress={progress.answered_indices.length > 0}
                        />
                    )}

                    {step === 'exercise' && currentExercise && (
                        <ExerciseCard
                            exercise={currentExercise}
                            userAnswer={userAnswer}
                            isValidating={isValidating}
                            onAnswerChange={setUserAnswer}
                            onSubmit={handleSubmit}
                            onOptionClick={handleOptionClick}
                            exerciseNumber={sessionTotal + 1}
                            totalExercises={currentLevel?.nb_exercices || 0}
                            timer={sessionTimeRemaining}
                        />
                    )}

                    {step === 'result' && (
                        <ResultCard
                            isCorrect={isCorrect}
                            correctAnswer={correctAnswer}
                        />
                    )}

                    {step === 'level-complete' && levelResult && (
                        <LevelCompleteScreen
                            level={progress.current_level}
                            advanced={levelResult.advanced}
                            sessionCorrect={sessionCorrect}
                            sessionTotal={sessionTotal}
                            onContinue={() => {
                                setLevelResult(null);
                                setStep('intro');
                            }}
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

// --- Modernized Sub-components ---

const renderTextWithUnderline = (text: string) => {
    const parts = text.split(/(__[^_]+__|_[^_]+_)/g);
    return parts.map((part, i) => {
        if (part.startsWith('__') && part.endsWith('__')) {
            return (
                <span key={i} className="underline underline-offset-[12px] decoration-orange-400 decoration-8 font-black text-slate-900">
                    {part.slice(2, -2)}
                </span>
            );
        }
        if (part.startsWith('_') && part.endsWith('_')) {
            return (
                <span key={i} className="underline underline-offset-[12px] decoration-orange-400 decoration-4 font-black text-slate-900">
                    {part.slice(1, -1)}
                </span>
            );
        }
        return part;
    });
};

const ProgressionIntro = memo(({ currentLevel, percentage, totalExercises, onStart, isGenerating, isLocked, hasProgress }: any) => (
    <motion.div
        key="intro"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-2xl bg-white/80 backdrop-blur-md rounded-[48px] p-12 md:p-16 border-4 border-white shadow-3xl text-center"
    >
        <div className="w-32 h-32 bg-orange-100 rounded-[32px] flex items-center justify-center text-6xl mx-auto mb-10 shadow-inner border-2 border-orange-200">
            🏔️
        </div>
        <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight uppercase">
            {hasProgress ? 'Continue l\'ascension !' : 'Démarre ton ascension !'}
        </h2>
        <p className="text-xl text-slate-500 font-bold mb-10 max-w-md mx-auto">
            Atteins le sommet du Niveau <span className="text-orange-500">{currentLevel}</span> en complétant <span className="text-orange-500">{totalExercises}</span> défis.
        </p>

        <div className="bg-slate-50 rounded-[32px] p-8 mb-10 border-2 border-slate-100">
            <div className="flex justify-between text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                <span>Progression Globale</span>
                <span>{percentage}%</span>
            </div>
            <div className="h-6 bg-white rounded-full overflow-hidden border-2 border-slate-200 shadow-inner p-1">
                <motion.div
                    className="h-full bg-gradient-to-r from-orange-400 to-rose-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1 }}
                />
            </div>
        </div>

        <Button
            onClick={onStart}
            disabled={isGenerating || isLocked}
            size="lg"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-8 text-2xl font-black rounded-[32px] shadow-xl border-b-8 border-orange-700 active:translate-y-1 active:border-b-4 transition-all"
        >
            {isGenerating ? (
                <>
                    <Loader2 className="w-8 h-8 animate-spin mr-3" /> PRÉPARATION...
                </>
            ) : isLocked ? 'REPOSE-TOI ENCORE' : 'C\'EST PARTI !'}
        </Button>
    </motion.div>
));
ProgressionIntro.displayName = 'ProgressionIntro';

const ExerciseCard = memo(({ exercise, userAnswer, isValidating, onAnswerChange, onSubmit, onOptionClick, exerciseNumber, totalExercises, timer }: any) => {
    const minutes = timer !== null ? Math.floor(timer / 60) : 0;
    const seconds = timer !== null ? timer % 60 : 0;

    return (
        <motion.div
            key="exercise"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            className="w-full max-w-3xl bg-white rounded-[48px] p-10 md:p-16 border-4 border-white shadow-3xl text-center relative overflow-hidden"
        >
            <div className="flex justify-between items-center mb-12">
                <div className="bg-orange-100 px-6 py-2 rounded-2xl text-orange-600 text-xs font-black uppercase tracking-widest border border-orange-200">
                    Défi {exerciseNumber} / {totalExercises}
                </div>
                {timer !== null && (
                    <div className={`flex items-center gap-2 px-6 py-2 rounded-2xl font-mono text-lg font-black border-2 ${timer < 60 ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse' : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}>
                        <Clock className="w-5 h-5" />
                        {minutes}:{seconds.toString().padStart(2, '0')}
                    </div>
                )}
            </div>

            <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-16 leading-[1.6]">
                {renderTextWithUnderline(exercise.question)}
            </h2>

            <div className="space-y-6 max-w-md mx-auto">
                {exercise.options ? (
                    <div className="grid grid-cols-1 gap-4">
                        {exercise.options.map((opt: string, i: number) => (
                            <motion.button
                                key={i}
                                whileHover={{ scale: 1.02, x: 5 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onOptionClick(opt)}
                                disabled={isValidating}
                                className="group w-full py-6 px-10 rounded-[28px] text-xl font-black text-slate-700 bg-white border-4 border-slate-100 hover:border-orange-500 hover:bg-orange-50 text-left flex items-center justify-between transition-all shadow-md"
                            >
                                {opt}
                                <ChevronRight className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity text-orange-500" strokeWidth={3} />
                            </motion.button>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-6">
                        <Input
                            value={userAnswer}
                            onChange={(e) => onAnswerChange(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && userAnswer.trim() && onSubmit()}
                            autoFocus
                            className="text-3xl font-black py-10 rounded-[32px] border-4 border-orange-100 focus:border-orange-500 focus:ring-8 focus:ring-orange-500/10 text-center shadow-inner placeholder:text-slate-200"
                            placeholder="..."
                        />
                        <Button
                            onClick={onSubmit}
                            disabled={!userAnswer.trim() || isValidating}
                            className="w-full py-8 text-2xl font-black bg-orange-500 hover:bg-orange-600 rounded-[32px] shadow-xl border-b-8 border-orange-700 active:translate-y-1 active:border-b-4 transition-all"
                        >
                            VALIDER
                        </Button>
                    </div>
                )}
            </div>
        </motion.div>
    );
});
ExerciseCard.displayName = 'ExerciseCard';

const ResultCard = memo(({ isCorrect, correctAnswer }: any) => (
    <motion.div
        key="result"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`
            w-full max-w-lg rounded-[48px] p-16 shadow-3xl text-center border-4
            ${isCorrect ? 'bg-white border-emerald-500' : 'bg-white border-rose-500'}
        `}
    >
        {isCorrect ? (
            <>
                <div className="w-24 h-24 bg-emerald-100 rounded-[32px] flex items-center justify-center mx-auto mb-8">
                    <CheckCircle2 className="w-16 h-16 text-emerald-500" strokeWidth={3} />
                </div>
                <h3 className="text-4xl font-black text-emerald-600 uppercase tracking-tight">C'est gagné !</h3>
                <p className="text-xl text-slate-500 font-bold mt-4">Félicitations, Christian ! 🎉</p>
            </>
        ) : (
            <>
                <div className="w-24 h-24 bg-rose-100 rounded-[32px] flex items-center justify-center mx-auto mb-8">
                    <XCircle className="w-16 h-16 text-rose-500" strokeWidth={3} />
                </div>
                <h3 className="text-4xl font-black text-rose-600 uppercase tracking-tight">Presque...</h3>
                <p className="text-xl text-slate-500 font-bold mt-4">La bonne réponse était :</p>
                <div className="mt-6 text-3xl font-black text-slate-800 bg-slate-50 p-6 rounded-3xl border-2 border-slate-100">
                    {correctAnswer}
                </div>
            </>
        )}
    </motion.div>
));
ResultCard.displayName = 'ResultCard';

const AllCompleteScreen = memo(({ onBack }: any) => (
    <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center bg-white/80 backdrop-blur-md rounded-[56px] p-16 md:p-24 shadow-3xl border-4 border-white"
    >
        <Trophy className="w-48 h-48 text-yellow-400 mx-auto mb-10 drop-shadow-xl animate-bounce" />
        <h1 className="text-6xl font-black text-slate-800 mb-6 tracking-tighter uppercase leading-none">
            MAÎTRE DE <br /><span className="text-orange-500">L'ORTHOGRAPHE</span>
        </h1>
        <p className="text-2xl text-slate-500 font-bold mb-12 max-w-lg mx-auto">
            Tu as gravi tous les sommets de ce parcours ! C'est une performance exceptionnelle, Christian.
        </p>
        <Button
            onClick={onBack}
            size="lg"
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-black py-8 px-16 text-2xl rounded-[32px] shadow-2xl border-b-8 border-emerald-700 active:translate-y-1 active:border-b-4"
        >
            RETOUR AU MODULE
        </Button>
    </motion.div>
));
AllCompleteScreen.displayName = 'AllCompleteScreen';

const LevelCompleteScreen = memo(({ advanced, sessionCorrect, sessionTotal, onContinue }: any) => (
    <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white/80 backdrop-blur-md rounded-[48px] p-12 md:p-16 border-4 border-white shadow-3xl text-center max-w-lg w-full"
    >
        <div className="w-40 h-40 bg-orange-100 rounded-[40px] flex items-center justify-center mx-auto mb-10 shadow-inner border-2 border-orange-200">
            {advanced ? <Award className="w-24 h-24 text-orange-500" /> : <Sparkles className="w-24 h-24 text-orange-400" />}
        </div>
        <h2 className="text-4xl font-black text-slate-800 mb-2 uppercase tracking-tight">
            {advanced ? 'Niveau Validé !' : 'Continue l\'effort !'}
        </h2>
        <p className="text-xl text-slate-500 font-bold mb-10">
            Ton score : <span className="text-orange-500 text-3xl ml-2">{sessionCorrect} / {sessionTotal}</span>
        </p>
        <Button
            onClick={onContinue}
            size="lg"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-8 text-2xl font-black rounded-[32px] shadow-xl border-b-8 border-orange-700 active:translate-y-1 active:border-b-4 transition-all"
        >
            {advanced ? 'NIVEAU SUIVANT' : 'CONTINUER'} <ChevronRight className="ml-2 w-8 h-8" strokeWidth={3} />
        </Button>
    </motion.div>
));
LevelCompleteScreen.displayName = 'LevelCompleteScreen';

const GlobalLockoutScreen = memo(({ lockoutRemaining }: { lockoutRemaining: number }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center text-slate-900 p-8 text-center"
    >
        <Lock className="w-24 h-24 text-rose-500 mb-10" />
        <h1 className="text-5xl font-black mb-6 text-rose-600 uppercase tracking-tighter">TEMPS ÉPUISÉ</h1>
        <p className="text-2xl text-slate-400 font-bold max-w-md mx-auto mb-12">
            La session est terminée pour aujourd'hui. Souviens-toi que le repos fait partie de l'apprentissage !
        </p>
        <div className="text-lg font-black text-rose-400 uppercase tracking-widest bg-rose-50 px-8 py-4 rounded-3xl border-2 border-rose-100">
            Reviens bientôt pour de nouveaux défis
        </div>
    </motion.div>
));
GlobalLockoutScreen.displayName = 'GlobalLockoutScreen';
