import React from 'react';
import { motion } from 'framer-motion';

export interface LogicalSequenceData {
    sequence: string[]; // e.g. ["🔴", "🔵", "🔴", "?"]
    options: string[]; // e.g. ["🔴", "🔵", "🟢"]
    correctAnswer: string;
}

interface LogicalSequenceProps {
    data: LogicalSequenceData;
    onAnswer: (correct: boolean) => void;
}

const LogicalSequence: React.FC<LogicalSequenceProps> = ({ data, onAnswer }) => {
    return (
        <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto">
            <h3 className="text-xl text-gray-600 mb-8 font-medium">Complète la suite logique !</h3>

            <div className="flex gap-4 mb-12 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 justify-center flex-wrap">
                {data.sequence.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={`
                            w-16 h-16 md:w-20 md:h-20 flex items-center justify-center text-4xl rounded-xl
                            ${item === '?' ? 'bg-amber-100 text-amber-600 border-2 border-dashed border-amber-300' : 'bg-gray-50 border border-gray-200'}
                        `}
                    >
                        {item}
                    </motion.div>
                ))}
            </div>

            <div className="flex gap-4 flex-wrap justify-center">
                {data.options.map((option, index) => (
                    <motion.button
                        key={index}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onAnswer(option === data.correctAnswer)}
                        className="w-20 h-20 bg-white rounded-xl shadow-md border-b-4 border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-4xl flex items-center justify-center"
                    >
                        {option}
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default LogicalSequence;
