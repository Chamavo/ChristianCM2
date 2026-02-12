import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export interface AttentionIntruderData {
    gridSize: number; // e.g. 3 for 3x3
    commonItem: string; // e.g. "O"
    intruderItem: string; // e.g. "0"
    intruderIndex: number; // Position in the flat array
}

interface AttentionIntruderProps {
    data: AttentionIntruderData;
    onAnswer: (correct: boolean) => void;
}

const AttentionIntruder: React.FC<AttentionIntruderProps> = ({ data, onAnswer }) => {
    const { gridSize, commonItem, intruderItem, intruderIndex } = data;

    // Create the grid array
    const totalItems = gridSize * gridSize;
    const items = Array(totalItems).fill(commonItem);
    items[intruderIndex] = intruderItem;

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto">
            <h3 className="text-xl text-gray-600 mb-6 font-medium">Trouve l'intrus qui se cache !</h3>

            <motion.div
                className="grid gap-3 w-full"
                style={{
                    gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                    aspectRatio: '1/1'
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                {items.map((item, index) => (
                    <motion.button
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onAnswer(index === intruderIndex)}
                        className={`
                            rounded-xl text-3xl md:text-4xl shadow-md border-b-4 transition-all flex items-center justify-center
                            bg-white border-gray-200 text-gray-700 hover:border-amber-300 hover:bg-amber-50
                        `}
                    >
                        {item}
                    </motion.button>
                ))}
            </motion.div>
        </div>
    );
};

export default AttentionIntruder;
