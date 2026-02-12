import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export interface SpatialGridData {
    gridSize: number; // e.g. 3 for 3x3
    pattern: boolean[]; // flattened array of filled cells
    displayTime: number; // time in ms to show pattern
}

interface SpatialGridPatternProps {
    data: SpatialGridData;
    onAnswer: (correct: boolean) => void;
}

const SpatialGridPattern: React.FC<SpatialGridPatternProps> = ({ data, onAnswer }) => {
    const [phase, setPhase] = useState<'memorize' | 'recall'>('memorize');
    const [userPattern, setUserPattern] = useState<boolean[]>([]);
    const [timeLeft, setTimeLeft] = useState(data.displayTime / 1000);

    // Reset state on new data
    useEffect(() => {
        setPhase('memorize');
        setUserPattern(new Array(data.gridSize * data.gridSize).fill(false));
        setTimeLeft(data.displayTime / 1000);
    }, [data]);

    // Timer for memorization phase
    useEffect(() => {
        if (phase === 'memorize') {
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 0.1) {
                        clearInterval(timer);
                        setPhase('recall');
                        return 0;
                    }
                    return prev - 0.1;
                });
            }, 100);
            return () => clearInterval(timer);
        }
    }, [phase]);

    // Check answer when user fills enough cells
    useEffect(() => {
        if (phase === 'recall') {
            const targetCount = data.pattern.filter(Boolean).length;
            const userCount = userPattern.filter(Boolean).length;

            if (userCount === targetCount) {
                // Check correctness
                const isCorrect = data.pattern.every((val, index) => val === userPattern[index]);
                onAnswer(isCorrect);
            }
        }
    }, [userPattern, data.pattern, phase, onAnswer]);

    const handleCellClick = (index: number) => {
        if (phase !== 'recall') return;
        setUserPattern(prev => {
            const newPattern = [...prev];
            newPattern[index] = !newPattern[index]; // Toggle
            return newPattern;
        });
    };

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto">
            <h3 className="text-xl text-gray-600 mb-4 font-medium">
                {phase === 'memorize' ? `Mémorise le motif ! (${Math.ceil(timeLeft)}s)` : "Reproduis le motif !"}
            </h3>

            <div
                className="grid gap-2 w-full max-w-[300px] aspect-square p-4 bg-gray-100 rounded-xl"
                style={{
                    gridTemplateColumns: `repeat(${data.gridSize}, minmax(0, 1fr))`
                }}
            >
                {Array.from({ length: data.gridSize * data.gridSize }).map((_, index) => {
                    const isFilled = phase === 'memorize' ? data.pattern[index] : userPattern[index];

                    return (
                        <motion.button
                            key={index}
                            className={`
                                rounded-lg transition-colors duration-200
                                ${isFilled ? 'bg-amber-500 shadow-inner' : 'bg-white shadow-sm'}
                                ${phase === 'recall' ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'}
                            `}
                            onClick={() => handleCellClick(index)}
                            whileTap={phase === 'recall' ? { scale: 0.9 } : {}}
                            animate={{ scale: isFilled ? 1.05 : 1 }}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default SpatialGridPattern;
