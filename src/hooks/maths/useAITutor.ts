import { useState } from 'react';
import { supabase } from '@/integrations/supabase/mathsClient';

interface MathHelpRequest {
    type: 'math_help';
    question: string;
    correctAnswer: string | number;
    userAnswer: string | number;
    astuce?: string;
    failureCount: number;
}

interface WorldExplanationRequest {
    type: 'world_explanation';
    worldQuestion: string;
    worldChoices: { A: string; B: string; C: string; D: string };
    userChoice: string;
    justification: string;
    theme: string;
}

type AITutorRequest = MathHelpRequest | WorldExplanationRequest;

export const useAITutor = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [aiMessage, setAiMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const askForHelp = async (request: AITutorRequest): Promise<string | null> => {
        setIsLoading(true);
        setError(null);
        setAiMessage(null);

        try {
            const { data, error: invokeError } = await supabase.functions.invoke('ai-tutor', {
                body: request,
            });

            if (invokeError) {
                throw new Error(invokeError.message);
            }

            if (data?.success && data?.message) {
                setAiMessage(data.message);
                return data.message;
            } else {
                throw new Error(data?.error || 'Failed to get AI response');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            console.error('AI Tutor error:', errorMessage);
            setError(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const clearMessage = () => {
        setAiMessage(null);
        setError(null);
    };

    return {
        askForHelp,
        isLoading,
        aiMessage,
        error,
        clearMessage,
    };
};
