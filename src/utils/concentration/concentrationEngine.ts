import { ConcentrationExercise, ExerciseCategory, SessionPhase } from '@/types/concentrationTypes';
import { AttentionIntruderData } from '@/components/concentration/exercises/AttentionIntruder';
import { MemoryCardsData } from '@/components/concentration/exercises/MemoryCards';
import { MentalCalcData } from '@/components/concentration/exercises/MentalCalc';
import { SpatialGridData } from '@/components/concentration/exercises/SpatialGridPattern';
import { LogicalSequenceData } from '@/components/concentration/exercises/LogicalSequence';
import { AnagramData } from '@/components/concentration/exercises/Anagram';

// --- Generators ---

const generateAttentionExercise = (difficulty: number): ConcentrationExercise => {
    let gridSize = 3;
    let pairs = [
        ['O', '0'], ['B', '8'], ['Z', '2'], ['S', '5'], ['I', '1']
    ];

    if (difficulty === 2) {
        gridSize = 5;
        pairs = [
            ['6', '9'], ['p', 'q'], ['b', 'd'], ['M', 'W'], ['E', 'F']
        ];
    } else if (difficulty === 3) {
        gridSize = 7;
        pairs = [
            ['😊', '😃'], ['🌑', '🌒'], ['🍎', '🍏'], ['🐶', '🐺'], ['🔒', '🔓']
        ];
    }

    const pair = pairs[Math.floor(Math.random() * pairs.length)];
    const swap = Math.random() > 0.5;
    const common = swap ? pair[1] : pair[0];
    const intruder = swap ? pair[0] : pair[1];

    const totalItems = gridSize * gridSize;
    const intruderIndex = Math.floor(Math.random() * totalItems);

    const data: AttentionIntruderData = {
        gridSize,
        commonItem: common,
        intruderItem: intruder,
        intruderIndex
    };

    return {
        id: `attn-${Date.now()}-${Math.random()}`,
        category: 'attention',
        type: 'intruder',
        difficulty: difficulty as 1 | 2 | 3,
        data,
        question: "Où est l'intrus ?",
        answer: intruderIndex,
    };
};

const generateMemoryExercise = (difficulty: number): ConcentrationExercise => {
    let pairs = ['🐶', '🐱', '🐭', '🐹'];

    if (difficulty === 2) {
        pairs = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊'];
    } else if (difficulty === 3) {
        pairs = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
    }

    const data: MemoryCardsData = {
        gridSize: 4,
        pairs
    };

    return {
        id: `mem-${Date.now()}-${Math.random()}`,
        category: 'memory_visual',
        type: 'memory_cards',
        difficulty: difficulty as 1 | 2 | 3,
        data,
        question: "Trouve les paires",
        answer: 'game',
    };
};

const generateMathExercise = (difficulty: number): ConcentrationExercise => {
    let num1, num2, operator, answer;
    let distractorRange = 5;

    if (difficulty === 1) {
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        operator = Math.random() > 0.5 ? '+' : '-';
        if (operator === '-' && num1 < num2) [num1, num2] = [num2, num1];
        answer = operator === '+' ? num1 + num2 : num1 - num2;
    } else if (difficulty === 2) {
        num1 = Math.floor(Math.random() * 40) + 10;
        num2 = Math.floor(Math.random() * 40) + 10;
        operator = Math.random() > 0.5 ? '+' : '-';
        if (operator === '-' && num1 < num2) [num1, num2] = [num2, num1];
        answer = operator === '+' ? num1 + num2 : num1 - num2;
    } else {
        if (Math.random() > 0.5) {
            num1 = Math.floor(Math.random() * 9) + 2;
            num2 = Math.floor(Math.random() * 9) + 2;
            operator = '×';
            answer = num1 * num2;
        } else {
            num1 = Math.floor(Math.random() * 50) + 10;
            num2 = Math.floor(Math.random() * 50) + 10;
            let num3 = Math.floor(Math.random() * 20) + 1;
            operator = '+';
            answer = num1 + num2 + num3;
            num1 = `${num1} + ${num2}`;
            num2 = num3;
        }
    }

    const options = new Set<number>();
    options.add(answer);
    while (options.size < 4) {
        let offset = Math.floor(Math.random() * distractorRange * 2) - distractorRange;
        if (offset === 0) offset = 1;
        const distractor = answer + offset;
        if (distractor >= 0) options.add(distractor);
    }

    const data: MentalCalcData = {
        operation: `${num1} ${operator} ${num2}`,
        options: Array.from(options).sort(() => Math.random() - 0.5),
        correctAnswer: answer
    };

    if (typeof num1 === 'string') {
        data.operation = `${num1} + ${num2}`;
    }

    return {
        id: `math-${Date.now()}-${Math.random()}`,
        category: 'math',
        type: 'mental_calc',
        difficulty: difficulty as 1 | 2 | 3,
        data,
        question: "Calcul mental",
        answer: answer,
    };
};

const generateSpatialExercise = (difficulty: number): ConcentrationExercise => {
    const gridSize = difficulty === 1 ? 3 : difficulty === 2 ? 4 : 5;
    const numItems = difficulty === 1 ? 3 : difficulty === 2 ? 5 : 7;
    const displayTime = difficulty === 1 ? 3000 : difficulty === 2 ? 4000 : 5000;

    const pattern = new Array(gridSize * gridSize).fill(false);
    let placed = 0;
    while (placed < numItems) {
        const idx = Math.floor(Math.random() * pattern.length);
        if (!pattern[idx]) {
            pattern[idx] = true;
            placed++;
        }
    }

    const data: SpatialGridData = {
        gridSize,
        pattern,
        displayTime
    };

    return {
        id: `spatial-${Date.now()}-${Math.random()}`,
        category: 'spatial',
        type: 'grid_pattern',
        difficulty: difficulty as 1 | 2 | 3,
        data,
        question: "Mémorise le motif",
        answer: 'game',
    };
};

const generateLogicExercise = (difficulty: number): ConcentrationExercise => {
    // Simple logic sequences
    let sequence: string[] = [];
    let options: string[] = [];
    let answer = "";

    if (difficulty === 1) {
        // ABAB pattern
        const a = "🔴";
        const b = "🔵";
        sequence = [a, b, a, "?"];
        answer = b;
        options = ["🔴", "🔵", "🟢"];
    } else if (difficulty === 2) {
        // Number progression (+2 or +3)
        const start = Math.floor(Math.random() * 5) + 1;
        const step = Math.floor(Math.random() * 3) + 2;
        sequence = [start.toString(), (start + step).toString(), (start + step * 2).toString(), "?"];
        answer = (start + step * 3).toString();
        options = [
            answer,
            (start + step * 3 - 1).toString(),
            (start + step * 3 + 2).toString()
        ].sort(() => Math.random() - 0.5);
    } else {
        // Shape rotation or complex pattern (Simulated with arrows)
        sequence = ["⬆️", "➡️", "⬇️", "?"];
        answer = "⬅️";
        options = ["⬆️", "⬅️", "↗️"];
    }

    const data: LogicalSequenceData = {
        sequence,
        options,
        correctAnswer: answer
    };

    return {
        id: `logic-${Date.now()}-${Math.random()}`,
        category: 'logic',
        type: 'logical_sequence',
        difficulty: difficulty as 1 | 2 | 3,
        data,
        question: "Complète la suite",
        answer: answer,
    };
};

const generateLanguageExercise = (difficulty: number): ConcentrationExercise => {
    let word = "";
    let hint = "";

    if (difficulty === 1) {
        const words = [
            { w: "CHAT", h: "Animal qui miaule" },
            { w: "ROUGE", h: "Couleur de la fraise" },
            { w: "LIT", h: "Pour dormir" }
        ];
        const selection = words[Math.floor(Math.random() * words.length)];
        word = selection.w;
        hint = selection.h;
    } else if (difficulty === 2) {
        const words = [
            { w: "POULET", h: "Oiseau de ferme" },
            { w: "MAISON", h: "Lieu d'habitation" },
            { w: "SOLEIL", h: "Astre du jour" }
        ];
        const selection = words[Math.floor(Math.random() * words.length)];
        word = selection.w;
        hint = selection.h;
    } else {
        const words = [
            { w: "AEROPORT", h: "Pour les avions" },
            { w: "ELEPHANT", h: "Grand animal gris" },
            { w: "CHOCOLAT", h: "Gourmandise au cacao" }
        ];
        const selection = words[Math.floor(Math.random() * words.length)];
        word = selection.w;
        hint = selection.h;
    }

    const scrambled = word.split('').sort(() => Math.random() - 0.5);

    const data: AnagramData = {
        word,
        scrambled,
        hint
    };

    return {
        id: `lang-${Date.now()}-${Math.random()}`,
        category: 'language',
        type: 'anagram',
        difficulty: difficulty as 1 | 2 | 3,
        data,
        question: "Remets les lettres dans l'ordre",
        answer: word,
    };
};

// Placeholder for fallback
const generatePlaceholderExercise = (category: ExerciseCategory, difficulty: number): ConcentrationExercise => {
    return {
        id: `ex-${Date.now()}-${Math.random()}`,
        category,
        type: 'placeholder',
        difficulty: difficulty as 1 | 2 | 3,
        data: {},
        question: `Exercice ${category} - Niveau ${difficulty}`,
        answer: 'test',
        timeLimit: 60
    };
};

const getExerciseGenerator = (category: ExerciseCategory) => {
    switch (category) {
        case 'attention': return generateAttentionExercise;
        case 'memory_visual': return generateMemoryExercise;
        case 'math': return generateMathExercise;
        case 'spatial': return generateSpatialExercise;
        case 'logic': return generateLogicExercise;
        case 'language': return generateLanguageExercise;
        default: return (diff: number) => generatePlaceholderExercise(category, diff);
    }
};

export const generateSession = (phase: SessionPhase): ConcentrationExercise[] => {
    const exercises: ConcentrationExercise[] = [];

    // Configuration based on phase
    const config = {
        warmup: { count: 3, difficulties: [1, 1, 1] },
        core: { count: 6, difficulties: [1, 2, 2, 2, 3, 3] },
        challenge: { count: 3, difficulties: [3, 3, 3] },
        review: { count: 0, difficulties: [] },
    }[phase];

    if (!config) return [];

    // Order requested: Attention, Visual Memory, Math, Spatial, Logic, Language
    const categoryOrder: ExerciseCategory[] = ['attention', 'memory_visual', 'math', 'spatial', 'logic', 'language'];

    for (let i = 0; i < config.count; i++) {
        // Use the requested order, looping if necessary
        const category = categoryOrder[i % categoryOrder.length];
        const generator = getExerciseGenerator(category);
        exercises.push(generator(config.difficulties[i]));
    }

    return exercises;
};

export const getPhaseDuration = (phase: SessionPhase): number => {
    switch (phase) {
        case 'warmup': return 10 * 60; // 10 minutes
        case 'core': return 35 * 60;   // 35 minutes
        case 'challenge': return 10 * 60; // 10 minutes
        case 'review': return 5 * 60;     // 5 minutes
        default: return 0;
    }
};
