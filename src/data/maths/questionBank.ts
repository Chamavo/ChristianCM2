import { StructuredExercise, niveaux } from './structuredExercises';
import { mentalMathQuestions } from './mentalMathQuestions';
import { problemesExercises } from './problemesExercises';
import { niveauFractions1, niveauFractions2 } from './fractionLevels';

export interface BankQuestion extends StructuredExercise {
    id: string;
    source: string;
}

export const ALL_QUESTIONS: BankQuestion[] = [
    ...mentalMathQuestions.map(q => ({
        id: q.id,
        enonce: q.question,
        reponse: q.answer,
        type: q.category,
        astuce: '',
        difficulty: q.level,
        questionType: (q.level % 2 === 0 ? 'spirale' : 'cible') as any,
        source: 'mentalMath'
    })),

    ...problemesExercises.map(p => ({
        id: `prob_${p.id}`,
        enonce: p.enonce,
        reponse: p.reponse as any,
        type: 'probleme',
        astuce: '',
        difficulty: p.niveau * 10,
        questionType: 'mixte' as any,
        source: 'problemes'
    })),

    ...niveauFractions1.exercices.map((ex, i) => ({
        ...ex,
        id: `frac1_${i}`,
        difficulty: 10,
        questionType: 'cible' as any,
        source: 'fractions1'
    })),
    ...niveauFractions2.exercices.map((ex, i) => ({
        ...ex,
        id: `frac2_${i}`,
        difficulty: 25,
        questionType: 'cible' as any,
        source: 'fractions2'
    })),

    ...niveaux.flatMap(n => n.exercices.map((ex, i) => ({
        ...ex,
        id: `lvl-${n.niveau}-q-${i}`,
        difficulty: n.niveau,
        questionType: (i < 3 ? 'spirale' : (i < 8 ? 'cible' : 'mixte')) as any,
        source: `level_${n.niveau}`
    })))
];

export const getQuestions = (filters: {
    difficulty?: number;
    type?: 'spirale' | 'cible' | 'mixte';
    category?: string;
    limit?: number;
}) => {
    let filtered = ALL_QUESTIONS;

    if (filters.difficulty !== undefined) {
        filtered = filtered.filter(q => q.difficulty === filters.difficulty);
    }

    if (filters.type) {
        filtered = filtered.filter(q => q.questionType === filters.type);
    }

    if (filters.category) {
        filtered = filtered.filter(q => q.type === filters.category);
    }

    const shuffled = [...filtered].sort(() => Math.random() - 0.5);

    return filters.limit ? shuffled.slice(0, filters.limit) : shuffled;
};
