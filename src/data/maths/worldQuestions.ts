export interface WorldQuestion {
    id: number;
    theme: string;
    question: string;
    choices: { A: string; B: string; C: string; D: string; };
}

export const worldQuestions: WorldQuestion[] = [
    {
        id: 1,
        theme: "Vie quotidienne",
        question: "Combien de personnes vivent à Douala ?",
        choices: { A: "30 000", B: "300 000", C: "3 millions", D: "30 millions" }
    },
    {
        id: 2,
        theme: "Vie quotidienne",
        question: "Quelle distance sépare Douala de Yaoundé ?",
        choices: { A: "25 km", B: "250 km", C: "2 500 km", D: "25 000 km" }
    },
];

export const getQuestionOfTheDay = (): WorldQuestion => {
    return worldQuestions[0];
};

export const getTodayDateString = (): string => {
    return new Date().toISOString().split('T')[0];
};
