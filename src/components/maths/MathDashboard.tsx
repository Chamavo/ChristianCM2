import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Star, Calculator } from 'lucide-react';
import ModulePageLayout from '../shared/ModulePageLayout';
import ModuleHeader from '../shared/ModuleHeader';

interface MathDashboardProps {
    currentLevel: number;
    username: string;
    onStartLevel: (level: number) => void;
    onBack: () => void;
}

const TOTAL_LEVELS = 50;

const MathDashboard: React.FC<MathDashboardProps> = ({ currentLevel, username, onStartLevel, onBack }) => {
    const progressPercentage = Math.min(100, Math.round(((currentLevel - 1) / TOTAL_LEVELS) * 100));
    const levels = Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1);

    return (
        <ModulePageLayout>
            <div className="max-w-7xl w-full mx-auto px-6 py-10">
                <ModuleHeader
                    title="Calcul Rapide"
                    subtitle={`${TOTAL_LEVELS} Niveaux d'entraînement`}
                    icon={Calculator}
                    onBack={onBack}
                    variant="maths"
                />

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Progress Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white/80 backdrop-blur-md rounded-[32px] p-8 border-4 border-white shadow-xl">
                            <div className="flex flex-col items-center text-center gap-4 mb-8">
                                <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center text-4xl shadow-inner border-2 border-blue-200">
                                    🎓
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{username}</h2>
                                    <p className="text-slate-500 font-bold uppercase text-xs tracking-widest mt-1">Explorateur Mathématique</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-black text-slate-500 uppercase tracking-widest mb-1">
                                    <span>Progression</span>
                                    <span>{progressPercentage}%</span>
                                </div>
                                <div className="h-6 bg-slate-100 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-inner p-1">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressPercentage}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                    />
                                </div>
                                <p className="text-center text-xs font-bold text-slate-400 mt-2 uppercase">
                                    {currentLevel - 1} / {TOTAL_LEVELS} COMPLÉTÉS
                                </p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-[32px] p-8 text-white shadow-xl shadow-yellow-100 border-b-8 border-orange-600">
                            <Star className="w-10 h-10 mb-4 text-white drop-shadow-md" />
                            <h3 className="text-xl font-black uppercase mb-1">Défi du jour</h3>
                            <p className="font-bold text-yellow-100 leading-tight">Termine 3 nouveaux niveaux pour gagner un badge !</p>
                        </div>
                    </div>

                    {/* Levels Grid */}
                    <div className="lg:col-span-3">
                        <div className="bg-white/40 backdrop-blur-sm rounded-[42px] p-8 md:p-12 border-4 border-white shadow-2xl">
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-6">
                                {levels.map((level) => {
                                    const isCompleted = level < currentLevel;
                                    const isUnlocked = level === currentLevel;
                                    const isLocked = level > currentLevel;

                                    return (
                                        <motion.button
                                            key={level}
                                            onClick={() => !isLocked && onStartLevel(level)}
                                            disabled={isLocked}
                                            whileHover={!isLocked ? { scale: 1.1, y: -5 } : {}}
                                            whileTap={!isLocked ? { scale: 0.9 } : {}}
                                            className={`
                                                relative aspect-square rounded-[28px] flex flex-col items-center justify-center p-4 transition-all duration-200
                                                border-4 border-b-8
                                                ${isCompleted
                                                    ? 'bg-emerald-500 border-emerald-700 text-white shadow-lg shadow-emerald-100'
                                                    : isUnlocked
                                                        ? 'bg-blue-500 border-blue-700 text-white shadow-xl shadow-blue-200 cursor-pointer'
                                                        : 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed grayscale'
                                                }
                                                active:border-b-4 active:translate-y-1
                                            `}
                                        >
                                            <span className={`text-3xl font-black mb-1`}>
                                                {level}
                                            </span>
                                            {isUnlocked && (
                                                <div className="absolute -bottom-3 bg-yellow-400 text-yellow-900 text-[10px] font-black px-3 py-1 rounded-full shadow-md border-2 border-white uppercase tracking-tighter whitespace-nowrap">
                                                    À JOUER
                                                </div>
                                            )}
                                            {isCompleted && (
                                                <Star className="absolute top-2 right-2 w-5 h-5 text-yellow-300 fill-yellow-300 opacity-80" />
                                            )}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ModulePageLayout>
    );
};

export default MathDashboard;
