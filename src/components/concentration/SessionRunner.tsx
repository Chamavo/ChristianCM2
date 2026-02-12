import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConcentrationExercise, SessionPhase } from '@/types/concentrationTypes';
import { CheckCircle, Timer, XCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { playSound } from '@/utils/sounds';
import ExerciseRenderer from './ExerciseRenderer';

interface SessionRunnerProps {
    exercises: ConcentrationExercise[];
    phase: SessionPhase;
    onComplete: () => void;
}

const SessionRunner: React.FC<SessionRunnerProps> = ({ exercises, phase, onComplete }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [feedback, setFeedback] = useState<'success' | 'failure' | null>(null);
    const [score, setScore] = useState(0);
    const [showIntro, setShowIntro] = useState(true);

    const currentExercise = exercises[currentIndex];

    // Auto-advance placeholder
    useEffect(() => {
        if (!showIntro && !feedback) {
            // Simulate exercise completion for now since we have placeholders
            // In reality, the exercise component would callback here
        }
    }, [showIntro, feedback]);

    const handleAnswer = (correct: boolean) => {
        if (correct) {
            playSound('correct');
            setScore(s => s + 10);
            setFeedback('success');
        } else {
            playSound('incorrect');
            setFeedback('failure');
        }

        // Wait before next
        setTimeout(() => {
            setFeedback(null);
            if (currentIndex < exercises.length - 1) {
                setCurrentIndex(i => i + 1);
            } else {
                onComplete();
            }
        }, 1000);
    };

    if (showIntro) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl p-12 shadow-2xl text-center max-w-2xl mx-auto"
            >
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                    🚀
                </div>
                <h2 className="text-3xl font-black text-amber-900 mb-4 capitalize">Phase : {phase}</h2>
                <p className="text-xl text-gray-600 mb-8">
                    Tu vas avoir {exercises.length} exercices à réaliser.
                    Concentre-toi bien !
                </p>
                <Button
                    size="lg"
                    onClick={() => setShowIntro(false)}
                    className="text-xl px-12 py-6 rounded-full bg-amber-600 hover:bg-amber-700"
                >
                    C'est parti !
                </Button>
            </motion.div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8 bg-white/50 h-4 rounded-full overflow-hidden backdrop-blur-sm">
                <motion.div
                    className="h-full bg-amber-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentIndex + 1) / exercises.length) * 100}%` }}
                />
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="bg-white rounded-[2rem] shadow-2xl p-8 min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden"
                >
                    {/* Exercise View */}
                    <div className="w-full h-full flex flex-col">
                        <div className="text-center mb-6">
                            <span className="inline-block px-4 py-1 bg-gray-100 rounded-full text-sm font-bold text-gray-500 mb-2">
                                Exercice {currentIndex + 1} / {exercises.length} • {currentExercise.category}
                            </span>
                            <h3 className="text-2xl md:text-3xl font-bold text-gray-800">{currentExercise.question}</h3>
                        </div>

                        <div className="flex-grow flex items-center justify-center">
                            <ExerciseRenderer
                                exercise={currentExercise}
                                onAnswer={handleAnswer}
                            />
                        </div>
                    </div>

                    {/* Feedback Overlay */}
                    <AnimatePresence>
                        {feedback && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-10"
                            >
                                <motion.div
                                    initial={{ scale: 0.5 }}
                                    animate={{ scale: 1 }}
                                    className="text-center"
                                >
                                    {feedback === 'success' ? (
                                        <>
                                            <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-4" />
                                            <h2 className="text-4xl font-black text-green-600">Bravo ! 🎉</h2>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="w-24 h-24 text-amber-500 mx-auto mb-4" />
                                            <h2 className="text-4xl font-black text-amber-600">Oups...</h2>
                                        </>
                                    )}
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default SessionRunner;
