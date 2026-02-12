export type ExerciseCategory =
    | 'memory_visual'
    | 'logic'
    | 'attention'
    | 'math'
    | 'language'
    | 'spatial';

export type SessionPhase = 'warmup' | 'core' | 'challenge' | 'review';

export type DifficultyLevel = 1 | 2 | 3;

export interface ConcentrationExercise {
    id: string;
    category: ExerciseCategory;
    type: string; // Specific exercise type (e.g., 'memory_cards')
    difficulty: DifficultyLevel;
    data: any; // Specific data for the exercise (grid, sequence, etc.)
    question: string;
    answer: any;
    timeLimit?: number; // Optional timer in seconds
}

export interface ConcentrationProfile {
    username: string;
    level: number;
    xp: number;
    stats: {
        sessionsCompleted: number;
        exercisesCompleted: number;
        bestStreak: number;
    };
}

export interface SessionConfig {
    phase: SessionPhase;
    totalDuration: number; // in minutes
    exercises: ConcentrationExercise[];
}
