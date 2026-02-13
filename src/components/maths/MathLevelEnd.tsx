import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, RefreshCw, ArrowRight, Home, Clock, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import ModulePageLayout from '../shared/ModulePageLayout';

interface MathLevelEndProps {
    score: number;
    total: number;
    timeSpent: number;
    level: number;
    onRetry: () => void;
    onNext: () => void;
    onHome: () => void;
    isSuccess: boolean;
}

const MathLevelEnd: React.FC<MathLevelEndProps> = ({ score, total, timeSpent, level, onRetry, onNext, onHome, isSuccess }) => {

    useEffect(() => {
        if (isSuccess) {
            if (level % 5 === 0) {
                const duration = 3000;
                const end = Date.now() + duration;

                const frame = () => {
                    confetti({
                        particleCount: 5,
                        angle: 60,
                        spread: 55,
                        origin: { x: 0 },
                        colors: ['#3b82f6', '#10b981', '#fbbf24']
                    });
                    confetti({
                        particleCount: 5,
                        angle: 120,
                        spread: 55,
                        origin: { x: 1 },
                        colors: ['#3b82f6', '#10b981', '#fbbf24']
                    });

                    if (Date.now() < end) {
                        requestAnimationFrame(frame);
                    }
                };
                frame();
            } else {
                confetti({
                    particleCount: 150,
                    spread: 80,
                    origin: { y: 0.6 },
                    colors: ['#3b82f6', '#10b981', '#fbbf24']
                });
            }
        }
    }, [isSuccess, level]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}m ${s}s`;
    };

    return (
        <ModulePageLayout>
            <div className="min-h-[90vh] flex items-center justify-center p-6 w-full max-w-4xl mx-auto">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    className="bg-white/40 backdrop-blur-md rounded-[48px] border-4 border-white shadow-2xl p-8 md:p-16 w-full text-center relative overflow-hidden"
                >
                    {/* Decorative background element */}
                    <div className={`absolute top-0 left-0 w-full h-2 ${isSuccess ? 'bg-emerald-500' : 'bg-rose-500'}`} />

                    <div className="relative z-10">
                        {isSuccess ? (
                            <motion.div
                                initial={{ rotate: -10, scale: 0.5 }}
                                animate={{ rotate: 0, scale: 1 }}
                                className="w-40 h-40 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-[40px] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-yellow-200 border-b-8 border-orange-600"
                            >
                                <Trophy className="w-20 h-20 text-white drop-shadow-lg" />
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ scale: 0.5 }}
                                animate={{ scale: 1 }}
                                className="w-40 h-40 bg-gradient-to-br from-slate-400 to-slate-600 rounded-[40px] flex items-center justify-center mx-auto mb-10 shadow-2xl border-b-8 border-slate-800"
                            >
                                <RefreshCw className="w-20 h-20 text-white drop-shadow-lg" />
                            </motion.div>
                        )}

                        <h2 className="text-5xl font-black text-slate-800 mb-4 tracking-tight uppercase">
                            {isSuccess ? (level % 5 === 0 ? 'Exploit ! 🎉' : 'Niveau Réussi !') : 'Pas de panique !'}
                        </h2>

                        <p className="text-xl text-slate-500 font-bold mb-12 max-w-md mx-auto">
                            {isSuccess
                                ? "Tu as surmonté ce défi avec brio. Continue comme ça !"
                                : "L'entraînement est la clé du succès. On réessaie ?"}
                        </p>

                        <div className="grid grid-cols-2 gap-6 mb-12">
                            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border-2 border-white shadow-sm">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">Score</span>
                                <div className="flex items-center justify-center gap-3">
                                    <Star className={`w-8 h-8 ${isSuccess ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} />
                                    <span className={`text-4xl font-black ${isSuccess ? 'text-emerald-500' : 'text-slate-700'}`}>
                                        {score}/{total}
                                    </span>
                                </div>
                            </div>
                            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border-2 border-white shadow-sm">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">Chronomètre</span>
                                <div className="flex items-center justify-center gap-3 text-slate-700">
                                    <Clock className="w-8 h-8 text-blue-500" />
                                    <span className="text-4xl font-black">
                                        {formatTime(timeSpent)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 max-w-sm mx-auto">
                            {isSuccess && (
                                <motion.button
                                    whileHover={{ scale: 1.02, y: -4 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={onNext}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-2xl font-black py-6 rounded-[28px] shadow-xl shadow-blue-200 border-b-8 border-blue-800 flex items-center justify-center gap-3 transition-all"
                                >
                                    Niveau Suivant <ArrowRight className="w-8 h-8" strokeWidth={3} />
                                </motion.button>
                            )}

                            <motion.button
                                whileHover={{ scale: 1.02, y: -4 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onRetry}
                                className={`
                                    w-full text-2xl font-black py-6 rounded-[28px] border-b-8 flex items-center justify-center gap-3 transition-all
                                    ${!isSuccess
                                        ? 'bg-blue-600 text-white border-blue-800 shadow-xl shadow-blue-200 hover:brightness-110'
                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 shadow-lg'
                                    }
                                `}
                            >
                                <RefreshCw className="w-7 h-7" strokeWidth={3} />
                                {isSuccess ? "Recommencer" : "Réessayer"}
                            </motion.button>

                            <button
                                onClick={onHome}
                                className="mt-4 text-slate-400 hover:text-slate-600 font-black uppercase tracking-widest text-xs flex items-center gap-2 justify-center py-2 transition-colors"
                            >
                                <Home className="w-4 h-4" /> Retour au menu
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </ModulePageLayout>
    );
};

export default MathLevelEnd;
