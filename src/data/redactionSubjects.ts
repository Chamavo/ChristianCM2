
export interface RedactionSubject {
    id: number;
    titre: string;
    niveau: string;
    categorie: 'Récit simple' | 'Récit au passé' | 'Récit imaginaire';
}

export const redactionSubjects: RedactionSubject[] = [
    // NIVEAU 1 – Récits simples (présent)
    { id: 1, titre: "Ma journée à l'école à Douala", niveau: "CM1", categorie: "Récit simple" },
    { id: 2, titre: "Pourquoi j'aime aller manger des glaces à Maison H avec maman", niveau: "CM1", categorie: "Récit simple" },
    { id: 3, titre: "Un match de football dans le quartier", niveau: "CM1", categorie: "Récit simple" },
    { id: 4, titre: "Une panne d'électricité le soir", niveau: "CM1", categorie: "Récit simple" },
    { id: 5, titre: "Une forte pluie pendant la saison des pluies", niveau: "CM1", categorie: "Récit simple" },
    { id: 6, titre: "Anniversaire chez mon ami", niveau: "CM1", categorie: "Récit simple" },
    { id: 7, titre: "Une visite chez ma grand-mère en ville", niveau: "CM1", categorie: "Récit simple" },
    { id: 8, titre: "Le vendeur de beignets du quartier", niveau: "CM1", categorie: "Récit simple" },
    { id: 9, titre: "Le gardien de l'école à Bonapriso", niveau: "CM1", categorie: "Récit simple" },
    { id: 10, titre: "Mon meilleur ami à l'école", niveau: "CM1", categorie: "Récit simple" },

    // NIVEAU 2 – Récits au passé (imparfait + passé composé)
    { id: 11, titre: "Le jour où j'ai perdu mon cartable", niveau: "CM1", categorie: "Récit au passé" },
    { id: 12, titre: "Un voyage à Balengou", niveau: "CM1", categorie: "Récit au passé" },
    { id: 13, titre: "Une inondation dans mon quartier", niveau: "CM1", categorie: "Récit au passé" },
    { id: 14, titre: "Le jour où notre équipe a gagné un match", niveau: "CM1", categorie: "Récit au passé" },
    { id: 15, titre: "Une visite à l'hôpital pour voir un proche", niveau: "CM1", categorie: "Récit au passé" },
    { id: 16, titre: "Une fête nationale (20 mai) à l'école", niveau: "CM1", categorie: "Récit au passé" },
    { id: 17, titre: "Une panne d'eau dans la maison", niveau: "CM1", categorie: "Récit au passé" },
    { id: 18, titre: "Le jour où j'ai appris à faire du vélo", niveau: "CM1", categorie: "Récit au passé" },
    { id: 19, titre: "Une surprise que mon papa m'a faite", niveau: "CM1", categorie: "Récit au passé" },
    { id: 20, titre: "Une journée très chaude pendant la saison sèche", niveau: "CM1", categorie: "Récit au passé" },

    // NIVEAU 3 – Récits imaginaires (créativité)
    { id: 21, titre: "Si j'étais maire de ma ville", niveau: "CM1", categorie: "Récit imaginaire" },
    { id: 22, titre: "Si les animaux du quartier pouvaient parler", niveau: "CM1", categorie: "Récit imaginaire" },
    { id: 23, titre: "Une aventure dans un immeuble abandonné", niveau: "CM1", categorie: "Récit imaginaire" },
    { id: 24, titre: "Une rencontre avec un joueur célèbre des Lions Indomptables", niveau: "CM1", categorie: "Récit imaginaire" },
    { id: 25, titre: "Je découvre un trésor au marché central", niveau: "CM1", categorie: "Récit imaginaire" },
    { id: 26, titre: "Une nuit où toute la ville devient silencieuse", niveau: "CM1", categorie: "Récit imaginaire" },
    { id: 27, titre: "Une machine qui arrête la pluie", niveau: "CM1", categorie: "Récit imaginaire" },
    { id: 28, titre: "Un jour sans voitures dans la ville", niveau: "CM1", categorie: "Récit imaginaire" },
    { id: 29, titre: "Je me réveille et je peux voler au-dessus de Douala", niveau: "CM1", categorie: "Récit imaginaire" }
];
