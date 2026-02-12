import { useState, useEffect, useCallback } from 'react';
import { UserProgress, EXERCISES_PER_LEVEL, MAX_ERRORS_PER_LEVEL, TOTAL_LEVELS } from '@/types/orthographe';

const STORAGE_KEY_PREFIX = 'orthographe_cm2_';
const MAX_USED_IDS = 20;

export const useProgress = () => {
    const [userProgress, setUserProgress] = useState<UserProgress | null>(null);

    const loadProgress = useCallback(async (username: string): Promise<UserProgress> => {
        const storageKey = `${STORAGE_KEY_PREFIX}${username.toLowerCase()}`;

        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                const progress = JSON.parse(stored) as UserProgress;
                if (typeof progress.levelErrors !== 'number') {
                    progress.levelErrors = 0;
                }
                setUserProgress(progress);
                return progress;
            }
        } catch (error) {
            console.error('Error loading progress:', error);
        }

        const newProgress: UserProgress = {
            username,
            currentLevel: 1,
            levelProgress: 0,
            levelErrors: 0,
            exercisesPerLevel: EXERCISES_PER_LEVEL,
            mistakes: {},
            exercisesCompleted: 0,
            usedExerciseIds: [],
            usedWords: [],
            sessionStartTime: null,
            lastSessionEnd: null
        };

        setUserProgress(newProgress);
        return newProgress;
    }, []);

    const saveProgress = useCallback((progress: UserProgress) => {
        const storageKey = `${STORAGE_KEY_PREFIX}${progress.username.toLowerCase()}`;
        try {
            localStorage.setItem(storageKey, JSON.stringify(progress));
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    }, []);

    const recordExercise = useCallback((exerciseId: number, isCorrect: boolean, correctAnswer: string) => {
        let result: { newLevelProgress: number; newLevelErrors: number } | null = null;

        setUserProgress(prev => {
            if (!prev) return null;

            let newUsedIds = [...prev.usedExerciseIds, exerciseId];
            if (newUsedIds.length > MAX_USED_IDS) {
                newUsedIds = newUsedIds.slice(-MAX_USED_IDS);
            }

            const newMistakes = { ...prev.mistakes };
            if (!isCorrect) {
                newMistakes[correctAnswer] = (newMistakes[correctAnswer] || 0) + 1;
            }

            const newLevelProgress = isCorrect ? prev.levelProgress + 1 : prev.levelProgress;
            const newLevelErrors = isCorrect ? prev.levelErrors : prev.levelErrors + 1;

            const updated: UserProgress = {
                ...prev,
                exercisesCompleted: prev.exercisesCompleted + 1,
                levelProgress: newLevelProgress,
                levelErrors: newLevelErrors,
                usedExerciseIds: newUsedIds,
                mistakes: newMistakes
            };

            saveProgress(updated);
            return updated;
        });
    }, [saveProgress]);

    const levelUp = useCallback(() => {
        if (!userProgress) return false;

        const updated: UserProgress = {
            ...userProgress,
            currentLevel: userProgress.currentLevel + 1,
            levelProgress: 0,
            levelErrors: 0,
            usedExerciseIds: []
        };

        setUserProgress(updated);
        saveProgress(updated);
        return true;
    }, [userProgress, saveProgress]);

    const resetLevel = useCallback(() => {
        if (!userProgress) return false;

        const updated: UserProgress = {
            ...userProgress,
            levelProgress: 0,
            levelErrors: 0,
            usedExerciseIds: []
        };

        setUserProgress(updated);
        saveProgress(updated);
        return true;
    }, [userProgress, saveProgress]);

    return {
        userProgress,
        loadProgress,
        recordExercise,
        levelUp,
        resetLevel,
        setUserProgress
    };
};
