import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { ProgressionView } from '@/components/orthographe/ProgressionView';
import FrenchLanding from '../components/orthographe/FrenchLanding';
import { DicteeModule } from '@/components/orthographe/DicteeModule';
import { EtudeTexteModule } from '@/components/orthographe/EtudeTexteModule';
import { useNavigate } from 'react-router-dom';
import ModulePageLayout from '@/components/shared/ModulePageLayout';
import { useSessionTimer } from '@/hooks/useSessionTimer';
import { Clock, Lock } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { motion, AnimatePresence } from 'framer-motion';

type View = 'home' | 'progression' | 'dictee' | 'etude' | 'orthographe';

const FrancaisPage = () => {
    const [view, setView] = useState<View>('home');
    const { user } = useUser();
    const studentName = user || 'Christian';
    const navigate = useNavigate();
    const { remainingSec, isTimeUp, formattedTime, isRunning, start, pause } = useSessionTimer();

    // Start/pause timer only for the Parcours d'Orthographe
    useEffect(() => {
        if (view === 'progression' && !isTimeUp) {
            start();
        } else {
            pause();
        }
    }, [view, isTimeUp, start, pause]);

    // When time runs out mid-progression, go back to home after a short delay
    useEffect(() => {
        if (isTimeUp && view === 'progression') {
            // Let the overlay show for a moment, then reset view
            const t = setTimeout(() => setView('home'), 300);
            return () => clearTimeout(t);
        }
    }, [isTimeUp, view]);

    const handleModuleSelect = useCallback((module: string) => {
        if (isTimeUp && module === 'progression') {
            toast.info("Ta session de 20 minutes sur le Parcours est terminée pour aujourd'hui ! Reviens demain 💪");
            return;
        }
        switch (module) {
            case 'progression':
                setView('progression');
                break;
            case 'dictee':
                setView('dictee');
                break;
            case 'etude':
                setView('etude');
                break;
            default:
                toast.info("Ce module sera bientôt disponible !");
        }
    }, [isTimeUp]);

    const handleBackToMenu = useCallback(() => {
        setView('home');
    }, []);

    const handleExit = useCallback(() => {
        navigate('/');
    }, [navigate]);

    const isLowTime = remainingSec <= 120 && remainingSec > 0; // less than 2 min

    return (
        <ModulePageLayout>
            {/* Floating timer badge — visible in all sub-modules */}
            {view === 'progression' && !isTimeUp && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl font-mono text-lg font-black shadow-xl border-2 backdrop-blur-md transition-colors ${isLowTime
                        ? 'bg-rose-50/90 border-rose-300 text-rose-600 animate-pulse'
                        : 'bg-white/90 border-orange-200 text-slate-700'
                        }`}
                >
                    <Clock className={`w-5 h-5 ${isLowTime ? 'text-rose-500' : 'text-orange-500'}`} />
                    {formattedTime}
                </motion.div>
            )}

            {/* Timer info on landing page — only about Parcours */}
            {view === 'home' && (
                <div className="w-full max-w-2xl mx-auto mb-4 px-6">
                    <div className={`flex items-center justify-center gap-3 py-3 px-6 rounded-2xl text-sm font-black uppercase tracking-wider ${isTimeUp
                        ? 'bg-rose-100 text-rose-600 border-2 border-rose-200'
                        : 'bg-orange-50 text-orange-600 border-2 border-orange-100'
                        }`}>
                        <Clock className="w-4 h-4" />
                        {isTimeUp
                            ? 'Parcours terminé pour aujourd\'hui — Reviens demain ! 🌙'
                            : `Parcours : ${formattedTime} restantes aujourd'hui`
                        }
                    </div>
                </div>
            )}

            {view === 'home' && (
                <FrenchLanding
                    studentName={studentName}
                    onModuleSelect={handleModuleSelect as any}
                    onBack={handleExit}
                />
            )}

            {view === 'progression' && (
                <ProgressionView
                    studentName={studentName}
                    onComplete={handleBackToMenu}
                    onBack={handleBackToMenu}
                />
            )}

            {view === 'dictee' && (
                <DicteeModule onBack={handleBackToMenu} />
            )}

            {view === 'etude' && (
                <EtudeTexteModule onBack={handleBackToMenu} />
            )}

            {view !== 'home' && view !== 'progression' && view !== 'dictee' && view !== 'etude' && (
                <div className="flex flex-col items-center justify-center p-8 text-center bg-white/40 backdrop-blur-md rounded-[48px] border-4 border-white shadow-2xl max-w-2xl mx-auto my-20">
                    <h2 className="text-4xl font-black text-slate-800 mb-6 uppercase tracking-tight">Module en construction</h2>
                    <p className="text-xl text-slate-500 font-bold mb-10">La vue "{view}" est en cours d'intégration.</p>
                    <button
                        onClick={handleBackToMenu}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-black py-5 px-10 rounded-[28px] shadow-xl border-b-8 border-blue-800 transition-all active:translate-y-1 active:border-b-4"
                    >
                        Retour au menu
                    </button>
                </div>
            )}

            {/* Time's up overlay */}
            <AnimatePresence>
                {isTimeUp && view === 'progression' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="max-w-md"
                        >
                            <div className="w-32 h-32 bg-orange-100 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-inner border-2 border-orange-200">
                                <Lock className="w-16 h-16 text-orange-500" />
                            </div>
                            <h1 className="text-4xl font-black text-slate-800 mb-4 uppercase tracking-tight">
                                Bravo, Christian ! 🎉
                            </h1>
                            <p className="text-xl text-slate-500 font-bold mb-4">
                                Tes 20 minutes du jour sont terminées.
                            </p>
                            <p className="text-lg text-slate-400 font-bold mb-10">
                                Le repos fait aussi partie de l'apprentissage. Reviens demain pour continuer ton parcours !
                            </p>
                            <button
                                onClick={handleBackToMenu}
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-6 text-xl rounded-[28px] shadow-xl border-b-8 border-orange-700 active:translate-y-1 active:border-b-4 transition-all"
                            >
                                RETOUR AU MENU
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </ModulePageLayout>
    );
};

export default FrancaisPage;

