export const parseTime = (input: string): number | null => {
    const trimmed = input.trim();
    const timeMatch = trimmed.match(/^(\d{1,2}):(\d{2})$/);
    if (timeMatch) {
        const hours = parseInt(timeMatch[1], 10);
        const minutes = parseInt(timeMatch[2], 10);
        if (minutes >= 60) return null;
        return hours * 60 + minutes;
    }
    const hFormatMatch = trimmed.match(/^(\d{1,2})h\s*(\d{0,2})\s*(min)?$/i);
    if (hFormatMatch) {
        const hours = parseInt(hFormatMatch[1], 10);
        const minutes = hFormatMatch[2] ? parseInt(hFormatMatch[2], 10) : 0;
        if (minutes >= 60) return null;
        return hours * 60 + minutes;
    }
    return null;
};

export const isTimeQuestion = (question: string): boolean => {
    const speedPattern = /km\/h|vitesse|parcour/i;
    if (speedPattern.test(question)) return false;
    const timePatterns = [
        /durée du trajet/i,
        /dure le trajet/i,
        /\d+h\s*\d*\s*(min)?.*[+−\-×÷]/i,
        /\d+:\d+/,
        /débute.*finit/i,
        /parti.*arrivé/i,
        /à quelle heure/i,
    ];
    return timePatterns.some(pattern => pattern.test(question));
};

export const parseFraction = (input: string): number | null => {
    const trimmed = input.trim();
    if (!trimmed) return null;
    const timeValue = parseTime(trimmed);
    if (timeValue !== null) return timeValue;
    const fractionMatch = trimmed.match(/^(-?\d+)\s*\/\s*(\d+)$/);
    if (fractionMatch) {
        const numerator = parseInt(fractionMatch[1], 10);
        const denominator = parseInt(fractionMatch[2], 10);
        if (denominator === 0) return null;
        return numerator / denominator;
    }
    const mixedMatch = trimmed.match(/^(-?\d+)\s+(\d+)\s*\/\s*(\d+)$/);
    if (mixedMatch) {
        const whole = parseInt(mixedMatch[1], 10);
        const numerator = parseInt(mixedMatch[2], 10);
        const denominator = parseInt(mixedMatch[3], 10);
        if (denominator === 0) return null;
        const sign = whole < 0 ? -1 : 1;
        return whole + sign * (numerator / denominator);
    }
    const num = parseFloat(trimmed.replace(',', '.'));
    if (!isNaN(num)) return num;
    return null;
};

export const isInputFractionFormat = (input: string): boolean => {
    const trimmed = input.trim();
    return /^(-?\d+)\s*\/\s*(\d+)$/.test(trimmed) || /^(-?\d+)\s+(\d+)\s*\/\s*(\d+)$/.test(trimmed);
};

export const isFractionOperationQuestion = (question: string): boolean => {
    const fractionOpPattern = /\d+\s*\/\s*\d+\s*[+−\-×÷*\/]\s*(\d+\s*\/\s*\d+|\d+)/;
    return fractionOpPattern.test(question);
};

export const formatTimeFromMinutes = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins.toString().padStart(2, '0')}`;
};

export const formatAnswer = (answer: number | string): string => {
    if (typeof answer === 'string') return answer;
    const commonFractions: Record<string, string> = {
        '0.5': '1/2', '0.25': '1/4', '0.75': '3/4', '0.333': '1/3', '0.667': '2/3',
        '0.2': '1/5', '0.4': '2/5', '0.6': '3/5', '0.8': '4/5',
        '0.125': '1/8', '0.375': '3/8', '0.625': '5/8', '0.875': '7/8'
    };
    const rounded = Math.abs(answer).toFixed(3);
    for (const [decimal, fraction] of Object.entries(commonFractions)) {
        if (Math.abs(parseFloat(decimal) - Math.abs(answer)) < 0.005) {
            return answer < 0 ? `-${fraction}` : fraction;
        }
    }
    if (Number.isInteger(answer)) return answer.toString();
    return answer.toFixed(2);
};

export const isFractionQuestion = (question: string): boolean => {
    return /\d+\s*\/\s*\d+.*[+−\-×÷]/.test(question);
};
