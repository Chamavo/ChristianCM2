import React from 'react';
import { motion } from 'framer-motion';
import { Calculator, BookOpen, ArrowLeft } from 'lucide-react';
import ModulePageLayout from '../shared/ModulePageLayout';
import LogoutButton from '../shared/LogoutButton';

interface MathLandingProps {
    level: number;
    totalProblems: number;
    solvedProblemsCount: number;
    onSelectCalcul: () => void;
    onSelectProblemes: () => void;
    onBack: () => void;
}

const MathLanding: React.FC<MathLandingProps> = ({
    level,
    totalProblems,
    solvedProblemsCount,
    onSelectCalcul,
    onSelectProblemes,
    onBack
}) => {
    return (
        <ModulePageLayout className="min-h-screen">
            <div className="flex flex-col items-center justify-center p-6 gap-8 relative w-full h-full min-h-[90vh]">
                <motion.button
                    whileHover={{ scale: 1.1, x: -5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onBack}
                    className="absolute top-6 left-6 p-3 rounded-full bg-white shadow-md hover:bg-slate-50 transition-colors border-2 border-slate-100 z-30"
                >
                    <ArrowLeft className="w-6 h-6 text-slate-700" />
                </motion.button>

                <div className="absolute top-6 right-6 z-30">
                    <LogoutButton />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-4"
                >
                    <span className="text-sm font-black text-blue-500 uppercase tracking-widest mb-2 block">Christian CM2</span>
                    <h1 className="text-4xl md:text-7xl font-black text-slate-800 mb-2 uppercase tracking-tight">Mathématiques</h1>
                    <p className="text-xl text-slate-500 font-bold uppercase tracking-wider">Choisis ton défi !</p>
                </motion.div>

                <div className="w-full max-w-4xl flex flex-col gap-8">
                    {/* Bande Calcul */}
                    <motion.button
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onSelectCalcul}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[32px] p-8 flex items-center justify-between shadow-2xl shadow-blue-200 group relative overflow-hidden border-b-8 border-blue-800"
                    >
                        <div className="relative z-10 flex items-center gap-6 text-left">
                            <div className="bg-white/20 p-5 rounded-2xl backdrop-blur-md shadow-inner">
                                <Calculator className="w-14 h-14 text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl md:text-4xl font-black text-white mb-1 uppercase">Calcul Rapide</h2>
                                <p className="text-blue-100 font-bold text-lg">50 Niveaux • Rapidité • Précision</p>
                            </div>
                        </div>
                        <div className="relative z-10 bg-white/20 px-8 py-3 rounded-2xl backdrop-blur-md border border-white/30 shadow-lg">
                            <span className="text-white font-black text-xl">NIVEAU {level}</span>
                        </div>

                        {/* Decor */}
                        <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-white/10 to-transparent transform skew-x-12 translate-x-32 group-hover:translate-x-16 transition-transform duration-700" />
                    </motion.button>

                    {/* Bande Problèmes */}
                    <motion.button
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onSelectProblemes}
                        className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-[32px] p-8 flex items-center justify-between shadow-2xl shadow-purple-200 group relative overflow-hidden border-b-8 border-purple-800"
                    >
                        <div className="relative z-10 flex items-center gap-6 text-left">
                            <div className="bg-white/20 p-5 rounded-2xl backdrop-blur-md shadow-inner">
                                <BookOpen className="w-14 h-14 text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl md:text-4xl font-black text-white mb-1 uppercase">{totalProblems} Problèmes au CM2</h2>
                                <p className="text-purple-100 font-bold text-lg">Raisonnement • Logique • Enigmes</p>
                            </div>
                        </div>
                        <div className="relative z-10 bg-white/20 px-8 py-3 rounded-2xl backdrop-blur-md border border-white/30 shadow-lg">
                            <span className="text-white font-black text-xl">{solvedProblemsCount} / {totalProblems}</span>
                        </div>

                        {/* Decor */}
                        <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-white/10 to-transparent transform skew-x-12 translate-x-32 group-hover:translate-x-16 transition-transform duration-700" />
                    </motion.button>
                </div>
            </div>
        </ModulePageLayout>
    );
};

export default MathLanding;
