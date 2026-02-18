
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { MathProblem } from '@/utils/maths/problemManager';
import { useUser } from '@/contexts/UserContext';

interface ProblemeSessionProps {
    problem: MathProblem;
    onBack: () => void;
    onComplete: (success: boolean) => void;
}

const ProblemeSession: React.FC<ProblemeSessionProps> = ({ problem, onBack, onComplete }) => {
    const [showHint, setShowHint] = useState(false);
    const [userAnswers, setUserAnswers] = useState<string[]>([]);
    const [showError, setShowError] = useState(false);
    const [aiHints, setAiHints] = useState<string[]>([]);
    const [hintLevel, setHintLevel] = useState(0);
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { markProblemSolved } = useUser();

    // Filter questions to remove metadata (e.g. total count info)
    const validQuestions = React.useMemo(() => {
        if (!problem.questions) return null;
        return problem.questions.filter(q => {
            const label = (q.label || '').toLowerCase();
            return !label.includes('nombre total') &&
                !label.includes('exercices traités') &&
                !label.includes('exercices sur') &&
                q.response.trim() !== ""; // Metadata entries often have empty responses or irrelevant ones
        });
    }, [problem.questions]);

    // Initialize answers size and AI hints
    React.useEffect(() => {
        if (validQuestions) {
            setUserAnswers(new Array(validQuestions.length).fill(''));
        } else {
            setUserAnswers([]);
        }
        setShowError(false);
        setShowHint(false);
        setHintLevel(0);
        setIsSuccess(false);

        // Prepare hints from the answer (correction)
        const steps = problem.answer
            .split('\n')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('RÉPONSE') && !s.startsWith('VÉRIFICATION'));

        const initialHints = [
            "Lis bien l'énoncé et repère les informations importantes (nombres, unités).",
            ...steps
        ];
        setAiHints(initialHints);
    }, [problem, validQuestions]);

    const handleAnswerChange = (index: number, value: string) => {
        const newAnswers = [...userAnswers];
        newAnswers[index] = value;
        setUserAnswers(newAnswers);
        setShowError(false);
    };

    const checkAnswers = () => {
        if (!validQuestions) {
            handleSolved();
            return;
        }

        const allCorrect = validQuestions.every((q, i) => {
            const userVal = userAnswers[i].trim().replace(/\s/g, '').replace(',', '.');
            const correctVal = q.response.trim().replace(/\s/g, '').replace(',', '.');
            const userNum = parseFloat(userVal);
            const correctNum = parseFloat(correctVal);

            if (!isNaN(userNum) && !isNaN(correctNum)) {
                return userNum === correctNum;
            }
            return userVal.toLowerCase() === correctVal.toLowerCase();
        });

        if (allCorrect) {
            handleSolved();
        } else {
            setShowError(true);
        }
    };

    const handleSolved = () => {
        setIsSuccess(true);
        markProblemSolved(problem.id);
        confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 }
        });
        setTimeout(() => {
            onComplete(true);
        }, 1500);
    };

    const getNextHint = () => {
        if (isAiThinking) return;

        setIsAiThinking(true);
        setTimeout(() => {
            if (!showHint) {
                setShowHint(true);
                setHintLevel(0);
            } else if (hintLevel < aiHints.length - 1) {
                setHintLevel(hintLevel + 1);
            }
            setIsAiThinking(false);
        }, 800);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center font-nunito">
            {/* Header */}
            <div className="w-full max-w-4xl flex items-center justify-between mb-8">
                <button
                    onClick={onBack}
                    className="p-2 rounded-full hover:bg-slate-200 transition-colors flex items-center gap-2 text-slate-600 font-bold"
                >
                    <ArrowLeft className="w-6 h-6" />
                    Retour
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Mathématiques</span>
                    <h2 className="text-2xl font-black text-slate-800 uppercase">Problème {problem.id}</h2>
                </div>
                <div className="w-24" />
            </div>

            {/* Content */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[48px] shadow-3xl p-8 md:p-12 max-w-4xl w-full border-4 border-white relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[100px] -z-10" />

                <div className="prose prose-lg max-w-none mb-12">
                    <h1 className="text-4xl font-black text-slate-800 mb-6 tracking-tight">{problem.title}</h1>
                    <div className="text-2xl text-slate-700 whitespace-pre-wrap leading-relaxed font-bold bg-slate-50 p-8 rounded-[32px] border-2 border-slate-100 italic">
                        {problem.text}
                    </div>
                </div>

                {/* Structured Inputs */}
                {validQuestions && (
                    <div className="mb-12 flex flex-col gap-8">
                        {validQuestions.map((q, idx) => (
                            <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-6 bg-white p-8 rounded-[32px] border-4 border-slate-50 shadow-xl transition-all hover:border-blue-100">
                                {q.label && (
                                    <span className="font-black text-slate-800 min-w-[140px] text-xl uppercase tracking-tight">{q.label} :</span>
                                )}
                                <div className="flex items-center gap-4 flex-1">
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        placeholder="Ton résultat..."
                                        value={userAnswers[idx] || ''}
                                        onChange={(e) => handleAnswerChange(idx, e.target.value)}
                                        className={`w-full max-w-[240px] p-5 text-3xl font-black rounded-2xl border-4 outline-none transition-all shadow-inner ${showError ? 'border-red-400 bg-red-50 text-red-600 animate-shake' : 'border-slate-100 focus:border-blue-500 focus:bg-white text-blue-600'
                                            }`}
                                    />
                                    {q.unit && (
                                        <span className="text-2xl font-black text-slate-300 uppercase tracking-widest">{q.unit}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-10">
                    <AnimatePresence>
                        {(showHint || isAiThinking) && (
                            <motion.div
                                initial={{ height: 0, opacity: 0, y: 20 }}
                                animate={{ height: 'auto', opacity: 1, y: 0 }}
                                exit={{ height: 0, opacity: 0, y: 20 }}
                                className="overflow-hidden"
                            >
                                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-8 rounded-[40px] border-4 border-white text-slate-800 shadow-2xl relative mb-4">
                                    <div className="flex items-start gap-8">
                                        <div className={`w-20 h-20 bg-amber-400 rounded-3xl flex items-center justify-center shrink-0 shadow-lg border-4 border-white transition-all ${isAiThinking ? 'animate-bounce' : ''}`}>
                                            <HelpCircle className="w-12 h-12 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-black text-2xl mb-4 text-amber-600 uppercase tracking-[0.1em] flex items-center gap-3">
                                                L'Assistant IA conseille :
                                                {isAiThinking && <span className="flex gap-1"><span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" /><span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:0.2s]" /><span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:0.4s]" /></span>}
                                            </p>

                                            {!isAiThinking && (
                                                <div className="flex flex-col gap-4">
                                                    {aiHints.slice(0, hintLevel + 1).map((hint, i) => (
                                                        <motion.div
                                                            key={i}
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            className={`text-xl font-black leading-relaxed p-4 rounded-2xl ${i === hintLevel ? 'bg-white shadow-md text-slate-800' : 'text-slate-400'}`}
                                                        >
                                                            {hint}
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            )}

                                            {hintLevel < aiHints.length - 1 && !isAiThinking && (
                                                <button
                                                    onClick={getNextHint}
                                                    className="mt-6 text-amber-600 font-black underline hover:text-amber-800 transition-colors uppercase text-sm tracking-widest"
                                                >
                                                    Encore un indice...
                                                </button>
                                            )}
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
                                <div className="bg-rose-500 p-6 rounded-[32px] text-white font-black text-center border-b-8 border-rose-700 text-2xl shadow-xl animate-shake">
                                    Oups ! Pas tout à fait... <br />
                                    <span className="text-lg opacity-80">Vérifie tes calculs ou demande à l'IA !</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex flex-col sm:flex-row gap-8 justify-center items-center border-t-4 border-slate-50 pt-12">
                        <button
                            onClick={getNextHint}
                            disabled={isAiThinking}
                            className={`
                                flex items-center justify-center gap-4 px-12 py-6 rounded-[32px] text-2xl font-black transition-all border-b-[10px] active:border-b-0 active:translate-y-2
                                ${showHint
                                    ? 'bg-amber-100 text-amber-600 border-amber-200'
                                    : 'bg-amber-400 text-white border-amber-600 hover:scale-105 shadow-2xl shadow-amber-100'
                                }
                            `}
                        >
                            <HelpCircle className="w-10 h-10" />
                            {showHint ? "Plus d'aide" : "Aide IA"}
                        </button>

                        <button
                            onClick={checkAnswers}
                            className={`
                                flex items-center justify-center gap-5 px-16 py-6 rounded-[32px] text-3xl font-black transition-all shadow-2xl border-b-[10px] hover:scale-105 active:border-b-0 active:translate-y-2
                                ${isSuccess
                                    ? 'bg-emerald-500 text-white border-emerald-700'
                                    : 'bg-blue-600 text-white border-blue-800 shadow-blue-100'
                                }
                            `}
                        >
                            <Check className="w-12 h-12 stroke-[4]" />
                            {isSuccess ? "PARFAIT !" : (problem.questions ? "VALIDER" : "TROUVÉ !")}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};


export default ProblemeSession;
