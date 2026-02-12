export interface ProblemeExercise {
    id: number;
    niveau: 1 | 2 | 3 | 4;
    enonce: string;
    reponse: string | number | (string | number)[];
    unite?: string;
}

export const NIVEAU_LABELS: Record<number, { label: string; description: string }> = {
    1: { label: 'Très Facile', description: 'Opérations simples' },
    2: { label: 'Facile', description: 'Problèmes avec 2-3 opérations' },
    3: { label: 'Moyen', description: 'Problèmes avec plusieurs étapes' },
    4: { label: 'Assez Difficile', description: 'Problèmes complexes' },
};

export const problemesExercises: ProblemeExercise[] = [
    { id: 46, niveau: 1, enonce: "Calculer la somme de 2,325 ; 1,42 and 0,125.", reponse: 3.87 },
    { id: 47, niveau: 1, enonce: "De 14,125 retrancher 5,50.", reponse: 8.625 },
    { id: 1, niveau: 2, enonce: "Il y a 512 km de Douala à Yaoundé. À quelle distance de Yaoundé se trouve un car parti de Douala qui a roulé 8 h à 45 km à l'heure ?", reponse: 152, unite: "km" },
    { id: 2, niveau: 3, enonce: "Un libraire achète 48 volumes à 2 400 FCFA pièce. On lui fait une remise de 21 200 FCFA sur sa facture. Calculer son bénéfice s'il revend chaque livre 2 600 FCFA.", reponse: 30800, unite: "FCFA" },
    { id: 3, niveau: 4, enonce: "Deux maçons gagnent 400 FCFA par heure. L'un travaille 8 h par jour, l'autre 7 h. Combien chacun d'eux a-t-il gagné en une année (312 jours) ?", reponse: ["1er: 998 400 FCFA", "2e: 873 600 FCFA"] },
];

export const getProblemesByNiveau = (niveau: number): ProblemeExercise[] => {
    return problemesExercises.filter(ex => ex.niveau === niveau);
};

export const TOTAL_PROBLEMES = problemesExercises.length;
