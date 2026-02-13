import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    BookOpen,
    Send,
    CheckCircle2,
    AlertCircle,
    Sparkles,
    CheckCircle,
    XCircle,
    Info,
    Search,
    PenTool,
    GraduationCap,
    Clock,
    Award,
    RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { type TextStudy } from '@/data/etudeTexteData';
import ModuleHeader from '../shared/ModuleHeader';

interface EtudeTexteModuleProps {
    onBack: () => void;
}

export const EtudeTexteModule = ({ onBack }: EtudeTexteModuleProps) => {
    const [texts, setTexts] = useState<TextStudy[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedText, setSelectedText] = useState<TextStudy | null>(null);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [correctionData, setCorrectionData] = useState<{
        id: number;
        question: string;
        answer: string;
        feedback: string;
        status: 'correct' | 'partial' | 'incorrect';
    }[] | null>(null);
    const [isCorrecting, setIsCorrecting] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await import('@/data/etudeTexteData');
                setTexts(data.etudeTexteData);
            } catch (error) {
                console.error("Failed to load text data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    const handleAnswerChange = (questionId: number, value: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleCorrection = async () => {
        if (!selectedText) return;
        setIsCorrecting(true);

        // Simulation d'une analyse sémantique (IA)
        await new Promise(resolve => setTimeout(resolve, 3000));

        const feedbacks = selectedText.questions.map(q => {
            const answer = answers[q.id] || "";
            let feedback = "";
            let status: 'correct' | 'partial' | 'incorrect' = 'partial';

            if (q.expectedAnswer && q.expectedAnswer.trim() !== "") {
                const normalizedAnswer = answer.toLowerCase().trim();
                const normalizedExpected = q.expectedAnswer.toLowerCase().trim();

                if (normalizedAnswer.length > 5 && (normalizedExpected.includes(normalizedAnswer) || normalizedAnswer.includes(normalizedExpected.split(' ')[0]))) {
                    feedback = "Excellent ! Ta réponse est tout à fait pertinente et correspond précisément aux éléments clés du texte.";
                    status = 'correct';
                } else if (normalizedAnswer.length > 10) {
                    feedback = `Bonne tentative. Cependant, essaie d'être plus précis(e) en mentionnant par exemple : "${q.expectedAnswer.split('.')[0]}".`;
                    status = 'partial';
                } else {
                    feedback = `Ta réponse est un peu trop courte. Le texte suggère plutôt : "${q.expectedAnswer}".`;
                    status = 'incorrect';
                }
            } else {
                if (answer.trim().length > 30) {
                    feedback = "Analyse AI : Ta réponse démontre une compréhension approfondie. Elle est détaillée et bien structurée.";
                    status = 'correct';
                } else if (answer.trim().length > 10) {
                    feedback = "Analyse AI : Le sens global est saisi, mais mérite un développement plus étayé avec des passages du texte.";
                    status = 'partial';
                } else {
                    feedback = "Analyse AI : Cette réponse manque de profondeur. Examine de plus près les intentions de l'auteur.";
                    status = 'incorrect';
                }
            }

            return { id: q.id, question: q.question, answer, feedback, status };
        });

        setCorrectionData(feedbacks);
        setIsCorrecting(false);
        toast.success("Analyse de ton travail terminée !");
    };

    const handleInternalBack = () => {
        if (selectedText) {
            setSelectedText(null);
            setCorrectionData(null);
            setAnswers({});
        } else {
            onBack();
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-6 py-8 flex flex-col min-h-[90vh]">
            <ModuleHeader
                title="Étude de Texte"
                subtitle={selectedText ? selectedText.title : "Lecture & Compréhension"}
                icon={BookOpen}
                onBack={handleInternalBack}
                variant="orthographe"
            />

            <div className="flex-1 flex flex-col relative">
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex-1 flex items-center justify-center p-20"
                        >
                            <div className="flex flex-col items-center gap-6">
                                <div className="w-20 h-20 border-8 border-orange-100 border-t-orange-500 rounded-full animate-spin shadow-xl" />
                                <p className="text-2xl font-black text-slate-400 uppercase tracking-widest animate-pulse">Chargement...</p>
                            </div>
                        </motion.div>
                    ) : !selectedText ? (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            {texts.map((text) => (
                                <motion.div
                                    key={text.id}
                                    whileHover={{ y: -10, scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelectedText(text)}
                                    className="bg-white/80 backdrop-blur-md rounded-[40px] p-8 border-4 border-white shadow-2xl cursor-pointer group transition-all"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-16 h-16 bg-blue-100 rounded-3xl flex items-center justify-center shadow-inner group-hover:bg-blue-500 group-hover:text-white transition-colors duration-500">
                                            <Search className="w-8 h-8" />
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="px-4 py-2 bg-slate-100/50 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                                                {text.questions.length} QUESTIONS
                                            </span>
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-800 mb-3 leading-tight group-hover:text-blue-600 transition-colors">
                                        {text.title}
                                    </h3>
                                    <p className="text-slate-400 font-bold text-sm line-clamp-2 leading-relaxed mb-8">
                                        {text.content}
                                    </p>
                                    <div className="w-fit bg-blue-50 text-blue-600 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        Lire et analyser <Sparkles className="w-4 h-4 inline-block ml-1" />
                                    </div>
                                </motion.div>
                            ))}
                            {[...Array(3)].map((_, i) => (
                                <div key={`empty-${i}`} className="bg-slate-100/50 rounded-[40px] p-8 border-4 border-dashed border-slate-200 flex flex-col items-center justify-center min-h-[300px] text-center opacity-60">
                                    <div className="w-16 h-16 bg-slate-200 rounded-3xl mb-4 flex items-center justify-center text-slate-400">
                                        <Clock className="w-8 h-8" />
                                    </div>
                                    <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Nouveau texte à venir</p>
                                </div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="study"
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -50, opacity: 0 }}
                            className="max-w-4xl mx-auto w-full space-y-10"
                        >
                            {/* Text Card */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white/90 backdrop-blur-xl rounded-[48px] p-12 md:p-16 border-4 border-white shadow-3xl relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-[100px] -z-10" />
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-10 h-1 bg-amber-400 rounded-full" />
                                    <h2 className="text-sm font-black text-amber-500 uppercase tracking-[0.2em]">Texte à étudier</h2>
                                </div>
                                <div className="prose prose-2xl max-w-none text-slate-700 italic font-medium leading-[1.8] space-y-6">
                                    {selectedText.content.split('\n').map((line, i) => (
                                        <p key={i}>{line}</p>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Questions Section */}
                            <div className="space-y-12 pb-20">
                                {selectedText.questions.map((q, idx) => (
                                    <motion.div
                                        key={q.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + (idx * 0.1) }}
                                        className="relative pl-8 md:pl-12"
                                    >
                                        <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-blue-500 to-transparent rounded-full opacity-20" />

                                        <div className="flex flex-col gap-6">
                                            <div className="flex items-start gap-4">
                                                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg border-b-4 border-blue-800">
                                                    {q.id}
                                                </div>
                                                <h3 className="text-2xl font-black text-slate-800 pt-1 leading-tight tracking-tight">
                                                    {q.question}
                                                </h3>
                                            </div>

                                            <div className="relative group">
                                                <Textarea
                                                    value={answers[q.id] || ''}
                                                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                                    placeholder="Rédige ton analyse ici..."
                                                    className="min-h-[160px] text-xl font-bold rounded-[32px] p-8 border-4 border-white shadow-2xl focus:ring-12 focus:ring-blue-500/5 transition-all leading-relaxed bg-white/80 placeholder:text-slate-200 resize-none"
                                                    spellCheck={true}
                                                />
                                                <div className="absolute right-6 bottom-6 text-slate-200">
                                                    <PenTool className="w-8 h-8 opacity-20" />
                                                </div>
                                            </div>

                                            {/* Results Feedback within Question */}
                                            <AnimatePresence>
                                                {correctionData && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        className={`p-8 rounded-[32px] border-4 shadow-xl flex gap-6 ${correctionData.find(c => c.id === q.id)?.status === 'correct'
                                                            ? 'bg-emerald-50 border-emerald-200 text-emerald-900 shadow-emerald-500/10' :
                                                            correctionData.find(c => c.id === q.id)?.status === 'partial'
                                                                ? 'bg-orange-50 border-orange-200 text-orange-900 shadow-orange-500/10' :
                                                                'bg-rose-50 border-rose-200 text-rose-900 shadow-rose-500/10'
                                                            }`}
                                                    >
                                                        <div className="flex-shrink-0 mt-1">
                                                            {correctionData.find(c => c.id === q.id)?.status === 'correct' ? <CheckCircle2 className="w-8 h-8 text-emerald-500" /> :
                                                                correctionData.find(c => c.id === q.id)?.status === 'partial' ? <Info className="w-8 h-8 text-orange-500" /> :
                                                                    <AlertCircle className="w-8 h-8 text-rose-500" />}
                                                        </div>
                                                        <div className="space-y-2">
                                                            <p className="font-black flex items-center gap-2 uppercase text-xs tracking-[0.2em] opacity-50">
                                                                <Sparkles className="h-4 w-4" /> Analyse de l'Assistant
                                                            </p>
                                                            <p className="text-lg font-black leading-relaxed">
                                                                {correctionData.find(c => c.id === q.id)?.feedback}
                                                            </p>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Action Button */}
                            <div className="sticky bottom-10 left-0 right-0 z-30 flex flex-col items-center gap-6">
                                {!correctionData && (
                                    <div className="bg-slate-900/40 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 text-white font-black text-[10px] uppercase tracking-widest shadow-2xl flex items-center gap-2">
                                        <Sparkles className="w-3 h-3 text-blue-400" /> L'Assistant va corriger ton travail
                                    </div>
                                )}

                                <Button
                                    onClick={handleCorrection}
                                    disabled={isCorrecting}
                                    size="lg"
                                    className={`min-w-[400px] h-24 rounded-[32px] shadow-3xl text-2xl font-black uppercase tracking-tight transition-all border-b-8 active:translate-y-2 active:border-b-4 ${correctionData
                                        ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                                        : 'bg-emerald-500 border-emerald-700 text-white hover:bg-emerald-600'
                                        }`}
                                >
                                    {isCorrecting ? (
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                            Analyse en cours...
                                        </div>
                                    ) : correctionData ? (
                                        <div className="flex items-center gap-3">
                                            <RotateCcw className="w-6 h-6" /> Recommencer l'exercice
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <Send className="w-6 h-6" /> Soumettre mon travail
                                        </div>
                                    )}
                                </Button>
                            </div>

                            {/* Global Result Summary */}
                            <AnimatePresence>
                                {correctionData && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-slate-900 rounded-[56px] p-16 shadow-4xl text-white relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 m-12 opacity-5">
                                            <GraduationCap className="w-64 h-64" />
                                        </div>

                                        <div className="flex flex-col md:flex-row items-center gap-10 mb-12">
                                            <div className="w-24 h-24 bg-emerald-500/20 rounded-[32px] flex items-center justify-center text-4xl shadow-inner border border-emerald-500/30">
                                                🏆
                                            </div>
                                            <div className="text-center md:text-left">
                                                <h3 className="text-4xl font-black mb-2 tracking-tight uppercase">Bilan Global</h3>
                                                <p className="text-slate-400 text-xl font-bold italic">Excellent effort de lecture !</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                            {[
                                                { label: 'Maîtrisées', count: correctionData.filter(c => c.status === 'correct').length, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                                                { label: 'À Travailler', count: correctionData.filter(c => c.status === 'partial').length, color: 'text-orange-400', bg: 'bg-orange-400/10' },
                                                { label: 'Incomplètes', count: correctionData.filter(c => c.status === 'incorrect').length, color: 'text-rose-400', bg: 'bg-rose-400/10' }
                                            ].map((stat) => (
                                                <div key={stat.label} className={`${stat.bg} p-8 rounded-[32px] border border-white/5 flex flex-col items-center gap-2`}>
                                                    <span className={`${stat.color} text-6xl font-black tabular-nums`}>{stat.count}</span>
                                                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{stat.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default EtudeTexteModule;
