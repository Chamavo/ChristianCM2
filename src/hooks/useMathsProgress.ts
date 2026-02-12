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

export const useMathsProgress = () => {
  const [progress, setProgress] = useState<MathsProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load progress:", e);
    }
    return getDefaultProgress();
  });

  // Save to localStorage whenever progress changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.error("Failed to save progress:", e);
    }
  }, [progress]);

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
