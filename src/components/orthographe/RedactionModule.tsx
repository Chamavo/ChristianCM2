
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Check, BookOpen, Star } from 'lucide-react';
import { redactionSubjects, RedactionSubject } from '@/data/redactionSubjects';
import { toast } from 'sonner';

interface RedactionModuleProps {
    onBack: () => void;
}

type Step = 'selection' | 'ecriture' | 'feedback';

export const RedactionModule = ({ onBack }: RedactionModuleProps) => {
    const [step, setStep] = useState<Step>('selection');
    const [selectedSubject, setSelectedSubject] = useState<RedactionSubject | null>(null);
    const [userText, setUserText] = useState('');
    const [score, setScore] = useState<number | null>(null);
    const [feedback, setFeedback] = useState<{ pointsForts: string[], aAmeliorer: string[] } | null>(null);

    const handleSelectSubject = (subject: RedactionSubject) => {
        setSelectedSubject(subject);
        setStep('ecriture');
        setUserText('');
        setScore(null);
        setFeedback(null);
    };

    const evaluateRedaction = () => {
        if (!userText.trim()) return;

        // Simulate AI Correction
        const words = userText.trim().split(/\s+/);
        const wordCount = words.length;
        let tempScore = 0;
        const pointsForts = [];
        const aAmeliorer = [];

        // 1. Length check (Target ~120 words for CM1?)
        if (wordCount > 100) {
            tempScore += 5;
            pointsForts.push("Bonne longueur de texte.");
        } else if (wordCount > 50) {
            tempScore += 3;
            aAmeliorer.push("Essaie d'écrire un peu plus (vise 100 mots).");
        } else {
            tempScore += 1;
            aAmeliorer.push("Le texte est trop court.");
        }

        // 2. Connector check (heuristics)
        const connectors = ['puis', 'ensuite', 'enfin', 'mais', 'car', 'parce que', 'soudain', 'alors'];
        const usedConnectors = connectors.filter(c => userText.toLowerCase().includes(c));
        if (usedConnectors.length >= 3) {
            tempScore += 5;
            pointsForts.push("Bonne utilisation des mots de liaison.");
        } else {
            tempScore += 2;
            aAmeliorer.push("Utilise plus de mots de liaison (Puis, Ensuite, Mais...).");
        }

        // 3. Structure check (Paragraphs)
        const paragraphs = userText.split('\n').filter(p => p.trim().length > 0);
        if (paragraphs.length >= 3) {
            tempScore += 5;
            pointsForts.push("Texte bien structuré en paragraphes.");
        } else {
            tempScore += 2;
            aAmeliorer.push("Pense à aérer ton texte en faisant des paragraphes.");
        }

        // 4. Vocabulary/Creativity (Random variation for now + length bonus)
        if (wordCount > 120) tempScore += 5;
        else tempScore += 3;

        // Normalize to /20
        // Current max raw items = 5+5+5+5 = 20.
        // So tempScore is already roughly /20.

        // Heuristic adjustment
        setScore(Math.min(20, Math.max(10, tempScore)));
        setFeedback({ pointsForts, aAmeliorer });
        setStep('feedback');
    };

    return (
        <div className="w-full max-w-5xl mx-auto p-4 space-y-6">
            <div className="flex items-center space-x-4 mb-6">
                <Button
                    variant="default"
                    onClick={() => step === 'selection' ? onBack() : setStep('selection')}
                    className={`font-bold py-6 px-8 text-xl rounded-2xl shadow-lg gap-3 transition-all ${step === 'selection'
                            ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                            : 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/20'
                        }`}
                >
                    <ArrowLeft className="w-6 h-6" />
                    {step === 'selection' ? 'Menu' : 'Retour'}
                </Button>
                <h1 className="text-3xl font-bold text-amber-600">Module Rédaction</h1>
            </div>

            {step === 'selection' && (
                <div className="space-y-8">
                    {(['Récit simple', 'Récit au passé', 'Récit imaginaire'] as const).map((cat) => (
                        <div key={cat}>
                            <h2 className="text-xl font-bold text-slate-700 mb-4 flex items-center">
                                <BookOpen className="w-5 h-5 mr-2 text-amber-500" />
                                {cat}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {redactionSubjects.filter(s => s.categorie === cat).map((sujet) => (
                                    <Card
                                        key={sujet.id}
                                        className="p-6 hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-green-500 hover:scale-105"
                                        onClick={() => handleSelectSubject(sujet)}
                                    >
                                        <h3 className="font-bold text-lg mb-2 text-slate-800">{sujet.titre}</h3>
                                        <span className="text-xs text-slate-400">Niveau {sujet.niveau}</span>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedSubject && step === 'ecriture' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="p-8 bg-blue-50 border-blue-100 border text-center">
                        <h2 className="text-2xl font-bold text-blue-900 mb-2">{selectedSubject.titre}</h2>
                        <p className="text-blue-700">Raconte cette histoire en faisant attention à l'orthographe et à la structure de ton texte.</p>
                    </Card>

                    <Card className="p-6 shadow-md">
                        <Textarea
                            value={userText}
                            onChange={(e) => setUserText(e.target.value)}
                            placeholder="Il était une fois..."
                            className="min-h-[400px] text-lg leading-relaxed p-6 resize-y focus:ring-green-500 border-slate-200"
                            spellCheck={false}
                        />
                        <div className="flex justify-between items-center mt-2 text-slate-400 text-sm">
                            <span>Minimum conseillé : 100 mots</span>
                            <span>{userText.split(/\s+/).filter(w => w.length > 0).length} mots</span>
                        </div>
                    </Card>

                    <div className="flex justify-end">
                        <Button
                            onClick={evaluateRedaction}
                            size="lg"
                            className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl text-lg shadow-lg"
                            disabled={userText.length < 50}
                        >
                            Soumettre ma rédaction <Check className="ml-2 w-5 h-5" />
                        </Button>
                    </div>
                </div>
            )}

            {selectedSubject && step === 'feedback' && feedback && (
                <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                    <Card className="p-8 bg-white border-2 border-slate-100 shadow-xl">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-slate-800 mb-2">Ton Résultat</h2>
                            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-amber-100 text-amber-600 text-4xl font-black mb-4 border-4 border-amber-200">
                                {score}
                            </div>
                            <p className="text-slate-500">sur 20</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                                <h3 className="font-bold text-green-800 mb-4 flex items-center">
                                    <Star className="w-5 h-5 mr-2 fill-green-600 text-green-600" /> Points Forts
                                </h3>
                                <ul className="space-y-2">
                                    {feedback.pointsForts.length > 0 ? (
                                        feedback.pointsForts.map((pt, i) => (
                                            <li key={i} className="flex items-start text-green-700">
                                                <Check className="w-4 h-4 mr-2 mt-1 flex-shrink-0" /> {pt}
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-green-700 italic">Continue tes efforts !</li>
                                    )}
                                </ul>
                            </div>

                            <div className="bg-orange-50 p-6 rounded-xl border border-orange-100">
                                <h3 className="font-bold text-orange-800 mb-4 flex items-center">
                                    <BookOpen className="w-5 h-5 mr-2 text-orange-600" /> Conseils
                                </h3>
                                <ul className="space-y-2">
                                    {feedback.aAmeliorer.length > 0 ? (
                                        feedback.aAmeliorer.map((pt, i) => (
                                            <li key={i} className="flex items-start text-orange-700">
                                                <span className="mr-2">•</span> {pt}
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-orange-700 italic">Bravo, c'est excellent !</li>
                                    )}
                                </ul>
                            </div>
                        </div>

                        <div className="mt-8 text-center flex justify-center gap-4">
                            <Button onClick={() => setStep('selection')} variant="outline">
                                Autre sujet
                            </Button>
                            <Button onClick={() => { setStep('ecriture'); setUserText(''); }} className="bg-amber-500 hover:bg-amber-600">
                                Nouvelle rédaction
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};
