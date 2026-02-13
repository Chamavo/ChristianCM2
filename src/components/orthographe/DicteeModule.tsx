import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Play, Pause, Check, RotateCcw, PenTool, BookOpen, Volume2, Sparkles, Award } from 'lucide-react';
import { dictees, Dictee } from '@/data/dictees';
import ModuleHeader from '../shared/ModuleHeader';

interface DicteeModuleProps {
    onBack: () => void;
}

type Step = 'selection' | 'preparation' | 'ecriture' | 'correction';

export const DicteeModule = ({ onBack }: DicteeModuleProps) => {
    const [step, setStep] = useState<Step>('selection');
    const [selectedDictee, setSelectedDictee] = useState<Dictee | null>(null);
    const [userText, setUserText] = useState('');
    const [score, setScore] = useState<number | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speechRate, setSpeechRate] = useState(0.8);

    const synthesis = window.speechSynthesis;

    useEffect(() => {
        return () => {
            synthesis.cancel();
        };
    }, []);

    const handleSelectDictee = (dictee: Dictee) => {
        setSelectedDictee(dictee);
        setStep('preparation');
        setUserText('');
        setScore(null);
    };

    const handleSpeak = (text: string) => {
        if (synthesis.speaking) {
            synthesis.cancel();
            setIsPlaying(false);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'fr-FR';
        utterance.rate = speechRate;
        utterance.onend = () => setIsPlaying(false);

        setIsPlaying(true);
        synthesis.speak(utterance);
    };

    const calculateScore = () => {
        if (!selectedDictee) return;

        const targetWords = selectedDictee.texte.trim().split(/\s+/);
        const userWords = userText.trim().split(/\s+/);

        let correctCount = 0;
        const minLength = Math.min(targetWords.length, userWords.length);

        for (let i = 0; i < minLength; i++) {
            if (targetWords[i].replace(/[.,;:!?]/g, '').toLowerCase() === userWords[i].replace(/[.,;:!?]/g, '').toLowerCase()) {
                correctCount++;
            }
        }

        const accuracy = correctCount / targetWords.length;
        const computedScore = Math.max(0, Math.round(accuracy * 20));

        setScore(computedScore);
        setStep('correction');
    };

    return (
        <div className="w-full max-w-6xl mx-auto px-6 py-8 flex flex-col min-h-[90vh]">
            <ModuleHeader
                title="Dictées"
                subtitle={selectedDictee ? selectedDictee.titre : "Pratique ton orthographe"}
                icon={PenTool}
                onBack={() => step === 'selection' ? onBack() : setStep('selection')}
                variant="orthographe"
            />

            <div className="flex-1 flex flex-col relative">
                <AnimatePresence mode="wait">
                    {step === 'selection' && (
                        <motion.div
                            key="selection"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            {dictees.map((dictee) => (
                                <motion.div
                                    key={dictee.id}
                                    whileHover={{ y: -8, scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleSelectDictee(dictee)}
                                    className="bg-white/80 backdrop-blur-md rounded-[32px] p-8 border-4 border-white shadow-xl cursor-pointer group transition-all"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 font-black">
                                            #{dictee.id}
                                        </div>
                                        <div className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black text-slate-500 uppercase">
                                            {dictee.niveau || 'CM1'}
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-black text-slate-800 mb-2 leading-tight group-hover:text-orange-600 transition-colors">
                                        {dictee.titre}
                                    </h3>
                                    <p className="text-slate-400 font-bold italic text-sm mb-6">
                                        {dictee.auteur}
                                    </p>
                                    <div className="flex items-center gap-2 text-orange-500 font-black text-xs uppercase tracking-widest bg-orange-50 px-4 py-2 rounded-xl border border-orange-100 w-fit">
                                        Commencer <Sparkles className="w-4 h-4" />
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {selectedDictee && step === 'preparation' && (
                        <motion.div
                            key="preparation"
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white/80 backdrop-blur-md rounded-[48px] p-12 md:p-16 border-4 border-white shadow-3xl text-center max-w-3xl mx-auto"
                        >
                            <div className="w-24 h-24 bg-orange-100 rounded-[32px] flex items-center justify-center text-5xl mx-auto mb-8 shadow-inner border-2 border-orange-200">
                                📖
                            </div>
                            <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight uppercase">Préparation</h2>
                            <p className="text-xl text-slate-500 font-bold mb-10">"{selectedDictee.titre}" par {selectedDictee.auteur}</p>

                            <div className="bg-blue-50/50 p-8 rounded-[32px] text-left border-2 border-blue-100 mb-10">
                                <h3 className="font-black text-blue-800 mb-4 uppercase text-sm tracking-widest flex items-center gap-2">
                                    <BookOpen className="w-5 h-5" /> Conseils de réussite :
                                </h3>
                                <ul className="space-y-3">
                                    {[
                                        "Écoute bien la dictée en entier une première fois.",
                                        "Tu peux ralentir la lecture si besoin.",
                                        "Relis-toi bien avant de valider !",
                                        "Fais attention aux accords et aux pluriels."
                                    ].map((c, i) => (
                                        <li key={i} className="flex gap-3 text-slate-700 font-bold">
                                            <span className="text-blue-500">•</span> {c}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <Button
                                onClick={() => setStep('ecriture')}
                                size="lg"
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-8 text-2xl rounded-[32px] shadow-xl border-b-8 border-orange-700 active:translate-y-1 active:border-b-4 transition-all uppercase"
                            >
                                Commencer l'écriture ✍️
                            </Button>
                        </motion.div>
                    )}

                    {selectedDictee && step === 'ecriture' && (
                        <motion.div
                            key="ecriture"
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="space-y-8"
                        >
                            <div className="bg-white/60 backdrop-blur-md rounded-[32px] p-6 flex flex-col md:flex-row items-center justify-between gap-6 border-4 border-white shadow-xl">
                                <div className="flex items-center gap-6">
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleSpeak(selectedDictee.texte)}
                                        className={`w-20 h-20 rounded-[24px] flex items-center justify-center shadow-lg border-b-8 transition-all active:translate-y-1 active:border-b-4 ${isPlaying
                                                ? 'bg-rose-500 border-rose-700 text-white'
                                                : 'bg-orange-500 border-orange-700 text-white'
                                            }`}
                                    >
                                        {isPlaying ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 ml-1" />}
                                    </motion.button>
                                    <div>
                                        <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-1">Lecture</p>
                                        <h3 className="text-xl font-black text-slate-800">
                                            {isPlaying ? 'LECTURE EN COURS...' : 'ÉCUTER LA DICTÉE'}
                                        </h3>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 bg-white p-2 rounded-[24px] border-2 border-slate-100 shadow-inner">
                                    {[
                                        { l: 'Lente', v: 0.5 },
                                        { l: 'Normale', v: 0.8 },
                                        { l: 'Rapide', v: 1 }
                                    ].map((s) => (
                                        <button
                                            key={s.l}
                                            onClick={() => setSpeechRate(s.v)}
                                            className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-tighter transition-all ${speechRate === s.v
                                                    ? 'bg-orange-500 text-white shadow-md'
                                                    : 'text-slate-400 hover:bg-slate-50'
                                                }`}
                                        >
                                            {s.l}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="relative group">
                                <div className="absolute top-0 right-0 m-6 flex items-center gap-2 bg-slate-100/50 backdrop-blur-sm px-4 py-2 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <Volume2 className="w-4 h-4" /> {userText.split(/\s+/).filter(w => w.length > 0).length} MOTS
                                </div>
                                <Textarea
                                    value={userText}
                                    onChange={(e) => setUserText(e.target.value)}
                                    placeholder="Écris ici ce que tu entends..."
                                    className="min-h-[400px] text-2xl font-black rounded-[48px] p-12 border-4 border-white shadow-2xl focus:ring-12 focus:ring-orange-500/10 transition-all leading-relaxed bg-white/90 placeholder:text-slate-200 resize-none"
                                    spellCheck={false}
                                />
                            </div>

                            <div className="flex justify-center">
                                <Button
                                    onClick={calculateScore}
                                    size="lg"
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-16 py-8 rounded-[32px] text-2xl font-black shadow-xl border-b-8 border-emerald-700 active:translate-y-1 active:border-b-4 transition-all uppercase tracking-tight"
                                >
                                    Valider ma dictée <Check className="ml-4 w-8 h-8" strokeWidth={4} />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {selectedDictee && step === 'correction' && (
                        <motion.div
                            key="correction"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="space-y-10"
                        >
                            <div className="bg-white rounded-[56px] p-16 text-center border-4 border-white shadow-3xl overflow-hidden relative">
                                <div className="absolute -top-10 -right-10 opacity-5">
                                    <Award className="w-64 h-64 text-slate-900" />
                                </div>

                                <h2 className="text-4xl font-black text-slate-800 mb-4 uppercase tracking-tight">Ton Résultat</h2>
                                <div className="flex items-center justify-center gap-2 mb-10">
                                    <span className="text-8xl font-black text-orange-500 tracking-tighter">{score}</span>
                                    <span className="text-4xl font-black text-slate-300 mt-8">/ 20</span>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 text-left">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 bg-emerald-100/50 px-6 py-3 rounded-2xl w-fit border border-emerald-200">
                                            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                                            <span className="text-emerald-700 font-black text-xs uppercase tracking-widest">Version Originale</span>
                                        </div>
                                        <div className="bg-slate-50 p-8 rounded-[32px] border-2 border-slate-100 text-xl font-bold leading-relaxed text-slate-800 shadow-inner min-h-[250px]">
                                            {selectedDictee.texte}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 bg-blue-100/50 px-6 py-3 rounded-2xl w-fit border border-blue-200">
                                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                                            <span className="text-blue-700 font-black text-xs uppercase tracking-widest">Ta Version</span>
                                        </div>
                                        <div className="bg-slate-50 p-8 rounded-[32px] border-2 border-slate-100 text-xl font-bold leading-relaxed text-slate-800 shadow-inner min-h-[250px]">
                                            {userText || "(Pas de texte saisi)"}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-16">
                                    <Button
                                        onClick={() => setStep('selection')}
                                        variant="outline"
                                        className="h-20 px-10 rounded-[28px] text-lg font-black bg-white border-4 border-slate-100 hover:bg-slate-50 transition-all uppercase"
                                    >
                                        Autre dictée
                                    </Button>
                                    <Button
                                        onClick={() => { setUserText(''); setStep('ecriture'); setScore(null); }}
                                        className="h-20 px-12 rounded-[28px] text-lg font-black bg-orange-500 hover:bg-orange-600 text-white shadow-xl border-b-8 border-orange-700 active:translate-y-1 active:border-b-4 transition-all uppercase"
                                    >
                                        <RotateCcw className="w-6 h-6 mr-3" strokeWidth={3} /> Recommencer
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
