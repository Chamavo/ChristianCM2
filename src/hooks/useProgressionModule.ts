import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/orthographeClient';
import type {
    ProgressionLevel,
    ProgressionExercise,
    ProgressionProgress,
} from '@/types/progression';

const MAX_EXERCISES_PER_LEVEL = 10;
const SESSION_DURATION_SEC = 45 * 60;

export type ModuleStatus = 'loading_data' | 'fetching_progress' | 'generating_pool' | 'ready' | 'error';

export const useProgressionModule = (studentName: string) => {
    const [status, setStatus] = useState<ModuleStatus>('loading_data');
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState<ProgressionProgress>({
        student_id: studentName,
        current_level: 1,
        exercises_done: 0,
        correct_answers: 0,
        consecutive_perfect: 0,
        all_completed: false,
        failures_count: 0,
        lockout_until: null,
        exercises_pool: [],
        answered_indices: [],
    });
    const [exercises, setExercises] = useState<ProgressionExercise[]>([]);
    const [sessionTimeRemaining, setSessionTimeRemaining] = useState<number | null>(null);
    const [isSessionLocked, setIsSessionLocked] = useState(false);
    const [globalLockoutRemaining, setGlobalLockoutRemaining] = useState<number | null>(null);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setStatus('fetching_progress');
                const { data, error: dbError } = await supabase
                    .from('progression_levels')
                    .select('*')
                    .eq('student_id', studentName)
                    .maybeSingle();

                if (dbError) throw dbError;

                if (data) {
                    const d = data as any;
                    setProgress({
                        student_id: d.student_id,
                        current_level: d.current_level,
                        exercises_done: d.exercises_done,
                        correct_answers: d.correct_answers,
                        consecutive_perfect: d.consecutive_perfect,
                        all_completed: d.all_completed,
                        failures_count: d.failures_count || 0,
                        lockout_until: d.lockout_until,
                        exercises_pool: d.exercises_pool || [],
                        answered_indices: d.answered_indices || [],
                    });

                    if (d.exercises_pool && d.exercises_pool.length > 0) {
                        setExercises(d.exercises_pool);
                        setStatus('ready');
                    } else {
                        setStatus('generating_pool');
                    }
                } else {
                    // Create new progression if not exists
                    const { data: newData, error: insertError } = await supabase
                        .from('progression_levels')
                        .insert({ student_id: studentName })
                        .select()
                        .single();

                    if (insertError) throw insertError;
                    setStatus('generating_pool');
                }
            } catch (err: any) {
                setError(err.message);
                setStatus('error');
            }
        };

        loadInitialData();
    }, [studentName]);

    const generateExercises = useCallback(async () => {
        setStatus('generating_pool');
        // For now, use generated exercises client-side until full pool creation logic is moved
        const { generateExercise } = await import('@/types/orthographe');
        const newPool = Array.from({ length: 20 }, (_, i) => {
            const ex = generateExercise(progress.current_level, []);
            return {
                id: String(ex.id),
                question: ex.question,
                correctAnswer: ex.correctAnswer,
                options: ex.options,
                category: ex.category,
                hint: ex.hint
            };
        });

        await supabase
            .from('progression_levels')
            .update({
                exercises_pool: newPool,
                answered_indices: [],
                exercises_done: 0,
                correct_answers: 0
            })
            .eq('student_id', studentName);

        setExercises(newPool);
        setStatus('ready');
    }, [progress.current_level, studentName]);

    useEffect(() => {
        if (status === 'generating_pool') {
            generateExercises();
        }
    }, [status, generateExercises]);

    const recordAnswer = useCallback(async (isCorrect: boolean, exerciseIndex: number) => {
        const newDone = progress.exercises_done + 1;
        const newCorrect = progress.correct_answers + (isCorrect ? 1 : 0);
        const newAnsweredIndices = [...progress.answered_indices, exerciseIndex];

        const currentLevelTotal = MAX_EXERCISES_PER_LEVEL;

        if (newDone >= currentLevelTotal) {
            const isPass = (newCorrect / currentLevelTotal) >= 0.9;
            if (isPass) {
                const nextLevel = progress.current_level + 1;
                await supabase
                    .from('progression_levels')
                    .update({
                        current_level: nextLevel,
                        exercises_done: 0,
                        correct_answers: 0,
                        exercises_pool: [],
                        answered_indices: []
                    })
                    .eq('student_id', studentName);

                setProgress(prev => ({
                    ...prev,
                    current_level: nextLevel,
                    exercises_done: 0,
                    correct_answers: 0,
                    answered_indices: [],
                    exercises_pool: []
                }));
                setStatus('generating_pool');
                return { levelComplete: true, advanced: true, perfectSession: newCorrect === currentLevelTotal };
            } else {
                await supabase
                    .from('progression_levels')
                    .update({
                        exercises_done: 0,
                        correct_answers: 0,
                        answered_indices: []
                    })
                    .eq('student_id', studentName);

                setProgress(prev => ({
                    ...prev,
                    exercises_done: 0,
                    correct_answers: 0,
                    answered_indices: []
                }));
                return { levelComplete: true, advanced: false, perfectSession: false };
            }
        }

        setProgress(prev => ({
            ...prev,
            exercises_done: newDone,
            correct_answers: newCorrect,
            answered_indices: newAnsweredIndices
        }));

        await supabase
            .from('progression_levels')
            .update({
                exercises_done: newDone,
                correct_answers: newCorrect,
                answered_indices: newAnsweredIndices
            })
            .eq('student_id', studentName);

        return null;
    }, [progress, studentName]);

    const overallPercentage = Math.round(((progress.current_level - 1) / 50) * 100);

    return {
        status,
        error,
        progress,
        exercises,
        currentLevel: { nb_exercices: MAX_EXERCISES_PER_LEVEL } as any,
        overallPercentage,
        recordAnswer,
        generateExercises,
        isSessionLocked: false,
        sessionTimeRemaining: 3600,
        globalLockoutRemaining: null
    };
};
