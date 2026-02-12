import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface MemoryCardsData {
    gridSize: number; // usually 4 (4x4=16 cards)
    pairs: string[]; // Array of 8 emojis to form 16 cards
}

interface MemoryCardsProps {
    data: MemoryCardsData;
    onAnswer: (correct: boolean) => void;
}

const MemoryCards: React.FC<MemoryCardsProps> = ({ data, onAnswer }) => {
    const [cards, setCards] = useState<{ id: number, content: string, isFlipped: boolean, isMatched: boolean }[]>([]);
    const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
    const [matches, setMatches] = useState(0);

    // Initialize game
    useEffect(() => {
        const deck = [...data.pairs, ...data.pairs]
            .sort(() => Math.random() - 0.5)
            .map((content, index) => ({
                id: index,
                content,
                isFlipped: false,
                isMatched: false
            }));
        setCards(deck);
    }, [data]);

    // Check match
    useEffect(() => {
        if (flippedIndices.length === 2) {
            const [first, second] = flippedIndices;
            if (cards[first].content === cards[second].content) {
                // Match!
                setCards(prev => prev.map((card, index) =>
                    index === first || index === second ? { ...card, isMatched: true } : card
                ));
                setMatches(m => m + 1);
                setFlippedIndices([]);
            } else {
                // No match, flip back
                setTimeout(() => {
                    setCards(prev => prev.map((card, index) =>
                        index === first || index === second ? { ...card, isFlipped: false } : card
                    ));
                    setFlippedIndices([]);
                }, 1000);
            }
        }
    }, [flippedIndices, cards]);

    // Check win condition
    useEffect(() => {
        if (matches > 0 && matches === data.pairs.length) {
            setTimeout(() => onAnswer(true), 500);
        }
    }, [matches, data.pairs.length, onAnswer]);

    const handleCardClick = (index: number) => {
        if (flippedIndices.length >= 2 || cards[index].isFlipped || cards[index].isMatched) return;

        setCards(prev => prev.map((card, i) =>
            i === index ? { ...card, isFlipped: true } : card
        ));
        setFlippedIndices(prev => [...prev, index]);
    };

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto">
            <h3 className="text-xl text-gray-600 mb-6 font-medium">Trouve toutes les paires !</h3>

            <div className="grid grid-cols-4 gap-3 w-full aspect-square">
                {cards.map((card, index) => (
                    <motion.div
                        key={card.id}
                        className="relative w-full h-full perspective-1000 cursor-pointer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleCardClick(index)}
                    >
                        <motion.div
                            className={`w-full h-full rounded-xl shadow-md flex items-center justify-center text-3xl transition-all duration-300 ${card.isFlipped || card.isMatched
                                    ? 'bg-white border-2 border-primary rotate-y-180'
                                    : 'bg-primary/20 border-2 border-primary/50'
                                }`}
                            animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                        >
                            {(card.isFlipped || card.isMatched) ? card.content : '❓'}
                        </motion.div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default MemoryCards;
