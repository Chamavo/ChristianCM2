import { StructuredExercise, NiveauData } from './structuredExercises';

export const niveauFractions1: NiveauData = {
    niveau: 6.5,
    duree: "15 mn",
    instructions: "Niveau Fractions 1 : 20 questions à choix multiples sur les opérations de fractions simples.",
    exercices: [
        { enonce: "1/2 + 1/4 =", type: "fraction", reponse: 0.75, astuce: "= 2/4 + 1/4 = 3/4" },
        { enonce: "1/3 + 1/6 =", type: "fraction", reponse: 0.5, astuce: "= 2/6 + 1/6 = 3/6 = 1/2" },
        { enonce: "1/4 + 1/4 =", type: "fraction", reponse: 0.5, astuce: "= 2/4 = 1/2" },
        { enonce: "1/2 − 1/4 =", type: "fraction", reponse: 0.25, astuce: "= 2/4 − 1/4 = 1/4" },
        { enonce: "1/2 × 1/2 =", type: "fraction", reponse: 0.25, astuce: "= 1/4" },
        { enonce: "1/2 ÷ 2 =", type: "fraction", reponse: 0.25, astuce: "= 1/2 × 1/2 = 1/4" },
    ]
};

export const niveauFractions2: NiveauData = {
    niveau: 10.5,
    duree: "15 mn",
    instructions: "Niveau Fractions 2 : 20 questions ouvertes sur les opérations de fractions.",
    exercices: [
        { enonce: "1/2 + 1/3 =", type: "fraction", reponse: 0.833, astuce: "= 3/6 + 2/6 = 5/6" },
        { enonce: "2/3 + 1/4 =", type: "fraction", reponse: 0.917, astuce: "= 8/12 + 3/12 = 11/12" },
        { enonce: "2/3 − 1/4 =", type: "fraction", reponse: 0.417, astuce: "= 8/12 − 3/12 = 5/12" },
        { enonce: "2/3 × 3/4 =", type: "fraction", reponse: 0.5, astuce: "= 6/12 = 1/2" },
        { enonce: "1/2 ÷ 1/3 =", type: "fraction", reponse: 1.5, astuce: "= 1/2 × 3 = 3/2" },
    ]
};

export const generateFractionChoices = (correctAnswer: number): number[] => {
    const choices = [correctAnswer];
    const commonFractions = [0.25, 0.5, 0.75, 1, 1.5, 2];
    const possibleDistractors = commonFractions.filter(f => Math.abs(f - correctAnswer) >= 0.05);
    const shuffled = [...possibleDistractors].sort(() => Math.random() - 0.5);
    for (const distractor of shuffled) {
        if (choices.length >= 4) break;
        choices.push(distractor);
    }
    return choices.sort(() => Math.random() - 0.5);
};

export const formatAsFraction = (decimal: number): string => {
    const fractions: [number, string][] = [
        [0.25, '1/4'], [0.5, '1/2'], [0.75, '3/4'], [1, '1'], [1.5, '3/2'], [2, '2'],
        [0.833, '5/6'], [0.917, '11/12'], [0.417, '5/12'],
    ];
    for (const [val, frac] of fractions) {
        if (Math.abs(decimal - val) < 0.01) return frac;
    }
    return decimal.toFixed(2);
};

export const isSpecialFractionLevel = (level: number): boolean => level === 6.5 || level === 10.5;

export const getSpecialLevelConfig = (level: number): {
    questionsCount: number;
    timeSeconds: number;
    isQCM: boolean;
    totalPoolSize: number;
} | null => {
    if (level === 6.5) return { questionsCount: 5, timeSeconds: 900, isQCM: true, totalPoolSize: 6 };
    if (level === 10.5) return { questionsCount: 5, timeSeconds: 900, isQCM: false, totalPoolSize: 5 };
    return null;
};
