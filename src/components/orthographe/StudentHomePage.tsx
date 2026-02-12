import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
    BookOpen,
    PenTool,
    FileText,
    Award,
    ArrowRight,
    Lock,
    Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/orthographeClient';

interface StudentHomePageProps {
    studentName: string;
    onModuleSelect: (module: 'progression' | 'dictee' | 'etude') => void;
    onLogout: () => void;
}

const TOTAL_PROGRESSION_LEVELS = 50;

export const StudentHomePage = ({
    studentName,
    onModuleSelect,
    onLogout
}: StudentHomePageProps) => {
    const [progressionCompleted, setProgressionCompleted] = useState(false);
    const [currentLevel, setCurrentLevel] = useState(1);
    const [percentage, setPercentage] = useState(0);

    useEffect(() => {
        const loadProgressionStatus = async () => {
            const { data, error } = await supabase
                .from('progression_levels')
                .select('current_level, all_completed')
                .eq('student_id', studentName)
                .maybeSingle();

            if (error) {
                console.error('Error loading progression status:', error);
                return;
            }

            if (data) {
                setProgressionCompleted(data.all_completed);
                setCurrentLevel(data.current_level);
                setPercentage(Math.round(((data.current_level - 1) / TOTAL_PROGRESSION_LEVELS) * 100));
            }
        };

        loadProgressionStatus();
    }, [studentName]);

    return (
        <div className="min-h-screen bg-white">
            <div className="flex justify-end p-4">
                <Button variant="default" size="lg" onClick={onLogout} className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-6 px-8 text-xl rounded-2xl shadow-lg gap-3 shadow-amber-500/20">
                    <Home className="w-6 h-6" /> Menu
                </Button>
            </div>

            <div className="max-w-5xl mx-auto px-4 pb-8 flex flex-col items-center">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">✨ Bonjour Christian ! 👋 ⭐</h1>
                    <p className="text-xl text-slate-600">Bienvenue dans ton module <span className="text-amber-500 font-bold">Français</span> ! 🏆</p>
                </motion.div>

                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    onClick={() => onModuleSelect('progression')}
                    className="w-full max-w-2xl rounded-3xl p-8 mb-12 text-left bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all shadow-xl hover:shadow-2xl hover:shadow-emerald-500/20 group flex flex-col gap-6"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Parcours d'orthographe (50 niveaux)</h2>
                            </div>
                        </div>
                        <ArrowRight className="w-10 h-10 text-white group-hover:translate-x-2 transition-transform" />
                    </div>

                    <div className="w-full">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-white/70 text-sm">Progression globale</span>
                            <span className="text-white font-black text-xl">{percentage}%</span>
                        </div>
                        <div className="h-4 bg-black/20 rounded-full overflow-hidden border border-white/5">
                            <motion.div className="h-full bg-white rounded-full" initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 1 }} />
                        </div>
                    </div>
                </motion.button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                    <div
                        onClick={() => onModuleSelect('dictee')}
                        className="bg-purple-600 rounded-3xl p-8 text-center border-none cursor-pointer transition-all hover:scale-105 hover:shadow-2xl hover:bg-purple-700 group shadow-xl shadow-purple-500/30 flex flex-col items-center justify-center min-h-[220px]"
                    >
                        <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm shadow-inner">
                            <PenTool className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-white text-5xl font-extrabold mb-2 tracking-wide drop-shadow-md">Dictées</h3>
                    </div>
                    <div
                        onClick={() => onModuleSelect('etude')}
                        className="bg-orange-500 rounded-3xl p-8 text-center border-none cursor-pointer transition-all hover:scale-105 hover:shadow-2xl hover:bg-orange-600 group shadow-xl shadow-orange-500/30 flex flex-col items-center justify-center min-h-[220px]"
                    >
                        <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm shadow-inner">
                            <BookOpen className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-white text-5xl font-extrabold mb-2 tracking-wide drop-shadow-md">Études de texte</h3>
                    </div>
                </div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-12 bg-slate-50 rounded-3xl p-8 text-center max-w-2xl border border-slate-100">
                    <p className="text-slate-600 text-lg italic">"Le français, c'est comme un muscle : plus tu t'entraînes, plus tu deviens fort !"</p>
                </motion.div>
            </div>
        </div>
    );
};
