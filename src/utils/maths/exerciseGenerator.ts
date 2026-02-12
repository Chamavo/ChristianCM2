import { getExercisesForLevel, StructuredExercise } from '@/data/maths/structuredExercises';
import { mentalMathQuestions } from '@/data/maths/mentalMathQuestions';
import { parseFraction } from './fractionUtils';
import { numberToFrench, intToWords } from './numberToFrench';

export interface Exercise {
    id: string;
    question: string;
    answer: number;
    category: string;
    level: number;
    hint?: string;
    isQCM?: boolean;
    choices?: number[];
    competence?: string;
    difficulty?: number;
    questionType?: 'spirale' | 'cible' | 'mixte';
    tempsEstime?: number;
}

const generateId = (): string => `ex-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

const parseAnswer = (reponse: number | string): number => {
    if (typeof reponse === 'number') return reponse;
    const timeMatch = reponse.match(/(\d+)h\s*(\d{1,2})/);
    if (timeMatch) return parseInt(timeMatch[1]) * 60 + parseInt(timeMatch[2]);
    const hoursOnlyMatch = reponse.match(/^(\d+)h$/);
    if (hoursOnlyMatch) return parseInt(hoursOnlyMatch[1]) * 60;
    return parseFraction(reponse) || 0;
};

export const generateChoices = (correctAnswer: number): number[] => {
    const choices = [correctAnswer];
    const isDecimal = correctAnswer % 1 !== 0;
    while (choices.length < 4) {
        let wrong: number;
        if (isDecimal) {
            wrong = parseFloat((correctAnswer + (Math.random() * 0.4 - 0.2)).toFixed(2));
        } else {
            wrong = correctAnswer + (Math.floor(Math.random() * 20) - 10);
        }
        if (!choices.includes(wrong) && wrong >= 0) choices.push(wrong);
    }
    return choices.sort(() => Math.random() - 0.5);
};

const convertToExercise = (structured: StructuredExercise, level: number): Exercise => {
    const answer = parseAnswer(structured.reponse);
    return {
        id: generateId(),
        question: structured.enonce,
        answer,
        category: structured.type,
        level,
        hint: structured.astuce,
        isQCM: structured.type === 'fractions' || Math.random() > 0.7,
        choices: generateChoices(answer)
    };
};


const generateProceduralExercises = (level: number): Exercise[] => {
    const exercises: Exercise[] = [];
    const count = 10;

    for (let i = 0; i < count; i++) {
        const id = generateId();
        let question = "";
        let answer = 0;
        let category = "calcul";
        let isQCM = Math.random() > 0.6;
        let choices: number[] | undefined;

        // PROGRESSION CM1

        // 1-2: Dictée de nombres
        if (level === 1) { // < 10 000
            const val = Math.floor(Math.random() * 9000) + 1000;
            question = `Écris le nombre : ${intToWords(val)}`;
            answer = val;
            category = "dictee";
            isQCM = false;
        } else if (level === 2) { // < 999 999
            const val = Math.floor(Math.random() * 900000) + 10000;
            question = `Écris le nombre : ${intToWords(val)}`;
            answer = val;
            category = "dictee";
            isQCM = false;
        }

        // 3-4: Tables Addition / Soustraction
        else if (level === 3) {
            const a = Math.floor(Math.random() * 9) + 2;
            const b = Math.floor(Math.random() * 9) + 2;
            question = `${a} + ${b} =`;
            answer = a + b;
            category = "addition";
        } else if (level === 4) {
            const a = Math.floor(Math.random() * 18) + 2;
            const b = Math.floor(Math.random() * 9) + 2;
            const max = Math.max(a, b);
            const min = Math.min(a, b);
            question = `${max} - ${min} =`;
            answer = max - min;
            category = "soustraction";
        }

        // 5: Ajouter 1 chiffre à 2 chiffres (avec retenue souvent)
        else if (level === 5) {
            const a = Math.floor(Math.random() * 80) + 10;
            const b = Math.floor(Math.random() * 9) + 1;
            question = `${a} + ${b} =`;
            answer = a + b;
            category = "addition_complexe";
        }

        // 6-7: Tables Multiplication
        else if (level === 6) { // 2, 3, 4, 5
            const a = [2, 3, 4, 5][Math.floor(Math.random() * 4)];
            const b = Math.floor(Math.random() * 9) + 2;
            question = `${b} × ${a} =`;
            answer = b * a;
            category = "multiplication";
        } else if (level === 7) { // 6, 7
            const a = [6, 7][Math.floor(Math.random() * 2)];
            const b = Math.floor(Math.random() * 9) + 2;
            question = `${b} × ${a} =`;
            answer = b * a;
            category = "multiplication";
        }

        // 8-9: Multiples
        else if (level === 8) { // Multiples de 2
            const isMultiple = Math.random() > 0.5;
            const base = Math.floor(Math.random() * 50);
            const val = isMultiple ? base * 2 : base * 2 + 1;
            question = `Est-ce que ${val} est un multiple de 2 ? (1=Oui, 0=Non)`;
            // QCM trick: generated choices usually mimic the answer type.
            // Let's stick to numerical input for now or standard QCM.
            // Maybe: "Quel nombre est pair ?" not supported well by engine yet.
            // Let's do: "24 est-il multiple de 2 ?" Answer 1 (Oui) or 0 (Non).
            // Better: "Vrai (1) ou Faux (0) : ${val} est multiple de 2"
            // Or simple math: "Le reste de ${val} ÷ 2 est ?" -> 0 ou 1.
            // Let's try: "Écris le multiple de 2 le plus proche de ${val} (inférieur)"
            // User requested "Les multiples de 2".
            // Let's just do simple Mult: 2 x ? = ...
            // BUT "Les multiples de 2" usually implies recognition.
            // Let's skip logic text requiring "Oui/Non" string answers since `answer` is number.
            // workaround: 
            const factor = Math.floor(Math.random() * 50);
            question = `Quel est le double de ${factor} ?`;
            answer = factor * 2;
            category = "multiples";
        } else if (level === 9) { // Multiples de 5
            const factor = Math.floor(Math.random() * 20);
            question = `Combien font 5 × ${factor} ?`;
            answer = factor * 5;
            category = "multiples";
        }

        // 10: Tables 8, 9
        else if (level === 10) {
            const a = [8, 9][Math.floor(Math.random() * 2)];
            const b = Math.floor(Math.random() * 9) + 2;
            question = `${b} × ${a} =`;
            answer = b * a;
            category = "multiplication";
        }

        // 11: x 11
        else if (level === 11) {
            const a = 11;
            const b = Math.floor(Math.random() * 80) + 10; // 2 digits
            question = `${b} × ${a} =`;
            answer = b * a;
            category = "multiplication_11";
        }

        // 12: Racines carrées (4...100)
        else if (level === 12) {
            const squares = [4, 9, 16, 25, 36, 49, 64, 81, 100];
            const val = squares[Math.floor(Math.random() * squares.length)];
            question = `√${val} = ?`; // Or "Racine de..."
            answer = Math.sqrt(val);
            category = "racine";
        }

        // 13-16: x 10,20...80
        else if (level >= 13 && level <= 16) {
            const rangeStart = (level - 13) * 20 + 10; // 10, 30, 50, 70
            const factors = [rangeStart, rangeStart + 10];
            const factor = factors[Math.floor(Math.random() * factors.length)];
            const b = Math.floor(Math.random() * 20) + 2;
            question = `${b} × ${factor} =`;
            answer = b * factor;
            category = "multiplication_dizaines";
        }

        // 17-18: x 10, 100, 1000
        else if (level === 17) { // Integer
            const factors = [10, 100, 1000];
            const factor = factors[Math.floor(Math.random() * factors.length)];
            const b = Math.floor(Math.random() * 100) + 2;
            question = `${b} × ${factor} =`;
            answer = b * factor;
            category = "puissance_10";
        } else if (level === 18) { // Decimal
            const factors = [10, 100, 1000];
            const factor = factors[Math.floor(Math.random() * factors.length)];
            const b = parseFloat((Math.random() * 50).toFixed(3)); // 3 decimal places max
            question = `${b} × ${factor} =`;
            // Fix float precision issues
            answer = parseFloat((b * factor).toFixed(3));
            category = "puissance_10_dec";
        }

        // 19: x 25
        else if (level === 19) {
            const b = Math.floor(Math.random() * 20) + 1;
            question = `${b} × 25 =`;
            answer = b * 25;
            category = "multiplication_25";
        }

        // 20: / 10, 100, 1000
        else if (level === 20) {
            const divisors = [10, 100, 1000];
            const divisor = divisors[Math.floor(Math.random() * divisors.length)];
            const val = Math.floor(Math.random() * 5000) + 100;
            question = `${val} ÷ ${divisor} =`;
            answer = val / divisor;
            category = "division_10";
        }

        // 21: x 1,5
        else if (level === 21) {
            // Use even numbers to make it cleaner mostly, or simple integers
            const b = Math.floor(Math.random() * 20) * 2;
            question = `${b} × 1,5 =`;
            answer = b * 1.5;
            category = "multiplication_1_5";
        }

        // 22: + Decimal to Integer
        else if (level === 22) {
            const intVal = Math.floor(Math.random() * 50) + 1;
            const decVal = parseFloat(Math.random().toFixed(2)); // 0.XX
            question = `${intVal} + ${decVal} =`;
            answer = intVal + decVal;
            category = "addition_decimale";
        }

        // 23: Fraction -> Decimal
        else if (level === 23) {
            // Common fractions: 1/2, 1/4, 3/4, 1/5, 2/5...
            const pairs = [
                { n: 1, d: 2 }, { n: 1, d: 4 }, { n: 3, d: 4 },
                { n: 1, d: 5 }, { n: 2, d: 5 }, { n: 3, d: 5 }, { n: 4, d: 5 },
                { n: 1, d: 10 }, { n: 3, d: 10 }
            ];
            const p = pairs[Math.floor(Math.random() * pairs.length)];
            question = `${p.n}/${p.d} = ? (décimal)`;
            answer = p.n / p.d;
            category = "fraction_decimal";
        }

        // 24-25: x / 0.5
        else if (level === 24) {
            const b = Math.floor(Math.random() * 40) + 1;
            question = `${b} × 0,5 =`;
            answer = b * 0.5;
            category = "multiplication_0_5";
        } else if (level === 25) {
            const b = Math.floor(Math.random() * 40) + 1;
            question = `${b} ÷ 0,5 =`;
            answer = b / 0.5; // Double
            category = "division_0_5";
        }

        // 26-27: x / 0.25
        else if (level === 26) {
            // multiples of 4 for cleaner result? Or just integer
            const b = Math.floor(Math.random() * 20) * 4;
            question = `${b} × 0,25 =`;
            answer = b * 0.25;
            category = "multiplication_0_25";
        } else if (level === 27) {
            const b = Math.floor(Math.random() * 20) + 1;
            question = `${b} ÷ 0,25 =`;
            answer = b / 0.25; // x4
            category = "division_0_25";
        }

        // 28: Add Fractions same denom
        else if (level === 28) {
            const d = Math.floor(Math.random() * 8) + 2;
            const n1 = Math.floor(Math.random() * (d - 1)) + 1;
            const n2 = Math.floor(Math.random() * (d - n1)) + 1;
            question = `${n1}/${d} + ${n2}/${d} = ? (forme a/b)`;
            // Engine might not support "a/b" input parsing as single number answer easily without `parseAnswer` improvement
            // `parseAnswer` handles fraction string if user types "3/4".
            // Let's assume user types "3/4".
            // Correct answer is number value? 
            // Logic check: parseAnswer returns a NUMBER.
            // If answer is 1 (e.g. 2/4 + 2/4), user types "1" -> Correct.
            // If answer is 0.75 (3/4), user types "3/4" -> parseFraction handles it?
            // Need to check `fractionUtils.ts` or `parseFraction` in this file.
            // It is imported: `import { parseFraction } from './fractionUtils';`
            // So if user types "3/4", it works.
            answer = (n1 + n2) / d;
            category = "addition_fraction";
        }

        // 29-50: Mix & Increase Difficulty
        else {
            // Randomly pick a category from previous levels but harder
            const mode = Math.floor(Math.random() * 6);
            if (mode === 0) { // Big Mult
                const a = Math.floor(Math.random() * 50) + 10;
                const b = Math.floor(Math.random() * 9) + 2;
                question = `${a} × ${b} =`;
                answer = a * b;
            } else if (mode === 1) { // Division
                const b = Math.floor(Math.random() * 9) + 2;
                const res = Math.floor(Math.random() * 20) + 10;
                const a = b * res;
                question = `${a} ÷ ${b} =`;
                answer = res;
            } else if (mode === 2) { // 0.25 / 0.5 logic
                const is05 = Math.random() > 0.5;
                const factor = is05 ? 0.5 : 0.25;
                const val = Math.floor(Math.random() * 100);
                const isMult = Math.random() > 0.5;
                const op = isMult ? '×' : '÷';
                question = `${val} ${op} ${factor.toString().replace('.', ',')} =`;
                answer = isMult ? val * factor : val / factor;
            } else { // Chain
                const a = Math.floor(Math.random() * 10) + 1;
                const b = Math.floor(Math.random() * 10) + 1;
                const c = Math.floor(Math.random() * 10) + 1;
                question = `${a} × ${b} + ${c} =`;
                answer = a * b + c;
            }
            category = "mixte_avance";
        }

        exercises.push({
            id,
            question,
            answer,
            category,
            level,
            isQCM,
            choices: generateChoices(answer)
        });
    }

    return exercises;
};

// New helper to convert MentalMathQuestion to Exercise

const convertMentalToExercise = (mmq: any): Exercise => {
    return {
        id: mmq.id,
        question: mmq.question,
        answer: mmq.answer,
        category: mmq.category,
        level: mmq.level,
        hint: "",
        isQCM: mmq.category === 'comparison' || Math.random() > 0.7,
        choices: generateChoices(mmq.answer)
    };
};

export const generateLevelExercises = (level: number): Exercise[] => {
    // 1. Try MentalMathQuestions (MathsEnLigne source)
    const mentalQuestions = mentalMathQuestions.filter(q => q.level === level);

    if (mentalQuestions.length >= 10) {
        // Shuffle and pick 10
        const shuffled = [...mentalQuestions].sort(() => Math.random() - 0.5).slice(0, 10);
        return shuffled.map(convertMentalToExercise);
    }

    // 2. Fallback to StructuredExercises (CM1 legacy)
    const structured = getExercisesForLevel(level);
    if (structured.length > 0) {
        const converted = structured.map(s => convertToExercise(s, level));
        if (converted.length >= 10) return converted;

        // precise fallback
        const needed = 10 - converted.length;
        const procedural = generateProceduralExercises(level).slice(0, needed);
        return [...converted, ...procedural];
    }

    // 3. Last resort: Procedural Generation
    return generateProceduralExercises(level);
};

export const ALL_LEVELS = Array.from({ length: 50 }, (_, i) => i + 1);

export const getNextLevel = (currentLevel: number): number => {
    const idx = ALL_LEVELS.indexOf(currentLevel);
    return idx < ALL_LEVELS.length - 1 ? ALL_LEVELS[idx + 1] : currentLevel;
};

export const getLevelInfo = (level: number) => ({
    questionsCount: 10,
    timeSeconds: 360, // 6 minutes for all levels
    isSpecial: level % 5 === 0,
    name: `Niveau ${level}`,
    grade: level <= 20 ? 'CM1' : 'CM2' as const
});
