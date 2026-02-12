import { StructuredExercise, NiveauData } from './structuredExercises';

export const niveauFondamentaux: NiveauData = {
    niveau: 5.5,
    duree: "15 mn",
    instructions: "Niveau Fondamentaux : Comprendre le lien entre fractions, nombres décimaux et pourcentages. 15 questions, 1 erreur autorisée.",
    exercices: [
        { enonce: "1/4 sous forme décimale = ?", type: "conversion", reponse: 0.25, astuce: "1/4 = 1÷4 = 0,25" },
        { enonce: "1/2 sous forme décimale = ?", type: "conversion", reponse: 0.5, astuce: "1/2 = 1÷2 = 0,5" },
        { enonce: "3/4 sous forme décimale = ?", type: "conversion", reponse: 0.75, astuce: "3/4 = 3÷4 = 0,75" },
        { enonce: "1/5 sous forme décimale = ?", type: "conversion", reponse: 0.2, astuce: "1/5 = 1÷5 = 0,2" },
        { enonce: "2/5 sous forme décimale = ?", type: "conversion", reponse: 0.4, astuce: "2/5 = 2÷5 = 0,4" },
        { enonce: "0,25 en pourcentage = ? %", type: "pourcentage", reponse: 25, astuce: "0,25 × 100 = 25%" },
        { enonce: "0,5 en pourcentage = ? %", type: "pourcentage", reponse: 50, astuce: "0,5 × 100 = 50%" },
        { enonce: "0,75 en pourcentage = ? %", type: "pourcentage", reponse: 75, astuce: "0,75 × 100 = 75%" },
        { enonce: "0,1 en pourcentage = ? %", type: "pourcentage", reponse: 10, astuce: "0,1 × 100 = 10%" },
        { enonce: "0,2 en pourcentage = ? %", type: "pourcentage", reponse: 20, astuce: "0,2 × 100 = 20%" },
        { enonce: "1/4 en pourcentage = ? %", type: "pourcentage", reponse: 25, astuce: "1/4 = 0,25 = 25%" },
        { enonce: "1/2 en pourcentage = ? %", type: "pourcentage", reponse: 50, astuce: "1/2 = 0,5 = 50%" },
        { enonce: "3/4 en pourcentage = ? %", type: "pourcentage", reponse: 75, astuce: "3/4 = 0,75 = 75%" },
        { enonce: "1/5 en pourcentage = ? %", type: "pourcentage", reponse: 20, astuce: "1/5 = 0,2 = 20%" },
        { enonce: "1/10 en pourcentage = ? %", type: "pourcentage", reponse: 10, astuce: "1/10 = 0,1 = 10%" },
        { enonce: "25% sous forme décimale = ?", type: "conversion", reponse: 0.25, astuce: "25% = 25÷100 = 0,25" },
        { enonce: "50% sous forme décimale = ?", type: "conversion", reponse: 0.5, astuce: "50% = 50÷100 = 0,5" },
        { enonce: "75% sous forme décimale = ?", type: "conversion", reponse: 0.75, astuce: "75% = 75÷100 = 0,75" },
        { enonce: "10% sous forme décimale = ?", type: "conversion", reponse: 0.1, astuce: "10% = 10÷100 = 0,1" },
        { enonce: "20% sous forme décimale = ?", type: "conversion", reponse: 0.2, astuce: "20% = 20÷100 = 0,2" },
        { enonce: "3/10 en pourcentage = ? %", type: "pourcentage", reponse: 30, astuce: "3/10 = 0,3 = 30%" },
        { enonce: "4/5 en pourcentage = ? %", type: "pourcentage", reponse: 80, astuce: "4/5 = 0,8 = 80%" },
        { enonce: "0,125 en pourcentage = ? %", type: "pourcentage", reponse: 12.5, astuce: "0,125 × 100 = 12,5%" },
        { enonce: "1/8 sous forme décimale = ?", type: "conversion", reponse: 0.125, astuce: "1/8 = 1÷8 = 0,125" },
        { enonce: "5% sous forme décimale = ?", type: "conversion", reponse: 0.05, astuce: "5% = 5÷100 = 0,05" },
        { enonce: "2/4 simplifié et en pourcentage = ? %", type: "pourcentage", reponse: 50, astuce: "2/4 = 1/2 = 50%" },
        { enonce: "6/10 simplifié et en pourcentage = ? %", type: "pourcentage", reponse: 60, astuce: "6/10 = 3/5 = 0,6 = 60%" },
        { enonce: "0,33 arrondi en pourcentage = ? %", type: "pourcentage", reponse: 33, astuce: "0,33 × 100 ≈ 33%" },
        { enonce: "0,66 arrondi en pourcentage = ? %", type: "pourcentage", reponse: 66, astuce: "0,66 × 100 ≈ 66%" },
        { enonce: "100% sous forme de fraction = ?", type: "conversion", reponse: 1, astuce: "100% = 100÷100 = 1" },
    ]
};

export const getFondamentauxExercises = (): StructuredExercise[] => {
    return niveauFondamentaux.exercices;
};
