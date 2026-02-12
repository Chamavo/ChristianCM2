import React from 'react';
import { ConcentrationExercise } from '@/types/concentrationTypes';
import AttentionIntruder from './exercises/AttentionIntruder';
import MemoryCards from './exercises/MemoryCards';
import MentalCalc from './exercises/MentalCalc';
import SpatialGridPattern from './exercises/SpatialGridPattern';
import LogicalSequence from './exercises/LogicalSequence';
import Anagram from './exercises/Anagram';

interface ExerciseRendererProps {
    exercise: ConcentrationExercise;
    onAnswer: (correct: boolean) => void;
}

const ExerciseRenderer: React.FC<ExerciseRendererProps> = ({ exercise, onAnswer }) => {
    switch (exercise.category) {
        case 'attention':
            return <AttentionIntruder data={exercise.data} onAnswer={onAnswer} />;

        case 'memory_visual':
            return <MemoryCards data={exercise.data} onAnswer={onAnswer} />;

        case 'math':
            return <MentalCalc data={exercise.data} onAnswer={onAnswer} />;

        case 'spatial':
            return <SpatialGridPattern data={exercise.data} onAnswer={onAnswer} />;

        case 'logic':
            return <LogicalSequence data={exercise.data} onAnswer={onAnswer} />;

        case 'language':
            return <Anagram data={exercise.data} onAnswer={onAnswer} />;

        // Add other cases here as we implement them

        default:
            return (
                <div className="p-12 text-center">
                    <p className="text-gray-400 italic mb-4">Exercice en cours de développement...</p>
                    <p className="font-mono text-sm bg-gray-100 p-2 rounded inline-block">
                        {exercise.category} / {exercise.type}
                    </p>
                    <div className="mt-8">
                        <button onClick={() => onAnswer(true)} className="px-4 py-2 bg-green-100 text-green-700 rounded mr-2">Simuler Succès</button>
                    </div>
                </div>
            );
    }
};

export default ExerciseRenderer;
