import React from 'react';
import { Calculator, Globe, Star, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import MathsAppHeader from './MathsAppHeader';

interface LearnerHomeProps {
    username: string;
    level: number;
    onSelectCalcul: () => void;
    onSelectMonde: () => void;
    onBackToApp: () => void;
}

const LearnerHome: React.FC<LearnerHomeProps> = ({
    username,
    level,
    onSelectCalcul,
    onSelectMonde,
    onBackToApp,
}) => {
    return (
        <div className="min-h-screen gradient-bg flex flex-col relative overflow-hidden">
            {/* Decorative shapes */}
            <div className="kumon-shape kumon-shape-1" />
            <div className="kumon-shape kumon-shape-2" />
            <div className="kumon-shape kumon-shape-3" />

            <MathsAppHeader
                showHome={false}
                onBack={onBackToApp}
                variant="transparent"
                username={username}
            />

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-center relative z-10">
                <div className="max-w-4xl w-full mx-auto">
                    {/* Header avec animation */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-8 sm:mb-12"
                    >
                        <div className="flex justify-center items-center gap-3 mb-4">
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <Trophy className="w-10 h-10 sm:w-14 sm:h-14 text-warning drop-shadow-lg" />
                            </motion.div>
                            <div>
                                <h1 className="text-3xl sm:text-5xl font-extrabold text-white drop-shadow-md">
                                    Salut <span className="text-yellow-300">{username}</span> ! 👋
                                </h1>
                            </div>
                        </div>
                        <p className="text-lg sm:text-2xl text-white/90 font-medium">
                            Tu es au <span className="font-bold underline decoration-yellow-400 decoration-4">Niveau {level}</span>. Prêt pour la suite ? ✨
                        </p>
                    </motion.div>

                    {/* BOUTON PRINCIPAL - Parcours Linéaire */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="mb-12"
                    >
                        <motion.button
                            onClick={onSelectCalcul}
                            className="w-full relative overflow-hidden rounded-[40px] p-8 sm:p-12 kid-card bg-gradient-to-br from-primary via-blue-500 to-primary shadow-glow-blue border-4 border-white/20"
                            whileHover={{ scale: 1.03, rotate: -1 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            {/* Effet de brillance intense */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                animate={{ x: ["-150%", "150%"] }}
                                transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}
                            />

                            <div className="relative z-10 flex flex-col items-center gap-6">
                                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full flex items-center justify-center shadow-xl">
                                    <Calculator className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
                                </div>
                                <div className="text-center">
                                    <h2 className="text-3xl sm:text-5xl font-black text-white mb-2 uppercase tracking-tighter">
                                        Continuer le Parcours
                                    </h2>
                                    <p className="text-white/90 text-xl sm:text-2xl font-bold">
                                        Niveau {level} &rarr; Niveau {level + 1}
                                    </p>
                                </div>
                                <motion.div
                                    animate={{ y: [0, 10, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="bg-white/20 backdrop-blur-md px-6 py-2 rounded-full text-white font-bold"
                                >
                                    S'entraîner 🚀
                                </motion.div>
                            </div>
                        </motion.button>
                    </motion.div>

                    {/* Section Secondaire: Monde */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <motion.button
                            onClick={onSelectMonde}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="group relative overflow-hidden rounded-3xl p-6 bg-white/10 backdrop-blur-lg hover:bg-white/20 transition-all border-2 border-white/20 hover:border-white shadow-sm"
                            whileHover={{ y: -5 }}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-warning/20 rounded-2xl flex items-center justify-center">
                                    <Globe className="w-6 h-6 text-warning" />
                                </div>
                                <div className="text-left text-white">
                                    <h3 className="font-bold">Comprendre le monde</h3>
                                    <p className="text-sm opacity-80 text-xs">La question du jour 🌎</p>
                                </div>
                            </div>
                        </motion.button>

                        {/* Achievement / Stats preview */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="rounded-3xl p-6 bg-white/5 border-2 border-dashed border-white/20 flex items-center gap-4"
                        >
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                <Star className="w-6 h-6 text-yellow-300" fill="currentColor" />
                            </div>
                            <div className="text-left text-white">
                                <h3 className="font-bold">Objectif : 50 Niveaux</h3>
                                <p className="text-sm opacity-80 text-xs">Étape par étape 🏆</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Message d'encouragement */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.8 }}
                        className="mt-12 text-center"
                    >
                        <p className="text-white/60 italic">
                            "Chaque effort te rapproche de la maîtrise ! 💪"
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default LearnerHome;
