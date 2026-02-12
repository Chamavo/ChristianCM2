import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export interface MentalCalcData {
    operation: string; // e.g. "15 + 7"
    options: number[]; // e.g. [21, 22, 23, 22]
    correctAnswer: number;
}

interface MentalCalcProps {
    data: MentalCalcData;
    onAnswer: (correct: boolean) => void;
}

const MentalCalc: React.FC<MentalCalcProps> = ({ data, onAnswer }) => {
    return (
        <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto">
            <h3 className="text-xl text-gray-600 mb-8 font-medium">Calcule rapidement !</h3>

            <motion.div
                className="bg-amber-100/50 rounded-3xl p-12 mb-10 w-full text-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
            >
                <div className="text-6xl font-black text-amber-900 tracking-wider">
                    {data.operation}
                </div>
            </motion.div>

            <div className="grid grid-cols-2 gap-4 w-full">
                {data.options.map((option, index) => (
                    <motion.button
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onAnswer(option === data.correctAnswer)}
                        className={`
                            py-6 rounded-2xl text-3xl font-bold shadow-sm border-b-4 transition-all
                            bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50
                        `}
                    >
                        {option}
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default MentalCalc;
