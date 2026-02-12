
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { MathProblem, saveProblemStatus } from '@/utils/maths/problemManager';

interface ProblemeSessionProps {
    problem: MathProblem;
    onBack: () => void;
    onComplete: (success: boolean) => void;
}

const ProblemeSession: React.FC<ProblemeSessionProps> = ({ problem, onBack, onComplete }) => {
    const [showHint, setShowHint] = useState(false);
    const [userAnswers, setUserAnswers] = useState<string[]>([]);
    const [showError, setShowError] = useState(false);

    // Initialize answers size
    React.useEffect(() => {
        if (problem.questions) {
            setUserAnswers(new Array(problem.questions.length).fill(''));
        } else {
            setUserAnswers([]);
        }
        setShowError(false);
    }, [problem]);

    const handleAnswerChange = (index: number, value: string) => {
        const newAnswers = [...userAnswers];
        newAnswers[index] = value;
        setUserAnswers(newAnswers);
        setShowError(false);
    };

    const checkAnswers = () => {
        if (!problem.questions) {
            handleSolved();
            return;
        }

        const allCorrect = problem.questions.every((q, i) => {
            const userVal = userAnswers[i].trim().replace(/\s/g, '').replace(',', '.');
            const correctVal = q.response.trim().replace(/\s/g, '').replace(',', '.');
            return userVal === correctVal;
        });

        if (allCorrect) {
            handleSolved();
        } else {
            setShowError(true);
            // Shake effect or sound could be added here
        }
    };

    const handleSolved = () => {
        saveProblemStatus(problem.id, 'solved');
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
        setTimeout(() => {
            onComplete(true);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center">
            {/* Header */}
            <div className="w-full max-w-4xl flex items-center justify-between mb-8">
                <button
                    onClick={onBack}
                    className="p-2 rounded-full hover:bg-slate-200 transition-colors flex items-center gap-2 text-slate-600 font-bold"
                >
                    <ArrowLeft className="w-6 h-6" />
                    Retour
                </button>
                <h2 className="text-2xl font-black text-slate-800">Problème {problem.id}</h2>
                <div className="w-24" /> {/* Spacer */}
            </div>

            {/* Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-xl p-8 md:p-12 max-w-4xl w-full border-b-8 border-slate-200"
            >
                <div className="prose prose-lg max-w-none mb-12">
                    <h1 className="text-3xl font-black text-blue-600 mb-6">{problem.title}</h1>
                    <div className="text-2xl text-slate-800 whitespace-pre-wrap leading-relaxed font-medium">
                        {problem.text}
                    </div>
                </div>

                {/* Structured Inputs */}
                {problem.questions && (
                    <div className="mb-12 flex flex-col gap-6">
                        {problem.questions.map((q, idx) => (
                            <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-4 bg-slate-50 p-6 rounded-2xl border-2 border-slate-100">
                                {q.label && (
                                    <span className="font-bold text-slate-700 min-w-[120px]">{q.label} :</span>
                                )}
                                <div className="flex items-center gap-3 flex-1">
                                    <input
                                        type="text"
                                        placeholder="?"
                                        value={userAnswers[idx] || ''}
                                        onChange={(e) => handleAnswerChange(idx, e.target.value)}
                                        className={`w-full max-w-[200px] p-3 text-xl font-bold rounded-xl border-2 outline-none transition-all ${showError ? 'border-red-300 bg-red-50' : 'border-slate-300 focus:border-blue-400 focus:bg-white'
                                            }`}
                                    />
                                    {q.unit && (
                                        <span className="text-xl font-bold text-slate-500">{q.unit}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-8">

                    <AnimatePresence>
                        {showHint && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="bg-yellow-50 p-6 rounded-2xl border-l-8 border-yellow-400 text-yellow-900 text-lg font-medium shadow-sm">
                                    <div className="flex items-start gap-4">
                                        <HelpCircle className="w-8 h-8 text-yellow-500 shrink-0" />
                                        <div>
                                            <p className="font-bold mb-2">Indice :</p>
                                            <p>Lis bien la question et repère les chiffres importants. Fais un schéma si besoin !</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        {showError && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="bg-red-50 p-4 rounded-xl text-red-600 font-bold text-center">
                                    Oups ! Ce n'est pas tout à fait ça. Vérifie tes calculs.
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center border-t-2 border-slate-100 pt-8">

                        <button
                            onClick={() => setShowHint(!showHint)}
                            className={`
                                flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-xl font-bold transition-all border-b-4 active:border-b-0 active:translate-y-1
                                ${showHint
                                    ? 'bg-slate-100 text-slate-500 border-slate-300'
                                    : 'bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200'
                                }
                            `}
                        >
                            <HelpCircle className="w-6 h-6" />
                            {showHint ? "Masquer l'indice" : "J'ai besoin d'aide"}
                        </button>

                        <button
                            onClick={checkAnswers}
                            className="flex items-center justify-center gap-3 bg-green-500 text-white px-10 py-4 rounded-2xl text-xl font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-200 hover:scale-105 border-b-4 border-green-700 active:border-b-0 active:translate-y-1"
                        >
                            <Check className="w-7 h-7 stroke-[3]" />
                            {problem.questions ? "Valider" : "J'ai trouvé !"}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ProblemeSession;
