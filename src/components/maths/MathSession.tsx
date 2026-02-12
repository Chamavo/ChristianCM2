import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, XCircle, Calculator } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Exercise } from '@/utils/maths/exerciseGenerator';
import { parseFraction, formatAnswer } from '@/utils/maths/fractionUtils';

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
    const [timeLeft, setTimeLeft] = useState(360); // 6 minutes fixed

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
        const currentExercise = exercises[currentIndex];
        let correct = false;

        // Validation logic
        if (currentExercise.isQCM) {
            // Handle QCM differently if needed, for now assuming text input for simplicity
            // or passing selectedChoice if we implemented QCM UI.
            // But the design brief emphasized "Zone réponse: Champ large", so maybe focusing on input.
            // If QCM is required by exercise type, we should support it.
            // Let's support simple input first as per brief "Champ large, centré".
        }

        const parsedUser = parseFraction(userAnswer);
        const parsedCorrect = typeof currentExercise.answer === 'string' ? parseFraction(currentExercise.answer) : currentExercise.answer;

        if (parsedUser !== null && parsedCorrect !== null && Math.abs(parsedUser - parsedCorrect) < 0.01) {
            correct = true;
        }

        setIsCorrect(correct);
        if (correct) {
            setScore(s => s + 1);
            // Confetti for correct answer
            confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.7 }
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
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* Header */}
            <div className="bg-white p-4 shadow-sm flex justify-between items-center text-slate-800">
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Niveau</span>
                    <span className="text-2xl font-black text-blue-600">{level}</span>
                </div>

                <div className="flex flex-col items-center">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Question</span>
                    <span className="text-xl font-bold">{currentIndex + 1} / {exercises.length}</span>
                </div>

                <div className={`flex items-center gap-2 font-mono text-2xl font-bold ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-slate-700'}`}>
                    <Clock className="w-6 h-6" />
                    {formatTime(timeLeft)}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-slate-200 w-full">
                <motion.div
                    className="h-full bg-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-4xl mx-auto w-full relative">
                <motion.div
                    key={currentIndex}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full text-center"
                >
                    <h2 className="text-5xl md:text-7xl font-black text-slate-800 mb-12 tracking-tight">
                        {currentExercise.question}
                    </h2>

                    <input
                        type="text"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleValidate()}
                        placeholder="?"
                        autoFocus
                        className="w-full max-w-xs text-center text-4xl font-bold p-4 rounded-2xl border-4 border-blue-100 focus:border-blue-500 outline-none transition-colors bg-white shadow-inner mx-auto block mb-8"
                    />

                    <button
                        onClick={handleValidate}
                        className="bg-green-500 hover:bg-green-600 text-white text-xl font-black py-4 px-12 rounded-2xl shadow-[0_4px_0_0_rgba(21,128,61,1)] hover:shadow-[0_2px_0_0_rgba(21,128,61,1)] hover:translate-y-[2px] transition-all active:shadow-none active:translate-y-[4px]"
                    >
                        VALIDER
                    </button>

                    <button
                        onClick={onExit}
                        className="absolute bottom-4 left-4 text-slate-400 hover:text-slate-600 text-sm font-medium flex items-center gap-2"
                    >
                        🏠 Menu Maths
                    </button>
                </motion.div>

                {/* Feedback Overlay */}
                <AnimatePresence>
                    {showResult && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-20 rounded-3xl"
                        >
                            <motion.div
                                initial={{ scale: 0.5 }}
                                animate={{ scale: 1 }}
                                className="text-center"
                            >
                                {isCorrect ? (
                                    <>
                                        <CheckCircle className="w-32 h-32 text-green-500 mx-auto mb-4" />
                                        <h3 className="text-4xl font-black text-green-600">BRAVO !</h3>
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="w-32 h-32 text-red-500 mx-auto mb-4" />
                                        <h3 className="text-4xl font-black text-red-600">OUPS...</h3>
                                        <p className="text-xl text-slate-600 font-bold mt-2">
                                            La réponse était : {formatAnswer(currentExercise.answer)}
                                        </p>
                                    </>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default MathSession;
