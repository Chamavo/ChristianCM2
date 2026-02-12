export interface ProgressionLevel {
    id: number;
    name: string;
    nb_exercices: number;
    revision: boolean;
}

export interface ProgressionExercise {
    id: string;
    question: string;
    correctAnswer: string;
    options?: string[];
    category: string;
    text_content?: string;
    hint?: string;
}

export interface ProgressionProgress {
    student_id: string;
    current_level: number;
    exercises_done: number;
    correct_answers: number;
    consecutive_perfect: number;
    all_completed: boolean;
    failures_count: number;
    lockout_until: string | null;
    exercises_pool: ProgressionExercise[];
    answered_indices: number[];
}

export interface NiveauxData {
    niveaux: ProgressionLevel[];
}

export interface ProgressionData {
    verbes: any[];
}

export interface MotsDuboisData {
    mots: any[];
}

export interface GrammarPhrasesData {
    phrases: any[];
}
