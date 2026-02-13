import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
    BookOpen,
    PenTool,
    ArrowRight,
    Award,
    Star,
    Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/orthographeClient';
import ModuleHeader from '../shared/ModuleHeader';

interface FrenchLandingProps {
    studentName: string;
    onModuleSelect: (module: 'progression' | 'dictee' | 'etude') => void;
    onBack: () => void;
}

const TOTAL_PROGRESSION_LEVELS = 50;

const FrenchLanding = ({
    studentName,
    onModuleSelect,
    onBack
}: FrenchLandingProps) => {
    const [progressionCompleted, setProgressionCompleted] = useState(false);
    const [currentLevel, setCurrentLevel] = useState(1);
    const [percentage, setPercentage] = useState(0);

    useEffect(() => {
        const loadProgressionStatus = async () => {
            try {
                const { data, error } = await supabase
                    .from('progression_levels')
                    .select('current_level, all_completed')
                    .eq('student_id', studentName)
                    .maybeSingle();

                if (error) throw error;

                if (data) {
                    setProgressionCompleted(data.all_completed);
                    setCurrentLevel(data.current_level);
                    setPercentage(Math.round(((data.current_level - 1) / TOTAL_PROGRESSION_LEVELS) * 100));
                } else {
                    const stored = localStorage.getItem(`orthographe_progression_${studentName.toLowerCase()}`);
                    if (stored) {
                        const local = JSON.parse(stored);
                        setProgressionCompleted(local.all_completed);
                        setCurrentLevel(local.current_level);
                        setPercentage(Math.round(((local.current_level - 1) / TOTAL_PROGRESSION_LEVELS) * 100));
                    }
                }
            } catch (error) {
                console.error('Error loading progression status (Supabase), trying local storage:', error);
                const stored = localStorage.getItem(`orthographe_progression_${studentName.toLowerCase()}`);
                if (stored) {
                    const local = JSON.parse(stored);
                    setProgressionCompleted(local.all_completed);
                    setCurrentLevel(local.current_level);
                    setPercentage(Math.round(((local.current_level - 1) / TOTAL_PROGRESSION_LEVELS) * 100));
                }
            }
        };

        loadProgressionStatus();
    }, [studentName]);

    return (
        <div className="max-w-7xl w-full mx-auto px-6 py-10">
            <ModuleHeader
                title="Langue Française"
                subtitle="Orthographe, Grammaire & Lecture"
                icon={Sparkles}
                onBack={onBack}
                variant="orthographe"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Column: Profile & Main Progression */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white/80 backdrop-blur-md rounded-[42px] p-8 border-4 border-white shadow-2xl">
                        <div className="flex flex-col items-center text-center gap-6 mb-10">
                            <div className="relative">
                                <div className="w-24 h-24 bg-orange-100 rounded-[32px] flex items-center justify-center text-5xl shadow-inner border-2 border-orange-200">
                                    👨‍🎓
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-xl shadow-lg border-2 border-white">
                                    <Award className="w-5 h-5" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">{studentName}</h2>
                                <p className="text-orange-500 font-black uppercase text-xs tracking-widest mt-1">Maître de la Langue</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                <span>Progression Totale</span>
                                <span>{percentage}%</span>
                            </div>
                            <div className="h-8 bg-slate-100 rounded-[20px] overflow-hidden border-2 border-slate-200 shadow-inner p-1">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-orange-400 to-rose-500 rounded-[14px] shadow-lg"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                />
                            </div>
                            <p className="text-center text-[10px] font-black text-slate-400 mt-2 uppercase tracking-tighter">
                                {currentLevel - 1} / {TOTAL_PROGRESSION_LEVELS} NIVEAUX VÉRIFIÉS
                            </p>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-[42px] p-8 text-white shadow-2xl border-b-8 border-indigo-800 relative overflow-hidden group">
                        <div className="relative z-10">
                            <Star className="w-12 h-12 mb-4 text-yellow-300 drop-shadow-md" />
                            <h3 className="text-2xl font-black uppercase mb-1">Badge du jour</h3>
                            <p className="font-bold text-indigo-100 leading-tight">Sans faute ! Termine une dictée sans aucune erreur.</p>
                        </div>
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                    </div>
                </div>

                {/* Right Column: Module Grid */}
                <div className="lg:col-span-2 flex flex-col gap-8">
                    {/* Main Progression Card */}
                    <motion.button
                        whileHover={{ y: -8, scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => onModuleSelect('progression')}
                        className="relative w-full rounded-[48px] p-10 text-left bg-gradient-to-br from-emerald-500 to-teal-600 shadow-2xl shadow-emerald-200/50 border-b-[12px] border-emerald-800 group overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-125 transition-transform duration-500">
                            <Award className="w-48 h-48 text-white" />
                        </div>

                        <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                            <div>
                                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest mb-6">
                                    <Sparkles className="w-4 h-4" /> Mode Aventure
                                </div>
                                <h2 className="text-5xl font-black text-white mb-4 tracking-tighter leading-none">
                                    PARCOURS <br />D'ORTHOGRAPHE
                                </h2>
                                <p className="text-emerald-100 text-xl font-bold max-w-md">
                                    Relève les {TOTAL_PROGRESSION_LEVELS} défis pour devenir un as de l'orthographe !
                                </p>
                            </div>

                            <div className="flex items-center gap-4 text-white font-black text-2xl uppercase tracking-widest">
                                COMMENCER <ArrowRight className="w-8 h-8 stroke-[3]" />
                            </div>
                        </div>
                    </motion.button>

                    {/* Secondary Modules Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <motion.button
                            whileHover={{ y: -8 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onModuleSelect('dictee')}
                            className="bg-purple-600 rounded-[42px] p-10 text-left border-b-[10px] border-purple-800 shadow-2xl shadow-purple-200 cursor-pointer group flex flex-col justify-between min-h-[280px]"
                        >
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                                <PenTool className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white text-4xl font-black mb-2 tracking-tight uppercase">Dictées</h3>
                                <p className="text-purple-100 font-bold">Écoute et écris sans fautes.</p>
                            </div>
                        </motion.button>

                        <motion.button
                            whileHover={{ y: -8 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onModuleSelect('etude')}
                            className="bg-orange-500 rounded-[42px] p-10 text-left border-b-[10px] border-orange-700 shadow-2xl shadow-orange-200 cursor-pointer group flex flex-col justify-between min-h-[280px]"
                        >
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                                <BookOpen className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white text-4xl font-black mb-2 tracking-tight uppercase">Études</h3>
                                <p className="text-orange-100 font-bold">Analyse les textes et réponds.</p>
                            </div>
                        </motion.button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FrenchLanding;
