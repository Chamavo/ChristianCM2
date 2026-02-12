export interface Student {
    id: string;
    first_name: string;
    last_name: string;
    display_name: string;
    level: number;
    username?: string;
    password_hash?: string;
    is_active?: boolean;
}

export interface ErrorByCategory {
    fraction: number;
    addition: number;
    soustraction: number;
    multiplication: number;
    division: number;
    pourcentage: number;
    geometrie: number;
    conversion: number;
    vitesse: number;
    partage: number;
    temps: number;
    autre: number;
}

export interface LevelAttempt {
    level: number;
    date: string;
    score: number;
    totalQuestions: number;
    timeSpent: number;
    passed: boolean;
    errors: ErrorByCategory;
}

export interface StudentProgress {
    username: string;
    currentLevel: number;
    totalAttempts: number;
    lastActivity: string;
    attempts: LevelAttempt[];
    errorStats: ErrorByCategory;
}

export type AppView = 'home' | 'calcul' | 'monde' | 'revisions' | 'sujets' | 'problemes' | 'dashboard';

export interface AppSession {
    username: string;
    level: number;
    isTeacher: boolean;
    role: 'student' | 'teacher';
}
