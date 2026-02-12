
import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Check } from 'lucide-react';
import { getAllProblems, getProblemStatus, TOTAL_PROBLEMS } from '@/utils/maths/problemManager';

interface ProblemesDashboardProps {
    onSelectProblem: (id: number) => void;
    onBack: () => void;
}

const ProblemesDashboard: React.FC<ProblemesDashboardProps> = ({ onSelectProblem, onBack }) => {
    const [problems, setProblems] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const load = async () => {
            const data = await getAllProblems();
            setProblems(data);
            setIsLoading(false);
        };
        load();
    }, []);

    // Generate 1 to 150
    const allIds = Array.from({ length: TOTAL_PROBLEMS }, (_, i) => i + 1);

    // Group by parts
    const part1 = allIds.filter(id => id <= 50);
    const part2 = allIds.filter(id => id > 50 && id <= 100);
    const part3 = allIds.filter(id => id > 100 && id <= 150);
    const part4 = allIds.filter(id => id > 150);

    const getButtonColor = (id: number) => {
        const colors = [
            'bg-blue-100 text-blue-700 border-blue-300 shadow-blue-200',
            'bg-green-100 text-green-700 border-green-300 shadow-green-200',
            'bg-yellow-100 text-yellow-700 border-yellow-300 shadow-yellow-200',
            'bg-pink-100 text-pink-700 border-pink-300 shadow-pink-200',
            'bg-purple-100 text-purple-700 border-purple-300 shadow-purple-200',
            'bg-orange-100 text-orange-700 border-orange-300 shadow-orange-200',
        ];
        return colors[(id - 1) % colors.length];
    };

    const renderGrid = (ids: number[], title: string, colorClass: string) => (
        <div className="mb-12">
            <h3 className={`text-2xl font-bold mb-6 ${colorClass}`}>{title}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {ids.map(id => {
                    const problem = problems.find(p => p.id === id);
                    const isMissing = !problem;
                    const status = getProblemStatus(id);
                    const isSolved = status === 'solved';
                    const colorStyle = getButtonColor(id);

                    return (
                        <motion.button
                            key={id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => !isMissing && onSelectProblem(id)}
                            disabled={isMissing}
                            className={`
                                relative aspect-square rounded-2xl p-2 flex flex-col items-center justify-center gap-1 transition-all
                                border-2 border-b-4
                                ${isMissing
                                    ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                                    : isSolved
                                        ? 'bg-green-500 border-green-600 text-white shadow-green-200'
                                        : `${colorStyle} hover:brightness-110 cursor-pointer`
                                }
                                active:border-b-2 active:translate-y-[2px]
                            `}
                        >
                            <span className={`text-lg font-black`}>
                                {id}
                            </span>
                            {isMissing ? (
                                <Lock className="w-5 h-5 opacity-50" />
                            ) : isSolved ? (
                                <Check className="w-6 h-6 text-white stroke-[3]" />
                            ) : (
                                <div className="w-0" />
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={onBack}
                        className="p-2 rounded-full hover:bg-slate-200 transition-colors"
                    >
                        ← Retour
                    </button>
                    <h1 className="text-3xl font-black text-slate-800">150 Problèmes au CM2</h1>
                </div>

                {renderGrid(part1, "Partie 1 : Début d'année", "text-blue-600")}
                {renderGrid(part2, "Partie 2 : Milieu d'année", "text-purple-600")}
                {renderGrid(part3, "Partie 3 : Fin d'année", "text-pink-600")}
                {renderGrid(part4, "Pour aller plus loin", "text-orange-600")}
            </div>
        </div>
    );
};

export default ProblemesDashboard;
