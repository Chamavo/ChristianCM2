import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Star, Trophy, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MathDashboardProps {
    currentLevel: number;
    username: string;
    onStartLevel: (level: number) => void;
    onBack: () => void;
}

const TOTAL_LEVELS = 50;

const MathDashboard: React.FC<MathDashboardProps> = ({ currentLevel, username, onStartLevel, onBack }) => {
    // Calculate global progress
    const progressPercentage = Math.min(100, Math.round(((currentLevel - 1) / TOTAL_LEVELS) * 100));

    // Generate levels
    const levels = Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1);

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Header / Top Bar */}
            <div className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">

                    {/* User Info */}
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl border-2 border-blue-200">
                            🎓
                        </div>
                        <div>
                            <h2 className="font-bold text-lg text-slate-800">{username}</h2>
                            <p className="text-sm text-slate-500 font-medium">Niveau actuel : {currentLevel} / {TOTAL_LEVELS}</p>
                        </div>
                    </div>

                    {/* Global Progress Bar */}
                    <div className="flex-1 w-full md:max-w-md">
                        <div className="flex justify-between text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                            <span>Progression Totale</span>
                            <span>{progressPercentage}%</span>
                        </div>
                        <div className="h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200">
                            <motion.div
                                className={`h-full ${progressPercentage > 0 ? 'bg-green-500' : 'bg-blue-500'}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercentage}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                            />
                        </div>
                    </div>

                    <Button
                        onClick={onBack}
                        variant="default"
                        size="lg"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 px-8 text-xl rounded-2xl shadow-lg gap-3"
                    >
                        <Home className="w-6 h-6" /> Accueil
                    </Button>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="max-w-5xl mx-auto px-4 py-8 md:py-12">

                {/* Intro / Welcome */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-2">
                        Ton Aventure Mathématique 🚀
                    </h1>
                    <p className="text-slate-500 text-lg">
                        Il te reste <span className="font-bold text-blue-600">{Math.max(0, TOTAL_LEVELS - (currentLevel - 1))}</span> niveaux à explorer !
                    </p>
                </div>

                {/* Level Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                    {levels.map((level) => {
                        const isCompleted = level < currentLevel;
                        const isUnlocked = level === currentLevel;
                        const isLocked = level > currentLevel;

                        return (
                            <motion.button
                                key={level}
                                onClick={() => !isLocked && onStartLevel(level)}
                                disabled={isLocked}
                                whileHover={!isLocked ? { y: -5 } : {}}
                                whileTap={!isLocked ? { y: 2 } : {}}
                                className={`
                                    relative aspect-square rounded-3xl flex flex-col items-center justify-center p-4 border-b-4 transition-all duration-200
                                    ${isCompleted
                                        ? 'bg-green-500 border-green-700 text-white shadow-green-200'
                                        : isUnlocked
                                            ? 'bg-blue-500 border-blue-700 text-white shadow-lg shadow-blue-200 cursor-pointer'
                                            : 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed contrast-50'
                                    }
                                `}
                            >
                                {/* Level Number */}
                                <span className={`text-3xl font-black mb-1 ${isLocked ? 'opacity-50' : ''}`}>
                                    {level}
                                </span>
                                <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                                    Niveau
                                </span>

                                {/* Status Icon */}
                                <div className="absolute top-3 right-3">
                                    {isCompleted && <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />}
                                    {isLocked && <Lock className="w-5 h-5 opacity-50" />}
                                    {isUnlocked && <div className="w-3 h-3 bg-white rounded-full animate-pulse" />}
                                </div>

                                {/* Current Level Indicator */}
                                {isUnlocked && (
                                    <div className="absolute -bottom-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm border border-yellow-500">
                                        EN COURS
                                    </div>
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </main>
        </div>
    );
};

export default MathDashboard;
