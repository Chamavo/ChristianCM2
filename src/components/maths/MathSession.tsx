import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, XCircle, Calculator, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Exercise } from '@/utils/maths/exerciseGenerator';
import { parseFraction, formatAnswer } from '@/utils/maths/fractionUtils';
import ModulePageLayout from '../shared/ModulePageLayout';

interface MathSessionProps {
    level: number;
    exercises: Exercise[];
    onComplete: (score: number, timeSpent: number) => void;
    onExit: () => void;
}

const MathSession: React.FC<MathSessionProps> = ({ level, exercises, onComplete, onExit }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [score, setScore] = useState(0);
    const [startTime] = useState(Date.now());
    const [timeLeft, setTimeLeft] = useState(360);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onComplete(score, Math.floor((Date.now() - startTime) / 1000));
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [score, startTime, onComplete]);

    const handleValidate = () => {
        if (showResult) return;
        const currentExercise = exercises[currentIndex];
        let correct = false;

        const parsedUser = parseFraction(userAnswer);
        const parsedCorrect = typeof currentExercise.answer === 'string' ? parseFraction(currentExercise.answer) : currentExercise.answer;

        if (parsedUser !== null && parsedCorrect !== null && Math.abs(parsedUser - parsedCorrect) < 0.01) {
            correct = true;
        }

        setIsCorrect(correct);
        if (correct) {
            setScore(s => s + 1);
            confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#3b82f6', '#10b981', '#fbbf24']
            });
        }
        setShowResult(true);

        setTimeout(() => {
            setShowResult(false);
            setUserAnswer('');
            if (currentIndex < exercises.length - 1) {
                setCurrentIndex(i => i + 1);
            } else {
                onComplete(correct ? score + 1 : score, Math.floor((Date.now() - startTime) / 1000));
            }
        }, 1500);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const currentExercise = exercises[currentIndex];
    const progress = ((currentIndex) / exercises.length) * 100;

    return (
        <ModulePageLayout>
            <div className="w-full max-w-5xl mx-auto px-6 py-8 flex flex-col min-h-[90vh]">
                {/* Session Header */}
                <div className="bg-white/80 backdrop-blur-md rounded-[32px] p-6 border-4 border-white shadow-xl flex flex-wrap items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-100 p-3 rounded-2xl shadow-inner border border-blue-200">
                            <Calculator className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Niveau</p>
                            <p className="text-xl font-black text-slate-800 tracking-tight">{level}</p>
                        </div>
                    </div>

                    <div className="flex-1 max-w-xs px-8">
                        <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                            <span>Question {currentIndex + 1} / {exercises.length}</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-4 bg-slate-100 rounded-full overflow-hidden border-2 border-slate-200 shadow-inner p-0.5">
                            <motion.div
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    <div className={`px-6 py-3 rounded-2xl border-2 flex items-center gap-3 font-mono text-xl font-black shadow-sm ${timeLeft < 60 ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse' : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}>
                        <Clock className="w-5 h-5" />
                        {formatTime(timeLeft)}
                    </div>
                </div>

                {/* Exercise Area */}
                <div className="flex-1 flex flex-col items-center justify-center relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -50, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="bg-white/40 backdrop-blur-sm rounded-[42px] border-4 border-white p-12 md:p-20 shadow-2xl w-full text-center relative overflow-hidden"
                        >
                            <h2 className="text-6xl md:text-8xl font-black text-slate-800 mb-16 tracking-tight drop-shadow-sm">
                                {currentExercise.question}
                            </h2>

                            <div className="max-w-md mx-auto relative">
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={userAnswer}
                                    onChange={(e) => setUserAnswer(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && userAnswer && handleValidate()}
                                    placeholder="?"
                                    autoFocus
                                    className="w-full text-center text-5xl font-black p-8 rounded-[32px] border-4 border-blue-100 focus:border-blue-500 focus:ring-8 focus:ring-blue-500/10 outline-none transition-all bg-white shadow-2xl placeholder:text-slate-200 text-slate-800"
                                />

                                <motion.button
                                    whileHover={userAnswer ? { scale: 1.05 } : {}}
                                    whileTap={userAnswer ? { scale: 0.95 } : {}}
                                    onClick={handleValidate}
                                    disabled={!userAnswer}
                                    className={`
                                        mt-10 w-full py-6 rounded-[24px] text-2xl font-black flex items-center justify-center gap-3 transition-all border-b-8
                                        ${userAnswer
                                            ? 'bg-blue-600 text-white border-blue-800 shadow-xl shadow-blue-200 hover:brightness-110'
                                            : 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed contrast-75'}
                                        active:border-b-4 active:translate-y-1
                                    `}
                                >
                                    VALIDER <ChevronRight className="w-8 h-8" strokeWidth={3} />
                                </motion.button>
                            </div>

                            {/* Decorative background number */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20rem] font-black text-slate-500/5 -z-10 select-none">
                                {currentIndex + 1}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Feedback Overlay */}
                    <AnimatePresence>
                        {showResult && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-50 flex items-center justify-center p-6"
                            >
                                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md rounded-[42px]" />
                                <motion.div
                                    initial={{ scale: 0.5, y: 20 }}
                                    animate={{ scale: 1, y: 0 }}
                                    className={`
                                        relative rounded-[42px] p-12 md:p-16 border-4 shadow-3xl text-center max-w-sm w-full
                                        ${isCorrect ? 'bg-white border-emerald-500' : 'bg-white border-rose-500'}
                                    `}
                                >
                                    {isCorrect ? (
                                        <>
                                            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <CheckCircle className="w-16 h-16 text-emerald-500" strokeWidth={3} />
                                            </div>
                                            <h3 className="text-4xl font-black text-emerald-600 uppercase tracking-tight">Gagné !</h3>
                                            <p className="text-slate-500 font-bold mt-2">C'est la bonne réponse !</p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <XCircle className="w-16 h-16 text-rose-500" strokeWidth={3} />
                                            </div>
                                            <h3 className="text-4xl font-black text-rose-600 uppercase tracking-tight">Oups !</h3>
                                            <p className="text-slate-500 font-bold mt-2">La réponse était :</p>
                                            <div className="mt-4 text-3xl font-black text-slate-800 bg-slate-50 p-4 rounded-2xl border-2 border-slate-100">
                                                {formatAnswer(currentExercise.answer)}
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="mt-8 flex justify-center">
                    <button
                        onClick={onExit}
                        className="text-slate-400 hover:text-slate-600 font-black uppercase tracking-widest text-xs flex items-center gap-2 transition-colors py-2 px-4 rounded-xl hover:bg-slate-100"
                    >
                        Quitter la session
                    </button>
                </div>
            </div>
        </ModulePageLayout>
    );
};

export default MathSession;
