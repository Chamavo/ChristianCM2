import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Check, BookOpen } from 'lucide-react';
import { getAllProblems, TOTAL_PROBLEMS } from '@/utils/maths/problemManager';
import ModulePageLayout from '../shared/ModulePageLayout';
import ModuleHeader from '../shared/ModuleHeader';
import { useUser } from '@/contexts/UserContext';

interface ProblemesDashboardProps {
    onSelectProblem: (id: number) => void;
    onBack: () => void;
}

const ProblemesDashboard: React.FC<ProblemesDashboardProps> = ({ onSelectProblem, onBack }) => {
    const [problems, setProblems] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const { progress } = useUser();

    React.useEffect(() => {
        const load = async () => {
            const data = await getAllProblems();
            setProblems(data);
            setIsLoading(false);
        };
        load();
    }, []);

    // Generate IDS based on TOTAL_PROBLEMS
    const allIds = Array.from({ length: TOTAL_PROBLEMS }, (_, i) => i + 1);

    // Dynamic grouping based on current structure
    const part1 = allIds.filter(id => id <= 50);
    const part2 = allIds.filter(id => id > 50 && id <= 100);
    const part3 = allIds.filter(id => id > 100 && id <= 150);
    const part4 = allIds.filter(id => id > 150);

    const getButtonColor = (id: number) => {
        const colors = [
            'bg-blue-50 text-blue-700 border-blue-200 shadow-blue-100',
            'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-100',
            'bg-amber-50 text-amber-700 border-amber-200 shadow-amber-100',
            'bg-rose-50 text-rose-700 border-rose-200 shadow-rose-100',
            'bg-violet-50 text-violet-700 border-violet-200 shadow-violet-100',
            'bg-sky-50 text-sky-700 border-sky-200 shadow-sky-100',
        ];
        return colors[(id - 1) % colors.length];
    };

    const renderGrid = (ids: number[], title: string, colorClass: string) => (
        <div className="mb-16 last:mb-0">
            <h3 className={`text-2xl font-black mb-8 p-4 rounded-2xl bg-white/50 border-2 border-slate-100 shadow-sm inline-block ${colorClass} uppercase tracking-tight`}>
                {title}
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-5 px-2">
                {ids.map(id => {
                    const problem = problems.find(p => p.id === id);
                    const isMissing = !problem;
                    const isSolved = progress.solvedProblems.includes(id);
                    const colorStyle = getButtonColor(id);

                    return (
                        <motion.button
                            key={id}
                            whileHover={isMissing ? {} : { scale: 1.1, y: -5 }}
                            whileTap={isMissing ? {} : { scale: 0.9 }}
                            onClick={() => !isMissing && onSelectProblem(id)}
                            disabled={isMissing}
                            className={`
                                relative aspect-square rounded-[24px] p-2 flex flex-col items-center justify-center gap-1 transition-all
                                border-4 border-b-8
                                ${isMissing
                                    ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed grayscale'
                                    : isSolved
                                        ? 'bg-green-500 border-green-700 text-white shadow-lg shadow-green-100'
                                        : `${colorStyle} hover:brightness-105 cursor-pointer shadow-md`
                                }
                                active:border-b-4 active:translate-y-1
                            `}
                        >
                            <span className={`text-2xl font-black`}>
                                {id}
                            </span>
                            {isSolved && (
                                <Check className="absolute top-1 right-1 w-5 h-5 text-white/50 stroke-[4]" />
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );

    if (isLoading) {
        return (
            <ModulePageLayout>
                <div className="h-screen flex items-center justify-center">
                    <p className="text-xl font-black text-slate-400 animate-pulse uppercase tracking-widest">Chargement des problèmes...</p>
                </div>
            </ModulePageLayout>
        );
    }

    return (
        <ModulePageLayout>
            <div className="max-w-7xl w-full mx-auto px-6 py-10">
                <ModuleHeader
                    title={`${TOTAL_PROBLEMS} Problèmes au CM2`}
                    subtitle="Logique & Raisonnement"
                    icon={BookOpen}
                    onBack={onBack}
                    variant="maths"
                />

                <div className="bg-white/40 backdrop-blur-sm rounded-[42px] p-8 md:p-12 border-4 border-white shadow-2xl">
                    {renderGrid(part1, "Partie 1 : Début d'année", "text-blue-600")}
                    {renderGrid(part2, "Partie 2 : Milieu d'année", "text-indigo-600")}
                    {renderGrid(part3, "Partie 3 : Fin d'année", "text-violet-600")}
                    {renderGrid(part4, "Pour aller plus loin", "text-rose-600")}
                </div>
            </div>
        </ModulePageLayout>
    );
};

export default ProblemesDashboard;
