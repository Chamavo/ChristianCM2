export interface StructuredExercise {
    enonce: string;
    type: string;
    reponse: number | string;
    astuce: string;
    competence?: string;
    difficulty?: number;
    questionType?: 'spirale' | 'cible' | 'mixte';
    tempsEstime?: number;
}

export interface NiveauData {
    niveau: number;
    duree: string;
    instructions: string;
    exercices: StructuredExercise[];
}

export const niveaux: NiveauData[] = [
    {
        niveau: 1,
        duree: "8 mn",
        instructions: "Additions et soustractions simples (résultats ≤ 100).",
        exercices: [
            { enonce: "8 + 7 =", type: "addition", reponse: 15, astuce: "8+2+5=15" },
            { enonce: "14 - 9 =", type: "soustraction", reponse: 5, astuce: "14-4-5=5" },
            { enonce: "27 + 8 =", type: "addition", reponse: 35, astuce: "27+3+5=35" },
            { enonce: "20 - 9 =", type: "soustraction", reponse: 11, astuce: "20-9=11" },
            { enonce: "46 + 7 =", type: "addition", reponse: 53, astuce: "46+4+3=53" },
            { enonce: "32 - 8 =", type: "soustraction", reponse: 24, astuce: "32-2-6=24" },
            { enonce: "58 + 6 =", type: "addition", reponse: 64, astuce: "58+2+4=64" },
            { enonce: "41 - 7 =", type: "soustraction", reponse: 34, astuce: "41-1-6=34" },
            { enonce: "9 + 8 =", type: "addition", reponse: 17, astuce: "9+1+7=17" },
            { enonce: "15 - 7 =", type: "soustraction", reponse: 8, astuce: "15-5-2=8" },
        ]
    },
    {
        niveau: 2,
        duree: "8 mn",
        instructions: "Multiplications et divisions par 10, 100, 1000.",
        exercices: [
            { enonce: "45 × 10 =", type: "multiplication", reponse: 450, astuce: "Ajouter un 0" },
            { enonce: "340 ÷ 10 =", type: "division", reponse: 34, astuce: "Enlever un 0" },
            { enonce: "3,7 × 100 =", type: "multiplication", reponse: 370, astuce: "Décaler de 2 rangs" },
            { enonce: "750 ÷ 100 =", type: "division", reponse: 7.5, astuce: "Décaler de 2 rangs" },
            { enonce: "2,5 × 1000 =", type: "multiplication", reponse: 2500, astuce: "Décaler de 3 rangs" },
            { enonce: "4500 ÷ 1000 =", type: "division", reponse: 4.5, astuce: "Décaler de 3 rangs" },
            { enonce: "0,56 × 10 =", type: "multiplication", reponse: 5.6, astuce: "Décaler de 1 rang" },
            { enonce: "8,5 ÷ 10 =", type: "division", reponse: 0.85, astuce: "Décaler de 1 rang" },
            { enonce: "0,1 × 80 =", type: "multiplication", reponse: 8, astuce: "Multiplier par 0,1 = diviser par 10" },
            { enonce: "48 × 0,5 =", type: "multiplication", reponse: 24, astuce: "Multiplier par 0,5 = diviser par 2" },
        ]
    },
    {
        niveau: 3,
        duree: "10 mn",
        instructions: "Tables de multiplication de 2 à 5.",
        exercices: [
            { enonce: "3 × 4 =", type: "multiplication", reponse: 12, astuce: "3, 6, 9, 12" },
            { enonce: "5 × 6 =", type: "multiplication", reponse: 30, astuce: "5, 10, 15, 20, 25, 30" },
            { enonce: "2 × 9 =", type: "multiplication", reponse: 18, astuce: "Le double de 9" },
            { enonce: "4 × 7 =", type: "multiplication", reponse: 28, astuce: "28" },
            { enonce: "3 × 8 =", type: "multiplication", reponse: 24, astuce: "24" },
            { enonce: "5 × 9 =", type: "multiplication", reponse: 45, astuce: "45" },
            { enonce: "4 × 4 =", type: "multiplication", reponse: 16, astuce: "16" },
            { enonce: "2 × 8 =", type: "multiplication", reponse: 16, astuce: "16" },
            { enonce: "3 × 7 =", type: "multiplication", reponse: 21, astuce: "21" },
            { enonce: "5 × 5 =", type: "multiplication", reponse: 25, astuce: "25" },
        ]
    },
    {
        niveau: 4,
        duree: "10 mn",
        instructions: "Tables de multiplication de 6 à 9.",
        exercices: [
            { enonce: "6 × 7 =", type: "multiplication", reponse: 42, astuce: "42" },
            { enonce: "8 × 9 =", type: "multiplication", reponse: 72, astuce: "72" },
            { enonce: "7 × 8 =", type: "multiplication", reponse: 56, astuce: "56" },
            { enonce: "9 × 6 =", type: "multiplication", reponse: 54, astuce: "54" },
            { enonce: "6 × 8 =", type: "multiplication", reponse: 48, astuce: "48" },
            { enonce: "7 × 7 =", type: "multiplication", reponse: 49, astuce: "49" },
            { enonce: "8 × 8 =", type: "multiplication", reponse: 64, astuce: "64" },
            { enonce: "9 × 9 =", type: "multiplication", reponse: 81, astuce: "81" },
            { enonce: "7 × 9 =", type: "multiplication", reponse: 63, astuce: "63" },
            { enonce: "6 × 6 =", type: "multiplication", reponse: 36, astuce: "36" },
        ]
    },
    {
        niveau: 5,
        duree: "10 mn",
        instructions: "Doubles, moitiés, triples et quarts.",
        exercices: [
            { enonce: "Double de 15 =", type: "calcul", reponse: 30, astuce: "15 + 15" },
            { enonce: "Moitié de 50 =", type: "calcul", reponse: 25, astuce: "50 ÷ 2" },
            { enonce: "Triple de 12 =", type: "calcul", reponse: 36, astuce: "12 × 3" },
            { enonce: "Quart de 100 =", type: "calcul", reponse: 25, astuce: "100 ÷ 4" },
            { enonce: "Double de 45 =", type: "calcul", reponse: 90, astuce: "90" },
            { enonce: "Moitié de 14 =", type: "calcul", reponse: 7, astuce: "7" },
            { enonce: "Triple de 20 =", type: "calcul", reponse: 60, astuce: "60" },
            { enonce: "Quart de 20 =", type: "calcul", reponse: 5, astuce: "5" },
            { enonce: "Double de 250 =", type: "calcul", reponse: 500, astuce: "500" },
            { enonce: "Moitié de 1000 =", type: "calcul", reponse: 500, astuce: "500" },
        ]
    },
    {
        niveau: 11,
        duree: "12 mn",
        instructions: "Fractions simples : moitié, tiers, quart.",
        exercices: [
            { enonce: "1/2 de 100 =", type: "fractions", reponse: 50, astuce: "50" },
            { enonce: "1/4 de 80 =", type: "fractions", reponse: 20, astuce: "20" },
            { enonce: "1/3 de 30 =", type: "fractions", reponse: 10, astuce: "10" },
            { enonce: "3/4 de 100 =", type: "fractions", reponse: 75, astuce: "75" },
            { enonce: "2/3 de 15 =", type: "fractions", reponse: 10, astuce: "10" },
        ]
    },
    {
        niveau: 20,
        duree: "30 mn",
        instructions: "Bilan CM1.",
        exercices: [
            { enonce: "125 × 8 =", type: "calcul", reponse: 1000, astuce: "1000" },
            { enonce: "Périmètre carré 40 cm. Aire ?", type: "geometrie", reponse: 100, astuce: "côté=10, 10×10=100" },
        ]
    },
    {
        niveau: 50,
        duree: "60 mn",
        instructions: "Examen Final - Maître des Maths. Tous sujets confondus.",
        exercices: [
            { enonce: "0,1 × 0,01 =", type: "calcul", reponse: 0.001, astuce: "0,001" },
            { enonce: "Volume d'un cube de 5 cm de côté ?", type: "geometrie", reponse: 125, astuce: "125" },
            { enonce: "1/2 + 1/4 + 1/8 + 1/8 =", type: "fractions", reponse: 1, astuce: "1" },
            { enonce: "20% de remise sur 150 F. Nouveau prix ?", type: "calcul", reponse: 120, astuce: "120" },
            { enonce: "Vitesse de 15 km en 45 min (km/h) ?", type: "grandeurs", reponse: 20, astuce: "15 / (3/4) = 20" },
        ]
    }
];

export const getExercisesForLevel = (level: number): StructuredExercise[] => {
    if (level === 0) {
        return [
            { enonce: "12 + 13 =", type: "calcul", reponse: 25, astuce: "25" },
            { enonce: "5 × 5 =", type: "calcul", reponse: 25, astuce: "25" },
        ];
    }
    const niveauData = niveaux.find(n => n.niveau === level);
    return niveauData?.exercices || [];
};

export const getLevelInstructions = (level: number): string => {
    const niveauData = niveaux.find(n => n.niveau === level);
    return niveauData?.instructions || '';
};

export const getLevelDuration = (level: number): string => {
    const niveauData = niveaux.find(n => n.niveau === level);
    return niveauData?.duree || '10 mn';
};
