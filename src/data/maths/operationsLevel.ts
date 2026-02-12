import { StructuredExercise, NiveauData } from './structuredExercises';

export const niveauOperations: NiveauData = {
    niveau: 8.5,
    duree: "15 mn",
    instructions: "Niveau Opérations : Opérations à 2 ou 3 chiffres. 20 questions, 2 erreurs autorisées.",
    exercices: [
        { enonce: "67 + 86 =", type: "addition", reponse: 153, astuce: "67 + 86 = 153 (retenue)" },
        { enonce: "78 + 45 =", type: "addition", reponse: 123, astuce: "78 + 45 = 123 (retenue)" },
        { enonce: "59 + 64 =", type: "addition", reponse: 123, astuce: "59 + 64 = 123 (retenue)" },
        { enonce: "88 + 37 =", type: "addition", reponse: 125, astuce: "88 + 37 = 125 (retenue)" },
        { enonce: "46 + 79 =", type: "addition", reponse: 125, astuce: "46 + 79 = 125 (retenue)" },
        { enonce: "95 + 68 =", type: "addition", reponse: 163, astuce: "95 + 68 = 163 (retenue)" },
        { enonce: "73 + 89 =", type: "addition", reponse: 162, astuce: "73 + 89 = 162 (retenue)" },
        { enonce: "84 + 57 =", type: "addition", reponse: 141, astuce: "84 + 57 = 141 (retenue)" },
        { enonce: "69 + 76 =", type: "addition", reponse: 145, astuce: "69 + 76 = 145 (retenue)" },
        { enonce: "97 + 48 =", type: "addition", reponse: 145, astuce: "97 + 48 = 145 (retenue)" },
        { enonce: "92 − 46 =", type: "soustraction", reponse: 46, astuce: "92 − 46 = 46" },
        { enonce: "85 − 38 =", type: "soustraction", reponse: 47, astuce: "85 − 38 = 47" },
        { enonce: "74 − 29 =", type: "soustraction", reponse: 45, astuce: "74 − 29 = 45" },
        { enonce: "91 − 54 =", type: "soustraction", reponse: 37, astuce: "91 − 54 = 37" },
        { enonce: "83 − 47 =", type: "soustraction", reponse: 36, astuce: "83 − 47 = 36" },
        { enonce: "72 − 35 =", type: "soustraction", reponse: 37, astuce: "72 − 35 = 37" },
        { enonce: "95 − 58 =", type: "soustraction", reponse: 37, astuce: "95 − 58 = 37" },
        { enonce: "81 − 44 =", type: "soustraction", reponse: 37, astuce: "81 − 44 = 37" },
        { enonce: "63 − 28 =", type: "soustraction", reponse: 35, astuce: "63 − 28 = 35" },
        { enonce: "76 − 39 =", type: "soustraction", reponse: 37, astuce: "76 − 39 = 37" },
        { enonce: "77 × 7 =", type: "multiplication", reponse: 539, astuce: "77 × 7 = 539" },
        { enonce: "45 × 8 =", type: "multiplication", reponse: 360, astuce: "45 × 8 = 360" },
        { enonce: "63 × 6 =", type: "multiplication", reponse: 378, astuce: "63 × 6 = 378" },
        { enonce: "82 × 4 =", type: "multiplication", reponse: 328, astuce: "82 × 4 = 328" },
        { enonce: "56 × 9 =", type: "multiplication", reponse: 504, astuce: "56 × 9 = 504" },
        { enonce: "38 × 7 =", type: "multiplication", reponse: 266, astuce: "38 × 7 = 266" },
        { enonce: "94 × 5 =", type: "multiplication", reponse: 470, astuce: "94 × 5 = 470" },
        { enonce: "67 × 8 =", type: "multiplication", reponse: 536, astuce: "67 × 8 = 536" },
        { enonce: "49 × 6 =", type: "multiplication", reponse: 294, astuce: "49 × 6 = 294" },
        { enonce: "73 × 9 =", type: "multiplication", reponse: 657, astuce: "73 × 9 = 657" },
        { enonce: "222 ÷ 6 =", type: "division", reponse: 37, astuce: "222 ÷ 6 = 37" },
        { enonce: "144 ÷ 8 =", type: "division", reponse: 18, astuce: "144 ÷ 8 = 18" },
        { enonce: "168 ÷ 7 =", type: "division", reponse: 24, astuce: "168 ÷ 7 = 24" },
        { enonce: "135 ÷ 9 =", type: "division", reponse: 15, astuce: "135 ÷ 9 = 15" },
        { enonce: "252 ÷ 4 =", type: "division", reponse: 63, astuce: "252 ÷ 4 = 63" },
        { enonce: "186 ÷ 6 =", type: "division", reponse: 31, astuce: "186 ÷ 6 = 31" },
        { enonce: "192 ÷ 8 =", type: "division", reponse: 24, astuce: "192 ÷ 8 = 24" },
        { enonce: "245 ÷ 5 =", type: "division", reponse: 49, astuce: "245 ÷ 5 = 49" },
        { enonce: "171 ÷ 9 =", type: "division", reponse: 19, astuce: "171 ÷ 9 = 19" },
        { enonce: "196 ÷ 7 =", type: "division", reponse: 28, astuce: "196 ÷ 7 = 28" },
    ]
};

export const getOperationsExercises = (): StructuredExercise[] => {
    return niveauOperations.exercices;
};
