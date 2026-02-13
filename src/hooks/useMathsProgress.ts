import { useState, useEffect, useCallback } from "react";

interface LevelProgress {
  completed: boolean;
  bestScore: number;
  totalQuestions: number;
  attempts: number;
  lastPlayed?: string;
}

interface CategoryProgress {
  bestScore: number;
  totalQuestions: number;
  attempts: number;
  lastPlayed?: string;
}

interface SujetProgress {
  bestScore: number;
  totalQuestions: number;
  attempts: number;
  bestTime?: number;
  lastPlayed?: string;
}

interface MathsProgress {
  levels: Record<number, LevelProgress>;
  revisions: Record<string, CategoryProgress>;
  sujets: Record<string, SujetProgress>;
  totalStars: number;
  lastUpdated: string;
}

const STORAGE_KEY = "maths-progress";

const getDefaultProgress = (): MathsProgress => ({
  levels: {},
  revisions: {},
  sujets: {},
  totalStars: 0,
  lastUpdated: new Date().toISOString(),
});

// Get max allowed errors for a level
export const getMaxErrorsForLevel = (levelIndex: number): number => {
  // Levels 1-2 (index 0-1): 0 errors allowed
  // Levels 3+ (index 2+): 1 error allowed
  return levelIndex < 2 ? 0 : 1;
};

import { supabase } from "@/integrations/supabase/mathsClient";

export const useMathsProgress = (studentId: string) => {
  const [progress, setProgress] = useState<MathsProgress>(() => {
    // Try to load from local storage first for immediate UI
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_${studentId}`);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load progress:", e);
    }
    return getDefaultProgress();
  });

  // Load from Supabase on mount
  useEffect(() => {
    const loadFromSupabase = async () => {
      try {
        const { data, error } = await supabase
          .from('progression_maths')
          .select('data')
          .eq('student_id', studentId)
          .maybeSingle();

        if (error) throw error;

        if (data && data.data) {
          // Merge or replace? For now, server wins if it exists
          const serverProgress = data.data as unknown as MathsProgress;
          setProgress(serverProgress);
          // Update local storage to match server
          localStorage.setItem(`${STORAGE_KEY}_${studentId}`, JSON.stringify(serverProgress));
        }
      } catch (e) {
        console.error("Failed to load from Supabase:", e);
      }
    };

    if (studentId) {
      loadFromSupabase();
    }
  }, [studentId]);

  // Save to localStorage AND Supabase whenever progress changes
  useEffect(() => {
    if (!studentId) return;

    // 1. Local Storage
    try {
      localStorage.setItem(`${STORAGE_KEY}_${studentId}`, JSON.stringify(progress));
    } catch (e) {
      console.error("Failed to save progress locally:", e);
    }

    // 2. Supabase (Debounced or fire-and-forget)
    const saveToSupabase = async () => {
      try {
        const { error } = await supabase
          .from('progression_maths')
          .upsert({
            student_id: studentId,
            data: progress as any,
            last_updated: new Date().toISOString()
          });

        if (error) throw error;
      } catch (e) {
        console.error("Failed to save to Supabase:", e);
      }
    };

    // Simple fire-and-forget for now to avoid complexity
    saveToSupabase();

  }, [progress, studentId]);

  const updateLevelProgress = useCallback((
    levelIndex: number,
    score: number,
    totalQuestions: number,
    errors: number
  ) => {
    setProgress((prev) => {
      const existingLevel = prev.levels[levelIndex];
      const isNewBest = !existingLevel || score > existingLevel.bestScore;

      // Check if level is passed based on error rules
      const maxErrors = getMaxErrorsForLevel(levelIndex);
      const isPassed = errors <= maxErrors && score >= totalQuestions - maxErrors;

      // Calculate stars earned
      let starsEarned = 0;
      const isPerfect = score === totalQuestions;
      if (isPerfect && (!existingLevel || !existingLevel.completed)) {
        starsEarned = 3;
      } else if (score >= totalQuestions * 0.8 && !existingLevel?.completed) {
        starsEarned = 2;
      } else if (score >= totalQuestions * 0.6 && !existingLevel?.completed) {
        starsEarned = 1;
      }

      return {
        ...prev,
        levels: {
          ...prev.levels,
          [levelIndex]: {
            completed: isPassed || existingLevel?.completed || false,
            bestScore: isNewBest ? score : (existingLevel?.bestScore || 0),
            totalQuestions,
            attempts: (existingLevel?.attempts || 0) + 1,
            lastPlayed: new Date().toISOString(),
          },
        },
        totalStars: prev.totalStars + starsEarned,
        lastUpdated: new Date().toISOString(),
      };
    });
  }, []);

  const updateRevisionProgress = useCallback((
    categoryId: string,
    score: number,
    totalQuestions: number
  ) => {
    setProgress((prev) => {
      const existing = prev.revisions[categoryId];
      const isNewBest = !existing || score > existing.bestScore;

      return {
        ...prev,
        revisions: {
          ...prev.revisions,
          [categoryId]: {
            bestScore: isNewBest ? score : (existing?.bestScore || 0),
            totalQuestions,
            attempts: (existing?.attempts || 0) + 1,
            lastPlayed: new Date().toISOString(),
          },
        },
        lastUpdated: new Date().toISOString(),
      };
    });
  }, []);

  const updateSujetProgress = useCallback((
    sujetId: string,
    score: number,
    totalQuestions: number,
    timeSpent?: number
  ) => {
    setProgress((prev) => {
      const existing = prev.sujets[sujetId];
      const isNewBest = !existing || score > existing.bestScore;
      const isBetterTime = timeSpent && (!existing?.bestTime || timeSpent < existing.bestTime);

      return {
        ...prev,
        sujets: {
          ...prev.sujets,
          [sujetId]: {
            bestScore: isNewBest ? score : (existing?.bestScore || 0),
            totalQuestions,
            attempts: (existing?.attempts || 0) + 1,
            bestTime: isBetterTime ? timeSpent : existing?.bestTime,
            lastPlayed: new Date().toISOString(),
          },
        },
        lastUpdated: new Date().toISOString(),
      };
    });
  }, []);

  const getLevelProgress = useCallback((levelIndex: number): LevelProgress | undefined => {
    return progress.levels[levelIndex];
  }, [progress.levels]);

  const getRevisionProgress = useCallback((categoryId: string): CategoryProgress | undefined => {
    return progress.revisions[categoryId];
  }, [progress.revisions]);

  const getSujetProgress = useCallback((sujetId: string): SujetProgress | undefined => {
    return progress.sujets[sujetId];
  }, [progress.sujets]);

  // Check if a level is unlocked
  const isLevelUnlocked = useCallback((levelIndex: number): boolean => {
    // Level 1 (index 0) is always unlocked
    if (levelIndex === 0) return true;

    // Check if previous level is completed
    const previousLevel = progress.levels[levelIndex - 1];
    return previousLevel?.completed === true;
  }, [progress.levels]);

  const getCompletedLevelsCount = useCallback((): number => {
    return Object.values(progress.levels).filter(l => l.completed).length;
  }, [progress.levels]);

  const resetProgress = useCallback(() => {
    setProgress(getDefaultProgress());
  }, []);

  return {
    progress,
    updateLevelProgress,
    updateRevisionProgress,
    updateSujetProgress,
    getLevelProgress,
    getRevisionProgress,
    getSujetProgress,
    isLevelUnlocked,
    getCompletedLevelsCount,
    resetProgress,
  };
};
