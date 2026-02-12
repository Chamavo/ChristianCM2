import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

export interface AnagramData {
    word: string; // e.g. "MAISON"
    scrambled: string[]; // e.g. ["O", "S", "M", "I", "A", "N"]
    hint?: string; // e.g. "Où l'on habite"
}

interface AnagramProps {
    data: AnagramData;
    onAnswer: (correct: boolean) => void;
}

const Anagram: React.FC<AnagramProps> = ({ data, onAnswer }) => {
    const [selectedLetters, setSelectedLetters] = useState<{ letter: string, index: number }[]>([]);
    const [availableLetters, setAvailableLetters] = useState<{ letter: string, originalIndex: number }[]>([]);

    useEffect(() => {
        setAvailableLetters(data.scrambled.map((l, i) => ({ letter: l, originalIndex: i })));
        setSelectedLetters([]);
    }, [data]);

    const handleSelect = (letterObj: { letter: string, originalIndex: number }) => {
        setSelectedLetters(prev => [...prev, { letter: letterObj.letter, index: letterObj.originalIndex }]);
        setAvailableLetters(prev => prev.filter(l => l.originalIndex !== letterObj.originalIndex));
    };

    const handleDeselect = (letterObj: { letter: string, index: number }) => {
        setAvailableLetters(prev => [...prev, { letter: letterObj.letter, originalIndex: letterObj.index }]);
        setSelectedLetters(prev => prev.filter(l => l.index !== letterObj.index));
    };

    const checkWord = () => {
        const currentWord = selectedLetters.map(l => l.letter).join('');
        if (currentWord === data.word) {
            onAnswer(true);
        } else {
            // Shake animation or error feedback could go here
            // For now just simpler error handling
            const container = document.getElementById('word-container');
            if (container) {
                container.animate([
                    { transform: 'translateX(0)' },
                    { transform: 'translateX(-10px)' },
                    { transform: 'translateX(10px)' },
                    { transform: 'translateX(0)' }
                ], { duration: 300 });
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto">
            <h3 className="text-xl text-gray-600 mb-2 font-medium">Remets les lettres dans l'ordre !</h3>
            {data.hint && <p className="text-sm text-gray-400 mb-8 italic">Indice : {data.hint}</p>}

            {/* Selected Letters (Target) */}
            <div id="word-container" className="flex gap-2 mb-12 min-h-[80px] p-4 bg-amber-50/50 rounded-2xl border-2 border-amber-100 justify-center flex-wrap">
                <AnimatePresence>
                    {selectedLetters.map((item) => (
                        <motion.button
                            key={`selected-${item.index}`}
                            layoutId={`letter-${item.index}`}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            onClick={() => handleDeselect(item)}
                            className="w-12 h-12 md:w-14 md:h-14 bg-amber-500 text-white rounded-xl shadow-lg font-bold text-2xl flex items-center justify-center"
                        >
                            {item.letter}
                        </motion.button>
                    ))}
                    {selectedLetters.length === 0 && (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 italic">
                            Clique sur les lettres...
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Available Letters (Source) */}
            <div className="flex gap-3 flex-wrap justify-center mb-8">
                {availableLetters.map((item) => (
                    <motion.button
                        key={`source-${item.originalIndex}`}
                        layoutId={`letter-${item.originalIndex}`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleSelect(item)}
                        className="w-14 h-14 bg-white text-gray-700 border-b-4 border-gray-200 rounded-xl shadow-sm font-bold text-2xl flex items-center justify-center hover:bg-gray-50"
                    >
                        {item.letter}
                    </motion.button>
                ))}
            </div>

            <Button
                onClick={checkWord}
                disabled={selectedLetters.length !== data.word.length}
                className="w-full max-w-xs mt-4"
                size="lg"
            >
                Valider
            </Button>
        </div>
    );
};

export default Anagram;
