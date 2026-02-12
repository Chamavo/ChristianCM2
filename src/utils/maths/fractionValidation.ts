export const gcd = (a: number, b: number): number => {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
        const t = b;
        b = a % b;
        a = t;
    }
    return a;
};

export const isSimplifiedFraction = (numerator: number, denominator: number): boolean => {
    if (denominator === 0) return false;
    return gcd(numerator, denominator) === 1;
};

export const simplifyFraction = (numerator: number, denominator: number): string => {
    if (denominator === 0) return 'undefined';
    const divisor = gcd(numerator, denominator);
    const simplifiedNum = numerator / divisor;
    const simplifiedDen = denominator / divisor;

    if (simplifiedDen === 1) return String(simplifiedNum);
    return `${simplifiedNum}/${simplifiedDen}`;
};

export const parseFractionInput = (input: string): {
    isValid: boolean;
    isSimplified: boolean;
    simplified: string;
    value: number;
    numerator: number;
    denominator: number;
} => {
    const trimmed = input.trim();

    const fractionMatch = trimmed.match(/^(-?\d+)\s*\/\s*(\d+)$/);
    if (fractionMatch) {
        const numerator = parseInt(fractionMatch[1], 10);
        const denominator = parseInt(fractionMatch[2], 10);

        if (denominator === 0) {
            return { isValid: false, isSimplified: false, simplified: '', value: 0, numerator: 0, denominator: 0 };
        }

        const value = numerator / denominator;
        const isSimplified = isSimplifiedFraction(numerator, denominator);
        const simplified = simplifyFraction(numerator, denominator);

        return { isValid: true, isSimplified, simplified, value, numerator, denominator };
    }

    const intMatch = trimmed.match(/^(-?\d+)$/);
    if (intMatch) {
        const value = parseInt(intMatch[1], 10);
        return { isValid: true, isSimplified: true, simplified: String(value), value, numerator: value, denominator: 1 };
    }

    return { isValid: false, isSimplified: false, simplified: '', value: 0, numerator: 0, denominator: 0 };
};

export const validateFractionAnswer = (
    userInput: string,
    correctValue: number,
    requireSimplified: boolean = true
): {
    correct: boolean;
    needsSimplification: boolean;
    simplifiedForm: string;
    userValue: number;
} => {
    const parsed = parseFractionInput(userInput);

    if (!parsed.isValid) {
        return { correct: false, needsSimplification: false, simplifiedForm: '', userValue: 0 };
    }

    const valueMatches = Math.abs(parsed.value - correctValue) < 0.01;

    if (!valueMatches) {
        return { correct: false, needsSimplification: false, simplifiedForm: parsed.simplified, userValue: parsed.value };
    }

    if (requireSimplified && !parsed.isSimplified) {
        return {
            correct: false,
            needsSimplification: true,
            simplifiedForm: parsed.simplified,
            userValue: parsed.value
        };
    }

    return { correct: true, needsSimplification: false, simplifiedForm: parsed.simplified, userValue: parsed.value };
};
