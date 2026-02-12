import React, { useState, useEffect } from 'react';
import { Globe, Send, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { getQuestionOfTheDay, WorldQuestion } from '@/data/maths/worldQuestions';
import { useAITutor } from '@/hooks/maths/useAITutor';
import MathsAppHeader from './MathsAppHeader';
import AITutorDialog from './AITutorDialog';

interface ComprendreLeMondeProps {
    username: string;
    onBack: () => void;
    onLogout: () => void;
}

const ComprendreLeMondeSection: React.FC<ComprendreLeMondeProps> = ({
    username,
    onBack,
    onLogout,
}) => {
    const [question, setQuestion] = useState<WorldQuestion | null>(null);
    const [selectedChoice, setSelectedChoice] = useState<string>('');
    const [justification, setJustification] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasAnsweredToday, setHasAnsweredToday] = useState(false);
    const [showAIDialog, setShowAIDialog] = useState(false);
    const { askForHelp, isLoading: isAILoading, aiMessage, clearMessage } = useAITutor();

    useEffect(() => {
        setQuestion(getQuestionOfTheDay());
        // Check if answered today in localStorage
        const today = new Date().toISOString().split('T')[0];
        const answered = localStorage.getItem(`world_answered_${username}_${today}`);
        if (answered) setHasAnsweredToday(true);
    }, [username]);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        // Simulate submission
        setTimeout(() => {
            const today = new Date().toISOString().split('T')[0];
            localStorage.setItem(`world_answered_${username}_${today}`, 'true');
            setHasAnsweredToday(true);
            setIsSubmitting(false);
            setShowAIDialog(true);
        }, 1000);
    };

    return (
        <div className="min-h-screen gradient-bg flex flex-col">
            <MathsAppHeader username={username} onBack={onBack} />

            <div className="flex-1 overflow-y-auto p-4 sm:p-8">
                <div className="max-w-2xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-8"
                    >
                        <Globe className="w-16 h-16 text-teal-400 mx-auto mb-4" />
                        <h1 className="text-3xl font-bold text-white mb-2">Comprendre le monde</h1>
                        <p className="text-white/70 italic text-lg">Intuition et ordres de grandeur 🌍</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl shadow-2xl p-6 sm:p-10"
                    >
                        {hasAnsweredToday ? (
                            <div className="text-center py-10">
                                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                                <h2 className="text-3xl font-black text-gray-800 mb-4">Bravo !</h2>
                                <p className="text-xl text-gray-600 mb-8">Ta réflexion du jour est enregistrée. ✨</p>
                                <Button
                                    onClick={() => setShowAIDialog(true)}
                                    className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-xl rounded-full"
                                >
                                    🤖 Discuter avec mon Tuteur IA
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="mb-10 text-center">
                                    <span className="bg-teal-100 text-teal-600 px-4 py-1 rounded-full text-sm font-bold mb-4 inline-block">
                                        {question?.theme}
                                    </span>
                                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 leading-tight">
                                        {question?.question}
                                    </h2>
                                </div>

                                <RadioGroup value={selectedChoice} onValueChange={setSelectedChoice} className="space-y-4 mb-10">
                                    {Object.entries(question?.choices || {}).map(([letter, label]) => (
                                        <Label
                                            key={letter}
                                            htmlFor={`choice-${letter}`}
                                            className={`flex items-center gap-4 p-5 rounded-2xl border-4 cursor-pointer transition-all ${selectedChoice === letter ? 'border-primary bg-blue-50' : 'border-gray-100 hover:border-gray-200'
                                                }`}
                                        >
                                            <RadioGroupItem value={letter} id={`choice-${letter}`} className="sr-only" />
                                            <span className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl ${selectedChoice === letter ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
                                                }`}>
                                                {letter}
                                            </span>
                                            <span className="text-xl font-bold text-gray-700">{label}</span>
                                        </Label>
                                    ))}
                                </RadioGroup>

                                <div className="mb-10">
                                    <Label className="text-xl font-bold text-gray-800 mb-4 block">Explique ton raisonnement 🤔</Label>
                                    <Textarea
                                        value={justification}
                                        onChange={(e) => setJustification(e.target.value)}
                                        placeholder="Pourquoi penses-tu que c'est cette réponse ?"
                                        className="min-h-[150px] text-lg rounded-2xl border-gray-200 focus:border-primary p-4"
                                    />
                                </div>

                                <Button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !selectedChoice || justification.length < 5}
                                    className="w-full py-8 text-2xl font-black rounded-2xl shadow-lg"
                                >
                                    {isSubmitting ? 'Enregistrement... ⏳' : 'JE VALIDE MA RÉPONSE 🚀'}
                                </Button>
                            </>
                        )}
                    </motion.div>
                </div>
            </div>

            <AITutorDialog
                isOpen={showAIDialog}
                onClose={() => setShowAIDialog(false)}
                question={question?.question || ''}
                userAnswer={selectedChoice}
                correctAnswer="L'important est ton raisonnement !"
                title="Réflexion sur le monde 🌍"
            />
        </div>
    );
};

export default ComprendreLeMondeSection;
