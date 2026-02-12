export interface MathProblem {
    id: number;
    title: string;
    part: number;
    text: string;
    answer: string;
    questions?: {
        label?: string;
        response: string; // The expected answer
        unit?: string;    // The expected unit (e.g., "km", "€")
    }[];
}

let problemsData: MathProblem[] = [];
let problemsMap = new Map<number, MathProblem>();
let isLoaded = false;

async function ensureLoaded() {
    if (isLoaded) return;
    const data = await import('../../data/maths/problems150.json');
    problemsData = data.default as MathProblem[];
    problemsData.forEach((p) => {
        problemsMap.set(p.id, p);
    });
    isLoaded = true;
}

export const TOTAL_PROBLEMS = 200;

export const getProblem = (id: number): MathProblem | null => {
    // Note: This remains synchronous for UI compatibility, 
    // but the data should be pre-loaded by the dashboard
    return problemsMap.get(id) || null;
};

export const getAllProblems = async (): Promise<MathProblem[]> => {
    await ensureLoaded();
    return problemsData;
};

export const prefetchProblems = async () => {
    await ensureLoaded();
};

export const getProblemStatus = (id: number): 'locked' | 'unlocked' | 'solved' => {
    try {
        const saved = localStorage.getItem('math_problems_progress');
        if (!saved) return 'unlocked';
        const progress = JSON.parse(saved);
        return progress[id] || 'unlocked';
    } catch (e) {
        return 'unlocked';
    }
};

export const saveProblemStatus = (id: number, status: 'solved') => {
    try {
        const saved = localStorage.getItem('math_problems_progress');
        const progress = saved ? JSON.parse(saved) : {};
        progress[id] = status;
        localStorage.setItem('math_problems_progress', JSON.stringify(progress));
    } catch (e) {
        console.error("Failed to save progress", e);
    }
};

export const getProblemsByPart = (part: number): MathProblem[] => {
    return problemsData.filter((p: any) => p.part === part) as MathProblem[];
};
