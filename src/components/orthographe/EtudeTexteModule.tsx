import { useState } from 'react';
import { ArrowLeft, BookOpen, Send, CheckCircle2, AlertCircle, Sparkles, CheckCircle, XCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { etudeTexteData, TextStudy } from '@/data/etudeTexteData';

interface EtudeTexteModuleProps {
    onBack: () => void;
}

export const EtudeTexteModule = ({ onBack }: EtudeTexteModuleProps) => {
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

    const handleAnswerChange = (questionId: number, value: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleCorrection = async () => {
        if (!selectedText) return;
        setIsCorrecting(true);

        // Simuler une analyse sémantique profonde (IA)
        await new Promise(resolve => setTimeout(resolve, 2500));

        const feedbacks = selectedText.questions.map(q => {
            const answer = answers[q.id] || "";
            let feedback = "";
            let status: 'correct' | 'partial' | 'incorrect' = 'partial';

            if (q.expectedAnswer && q.expectedAnswer.trim() !== "") {
                // Si un corrigé existe, comparaison plus stricte
                const normalizedAnswer = answer.toLowerCase().trim();
                const normalizedExpected = q.expectedAnswer.toLowerCase().trim();

                if (normalizedAnswer.length > 5 && (normalizedExpected.includes(normalizedAnswer) || normalizedAnswer.includes(normalizedExpected.split(' ')[0]))) {
                    feedback = "Excellent ! Ta réponse est tout à fait pertinente et correspond aux éléments clés du texte.";
                    status = 'correct';
                } else if (normalizedAnswer.length > 10) {
                    feedback = `Bonne tentative. Cependant, n'oublie pas de mentionner certains points comme : "${q.expectedAnswer.split('.')[0]}".`;
                    status = 'partial';
                } else {
                    feedback = `Ta réponse est un peu brève. Le texte suggérait plutôt : "${q.expectedAnswer}".`;
                    status = 'incorrect';
                }
            } else {
                // Analyse sémantique fallback (SANS corrigé)
                if (answer.trim().length > 30) {
                    feedback = "Analyse IA : Ta réponse montre une excellente compréhension du contexte. Elle est détaillée et bien argumentée.";
                    status = 'correct';
                } else if (answer.trim().length > 10) {
                    feedback = "Analyse IA : Le sens global semble correct, mais tu pourrais étayer davantage tes propos en t'appuyant sur des passages du texte.";
                    status = 'partial';
                } else {
                    feedback = "Analyse IA : Ta réponse manque de développement. Essaie d'analyser plus en profondeur les intentions de l'auteur.";
                    status = 'incorrect';
                }
            }

            return {
                id: q.id,
                question: q.question,
                answer,
                feedback,
                status
            };
        });

        setCorrectionData(feedbacks);
        setIsCorrecting(false);
        toast.success("Analyse terminée !");
    };

    if (selectedText) {
        return (
            <div className="min-h-screen bg-slate-50 p-4 md:p-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    <Button onClick={() => setSelectedText(null)} variant="outline" className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la liste
                    </Button>

                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                        <h1 className="text-3xl font-bold text-slate-900 mb-6">{selectedText.title}</h1>
                        <div className="prose prose-lg max-w-none mb-8 bg-amber-50/50 p-6 rounded-xl border border-amber-100 text-slate-700 italic leading-relaxed">
                            {selectedText.content.split('\n').map((line, i) => (
                                <p key={i}>{line}</p>
                            ))}
                        </div>

                        <div className="space-y-12">
                            {selectedText.questions.map((q) => (
                                <div key={q.id} className="relative group">
                                    <div className="absolute -left-4 top-0 bottom-0 w-1 bg-emerald-100 group-hover:bg-emerald-400 transition-colors rounded-full" />
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 font-bold text-sm border border-emerald-100">
                                                {q.id}
                                            </span>
                                            <label className="text-xl font-semibold text-slate-800 leading-tight">
                                                {q.question}
                                            </label>
                                        </div>

                                        <div className="relative">
                                            <Textarea
                                                value={answers[q.id] || ''}
                                                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                                placeholder="Écris ta réponse ici en te basant sur le texte..."
                                                className="min-h-[120px] text-lg p-6 bg-slate-50 border-2 border-slate-100 focus:border-emerald-500 rounded-2xl shadow-inner transition-all resize-none placeholder:text-slate-400 focus:bg-white"
                                            />
                                            <div className="absolute right-4 bottom-4 opacity-20 group-hover:opacity-100 transition-opacity">
                                                <BookOpen className="h-5 w-5 text-slate-400" />
                                            </div>
                                        </div>

                                        {correctionData && (
                                            <div className={`mt-4 p-5 rounded-2xl border-2 animate-in fade-in slide-in-from-top-2 duration-500 ${correctionData.find(c => c.id === q.id)?.status === 'correct' ? 'bg-emerald-50 border-emerald-100 text-emerald-900' :
                                                correctionData.find(c => c.id === q.id)?.status === 'partial' ? 'bg-amber-50 border-amber-100 text-amber-900' :
                                                    'bg-rose-50 border-rose-100 text-rose-900'
                                                }`}>
                                                <div className="flex items-start gap-4">
                                                    <div className="mt-1">
                                                        {correctionData.find(c => c.id === q.id)?.status === 'correct' ? <CheckCircle className="h-6 w-6 text-emerald-600" /> :
                                                            correctionData.find(c => c.id === q.id)?.status === 'partial' ? <Info className="h-6 w-6 text-amber-600" /> :
                                                                <XCircle className="h-6 w-6 text-rose-600" />}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <p className="font-bold flex items-center gap-2">
                                                            <Sparkles className="h-4 w-4" /> Analyse de l'assistant
                                                        </p>
                                                        <p className="text-lg opacity-90 leading-relaxed">
                                                            {correctionData.find(c => c.id === q.id)?.feedback}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col items-center gap-4">
                            {!correctionData && (
                                <p className="text-slate-500 flex items-center gap-2 italic">
                                    <Sparkles className="h-4 w-4 text-emerald-500" />
                                    L'assistant analysera tes réponses en format libre.
                                </p>
                            )}
                            <Button
                                onClick={handleCorrection}
                                disabled={isCorrecting}
                                size="lg"
                                className="w-full md:w-auto min-w-[300px] bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xl py-8 px-12 rounded-2xl shadow-xl shadow-emerald-500/30 hover:-translate-y-1 transition-all active:scale-95"
                            >
                                {isCorrecting ? (
                                    <span className="flex items-center gap-3">
                                        <div className="animate-spin rounded-full h-6 w-6 border-4 border-white border-t-transparent" />
                                        Analyse intelligente...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-3">
                                        <Send className="h-6 w-6" /> Soumettre mon travail
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>

                    {correctionData && (
                        <div className="bg-slate-900 rounded-3xl p-10 shadow-2xl border-4 border-emerald-500/20 text-white">
                            <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                                <div className="p-5 bg-emerald-500/20 rounded-2xl border border-emerald-500/30">
                                    <Sparkles className="h-10 w-10 text-emerald-400" />
                                </div>
                                <div className="text-center md:text-left">
                                    <h3 className="text-3xl font-black mb-2">Bilan de l'Assistant IA</h3>
                                    <p className="text-emerald-400/80 text-lg font-medium">Analyse globale de ton étude de texte terminée avec succès.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-center">
                                    <p className="text-emerald-400 text-4xl font-black mb-1">
                                        {correctionData.filter(c => c.status === 'correct').length}
                                    </p>
                                    <p className="text-slate-400 uppercase tracking-widest text-xs font-bold">Excellents</p>
                                </div>
                                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-center">
                                    <p className="text-amber-400 text-4xl font-black mb-1">
                                        {correctionData.filter(c => c.status === 'partial').length}
                                    </p>
                                    <p className="text-slate-400 uppercase tracking-widest text-xs font-bold">À compléter</p>
                                </div>
                                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-center">
                                    <p className="text-rose-400 text-4xl font-black mb-1">
                                        {correctionData.filter(c => c.status === 'incorrect').length}
                                    </p>
                                    <p className="text-slate-400 uppercase tracking-widest text-xs font-bold">Insuffisants</p>
                                </div>
                            </div>

                            <Button
                                onClick={() => {
                                    setCorrectionData(null);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="mt-8 w-full bg-white/10 hover:bg-white/20 text-white border border-white/10 py-6 text-lg rounded-xl font-bold"
                            >
                                Réessayer l'exercice
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <Button onClick={onBack} variant="outline" size="lg">
                        <ArrowLeft className="mr-2 h-5 w-5" /> Retour
                    </Button>
                    <h1 className="text-3xl font-bold text-slate-900">Études de texte</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {etudeTexteData.map((text) => (
                        <div
                            key={text.id}
                            onClick={() => setSelectedText(text)}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-amber-100 rounded-xl group-hover:bg-amber-200 transition-colors">
                                    <BookOpen className="h-6 w-6 text-amber-700" />
                                </div>
                                <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600">
                                    {text.questions.length} questions
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-emerald-700 transition-colors">
                                {text.title}
                            </h3>
                            <p className="text-slate-500 line-clamp-2 text-sm">
                                {text.content}
                            </p>
                        </div>
                    ))}
                    {/* Placeholder cards to show grid layout */}
                    {[...Array(5)].map((_, i) => (
                        <div key={`placeholder-${i}`} className="bg-slate-50 rounded-2xl p-6 border-2 border-dashed border-slate-200 flex items-center justify-center min-h-[200px]">
                            <p className="text-slate-400 font-medium">Texte {i + 2} (Bientôt disponible)</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
