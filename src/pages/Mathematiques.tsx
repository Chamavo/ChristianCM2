
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calculator, BookOpen, ArrowLeft } from 'lucide-react';
import MathDashboard from '@/components/maths/MathDashboard';
import MathSession from '@/components/maths/MathSession';
import MathLevelEnd from '@/components/maths/MathLevelEnd';
import ProblemesDashboard from '@/components/maths/ProblemesDashboard';
import ProblemeSession from '@/components/maths/ProblemeSession';
import { getCurrentLevel, updateCurrentLevel } from '@/utils/maths/levelBlockingSystem';
import { generateLevelExercises, Exercise } from '@/utils/maths/exerciseGenerator';
import { getProblem, MathProblem } from '@/utils/maths/problemManager';

type ViewState = 'landing' | 'calcul_dashboard' | 'calcul_session' | 'calcul_result' | 'problemes_dashboard' | 'probleme_session';

const Mathematiques: React.FC = () => {
    const navigate = useNavigate();
    const [currentView, setCurrentView] = useState<ViewState>('landing');

    // Calcul State
    const [level, setLevel] = useState(1);
    const [currentSessionLevel, setCurrentSessionLevel] = useState(1);
    const [exercises, setExercises] = useState<Exercise[]>([]);

    // Result state
    const [lastScore, setLastScore] = useState(0);
    const [lastTime, setLastTime] = useState(0);
    const [lastSuccess, setLastSuccess] = useState(false);

    // Problemes State
    const [selectedProblem, setSelectedProblem] = useState<MathProblem | null>(null);

    const [username] = useState('Christian'); // Christian hardcoded based on current session logic

    useEffect(() => {
        const loadLevel = async () => {
            const l = await getCurrentLevel(username, 'progression');
            setLevel(l);
        };
        loadLevel();
    }, [username]);

    // --- Calcul Logic ---
    const handleStartLevel = (lvl: number) => {
        const newExercises = generateLevelExercises(lvl);
        // Ensure we limit to 10 questions if generator returns more
        const sessionExercises = newExercises.slice(0, 10);

        setExercises(sessionExercises);
        setCurrentSessionLevel(lvl);
        setCurrentView('calcul_session');
    };

    const handleSessionComplete = async (score: number, timeSpent: number) => {
        setLastScore(score);
        setLastTime(timeSpent);
        const success = score >= 9; // Changed to 90% (9/10) as per new requirements
        setLastSuccess(success);

        if (success && currentSessionLevel === level) {
            // Unlock next level
            const nextLevel = level + 1;
            await updateCurrentLevel(username, nextLevel);
            setLevel(nextLevel);
        }

        setCurrentView('calcul_result');
    };

    const handleRetry = () => {
        handleStartLevel(currentSessionLevel);
    };

    const handleNextLevel = () => {
        handleStartLevel(currentSessionLevel + 1);
    };

    const handleBackToDashboard = () => {
        setCurrentView('calcul_dashboard');
    };

    // --- Problemes Logic ---
    const handleSelectProblem = (id: number) => {
        const problem = getProblem(id);
        if (problem) {
            setSelectedProblem(problem);
            setCurrentView('probleme_session');
        }
    };

    const handleProblemBack = () => {
        setSelectedProblem(null);
        setCurrentView('problemes_dashboard');
    };

    const handleProblemComplete = (success: boolean) => {
        if (success) {
            // Logic handled in component for now (save status), just navigate back or show success
            // Maybe go back to dashboard after a delay?
            // The component calls update, and we can perhaps wait a bit
            // For now, let the user manually go back or rely on component's internal feedback
            // But component calls onComplete(true).
            // Let's go back to dashboard to show updated state (green dot)
            handleProblemBack();
        }
    };


    // --- Navigation ---
    const handleBackToLanding = () => {
        setCurrentView('landing');
    };

    const handleExitApp = () => {
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Landing View */}
            {currentView === 'landing' && (
                <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-8 relative overflow-hidden">
                    <button
                        onClick={handleExitApp}
                        className="absolute top-6 left-6 p-3 rounded-full bg-slate-200 hover:bg-slate-300 transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-slate-700" />
                    </button>

                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-4"
                    >
                        <h1 className="text-4xl md:text-6xl font-black text-slate-800 mb-2">Mathématiques</h1>
                        <p className="text-xl text-slate-500 font-medium">Choisis ton défi !</p>
                    </motion.div>

                    <div className="w-full max-w-4xl flex flex-col gap-6">
                        {/* Bande Calcul */}
                        <motion.button
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setCurrentView('calcul_dashboard')}
                            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-8 flex items-center justify-between shadow-xl shadow-blue-200 group relative overflow-hidden"
                        >
                            <div className="relative z-10 flex items-center gap-6 text-left">
                                <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                                    <Calculator className="w-12 h-12 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-white mb-1">Calcul Rapide</h2>
                                    <p className="text-blue-100 font-medium text-lg">50 Niveaux • Rapidité • Précision</p>
                                </div>
                            </div>
                            <div className="relative z-10 bg-white/10 px-6 py-2 rounded-full backdrop-blur-md border border-white/20">
                                <span className="text-white font-bold">Niveau {level}</span>
                            </div>

                            {/* Decor */}
                            <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/10 to-transparent transform skew-x-12 translate-x-10 group-hover:translate-x-0 transition-transform duration-500" />
                        </motion.button>

                        {/* Bande 150 Problèmes */}
                        <motion.button
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setCurrentView('problemes_dashboard')}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-3xl p-8 flex items-center justify-between shadow-xl shadow-purple-200 group relative overflow-hidden"
                        >
                            <div className="relative z-10 flex items-center gap-6 text-left">
                                <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                                    <BookOpen className="w-12 h-12 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-white mb-1">150 problèmes au CM2</h2>
                                    <p className="text-purple-100 font-medium text-lg">Raisonnement • Logique • Enigmes</p>
                                </div>
                            </div>
                            <div className="relative z-10 bg-white/10 px-6 py-2 rounded-full backdrop-blur-md border border-white/20">
                                <span className="text-white font-bold">0 / 150</span>
                            </div>

                            {/* Decor */}
                            <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/10 to-transparent transform skew-x-12 translate-x-10 group-hover:translate-x-0 transition-transform duration-500" />
                        </motion.button>
                    </div>
                </div>
            )}

            {/* Calcul Views */}
            {currentView === 'calcul_dashboard' && (
                <MathDashboard
                    username={username}
                    currentLevel={level}
                    onStartLevel={handleStartLevel}
                    onBack={handleBackToLanding}
                />
            )}

            {currentView === 'calcul_session' && (
                <MathSession
                    level={currentSessionLevel}
                    exercises={exercises}
                    onComplete={handleSessionComplete}
                    onExit={handleBackToDashboard}
                />
            )}

            {currentView === 'calcul_result' && (
                <MathLevelEnd
                    score={lastScore}
                    total={10}
                    timeSpent={lastTime}
                    level={currentSessionLevel}
                    isSuccess={lastSuccess}
                    onRetry={handleRetry}
                    onNext={handleNextLevel}
                    onHome={handleBackToDashboard}
                />
            )}

            {/* Problèmes View */}
            {currentView === 'problemes_dashboard' && (
                <ProblemesDashboard
                    onSelectProblem={handleSelectProblem}
                    onBack={handleBackToLanding}
                />
            )}

            {currentView === 'probleme_session' && selectedProblem && (
                <ProblemeSession
                    problem={selectedProblem}
                    onBack={handleProblemBack}
                    onComplete={handleProblemComplete}
                />
            )}
        </div>
    );
};

export default Mathematiques;
