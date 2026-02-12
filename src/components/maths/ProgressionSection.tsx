import React, { useState, useEffect } from 'react';
import { Brain, Trophy, Clock, Target, ChevronRight, ChevronLeft, CheckCircle, XCircle, RotateCcw, Star, AlertCircle, Lock, Home, Calculator } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateLevelExercises, Exercise, getLevelInfo, ALL_LEVELS, getNextLevel } from '@/utils/maths/exerciseGenerator';
import { parseFraction, formatAnswer, isFractionQuestion, isInputFractionFormat } from '@/utils/maths/fractionUtils';
import { validateFractionAnswer } from '@/utils/maths/fractionValidation';
import { useEvaluation } from '@/hooks/maths/useEvaluation';
import { useAITutor } from '@/hooks/maths/useAITutor';
import AITutorDialog from './AITutorDialog';
import confetti from 'canvas-confetti';
import {
    getBlockingInfo,
    recordLevelFailure,
    recordLevelSuccess,
    markLevelStarted,
    markLevelCompleted,
    checkAndRecordAbandon,
    LevelBlockInfo
} from '@/utils/maths/levelBlockingSystem';
import MathsAppHeader from './MathsAppHeader';
import { AppSession } from '@/types/mathsTypes';

const triggerConfetti = () => {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });
};

const PASS_SCORE = 8;

interface ExerciseResult {
    exerciseId: string;
    question: string;
    userAnswer: number | null;
    correctAnswer: number | string;
    correct: boolean;
    timeSpent: number;
    category: string;
}

interface ProgressionSectionProps {
    session: AppSession;
    onBack: () => void;
    onLogout: () => void;
    onUpdateSession: (session: AppSession) => void;
}

const ProgressionSection: React.FC<ProgressionSectionProps> = ({
    session,
    onBack,
    onLogout,
    onUpdateSession,
}) => {
    const [currentLevel, setCurrentLevel] = useState<number>(session.level);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
    const [results, setResults] = useState<ExerciseResult[]>([]);
    const [startTime, setStartTime] = useState<number>(0);
    const [sessionStartTime, setSessionStartTime] = useState<number>(0);
    const [isTestMode, setIsTestMode] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false);
    const [blockingInfo, setBlockingInfo] = useState<LevelBlockInfo | null>(null);
    const [showAIHelp, setShowAIHelp] = useState(false);
    const [currentQuestionForAI, setCurrentQuestionForAI] = useState<Exercise | null>(null);

    const { askForHelp, isLoading: isAILoading, aiMessage, clearMessage } = useAITutor();

    useEffect(() => {
        const initBlockingInfo = async () => {
            const updatedInfo = await checkAndRecordAbandon(session.username);
            setBlockingInfo(updatedInfo || await getBlockingInfo(session.username));
        };
        initBlockingInfo();
    }, [session.username]);

    const startLevel = async (level: number) => {
        await markLevelStarted(session.username, level);
        setCurrentLevel(level);
        const newExercises = generateLevelExercises(level);
        setExercises(newExercises);
        setCurrentExerciseIndex(0);
        setResults([]);
        setUserAnswer('');
        setSelectedChoice(null);
        setStartTime(Date.now());
        setSessionStartTime(Date.now());
        setIsTestMode(true);
        setShowResult(false);
    };

    const submitAnswer = () => {
        const currentExercise = exercises[currentExerciseIndex];
        let parsedAnswer: number | null = null;
        let needsSimplification = false;

        if (currentExercise.isQCM && selectedChoice !== null) {
            parsedAnswer = selectedChoice;
        } else {
            parsedAnswer = parseFraction(userAnswer);
        }

        if (parsedAnswer === null) return;

        const correctAnswerNum = typeof currentExercise.answer === 'string'
            ? parseFraction(currentExercise.answer) || 0
            : currentExercise.answer;

        const valueCorrect = Math.abs(parsedAnswer - correctAnswerNum) < 0.01;
        const correct = valueCorrect && !needsSimplification;

        const newResult: ExerciseResult = {
            exerciseId: currentExercise.id,
            question: currentExercise.question,
            userAnswer: parsedAnswer,
            correctAnswer: currentExercise.answer,
            correct,
            timeSpent: Date.now() - startTime,
            category: currentExercise.category,
        };

        setResults([...results, newResult]);
        setLastAnswerCorrect(correct);
        setShowResult(true);

        setTimeout(() => {
            if (currentExerciseIndex < exercises.length - 1) {
                setCurrentExerciseIndex(currentExerciseIndex + 1);
                setUserAnswer('');
                setSelectedChoice(null);
                setStartTime(Date.now());
                setShowResult(false);
            } else {
                finishLevel();
            }
        }, correct ? 1000 : 3000);
    };

    const finishLevel = async () => {
        const correctCount = results.filter(r => r.correct).length + (lastAnswerCorrect ? 1 : 0);
        const isSuccess = correctCount >= PASS_SCORE;

        await markLevelCompleted(session.username, currentLevel);

        if (isSuccess) {
            await recordLevelSuccess(session.username, currentLevel);
            triggerConfetti();
            const nextLevel = getNextLevel(currentLevel);
            onUpdateSession({ ...session, level: nextLevel });
        } else {
            const info = await recordLevelFailure(session.username, currentLevel);
            setBlockingInfo(info);
        }
        setIsTestMode(false);
    };

    const levelInfo = getLevelInfo(currentLevel);

    if (!isTestMode) {
        return (
            <div className="min-h-screen gradient-bg p-4 sm:p-8">
                <MathsAppHeader username={session.username} onBack={onBack} />
                <div className="max-w-4xl mx-auto mt-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border-2 border-white/20 text-center text-white"
                    >
                        <Trophy className="w-20 h-20 text-yellow-300 mx-auto mb-6" />
                        <h2 className="text-4xl font-bold mb-4">Niveau {currentLevel}</h2>
                        <p className="text-xl mb-8 text-white/80">{levelInfo.name} - Prêt pour l'aventure ?</p>

                        {blockingInfo?.isBlocked && blockingInfo.level === currentLevel ? (
                            <div className="bg-red-500/20 border-2 border-red-500/50 rounded-2xl p-6 mb-8">
                                <Lock className="w-12 h-12 text-red-500 mx-auto mb-4" />
                                <p className="text-red-200 font-bold">Niveau bloqué ! Récupère un peu avant de réessayer. 🔒</p>
                            </div>
                        ) : (
                            <button
                                onClick={() => startLevel(currentLevel)}
                                className="bg-warning hover:bg-warning/90 text-amber-950 font-black text-2xl py-6 px-12 rounded-full shadow-glow-yellow transition-all"
                            >
                                C'EST PARTI ! 🚀
                            </button>
                        )}

                        <button
                            onClick={onBack}
                            className="block mx-auto mt-6 text-white/60 hover:text-white transition-colors"
                        >
                            Retour à l'accueil
                        </button>
                    </motion.div>
                </div>
            </div>
        );
    }

    const currentExercise = exercises[currentExerciseIndex];

    if (!currentExercise) {
        return (
            <div className="min-h-screen gradient-bg p-4 sm:p-8 flex flex-col items-center justify-center text-white text-center">
                <AlertCircle className="w-20 h-20 text-red-400 mb-6" />
                <h2 className="text-3xl font-bold mb-4">Oups ! Une erreur est survenue.</h2>
                <p className="text-xl mb-8">Impossible de charger les exercices pour ce niveau.</p>
                <button
                    onClick={onBack}
                    className="bg-white text-primary font-bold py-3 px-8 rounded-full shadow-lg hover:scale-105 transition-transform"
                >
                    Retour à l'accueil
                </button>
            </div>
        );
    }

    const progress = ((currentExerciseIndex + 1) / exercises.length) * 100;

    return (
        <div className="min-h-screen gradient-bg p-4 sm:p-8 flex flex-col">
            <div className="max-w-3xl w-full mx-auto flex-1 flex flex-col">
                <div className="w-full bg-white/20 rounded-full h-4 mb-8 overflow-hidden">
                    <motion.div
                        className="bg-warning h-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                    />
                </div>

                <motion.div
                    key={currentExerciseIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-[2rem] shadow-2xl p-8 sm:p-12 flex-1 flex flex-col"
                >
                    <div className="flex justify-between items-center mb-8">
                        <span className="bg-blue-100 text-primary px-4 py-2 rounded-full font-bold">
                            Question {currentExerciseIndex + 1} / {exercises.length}
                        </span>
                        <div className="flex items-center gap-2 text-primary font-bold">
                            <Clock className="w-5 h-5" />
                            {Math.floor((Date.now() - sessionStartTime) / 1000)}s
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <h3 className="text-3xl sm:text-5xl font-black text-gray-800 mb-12">
                            {currentExercise.question}
                        </h3>

                        {currentExercise.isQCM && currentExercise.choices ? (
                            <div className="grid grid-cols-2 gap-4 w-full">
                                {currentExercise.choices.map((choice, idx) => (
                                    <motion.button
                                        key={idx}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSelectedChoice(choice)}
                                        className={`p-6 rounded-2xl text-2xl font-bold border-4 transition-all ${selectedChoice === choice
                                            ? 'bg-primary text-white border-primary'
                                            : 'bg-white text-primary border-blue-100 hover:border-primary'
                                            }`}
                                    >
                                        {formatAnswer(choice)}
                                    </motion.button>
                                ))}
                            </div>
                        ) : (
                            <input
                                autoFocus
                                type="text"
                                value={userAnswer}
                                onChange={(e) => setUserAnswer(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && submitAnswer()}
                                className="w-full max-w-md text-center text-4xl font-black p-6 rounded-2xl border-4 border-blue-100 focus:border-primary outline-none text-primary"
                                placeholder="?"
                            />
                        )}
                    </div>

                    <div className="mt-8 flex justify-center">
                        <button
                            onClick={submitAnswer}
                            disabled={showResult || (!selectedChoice && !userAnswer)}
                            className="bg-primary hover:bg-primary/90 text-white font-black text-xl py-4 px-12 rounded-full shadow-lg transition-all disabled:opacity-50"
                        >
                            VALIDER ✅
                        </button>
                    </div>

                    <AnimatePresence>
                        {showResult && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                className={`absolute inset-0 flex items-center justify-center bg-white/90 rounded-[2rem] z-20`}
                            >
                                <div className="text-center">
                                    {lastAnswerCorrect ? (
                                        <>
                                            <CheckCircle className="w-32 h-32 text-green-500 mx-auto mb-4" />
                                            <h4 className="text-4xl font-black text-green-600 uppercase">Super !</h4>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="w-32 h-32 text-red-500 mx-auto mb-4" />
                                            <h4 className="text-4xl font-black text-red-600 uppercase">Oups...</h4>
                                            <p className="text-xl font-bold text-gray-600 mt-4">
                                                La réponse était : {formatAnswer(currentExercise.answer)}
                                            </p>
                                            {currentExercise.hint && (
                                                <p className="mt-4 text-blue-600 italic">💡 {currentExercise.hint}</p>
                                            )}
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                <div className="mt-6 flex justify-center gap-4">
                    <button
                        onClick={() => {
                            setCurrentQuestionForAI(currentExercise);
                            setShowAIHelp(true);
                        }}
                        className="flex items-center gap-2 text-white font-bold bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-xl transition-all"
                    >
                        <Brain className="w-5 h-5" /> Aide Prof AI
                    </button>
                </div>
            </div>

            <AITutorDialog
                isOpen={showAIHelp}
                onClose={() => setShowAIHelp(false)}
                question={currentQuestionForAI?.question || ''}
                userAnswer={userAnswer}
                correctAnswer={formatAnswer(currentExercise?.answer || 0)}
                hint={currentExercise?.hint}
            />
        </div>
    );
};

export default ProgressionSection;
