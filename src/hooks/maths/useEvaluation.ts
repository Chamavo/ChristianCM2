import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/mathsClient';

interface EvaluationError {
    question: string;
    userAnswer: string | null;
    correctAnswer: string;
    category: string;
}

interface EvaluationResult {
    id: string;
    score: number;
    totalQuestions: number;
    noteSur20: number;
    timeSpentSeconds: number;
    completedAt: string;
}

export const useEvaluation = () => {
    const [isLoading, setIsLoading] = useState(false);

    const canTakeEvaluation = useCallback(async (userId: string): Promise<{
        canTake: boolean;
        daysRemaining: number;
        lastEvaluation: EvaluationResult | null;
    }> => {
        try {
            const { data, error } = await supabase
                .from('student_evaluations')
                .select('*')
                .eq('user_id', userId)
                .order('completed_at', { ascending: false })
                .limit(1);

            if (error) {
                console.error('Erreur vérification évaluation:', error);
                return { canTake: true, daysRemaining: 0, lastEvaluation: null };
            }

            if (!data || data.length === 0) {
                return { canTake: true, daysRemaining: 0, lastEvaluation: null };
            }

            const lastEval = data[0];
            const lastDate = new Date(lastEval.completed_at);
            const now = new Date();
            const diffTime = now.getTime() - lastDate.getTime();
            const diffDays = diffTime / (1000 * 60 * 60 * 24);

            const canTake = diffDays >= 7;
            const daysRemaining = canTake ? 0 : Math.ceil(7 - diffDays);

            return {
                canTake,
                daysRemaining,
                lastEvaluation: {
                    id: lastEval.id,
                    score: lastEval.score,
                    totalQuestions: lastEval.total_questions,
                    noteSur20: Number(lastEval.note_sur_20),
                    timeSpentSeconds: lastEval.time_spent_seconds,
                    completedAt: lastEval.completed_at,
                },
            };
        } catch (error) {
            console.error('Erreur canTakeEvaluation:', error);
            return { canTake: true, daysRemaining: 0, lastEvaluation: null };
        }
    }, []);

    const saveEvaluation = useCallback(async (
        userId: string,
        username: string,
        score: number,
        totalQuestions: number,
        timeSpentSeconds: number,
        errors: EvaluationError[]
    ): Promise<boolean> => {
        setIsLoading(true);
        try {
            const noteSur20 = Math.round((score / totalQuestions) * 20 * 10) / 10;

            const { data: evalData, error: evalError } = await supabase
                .from('student_evaluations')
                .insert({
                    user_id: userId,
                    username,
                    score,
                    total_questions: totalQuestions,
                    note_sur_20: noteSur20,
                    time_spent_seconds: timeSpentSeconds,
                })
                .select()
                .single();

            if (evalError) {
                console.error('Erreur insertion évaluation:', evalError);
                setIsLoading(false);
                return false;
            }

            if (errors.length > 0) {
                const errorEntries = errors.map(e => ({
                    evaluation_id: evalData.id,
                    question: e.question,
                    user_answer: e.userAnswer,
                    correct_answer: e.correctAnswer,
                    category: e.category,
                }));

                const { error: errorsError } = await supabase
                    .from('evaluation_errors')
                    .insert(errorEntries);

                if (errorsError) {
                    console.error('Erreur insertion erreurs:', errorsError);
                }
            }

            setIsLoading(false);
            return true;
        } catch (error) {
            console.error('Erreur saveEvaluation:', error);
            setIsLoading(false);
            return false;
        }
    }, []);

    const getAllEvaluations = useCallback(async (): Promise<Array<{
        id: string;
        username: string;
        score: number;
        totalQuestions: number;
        noteSur20: number;
        timeSpentSeconds: number;
        completedAt: string;
        errorsCount: number;
    }>> => {
        try {
            const { data, error } = await supabase
                .from('student_evaluations')
                .select('*')
                .order('completed_at', { ascending: false });

            if (error) {
                console.error('Erreur récupération évaluations:', error);
                return [];
            }

            return data?.map(e => ({
                id: e.id,
                username: e.username,
                score: e.score,
                totalQuestions: e.total_questions,
                noteSur20: Number(e.note_sur_20),
                timeSpentSeconds: e.time_spent_seconds,
                completedAt: e.completed_at,
                errorsCount: e.total_questions - e.score,
            })) || [];
        } catch (error) {
            console.error('Erreur getAllEvaluations:', error);
            return [];
        }
    }, []);

    const getEvaluationErrors = useCallback(async (evaluationId: string): Promise<EvaluationError[]> => {
        try {
            const { data, error } = await supabase
                .from('evaluation_errors')
                .select('*')
                .eq('evaluation_id', evaluationId);

            if (error) {
                console.error('Erreur récupération erreurs:', error);
                return [];
            }

            return data?.map(e => ({
                question: e.question,
                userAnswer: e.user_answer,
                correctAnswer: e.correct_answer,
                category: e.category,
            })) || [];
        } catch (error) {
            console.error('Erreur getEvaluationErrors:', error);
            return [];
        }
    }, []);

    return {
        canTakeEvaluation,
        saveEvaluation,
        getAllEvaluations,
        getEvaluationErrors,
        isLoading,
    };
};
