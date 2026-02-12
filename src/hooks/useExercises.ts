import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/orthographeClient';
import { Exercise, generateExercise } from '@/types/orthographe';

interface ExerciseWithDbId extends Exercise {
    dbId?: string;
}

export const useExercises = () => {
    const [dbExercises, setDbExercises] = useState<ExerciseWithDbId[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [exerciseCount, setExerciseCount] = useState(0);

    const loadExercises = useCallback(async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase.rpc('get_exercises_public');

            if (error) {
                console.error('Error loading exercises:', error);
                return;
            }

            const exercises: ExerciseWithDbId[] = (data as any[]).map((ex, index) => ({
                id: index + 10000,
                dbId: ex.id,
                type: ex.type,
                question: ex.question,
                options: ex.options || undefined,
                correctAnswer: '',
                level: ex.level,
                hint: ex.explanation || undefined,
                category: 'orthographe' as const,
            }));

            setDbExercises(exercises);
            setExerciseCount(exercises.length);
        } catch (error) {
            console.error('Error loading exercises:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadExercises();
    }, [loadExercises]);

    const getExercise = useCallback((level: number, usedIds: number[]): ExerciseWithDbId => {
        let availableDbExercises = dbExercises.filter(
            ex => ex.level <= level && !usedIds.includes(ex.id)
        );

        if (availableDbExercises.length > 0) {
            return availableDbExercises[Math.floor(Math.random() * availableDbExercises.length)];
        }

        return generateExercise(level, usedIds);
    }, [dbExercises]);

    const validateAnswer = useCallback(async (
        exercise: ExerciseWithDbId,
        userAnswer: string
    ): Promise<{ isCorrect: boolean; correctAnswer?: string }> => {
        if (exercise.dbId) {
            try {
                const { data, error } = await supabase.functions.invoke('validate-answer', {
                    body: { exerciseId: exercise.dbId, userAnswer }
                });

                if (error) {
                    console.error('Error validating answer:', error);
                    return { isCorrect: false };
                }

                return {
                    isCorrect: data.isCorrect,
                    correctAnswer: data.correctAnswer
                };
            } catch (error) {
                console.error('Error calling validate-answer:', error);
                return { isCorrect: false };
            }
        }

        const isCorrect = userAnswer.trim().toLowerCase() === exercise.correctAnswer.toLowerCase();
        return {
            isCorrect,
            correctAnswer: isCorrect ? undefined : exercise.correctAnswer
        };
    }, []);

    return {
        dbExercises,
        exerciseCount,
        isLoading,
        loadExercises,
        getExercise,
        validateAnswer,
    };
};
