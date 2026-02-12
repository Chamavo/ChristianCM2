// Import from exerciseData for local use
import {
    LEVEL_CONFIGS as _LEVEL_CONFIGS,
    getLevelConfig as _getLevelConfig,
    getTotalLevels as _getTotalLevels,
    getConcoursLevel as _getConcoursLevel,
    type SpecialLevelType as _SpecialLevelType,
    type LevelConfig as _LevelConfig
} from './exerciseData';

// Re-export for backwards compatibility
export const LEVEL_CONFIGS = _LEVEL_CONFIGS;
export const getLevelConfig = _getLevelConfig;
export const getTotalLevels = _getTotalLevels;
export const getConcoursLevel = _getConcoursLevel;
export type SpecialLevelType = _SpecialLevelType;
export type LevelConfig = _LevelConfig;

export interface UserProgress {
    username: string;
    currentLevel: number;
    levelProgress: number; // correct exercises in current level
    levelErrors: number; // errors in current level
    exercisesPerLevel: number; // required to complete level (20)
    mistakes: { [word: string]: number };
    exercisesCompleted: number;
    usedExerciseIds: number[]; // track used exercises to avoid repetition
    usedWords: string[]; // track used words for special levels
    sessionStartTime: number | null;
    lastSessionEnd: number | null;
}

export interface Exercise {
    id: number;
    type: 'choice' | 'qcm' | 'fill';
    question: string;
    options?: string[];
    correctAnswer: string;
    level: number;
    hint?: string;
    category: 'conjugaison' | 'accord' | 'orthographe' | 'grammaire' | 'homophones' | 'invariables';
}

// Exercise templates for generation
export interface ExerciseTemplate {
    type: 'choice' | 'qcm' | 'fill';
    category: 'conjugaison' | 'accord' | 'orthographe' | 'grammaire';
    level: number;
    questionTemplate: string;
    generateOptions?: () => { options: string[]; correctAnswer: string };
    correctAnswerPattern?: string[];
    hint: string;
}

// Level summary after completing a level
export interface LevelSummary {
    level: number;
    questionsAnswered: number;
    correctAnswers: number;
    errors: number;
    passed: boolean;
    timeUsed: number; // in seconds
}

// Static exercises (can be expanded)
export const EXERCISES: Exercise[] = [
    {
        id: 1,
        type: 'choice',
        question: 'Le soir dont je vous parle, je peux même dire que je m\'ennuy___ moins que jamais.',
        options: ['ais', 'ait', 'aient', 'ai'],
        correctAnswer: 'ais',
        hint: 'À l\'imparfait, avec le sujet "je", la terminaison est spécifique.',
        level: 1,
        category: 'conjugaison'
    },
    {
        id: 2,
        type: 'choice',
        question: 'Choisissez la bonne orthographe :',
        options: ['Les enfants sont allés', 'Les enfants sont aller', 'Les enfants sont allé'],
        correctAnswer: 'Les enfants sont allés',
        hint: 'Accord du participe passé avec le sujet',
        level: 1,
        category: 'accord'
    },
    {
        id: 3,
        type: 'qcm',
        question: 'Quelle phrase est correctement orthographiée ?',
        options: [
            'Nous fesons nos devoirs',
            'Nous faisons nos devoirs',
            'Nous faison nos devoirs'
        ],
        correctAnswer: 'Nous faisons nos devoirs',
        hint: 'Verbe faire au présent',
        level: 1,
        category: 'conjugaison'
    },
    {
        id: 4,
        type: 'choice',
        question: 'C\'est la rentrée. Les petits, qui vienn___ de l\'école maternelle, découvrent de nouveaux bâtiments.',
        options: ['ent', 'entt', 'e', 'es'],
        correctAnswer: 'ent',
        hint: 'Le sujet "les petits" est à la 3ème personne du pluriel.',
        level: 1,
        category: 'conjugaison'
    },
    {
        id: 5,
        type: 'choice',
        question: 'Choisissez la forme correcte :',
        options: ['Je dévorais', 'Je dévoré', 'Je dévorer'],
        correctAnswer: 'Je dévorais',
        hint: 'Conjugaison à l\'imparfait',
        level: 2,
        category: 'conjugaison'
    },
    {
        id: 6,
        type: 'choice',
        question: 'Les oiseaux chant___ dans les arbres.',
        options: ['ent', 'entt', 'e', 'es'],
        correctAnswer: 'ent',
        hint: 'Le sujet "les oiseaux" indique une action faite par plusieurs éléments.',
        level: 1,
        category: 'conjugaison'
    },
    {
        id: 7,
        type: 'qcm',
        question: 'Comment écrit-on correctement ?',
        options: [
            'Ils ont mangé leur repas',
            'Ils ont manger leur repas',
            'Ils ont mangés leur repas'
        ],
        correctAnswer: 'Ils ont mangé leur repas',
        hint: 'Participe passé with avoir',
        level: 2,
        category: 'accord'
    },
    {
        id: 8,
        type: 'choice',
        question: 'Elle a pris son cart___ et ses crayons.',
        options: ['able', 'ablle', 'ables', 'abe'],
        correctAnswer: 'able',
        hint: 'Cherche l\'orthographe correcte de cet objet utilisé à l\'école.',
        level: 1,
        category: 'orthographe'
    },
    {
        id: 9,
        type: 'choice',
        question: 'Quelle est la bonne orthographe ?',
        options: ['Ces fleurs son magnifiques', 'Ces fleurs sont magnifiques', 'Ses fleurs sont magnifique'],
        correctAnswer: 'Ces fleurs sont magnifiques',
        hint: 'Attention au verbe être et à l\'accord de l\'adjectif',
        level: 2,
        category: 'accord'
    },
    {
        id: 10,
        type: 'choice',
        question: 'Nous pren___ le bus chaque matin.',
        options: ['ons', 'on', 'ont', 'ent'],
        correctAnswer: 'ons',
        hint: 'Avec le pronom "nous", la terminaison est presque toujours la même au présent.',
        level: 1,
        category: 'conjugaison'
    }
];

// Exercise generation data
const CONJUGAISON_DATA = {
    verbes_1er_groupe: [
        { infinitif: 'chanter', radical: 'chant', type: 'regular' },
        { infinitif: 'marcher', radical: 'march', type: 'regular' },
        { infinitif: 'parler', radical: 'parl', type: 'regular' },
        { infinitif: 'jouer', radical: 'jou', type: 'regular' },
        { infinitif: 'regarder', radical: 'regard', type: 'regular' },
        { infinitif: 'écouter', radical: 'écout', type: 'regular' },
        { infinitif: 'travailler', radical: 'travaill', type: 'regular' },
        { infinitif: 'danser', radical: 'dans', type: 'regular' },
        { infinitif: 'manger', radical: 'mang', type: 'ger' }, // Verbes en -ger (garder le e devant a/o)
        { infinitif: 'dessiner', radical: 'dessin', type: 'regular' },
        { infinitif: 'nager', radical: 'nag', type: 'ger' },
        { infinitif: 'voyager', radical: 'voyag', type: 'ger' },
        { infinitif: 'ranger', radical: 'rang', type: 'ger' }
    ],
    terminaisons_present: {
        je: 'e', tu: 'es', 'il/elle': 'e',
        nous: 'ons', vous: 'ez', 'ils/elles': 'ent'
    },
    terminaisons_imparfait: {
        je: 'ais', tu: 'ais', 'il/elle': 'ait',
        nous: 'ions', vous: 'iez', 'ils/elles': 'aient'
    },
    terminaisons_futur: {
        je: 'erai', tu: 'eras', 'il/elle': 'era',
        nous: 'erons', vous: 'erez', 'ils/elles': 'eront'
    },
    // Terminaisons qui commencent par a ou o (nécessitent le e pour verbes en -ger)
    terminaisons_avec_a_o: ['ais', 'ait', 'aient', 'ons'],
    sujets: ['Je', 'Tu', 'Il', 'Elle', 'Nous', 'Vous', 'Ils', 'Elles']
};

const ACCORD_DATA = {
    noms_masculins: ['chien', 'chat', 'livre', 'arbre', 'garçon'],
    noms_feminins: ['fille', 'fleur', 'maison', 'voiture', 'table'],
    adjectifs: [
        { masc_sing: 'grand', fem_sing: 'grande', masc_plur: 'grands', fem_plur: 'grandes' },
        { masc_sing: 'petit', fem_sing: 'petite', masc_plur: 'petits', fem_plur: 'petites' },
        { masc_sing: 'beau', fem_sing: 'belle', masc_plur: 'beaux', fem_plur: 'belles' },
        { masc_sing: 'joli', fem_sing: 'jolie', masc_plur: 'jolis', fem_plur: 'jolies' }
    ]
};

const HOMOPHONES = [
    { options: ['a', 'à'], hint: '"a" = verbe avoir, "à" = préposition' },
    { options: ['et', 'est'], hint: '"et" = conjonction, "est" = verbe être' },
    { options: ['son', 'sont'], hint: '"son" = possessif, "sont" = verbe être' },
    { options: ['ou', 'où'], hint: '"ou" = choix, "où" = lieu' },
    { options: ['ce', 'se'], hint: '"ce" = démonstratif, "se" = pronom réfléchi' },
    { options: ['ces', 'ses', 'c\'est'], hint: '"ces" = démonstratif pluriel, "ses" = possessif, "c\'est" = cela est' }
];

// Context phrases for conjugation exercises - varied and natural
const CONJUGAISON_CONTEXTS = {
    present: [
        { phrase: (sujet: string, radical: string) => `${sujet} ${radical}___ chaque matin.` },
        { phrase: (sujet: string, radical: string) => `En ce moment, ${sujet.toLowerCase()} ${radical}___.` },
        { phrase: (sujet: string, radical: string) => `${sujet} ${radical}___ souvent.` },
        { phrase: (sujet: string, radical: string) => `Aujourd'hui, ${sujet.toLowerCase()} ${radical}___.` },
    ],
    imparfait: [
        { phrase: (sujet: string, radical: string) => `Autrefois, ${sujet.toLowerCase()} ${radical}___.` },
        { phrase: (sujet: string, radical: string) => `Quand j'étais petit, ${sujet.toLowerCase()} ${radical}___.` },
        { phrase: (sujet: string, radical: string) => `Hier, ${sujet.toLowerCase()} ${radical}___ tranquillement.` },
        { phrase: (sujet: string, radical: string) => `Avant, ${sujet.toLowerCase()} ${radical}___ tous les jours.` },
    ],
    futur: [
        { phrase: (sujet: string, radical: string) => `Demain, ${sujet.toLowerCase()} ${radical}___.` },
        { phrase: (sujet: string, radical: string) => `La semaine prochaine, ${sujet.toLowerCase()} ${radical}___.` },
        { phrase: (sujet: string, radical: string) => `Bientôt, ${sujet.toLowerCase()} ${radical}___.` },
        { phrase: (sujet: string, radical: string) => `L'année prochaine, ${sujet.toLowerCase()} ${radical}___.` },
    ],
};

const generateConjugaisonExercise = (id: number, level: number): Exercise => {
    const verbe = CONJUGAISON_DATA.verbes_1er_groupe[Math.floor(Math.random() * CONJUGAISON_DATA.verbes_1er_groupe.length)];

    const tempsOptions = ['present', 'imparfait', 'futur'] as const;
    const temps = tempsOptions[Math.floor(Math.random() * tempsOptions.length)];

    let terminaisons: { [key: string]: string };
    let tempsLabel: string;

    if (temps === 'present') {
        terminaisons = CONJUGAISON_DATA.terminaisons_present;
        tempsLabel = 'présent de l\'indicatif';
    } else if (temps === 'imparfait') {
        terminaisons = CONJUGAISON_DATA.terminaisons_imparfait;
        tempsLabel = 'imparfait de l\'indicatif';
    } else {
        terminaisons = CONJUGAISON_DATA.terminaisons_futur;
        tempsLabel = 'futur simple de l\'indicatif';
    }

    const sujetKeys = Object.keys(terminaisons);
    const sujetKey = sujetKeys[Math.floor(Math.random() * sujetKeys.length)];
    let terminaison = terminaisons[sujetKey as keyof typeof terminaisons];

    const needsE = verbe.type === 'ger' && temps !== 'futur' && CONJUGAISON_DATA.terminaisons_avec_a_o.includes(terminaison);

    let correctAnswer: string;
    let questionRadical: string;

    if (temps === 'futur') {
        correctAnswer = terminaison;
        questionRadical = verbe.infinitif.slice(0, -1);
    } else {
        correctAnswer = needsE ? 'e' + terminaison : terminaison;
        questionRadical = verbe.radical;
    }

    const sujetAffiche = sujetKey.charAt(0).toUpperCase() + sujetKey.slice(1);
    const contexts = CONJUGAISON_CONTEXTS[temps];
    const context = contexts[Math.floor(Math.random() * contexts.length)];
    const phraseAvecTrou = context.phrase(sujetAffiche, questionRadical);

    const question = `Conjugue le verbe « ${verbe.infinitif} » au ${tempsLabel}.\n${phraseAvecTrou}`;

    const options = [correctAnswer, 'ons', 'ez', 'ent', 'es', 'is', 'it']
        .filter(o => o !== correctAnswer)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
    options.push(correctAnswer);
    options.sort(() => Math.random() - 0.5);

    const finalHint = `Observe le sujet "${sujetKey}" et le temps demandé.`;

    return {
        id,
        type: 'choice',
        question,
        options,
        correctAnswer,
        hint: finalHint,
        level,
        category: 'conjugaison'
    };
};

const generateAccordExercise = (id: number, level: number): Exercise => {
    const adj = ACCORD_DATA.adjectifs[Math.floor(Math.random() * ACCORD_DATA.adjectifs.length)];
    const isFeminine = Math.random() > 0.5;
    const isPlural = Math.random() > 0.5;

    const nom = isFeminine
        ? ACCORD_DATA.noms_feminins[Math.floor(Math.random() * ACCORD_DATA.noms_feminins.length)]
        : ACCORD_DATA.noms_masculins[Math.floor(Math.random() * ACCORD_DATA.noms_masculins.length)];

    const article = isFeminine ? (isPlural ? 'Les' : 'La') : (isPlural ? 'Les' : 'Le');
    const nomFinal = isPlural ? nom + 's' : nom;

    const correctAnswer = isFeminine
        ? (isPlural ? adj.fem_plur : adj.fem_sing)
        : (isPlural ? adj.masc_plur : adj.masc_sing);

    const options = [adj.masc_sing, adj.fem_sing, adj.masc_plur, adj.fem_plur]
        .filter((v, i, a) => a.indexOf(v) === i)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

    if (!options.includes(correctAnswer)) {
        options[0] = correctAnswer;
        options.sort(() => Math.random() - 0.5);
    }

    return {
        id,
        type: 'qcm',
        question: `${article} ${nomFinal} ${isFeminine ? (isPlural ? 'sont' : 'est') : (isPlural ? 'sont' : 'est')} ___`,
        options,
        correctAnswer,
        hint: `Accord de l'adjectif avec un nom ${isFeminine ? 'féminin' : 'masculin'} ${isPlural ? 'pluriel' : 'singulier'}`,
        level,
        category: 'accord'
    };
};

const generateHomophoneExercise = (id: number, level: number): Exercise => {
    const homo = HOMOPHONES[Math.floor(Math.random() * HOMOPHONES.length)];
    const correctIdx = Math.floor(Math.random() * homo.options.length);
    const correct = homo.options[correctIdx];

    const phrases: { [key: string]: string[] } = {
        'a': ['Il ___ un chien.', 'Elle ___ fini son travail.', 'On ___ mangé ensemble.'],
        'à': ['Je vais ___ l\'école.', 'Il pense ___ ses amis.', 'C\'est ___ toi de jouer.'],
        'et': ['Le chat ___ le chien jouent.', 'J\'aime les pommes ___ les poires.'],
        'est': ['Marie ___ gentille.', 'Il ___ tard.', 'Le ciel ___ bleu.'],
        'son': ['Il a perdu ___ livre.', 'Elle écoute ___ professeur.'],
        'sont': ['Ils ___ partis.', 'Les enfants ___ contents.'],
        'ou': ['Tu veux du thé ___ du café ?', 'Reste ___ pars.'],
        'où': ['___ vas-tu ?', 'La ville ___ j\'habite est belle.'],
        'ce': ['___ livre est intéressant.', '___ matin, il pleut.'],
        'se': ['Il ___ lave les mains.', 'Elle ___ promène.'],
        'ces': ['___ fleurs sont belles.', 'Regarde ___ oiseaux.'],
        'ses': ['Il a perdu ___ clés.', 'Elle aime ___ amis.'],
        'c\'est': ['___ magnifique !', '___ mon frère.']
    };

    const phraseOptions = phrases[correct] || [`Complète avec "${correct}"`];
    const phrase = phraseOptions[Math.floor(Math.random() * phraseOptions.length)];

    return {
        id,
        type: 'choice',
        question: phrase,
        options: homo.options,
        correctAnswer: correct,
        hint: homo.hint,
        level,
        category: 'orthographe'
    };
};

// Dynamic exercise generator
export const generateExercise = (level: number, usedIds: number[]): Exercise => {
    const generatorType = Math.random();
    const newId = Date.now() + Math.floor(Math.random() * 1000);

    if (generatorType < 0.4) {
        return generateConjugaisonExercise(newId, level);
    } else if (generatorType < 0.7) {
        return generateAccordExercise(newId, level);
    } else {
        return generateHomophoneExercise(newId, level);
    }
};

// Get exercises for a level, avoiding recently used ones
export const getExerciseForLevel = (level: number, usedIds: number[]): Exercise => {
    const availableStatic = EXERCISES.filter(e =>
        e.level <= level && !usedIds.includes(e.id)
    );

    if (availableStatic.length > 0) {
        return availableStatic[Math.floor(Math.random() * availableStatic.length)];
    }

    return generateExercise(level, usedIds);
};

// Constants
export const EXERCISES_PER_LEVEL = 10;
export const LEVEL_TIME_LIMIT = 10 * 60; // 10 minutes in seconds
export const MAX_ERRORS_PER_LEVEL = 2; // Maximum 2 errors to pass a level
export const TOTAL_LEVELS = 50;
export const CONCOURS_LEVEL = 50;

// Get level display name using imported config
export const getLevelName = (level: number): string => {
    const config = getLevelConfig(level);
    return config?.name || `Niveau ${level}`;
};
