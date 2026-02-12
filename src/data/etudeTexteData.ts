export interface TextStudy {
    id: number;
    title: string;
    content: string;
    questions: {
        id: number;
        question: string;
        expectedAnswer: string;
    }[];
}

export const etudeTexteData: TextStudy[] = [
    {
        id: 2,
        title: "Sujet 2",
        content: "L’Afrique est de plus en plus frappée par un nouveau fléau : la route ne se passe pas de jour, si non d’heure sans que, sur nos réseaux urbains ou en rase campagne, de graves accidents de circulation provoquent la mort des dizaines de voyageurs.\nLes principales raisons de cette hécatombe en Afrique sont : le manque d’éducation des conducteurs, la carence des autorités administratives dans l’installation des panneaux de signalisation ou le contrôle des véhicules vétustes.\nLes dirigeants africains devraient dès à présent réfléchir et réagir à temps pour limiter les dégâts. Notamment en organisant et en développant les infrastructures de transport, en faisant preuve de plus de rigueur au niveau du code de la route, en interdisant les véhicules non conformes aux règles de sécurité.\nSiradiou DIALLO",
        questions: [
            {
                id: 1,
                question: "Quel est ce nouveau fléau dont nous parle l’auteur ?",
                expectedAnswer: "Les accidents de circulation / Les accidents de la route"
            },
            {
                id: 2,
                question: "Cite 4 principales causes de ce fléau en Afrique.",
                expectedAnswer: "Le manque d'Ã©ducation des conducteurs\n- La carence des autoritÃ©s administratives\n- L'absence ou l'insuffisance de panneaux de signalisation\n- Les vÃ©hicules vÃ©tustes / non conformes"
            },
            {
                id: 3,
                question: "Quels sont les dégâts causés par les accidents de la circulation ?",
                expectedAnswer: "La mort de dizaines de voyageurs\n- Des graves accidents\n- Une hÃ©catombe"
            },
            {
                id: 4,
                question: "relève dans le texte, 3 précautions que doivent prendre les responsables africains pour éviter cette hécatombe ?",
                expectedAnswer: "Organiser et dÃ©velopper les infrastructures de transport\n- Faire preuve de plus de rigueur au niveau du code de la route\n- Interdire les vÃ©hicules non conformes aux rÃ¨gles de sÃ©curitÃ©"
            },
            {
                id: 5,
                question: "Combien de paragraphes y a-t-il dans ce texte ?",
                expectedAnswer: "3 paragraphes"
            },
            {
                id: 6,
                question: "Propose un bon titre au texte.",
                expectedAnswer: "\"Les accidents de la route en Afrique\"\n- \"L'hÃ©catombe routiÃ¨re en Afrique\"\n- \"La sÃ©curitÃ© routiÃ¨re en Afrique\"\n- \"Un flÃ©au meurtrier : les accidents de circulation\""
            },
            {
                id: 7,
                question: "Donne le nombre de phrases contenues dans le premier paragraphe.",
                expectedAnswer: "2 phrases (ou 1 phrase selon la ponctuation interprÃ©tÃ©e)"
            },
            {
                id: 8,
                question: "Donne : a- un synonyme de « hécatombe » ; b) Un homonyme de « voie » ; c)Un antonyme de « interdire ».",
                expectedAnswer: "Massacre, carnage, tuerie, boucherie\n\n**b) Homonyme de \"voie\"**\n- Voix, voit\n\n**c) Antonyme de \"interdire\"**\n- Autoriser, permettre, accepter, approuver"
            },
            {
                id: 9,
                question: "Trouve un verbe de la famille que chacun des noms suivants : a) Installation ; b) Transport.",
                expectedAnswer: "Installer\n\n**b) Transport**\n- Transporter"
            },
            {
                id: 10,
                question: "Trouve deux mots de la même famille que « inquiétant »  ═══════════════════════════════════════════════════════════════════════════════",
                expectedAnswer: "InquiÃ©tude, inquiet, inquiÃ©ter, s'inquiÃ©ter"
            },
        ]
    },
    {
        id: 3,
        title: "Sujet 3",
        content: "La semaine nationale de la culture\n\nCette année-là, la semaine nationale de la culture fut particulièrement animée. La ville de Sya qui abrite cette importante manifestation avait été nettoyée par les habitants. Les enfants s'étaient entraînés pour enlever les immondices qui enlaidissaient les abords de certains lieux publics.\n\nÀ l'ouverture, un grand défilé eut lieu. Les troupes de danse, de musique, de théâtre, ... se succédèrent. La nuit et les jours qui suivirent, les différents groupes entrèrent en compétition. Il fallait convaincre le public et le jury par la beauté et l'originalité de sa prestation.\n\nÀ la fin de la semaine, une grande cérémonie de clôture fut organisée à la maison de la culture. Tous les lauréats reçurent des prix sous les ovations de l'assistance.\n\nGroupe d'auteurs de l'IPB (texte adapté)",
        questions: [
            {
                id: 1,
                question: "« Les immondices qui enlaidissaient les abords ». Explique le mot « immondices ».",
                expectedAnswer: "DÃ©chets, ordures, saletÃ©s, dÃ©tritus"
            },
            {
                id: 2,
                question: "« ... sous les ovations de l'assistance. » Explique le mot « ovations ».",
                expectedAnswer: "Applaudissements enthousiastes, acclamations"
            },
            {
                id: 3,
                question: "« Les troupes de théâtre. » Trouve un adjectif qualificatif venant du mot « théâtre ».",
                expectedAnswer: "ThÃ©Ã¢tral(e)"
            },
            {
                id: 4,
                question: "« La semaine nationale. » Donne le radical du mot « nationale ».",
                expectedAnswer: "Nation"
            },
            {
                id: 5,
                question: "« ... les différents groupes... » Trouve le diminutif du mot « groupes ».",
                expectedAnswer: "Groupuscule, groupelet"
            },
            {
                id: 6,
                question: "« Il fallait convaincre le jury. » Trouve le participe passé du verbe « fallait ».",
                expectedAnswer: "Fallu"
            },
            {
                id: 7,
                question: "« Les enfants s'étaient entraînés. » À quel temps de l'indicatif est conjugué le verbe de cette phrase ?",
                expectedAnswer: "Plus-que-parfait de l'indicatif"
            },
            {
                id: 8,
                question: "« La nuit et les jours qui suivirent. » Réécris cette phrase en mettant le verbe au conditionnel présent.",
                expectedAnswer: "La nuit et les jours qui suivraient"
            },
            {
                id: 9,
                question: "« Les lauréats reçurent des prix. » Réécris cette phrase en mettant le verbe au passé antérieur de l'indicatif.",
                expectedAnswer: "Les laurÃ©ats eurent reÃ§u des prix"
            },
            {
                id: 10,
                question: "« Un grand défilé eut lieu. » Mets cette phrase à la forme négative.",
                expectedAnswer: "Un grand dÃ©filÃ© n'eut pas lieu / Aucun grand dÃ©filÃ© n'eut lieu"
            },
            {
                id: 11,
                question: "Donne la nature du mot souligné dans le texte.",
                expectedAnswer: "DÃ©pend du mot soulignÃ©"
            },
            {
                id: 12,
                question: "« Une grande cérémonie de clôture fut organisée. »     Donne la fonction du mot « grande ».",
                expectedAnswer: "Ã‰pithÃ¨te du nom \"cÃ©rÃ©monie\" / Adjectif qualificatif Ã©pithÃ¨te"
            },
            {
                id: 13,
                question: "« Certains lieux publics. » Réécris ce groupe du nom en remplaçant « Certains lieux » par « Certaines places ».",
                expectedAnswer: "Certaines places publiques"
            },
            {
                id: 14,
                question: "« La ville de Sya qui abrite cette importante manifestation avait été nettoyée. » Fais l'analyse logique de cette phrase.",
                expectedAnswer: "Proposition principale : \"La ville de Sya avait Ã©tÃ© nettoyÃ©e\"\n- Proposition subordonnÃ©e relative : \"qui abrite cette importante manifestation\""
            },
            {
                id: 15,
                question: "À partir du texte, donne une activité réalisée avant l'ouverture de la semaine nationale de la culture.",
                expectedAnswer: "La ville avait Ã©tÃ© nettoyÃ©e par les habitants\n- Les enfants avaient enlevÃ© les immondices"
            },
            {
                id: 16,
                question: "Deux critères ont été utilisés par le jury pour désigner les lauréats. Relèves-en un.",
                expectedAnswer: "La beautÃ© de la prestation\n- L'originalitÃ© de la prestation"
            },
            {
                id: 17,
                question: "Tu as déjà participé à une journée culturelle. En quatre ou cinq lignes, raconte.   ═══════════════════════════════════════════════════════════════════════════════",
                expectedAnswer: "Ã‰valuer : structure narrative, cohÃ©rence, richesse du vocabulaire, respect du nombre de lignes"
            },
        ]
    },
    {
        id: 4,
        title: "Sujet 4",
        content: "Le jeune menuisier\n\nTout petit, Satigui rêvait d'exercer le métier de menuisier. Aussi, à la fin de ses études primaires, ses parents approuvèrent-ils de l'inscrire dans un centre de formation professionnelle des artisans. Satigui, très attentif, étudia tout enseignage qu'il trouva très brillant pour exercer un métier trop peu valorisant.\n\nAvec les bénédictions des dieux, Satigui embrassa la carrière de menuisier. Pendant son stage, il a travaillé avec ardeur pour percer le mystère du travail du bois. Il polissait le bois à souhait lorsqu'il se trouvait à l'atelier.\n\nPlus tard, le jeune menuisier ouvrit un grand atelier. Depuis cinq ans, add il-il aux jeunes clients, Satigui fabrique divers meubles. Ses œuvres sont très appréciées par de nombreuses clients. Il est devenu riche. L'exemple de Satigui montre que l'artisanat est une activité qui réussit.\n\nGroupe d'auteurs (texte adapté)",
        questions: [
            {
                id: 1,
                question: "« Avec les bénédictions des dieux... » Explique le mot « bénédictions ».",
                expectedAnswer: "Faveurs, protection divine, bonnes grÃ¢ces"
            },
            {
                id: 2,
                question: "« ... il a travaillé avec ardeur... » Explique l'expression « avec ardeur ».",
                expectedAnswer: "Avec Ã©nergie, avec passion, avec dÃ©termination, avec zÃ¨le"
            },
            {
                id: 3,
                question: "« Satigui trouva qu'il le trouvée très brillant... » Trouve un synonyme du mot « brillant ».",
                expectedAnswer: "Intelligent, douÃ©, talentueux, excellent"
            },
            {
                id: 4,
                question: "« ... approuvèrent-ils de l'inscrire... » Donne un nom venant de « inscrire ».",
                expectedAnswer: "Inscription"
            },
            {
                id: 5,
                question: "« ... un secteur de réussite ». Trouve le contraire de « réussite ».",
                expectedAnswer: "Ã‰chec, insuccÃ¨s"
            },
            {
                id: 6,
                question: "« Satigui rêvait d'exercer le métier de menuisier. » Trouve le groupe du verbe souligné.",
                expectedAnswer: "1er groupe"
            },
            {
                id: 7,
                question: "« ... le jeune menuisier ouvrit... » Donne le participe présent de « ouvrit ».",
                expectedAnswer: "Ouvrant"
            },
            {
                id: 8,
                question: "« ... Satigui embrassa la carrière de menuisier- ». Réécris cette phrase en mettant le verbe au plus-que parfait de l'indicatif.",
                expectedAnswer: "Satigui avait embrassÃ© la carriÃ¨re de menuisier"
            },
            {
                id: 9,
                question: "« ... les clients étaient très satisfaits... » Réécris cette phrase en mettant le verbe au futur antérieur de l'indicatif.",
                expectedAnswer: "Les clients auront Ã©tÃ© trÃ¨s satisfaits"
            },
            {
                id: 10,
                question: "« ... l'artisanat est un secteur de réussite. » Mets cette phrase à la forme interrogative.",
                expectedAnswer: "L'artisanat est-il un secteur de rÃ©ussite ?\n- Est-ce que l'artisanat est un secteur de rÃ©ussite ?"
            },
            {
                id: 11,
                question: "Trouve la nature du mot souligné dans le texte.",
                expectedAnswer: "DÃ©pend du mot soulignÃ© dans le texte original"
            },
            {
                id: 12,
                question: "« Ses œuvres sont appréciées... » Trouve la fonction du mot « cinq ».",
                expectedAnswer: "Erreur dans la question : \"cinq\" ne se trouve pas dans \"Ses Å“uvres sont apprÃ©ciÃ©es\"\n- Si rÃ©fÃ©rence Ã  \"Depuis cinq ans\" : complÃ©ment circonstanciel de temps"
            },
            {
                id: 13,
                question: "« ... divers meubles ».    Réécris ce groupe du nom en remplaçant meubles par « table ».",
                expectedAnswer: "Diverses tables"
            },
            {
                id: 14,
                question: "« Il polissait le bois à souhait lorsque il se trouvait à l'atelier. » Fais l'analyse logique de cette phrase.",
                expectedAnswer: "Proposition principale : \"Il polissait le bois Ã  souhait\"\n- Proposition subordonnÃ©e conjonctive de temps : \"lorsqu'il se trouvait Ã  l'atelier\""
            },
            {
                id: 15,
                question: "Donne un titre au texte",
                expectedAnswer: "\"Le jeune menuisier\" (dÃ©jÃ  donnÃ©)\n- Alternatives : \"La rÃ©ussite de Satigui\", \"Un artisan passionnÃ©\", \"L'artisanat, voie de rÃ©ussite\""
            },
            {
                id: 16,
                question: "À quel moment les parents de Satigui approuvèrent-ils de l'inscrire dans un centre de formation professionnelle des artisans ?",
                expectedAnswer: "Ã€ la fin de ses Ã©tudes primaires"
            },
            {
                id: 17,
                question: "Relève dans le texte un passage qui montre que le jeune menuisier a réussi.",
                expectedAnswer: "\"Il est devenu riche\"\n- \"Ses Å“uvres sont trÃ¨s apprÃ©ciÃ©es par de nombreux clients\"\n- \"Satigui fabrique divers meubles\"\n- \"Le jeune menuisier ouvrit un grand atelier\""
            },
            {
                id: 18,
                question: "En quatre ou cinq lignes, donne les avantages du métier de menuisier.   ═══════════════════════════════════════════════════════════════════════════════",
                expectedAnswer: "Points attendus : autonomie professionnelle, crÃ©ativitÃ©, revenus, satisfaction du travail manuel, utilitÃ© sociale, transmission de savoir-faire"
            },
        ]
    },
    {
        id: 6,
        title: "Sujet 6",
        content: "Visite d'une usine textile\n\nUn jour, en compagnie de notre maître, nous nous sommes rendus à l'usine textile à bord d'un car. Un guide nous attendait devant le portail.\n\nLa visite commença par le magasin où sont entreposées les balles de coton traité. Nous passâmes ensuite à la section de filature. Là, nous fûmes accueillis par le vacarme des machines. Des ouvriers veillaient à la bonne qualité des fils produits. Après, nous entrâmes dans l'atelier de tissage où de longues bandes de tissu sortaient des grands métiers à tisser. À l'unité de teinture, une odeur nauséabonde montait des cuves. Des ouvriers aux mains gantées s'affairaient et faisaient sortir de ces cuves, de beaux tissus qui attirèrent la convoitise des clients.\n\nÀ la fin de cette visite passionnante, nous repartîmes avec de nouvelles connaissances.\n\nCaisse d'ONOU (texte adapté)",
        questions: [
            {
                id: 1,
                question: "« Une odeur nauséabonde montait des cuves. » Explique le mot « nauséabonde ».",
                expectedAnswer: ""
            },
            {
                id: 2,
                question: "« Là, nous fûmes accueillis par le vacarme des machines. »    Explique le mot « vacarme ».",
                expectedAnswer: ""
            },
            {
                id: 3,
                question: "Trouve le préfixe du mot « entreposées ».",
                expectedAnswer: ""
            },
            {
                id: 4,
                question: "« Des ouvriers veillaient à la bonne qualité des fils produits. »    Trouve un nom venant de « veillaient ».",
                expectedAnswer: ""
            },
            {
                id: 5,
                question: "Trouve un adverbe dérivé de « nouvelles ».",
                expectedAnswer: ""
            },
            {
                id: 6,
                question: "« Ils faisaient sortir de beaux tissus. » Trouve le participe présent de « faisaient ».",
                expectedAnswer: ""
            },
            {
                id: 7,
                question: "« Nous repartîmes avec de nouvelles connaissances. »    Trouve le groupe du verbe souligné dans cette phrase.",
                expectedAnswer: ""
            },
            {
                id: 8,
                question: "« Nous entrâmes dans l'atelier. »    Réécris cette phrase en mettant le verbe à l'imparfait de l'indicatif.",
                expectedAnswer: ""
            },
            {
                id: 9,
                question: "« De longues bandes de tissu sortaient des grands métiers à tisser. »    Réécris cette phrase en mettant le verbe au passé composé de l'indicatif.",
                expectedAnswer: ""
            },
            {
                id: 10,
                question: "« Un guide nous attendait. » Mets cette phrase à la forme passive.",
                expectedAnswer: ""
            },
            {
                id: 11,
                question: "Donne la nature du mot souligné dans le texte.",
                expectedAnswer: ""
            },
            {
                id: 12,
                question: "« Nous passâmes ensuite à la section de filature. »    Trouve la fonction du mot « filature ».",
                expectedAnswer: ""
            },
            {
                id: 13,
                question: "« De beaux tissus attirèrent la convoitise des clients. »    Réécris cette phrase en remplaçant le groupe du nom souligné par l'adjectif possessif qui convient.",
                expectedAnswer: ""
            },
            {
                id: 14,
                question: "« La visite commença par le magasin où sont entreposées les balles de coton traité. »    Fais l'analyse logique de cette phrase.",
                expectedAnswer: ""
            },
            {
                id: 15,
                question: "Relève dans le texte un endroit visité par les élèves à l'usine.",
                expectedAnswer: ""
            },
            {
                id: 16,
                question: "Relève dans le texte le passage qui montre que la visite a été utile pour les élèves.",
                expectedAnswer: ""
            },
            {
                id: 17,
                question: "En quatre ou cinq lignes, raconte le retour des élèves de l'usine.   ═══════════════════════════════════════════════════════════════════════════════",
                expectedAnswer: ""
            },
        ]
    },
    {
        id: 7,
        title: "Sujet 7",
        content: "Texte : Un voyage agité\n\nJe n'avais jamais voyagé. La veille, maman avait fait ma valise. Je montai dans une fourgonnette où plusieurs dizaines de jeunes élèves avaient déjà pris place. J'étais enthousiaste à l'idée de prendre pour la première fois un véhicule. Le chauffeur, un quadragénaire moustachu, criait sur tout le monde. Il était surexcité. Il avait certainement bu quelques verres de Guinness à cause des panneaux publicitaires qui recommandaient fortement aux gens d'en consommer avec des messages comme « Guinness is good for you ». Tout le monde était invité à boire cette boisson, du fœtus jusqu'aux rares nonagénaires. La foule bigarrée criait sur lui à chaque fois qu'il sortait un mot.\n\nC'était à la fois stressant et émouvant de quitter mon village. Je gardais en secret le souhait de retrouver mon père, parti sans laisser de nouvelles, voici bientôt sept ans. J'étais frappée par le mélange d'odeurs dans cette fourgonnette. Je reconnaissais néanmoins la forte odeur du manioc. Le manioc est bon, mais son odeur est repoussante. Il est comme le camembert, bon, mais puant, puant, mais bon. C'est le destin du manioc : on ne l'aime pas pour son odeur, on l'aime parce qu'il accompagne bien le poulet, les chenilles, le poisson, la gazelle, la tortue marine, le python, l'avocat, la mangue ou l'arachide.\n\nExtrait d'Arnold NGUIMBI, PASCALINE, l'Harmattan, 2012, Paris",
        questions: [
            {
                id: 1,
                question: "Dis en une ligne au moins ce que tu penses de ce voyage.",
                expectedAnswer: ""
            },
            {
                id: 2,
                question: "En lisant le texte, dis pourquoi le chauffeur était excité.",
                expectedAnswer: ""
            },
            {
                id: 3,
                question: "Dis en une ou deux lignes ce que décrit l'auteur dans le deuxième paragraphe.",
                expectedAnswer: ""
            },
            {
                id: 4,
                question: "Réécris la phrase « J'étais enthousiaste à l'idée de prendre pour la première fois un véhicule» en remplaçant le mot souligné par un synonyme.",
                expectedAnswer: ""
            },
            {
                id: 5,
                question: "Réécris la phrase « Le manioc est bon, et son odeur est repoussante.» en remplaçant l'adjectif souligné par un contraire.",
                expectedAnswer: ""
            },
            {
                id: 6,
                question: "Trouve un nom qui provient de l'adjectif « stressant ».",
                expectedAnswer: ""
            },
            {
                id: 7,
                question: "Réécris la phrase « on ne l'aime pas pour son odeur, on l'aime parce qu'il accompagne bien le poulet » en remplaçant la virgule par une conjonction de coordination.",
                expectedAnswer: ""
            },
            {
                id: 8,
                question: "Donne la nature et la fonction des mots et expressions soulignés dans le texte.",
                expectedAnswer: ""
            },
            {
                id: 9,
                question: "Réécris la phrase à la forme active: « Je n'avais jamais voyagé».",
                expectedAnswer: ""
            },
            {
                id: 10,
                question: "Réécris la phrase « J'étais frappée par le mélange d'odeurs dans cette fourgonnette» en mettant le verbe au présent de l'indicatif.",
                expectedAnswer: ""
            },
            {
                id: 11,
                question: "Donne l'infinitif et le groupe du verbe conjugué dans la phrase : « à chaque fois qu'il sortait un mot ».",
                expectedAnswer: ""
            },
            {
                id: 12,
                question: "Réécris la phrase « je reconnais néanmoins l'odeur du manioc » en commençant par Nous…  ═══════════════════════════════════════════════════════════════════════════════ ═══════════════════════════════════════════════════════════════════════════════",
                expectedAnswer: ""
            },
        ]
    },
    {
        id: 9,
        title: "Sujet 9",
        content: "Souvenir d’enfance  \nMon oncle et moi marchions sur un \nsentier tortueux qui mène à la ferme \nfamiliale. Pour un jeune citadin, \ncheminer en brousse est toujours \nmerveilleux. Pendant que nous \navancions, nous délogions ici un lièvre, \nlà un sanglier, en battant les hautes \nherbes av ec des branches mortes. \nApeurés par le bruit, des oiseaux \ns’envolent à tire -d’aile. Mon oncle, \nvoyant mon enthousiasme, s’efforçait à \ndébusquer davantage d’animaux et je \nl’imitais de temps à autre. Par endroits, \ndes singes bondissaient dans les arbres. \nQuand mon oncle me sentit fatigué, \nnous nous assîmes à l’ombre d’un arbre \npour nous reposer et déguster le plat \nque ma tante nous avait préparé. \nRevigorés, nous reprîmes sereinement \nnotre  parcours. J’étais maintenant \npressé d’arriver à la ferme pour \ncaresser les veaux dans l’étable.  \n            Camara laye, L’enfant noir",
        questions: [
            {
                id: 1,
                question: "–Explique  : revigorés, tortueux.",
                expectedAnswer: ""
            },
            {
                id: 2,
                question: "Trouve un verbe dérivé de  « merveilleux  »",
                expectedAnswer: ""
            },
            {
                id: 3,
                question: "Trouve le radical de  « familiale  »",
                expectedAnswer: ""
            },
            {
                id: 4,
                question: "Trouve le contraire de «  hautes  »",
                expectedAnswer: ""
            },
            {
                id: 5,
                question: "« Mon oncle me sentit  fatigué  ».Trouve le temps du verbe.",
                expectedAnswer: ""
            },
            {
                id: 6,
                question: "Relève dans le texte un verbe à la  forme pronominale.",
                expectedAnswer: ""
            },
            {
                id: 7,
                question: "« Des singes bondissaient dans les  arbres  ».Mets le verbe au passé  antérieur.",
                expectedAnswer: ""
            },
            {
                id: 8,
                question: "«Nous reprîmes notre parcours  ».  Mets l e verbe au conditionnel présent.",
                expectedAnswer: ""
            },
            {
                id: 9,
                question: "«Nous délogions ici un lièvre  ».Mets  la phrase à la forme interro -négative.",
                expectedAnswer: ""
            },
            {
                id: 10,
                question: "Donne la nature et la fonction du mot  souligné dans le texte.",
                expectedAnswer: ""
            },
            {
                id: 11,
                question: "Trouve la fonction de «  l’ » (Je  l’imitais)",
                expectedAnswer: ""
            },
            {
                id: 12,
                question: "« Le plat q ue ma tante nous avait  préparé  ». Remplace «  le plat  » par «  la  nourriture  »",
                expectedAnswer: ""
            },
            {
                id: 13,
                question: "« Quand mon oncle me sentit fatigué,  nous nous assîmes à l’ombre d’un  arbre  ». Fais l’analyse logique de cette  phrase.",
                expectedAnswer: ""
            },
            {
                id: 14,
                question: "comment l’enfant et son  oncle s’y  prenaient -ils pour débusquer les  animaux  ? Etude de texte  : CEP 2 .000 à 2 .021   +  CEP Blanc  Passoré       2-Relève dans le texte un passage qui  montre que le trajet était long.",
                expectedAnswer: ""
            },
            {
                id: 15,
                question: "En délogeant les animaux, une bête  dangereuse surgit devant l’enfant et  son oncle.   En 3 ou 4 lignes, raconte. ═══════════════════════════════════════════════════════════════════════════════ ═══════════════════════════════════════════════════════════════════════════════",
                expectedAnswer: ""
            },
        ]
    },
    {
        id: 11,
        title: "Sujet 11",
        content: "Le lièvre et le la perdrix  \n     Un jour, le lièvre et la perdrix \nmanquèrent de sel pour assaisonner \nleurs repas. Ils convinrent alors de jouer \nun tour aux marchands de sel qui se \nrendaient au marché voisin. Ainsi, le \nlièvre se cacha et la p erdrix joua à la \nblessée sur la route. Lorsque les \nmarchands la virent. Ils déposèrent \nleurs charges et tentèrent de la \ncapturer. Pendant que la perdrix les \nentraînait loin, le lièvre dissimula leur \nsel.    \n   Plus tard, les deux complices se \nretrouvèrent pour partager leur butin. \nLe lièvre voulut tromper la perdrix  ; \nmais celle -ci, plus rusée, goûta au sel, \nbattit des ailes puis fit la morte. Effrayé, \nle lièvre s’enfuit. La perdrix se releva et \nemporta tout le sel.",
        questions: [
            {
                id: 1,
                question: "« Ils tentèrent de la capturer  ».  Explique le mot «  capturer  »",
                expectedAnswer: ""
            },
            {
                id: 2,
                question: "« les deux complices se  retrouvèrent…  » Explique le  mot « complices  » 3-Trouve un homonyme du  mot « mais  »",
                expectedAnswer: ""
            },
            {
                id: 3,
                question: "« …jouer un tour…  » Trouve un nom  de la même famille que «  tour  »",
                expectedAnswer: ""
            },
            {
                id: 4,
                question: "« la perdrix les ent raînait loin…  »  Trouve l’adjectif qualificatif dérivé du  mot «  loin »",
                expectedAnswer: ""
            },
            {
                id: 5,
                question: "« le lièvre dissimula leur sel  » Trouve  le groupe du verbe de cette phrase.",
                expectedAnswer: ""
            },
            {
                id: 6,
                question: "« Le lièvre s’enfuit.  » Trouve le  participe présent du verbe de cette  phrase.",
                expectedAnswer: ""
            },
            {
                id: 7,
                question: "« Les marchands virent la perdrix».  Réécris cette phrase en mettant le  verbe au plus -que-parfait de l’indicatif.        4-« Celle -ci battit des ailes  ». Réécris  cette phrase en mettant le verbe au  présent de l’indicatif.     5-« Ils déposèrent leurs charge s » A  quelle voix est cette phrase.",
                expectedAnswer: ""
            },
            {
                id: 8,
                question: "« …celle -ci, plus rusée…  »Trouve la  nature du mot souligné.",
                expectedAnswer: ""
            },
            {
                id: 9,
                question: "« La perdrix se releva et emporta tout  le sel  »Trouve la fonction de «  perdrix  »",
                expectedAnswer: ""
            },
            {
                id: 10,
                question: "« Effrayé, le lièvre s’enfuit  » Réécris  cette phras e en remplaçant « le  lièvre  »par «  la pintade  »",
                expectedAnswer: ""
            },
            {
                id: 11,
                question: "« Pendant que la perdrix les entraînait  loin, le lièvre dissimula leur sel.  » Fais  l’analyse logique de cette phrase.              IV-Intelligence du texte",
                expectedAnswer: ""
            },
            {
                id: 12,
                question: "Quel a été le rôle du lièvre dans le  tour joué aux marchand s de sel  ?",
                expectedAnswer: ""
            },
            {
                id: 13,
                question: "Pourquoi la perdrix fit –elle la morte  ?",
                expectedAnswer: ""
            },
            {
                id: 14,
                question: "Quelques jour s après, le lièvre croise  la perdrix. En 4 ou 5 lignes, raconte. ═══════════════════════════════════════════════════════════════════════════════ ═══════════════════════════════════════════════════════════════════════════════",
                expectedAnswer: ""
            },
        ]
    },
    {
        id: 13,
        title: "Sujet 13",
        content: "Le karité est un arbre de la savane \npouvant atteindre sept à huit mètr es de \nhauteur. Le charbon produit à partir de \nson bois est prisé par les forgerons et \nles ménagères. Ses fruits charnus \ncontiennent des noix qui servent à la \nfabrication du beurre. La production et \nla commercialisation de cette matière \ngrasse sont principa lement l’affaire des \nfemmes. Elles vont régulièrement la \nvendre au marché afin de subvenir aux \nbesoins indispensables de leur famille. \nCe beurre, utilisé en cuisine, entre \négalement dans la fabrication de \nmédicaments et divers produits de \nbeauté.  \n      Le karité dont on reconnaît tant la \ncontribution au bien -être des familles \nest aujourd’hui menacé de disparition.  \nKOUAKOU N°138\n      I-Vocabulaire (5 pts)  \n1-« …subvenir aux besoins \nindispensables de leur familles.»  \nExplique le mot  « indispensables  » \n2-« Le charbon produit à partir de son \nbois est prisé  par ….les ménagères.  » \nExplique le mot  « prisé  » 3-Comment est formé le mot \n« fabrication  » ? \n4-Trouve l’adverbe dérivé du \nmot « divers  » \n5-Donne un synonyme du mot \n« commercialisatio n » \n      II-Conjugaison (5 pts)  \n1-« Les noix servent à la fabrication du \nbeurre  »Trouve le mode du verbe de \ncette phrase.  \n 2-« On reconnaît la contribution du \nkarité au bien -être des familles.  » \nTrouve le temps du verbe de cette \nphrase.  \n3-« Ses fruits cha rnus contiennent des \nnoix  ».  \nMets cette phrase à l’imparfait de \nl’indicatif.  \n4-« Elles vont la vendre au marché  » \nRéécris cette phrase au futur antérieur  \n5-« Ce beurre entre dans la fabrication \nde divers produits de beauté  » \nRéécris cette phrase à la form e \ninterrogative.  \n     III-Grammaire (5 pts)  \n1-«Le karité est un arbre de la savane \npouvant atteindre sept à huit mètres de \nhauteur.»   \nDonne la nature du mot souligné dans \ncette phrase.  \n2-« La production et la \ncommercialisation de cette matière \ngrasse sont l’affaire des femmes  »  \nTrouve la fonction du mot souligné dans \ncette phrase.  \n3-« Cette matière grasse  » \n     Réécris ce groupe du nom en \nremplaçant  «cette matière  »par «  ce \nproduit  »  \n4-« Le karité dont on reconnaît tant la \ncontribution au bien -être des famill es \nest aujourd’hui menacé de \ndisparition.  » \nFais l’analyse logique de cette phrase.",
        questions: [
            {
                id: 1,
                question: "Donne un autre titre au texte",
                expectedAnswer: ""
            },
            {
                id: 2,
                question: "Trouve dans le texte une utilité du  beurre de karité",
                expectedAnswer: ""
            },
            {
                id: 3,
                question: "En 3 ou 4 lignes, dis ce qu’il faut faire  pour éviter la disparition du karité. ═══════════════════════════════════════════════════════════════════════════════ ═══════════════════════════════════════════════════════════════════════════════",
                expectedAnswer: ""
            },
        ]
    },
    {
        id: 15,
        title: "Sujet 15",
        content: "A la maison, les parents  laissent  \nles enfants  se livrer aux jeux qui ne \nsont pas dangereux. Certains parents \nleur donne le matériel nécessaire pour \norganiser ces jeux. La plupart du  temps, \nles enfants reproduisent  les  actions  \ndes aînés en s’amusant.  \n         Les petits garçons s’entraînent  à la \ncourse. Ils jouent souvent  aux maçons \nen construisant  de  minuscules  cases  \navec les matériaux  qui leur tombent  \nsous la main. Ils ti ennent  parfois le rôle \nd’enseignant.  \n          Quant  aux petites filles, elles \nimitent  leur mère. Elles  tressent des \npaniers  avec  des tiges de roseaux. Elles \nconfectionnent  de  petits  ustensiles  \nde cuisine et préparent des plats \nimaginaires. Par m oments, ces petites \nfilles jouent  aux infirmières.      A travers les différents  jeux. Les \nenfants  s’initient à certains  métiers  et \napprennent  aussi  à être des citoyens \nexemplaires.  \nJomo Kenyatta",
        questions: [
            {
                id: 1,
                question: "Expliquez  : minuscule.",
                expectedAnswer: ""
            },
            {
                id: 2,
                question: "Construis  une phrase avec le mot ‹‹  exemplaires››.",
                expectedAnswer: ""
            },
            {
                id: 3,
                question: "Donne  le diminutif  du mot  ‹‹maison››.",
                expectedAnswer: ""
            },
            {
                id: 4,
                question: "Trouve un verbe venant  de  ‹‹  imaginaire ››",
                expectedAnswer: ""
            },
            {
                id: 5,
                question: "Trouve un mot de la même famille  que ‹‹ cuisine ››",
                expectedAnswer: ""
            },
            {
                id: 6,
                question: "‹‹ les enfants  reprodu isent  les   actions  des aînés ››  Trouve le groupe du verbe souligné",
                expectedAnswer: ""
            },
            {
                id: 7,
                question: "‹‹ Ils tiennent  parfois  le rôle  d’enseignant. ››  Donnez le participe passé du verbe  souligné.",
                expectedAnswer: ""
            },
            {
                id: 8,
                question: "‹‹Elles  confectionnent de petits  ustensiles ››  Réécris cette phrase au futur simple de   l’indicatif.",
                expectedAnswer: ""
            },
            {
                id: 9,
                question: "‹‹ Ils jouent  souvent  aux maçons ››  Réécris cette phrase à l’impératif  présent, 1ère  personne du pluriel.",
                expectedAnswer: ""
            },
            {
                id: 10,
                question: "‹‹Les petits garçons s’entraînent à la  course ››  Réécris cette phrase en remplaçant  ‹‹les petits garçons ››par ‹‹le petit  garçon ››.        III-Grammaire",
                expectedAnswer: ""
            },
            {
                id: 11,
                question: "Trouve la nature de  : certains   (certains garçons).",
                expectedAnswer: ""
            },
            {
                id: 12,
                question: "Donne la fonction du groupe de  mots  : aux jeux",
                expectedAnswer: ""
            },
            {
                id: 13,
                question: "‹‹. Les enfants  apprennent  à être des  citoyens  exemplaires.  ››  Réécris cette phrase en  remplaçant  « enfants  »par «  filles  »",
                expectedAnswer: ""
            },
            {
                id: 14,
                question: "« Elles  confectionnent  de petits  ustensiles de cuisine et préparent  des   plats  imaginaires.  »  Donne la nature des propositions de  cette phrase.",
                expectedAnswer: ""
            },
            {
                id: 15,
                question: "Donne un titre au texte.",
                expectedAnswer: ""
            },
            {
                id: 16,
                question: "Relève dans le texte un jeu auquel  se  livrent   les petites filles.",
                expectedAnswer: ""
            },
            {
                id: 17,
                question: "Décris en 4 ou 5 lignes le jeu que tu  aimes bien. ═══════════════════════════════════════════════════════════════════════════════ ═══════════════════════════════════════════════════════════════════════════════",
                expectedAnswer: ""
            },
        ]
    },
    {
        id: 17,
        title: "Sujet 17",
        content: "Chaque  année après les \nrécoltes, tout le village  s’adonne  à la \npêche. La plus intéressante est celle qui \nse déroule une fois par an dans le \nmarigot  du chef du village, situé à \nproximité des maisons d’habitation. Ce \nmarigot est le plus pois sonneux de la \nrégion.  \n              La veille de cette pêche, un griot \nannonce l’invitation du chef  à la \npopulation. Chacun apprête ses nasses \net son filet de pêche pour la \ncirconstance. Le matin de bonne heure, \ntout le village  est au bord du marigot. Le chef arrive sur les lieux avec ses \nnotables. Après les salutations  d’usage, \nle chef, d’un geste majestueux, donne \nle signal. Hommes, femmes et enfants, \ntous se jettent à l’eau dans un grand \nbruit. Chaque fois qu’un gros poisson \nest pris, on entend un cri  de triomphe.  \n        Les notables recueillent dans des \npaniers les plus gros poissons qui seront \nremis au chef.",
        questions: [
            {
                id: 1,
                question: "Expliquez  : Triomphe",
                expectedAnswer: ""
            },
            {
                id: 2,
                question: "Emploi l’adjectif  qualificatif  « intéressant  » dans une phrase  personnelle.           3-Le cont raire de  : « à proximité de  »",
                expectedAnswer: ""
            },
            {
                id: 3,
                question: "« le chef  arrive  ».Trouve un dérivé du  mot souligné.",
                expectedAnswer: ""
            },
            {
                id: 4,
                question: "Trouve un homonyme du  mot « fois ».",
                expectedAnswer: ""
            },
            {
                id: 5,
                question: "« un griot annonce l’invitation  »  Trouve le participe présent du verbe  conjugué dans cette phrase.",
                expectedAnswer: ""
            },
            {
                id: 6,
                question: "« Le chef donne  le signal  ».  A quel temps et mode est conjugué le  verbe de cette phrase.",
                expectedAnswer: ""
            },
            {
                id: 7,
                question: "« On entend un cri  ».Réécris cette  phrase au passé composé de l’indicatif.",
                expectedAnswer: ""
            },
            {
                id: 8,
                question: "« Ce marigot est le plus  poissonneux.  » Réécris cette phrase au  plus-que-parfait de l’indicatif.",
                expectedAnswer: ""
            },
            {
                id: 9,
                question: "Relè ve dans le texte un verbe  pronominal.",
                expectedAnswer: ""
            },
            {
                id: 10,
                question: "« Chacun  apprête ses nasses  ».Donne  la nature du mot souligné.",
                expectedAnswer: ""
            },
            {
                id: 11,
                question: "« Un geste majestueux  ». Réécris ce  groupe du nom en remplaçant «  un  geste  » par «  une voix  ».",
                expectedAnswer: ""
            },
            {
                id: 12,
                question: "« Tout le village est au bord du  marigot  ».Trouve la fonction du mot  souligné.",
                expectedAnswer: ""
            },
            {
                id: 13,
                question: "« Les notables ………….qui seront  remis  au chef.  » Donne la nature de  chacune des propositions de cette  phrase.",
                expectedAnswer: ""
            },
            {
                id: 14,
                question: "Donne un titre au texte.",
                expectedAnswer: ""
            },
            {
                id: 15,
                question: "Que font les gens du village  à  l’annonce de l’invi tation du chef  ?",
                expectedAnswer: ""
            },
            {
                id: 16,
                question: "En 4 lignes, raconte la fin de la pêche.",
                expectedAnswer: ""
            },
            {
                id: 17,
                question: "Etude texte  : CEP 2016       Quelques jours après la reprise des  classes, notre école a organisé une  journée de salubrité. La veille, le  directeur  a demandé aux élèves  d’apporter   le matériel nécessaire.       Le jour du nettoyage, vers huit  heures, le travail  commença. Les  élèves, munis de dabas, de pioches, de  coupe -coupe, de râteaux, de seaux et  de balais, ont été repartis en trois  groupes. Les grands élèves, filles  comme  garçons coupaient  les arbustes  et les herbes qui pourraient être de  véritables  abris de reptiles. Les p lus  petits ramassaient et entassaient  les  ordures qui, plus tard, seront brûlées.  Les autres, à l’aide de balais et de seaux d’eau, s’occupaient de la propreté des  salles de classes et des latrines. Le  travail s’est déroulé sous la surveillance  des maître s qui n’ont pas manqué de  mettre la main à la pâte.   A la fin de la journée, notre école était  devenue propre. Le maire de la  commune  est passé nous féliciter et  nous  inviter à maintenir notre  environnement  sain et agréable.     Questions",
                expectedAnswer: ""
            },
            {
                id: 18,
                question: "Explique le mot «  nécessaire  »",
                expectedAnswer: ""
            },
            {
                id: 19,
                question: "Construis une phrase avec le groupe  du nom  « la veille  ».",
                expectedAnswer: ""
            },
            {
                id: 20,
                question: "Trouve un homonyme de  « sain »",
                expectedAnswer: ""
            },
            {
                id: 21,
                question: "Comment est formé le mot  « propreté  » ?",
                expectedAnswer: ""
            },
            {
                id: 22,
                question: "Trouve un adjectif  qualificatif dérivé  de «  jour »",
                expectedAnswer: ""
            },
            {
                id: 23,
                question: "« Les arbustes et les herbes   pourraient  être de véritables  abris de  reptiles  »    Trouve le temps du verbe souligné.",
                expectedAnswer: ""
            },
            {
                id: 24,
                question: "Quel est le groupe du  verbe  « commença  » ?",
                expectedAnswer: ""
            },
            {
                id: 25,
                question: "« L’école était devenue  propre.  »Réécris cette phrase au  présent de l’indicatif.",
                expectedAnswer: ""
            },
            {
                id: 26,
                question: "« Le m aire de la commune est passé  nous féliciter.  »Reprends cette phrase  au passé simple de l’indicatif.       5-« Notre école a organisé une journée  de salubrité.  » Réécris cette phrase à la  forme interro -négative.",
                expectedAnswer: ""
            },
            {
                id: 27,
                question: "donnez la nature de  :l’(l’aide)",
                expectedAnswer: ""
            },
            {
                id: 28,
                question: "« Les élèves munis de dabas  »  Remplace «  élèves  » par «  filles  »",
                expectedAnswer: ""
            },
            {
                id: 29,
                question: "donnez la fonction es  : propre",
                expectedAnswer: ""
            },
            {
                id: 30,
                question: "« Le travail s’est……….maîtres  »  Donnez la nature des propositions  contenues dans cette phrase.",
                expectedAnswer: ""
            },
            {
                id: 31,
                question: "Donne un titre au texte.",
                expectedAnswer: ""
            },
            {
                id: 32,
                question: "Relève un passage qui montre que les  maîtres ont participé au nettoyage de  l’école.",
                expectedAnswer: ""
            },
            {
                id: 33,
                question: "Il faut maintenir son milieu de vie  propre et agréable. En 4 ou 5 ligne s, dis  pourquoi  ? ═══════════════════════════════════════════════════════════════════════════════ ═══════════════════════════════════════════════════════════════════════════════",
                expectedAnswer: ""
            },
        ]
    },
    {
        id: 19,
        title: "Sujet 19",
        content: "des enfants  \n     Le travail des enfants est une réalité \nau Burkina Faso et dans les autres pays. \nLes principales  causes sont la pauvreté  \net les croyances culturelles. Très \nsouvent, les enfants constituent  la \nprincipale main -d’œuvre dans \nl’agriculture, l’élevage et le commerce. \nIls sont présents sur les chantiers de \nconstruction de maisons et de routes. \nOn les rencontre également dans les \nateliers  métallurgiques et même sur les \nsites aurifères.  \n         Parfois battus et mal nourris, de \nnombreux enfants  sont exposés  à toutes sortes de dangers. On retrouve \ndes fillettes  employées comme \ndomestiques  dans des familles  où elles \ntravaillent  sans répit. Dans ces \nconditions,  le travail des enfants nuit à \nleur épanouissement. Malgré tout, \nplusieurs  enfants sont obligés de \nquitter leur famille ou l’école pour aller \nchercher du travail.  \n      Ensemble, luttons contre \nl’exploitation des enfants.  \nQuestions  :",
        questions: [
            {
                id: 1,
                question: "Explique  : sans répit  ; sites aurifères",
                expectedAnswer: ""
            },
            {
                id: 2,
                question: "Donne le contraire du mot «  présents",
                expectedAnswer: ""
            },
            {
                id: 3,
                question: "Trouv e l’adverbe venant de  « danger  .",
                expectedAnswer: ""
            },
            {
                id: 4,
                question: "Trouve un mot de la même famille  que « employé  »",
                expectedAnswer: ""
            },
            {
                id: 5,
                question: "«Le travail des enfants nuit  à leur  épanouissement.  »  Donne l’infinitif du souligné",
                expectedAnswer: ""
            },
            {
                id: 6,
                question: "« Les enfants constituent la principale  main -d’œuvre  »  Trouve le mode du verbe s ouligné",
                expectedAnswer: ""
            },
            {
                id: 7,
                question: "« Elles travaillent  sans  répit.  »Remplace dans la phrase  « elles » par «  nous  »",
                expectedAnswer: ""
            },
            {
                id: 8,
                question: "«Le travail des enfants est une réalité   Mets le verbe souligné à l’imparfait de  l’indicatif.",
                expectedAnswer: ""
            },
            {
                id: 9,
                question: "«Plusieurs enfants sont obligés de  quitter leur famille  »  Réécris cette phrase à la forme  interrogative.",
                expectedAnswer: ""
            },
            {
                id: 10,
                question: "Relève un adjectif qualificatif dans le  2e paragraphe du texte.",
                expectedAnswer: ""
            },
            {
                id: 11,
                question: "« Ils sont présents sur les  chantiers  ».Réécris cette phrase en  remplaçant  « ils » par  « les filles  »",
                expectedAnswer: ""
            },
            {
                id: 12,
                question: "« On les rencontre également da ns  les ateliers  métallurgiques . »   Donne la fonction du groupe de mots  souligné.",
                expectedAnswer: ""
            },
            {
                id: 13,
                question: "«On retrouve des fillettes employées  ……. où elles travaillent sans répit  »  Trouve la nature de chacune des  propositions contenues dans cette  phrase.",
                expectedAnswer: ""
            },
            {
                id: 14,
                question: "Relève un passage qui montre que les  enfants sont maltraités dans  leur lieu  de travail.",
                expectedAnswer: ""
            },
            {
                id: 15,
                question: "Relève dans le texte une raison qui  amène les enfants à travailler.",
                expectedAnswer: ""
            },
            {
                id: 16,
                question: "Ton camarade veut abandonner   l’école pour chercher du travail. En 4 ou",
                expectedAnswer: ""
            },
            {
                id: 17,
                question: "lignes, montre -lui l’importance de  l’école. ═══════════════════════════════════════════════════════════════════════════════ ═══════════════════════════════════════════════════════════════════════════════",
                expectedAnswer: ""
            },
        ]
    },
    {
        id: 21,
        title: "Sujet 21",
        content: "Un jour, l’hyène tomba dans un \npuits. D’un baobab, le singe qui jouait  \nentendit  ses cris et vint à son secours. Il \ntendit sa queue à l’hyène et l’aida à \nsortir du puits. Dès q ue l’hyène se \nretrouva hors de c e trou, elle dit au \nsinge  : « Je suis si faible…soutiens -\nmoi ». Le singe lui obéit. Aussitôt, \nl’hyène le saisit et s’exclama  : « je vais te manger, car je suis à jeun depuis \ndeux jours  ». \n      C’est à ce moment que le lièvre \narriva et vit l e singe qui se débattait. Il \nse fit raconter l’histoire. «  Je ne \ncomprends pas, dit le lièvre. «Comment \nle singe a pu sortir l ’hyène du puits avec \nsa queue  ? » Il faut recommencer  la \nscène devant moi pour que je puisse \nbien juger l’affaire  ». L’hyène \nredescendit  donc dans le puits. \n« Laisse -la maintenant et grimpe dans \nles arbres  ». Dit le lièvre au singe.  \nQuestions  :",
        questions: [
            {
                id: 1,
                question: "Explique  : « venir à mon secours  »",
                expectedAnswer: ""
            },
            {
                id: 2,
                question: "Construis une phrase avec le  mot « baobab  »",
                expectedAnswer: ""
            },
            {
                id: 3,
                question: "Trouve l’homonyme de « sans  »",
                expectedAnswer: ""
            },
            {
                id: 4,
                question: "« Il tendit sa queue  »  Réponds par Vrai ou Faux  : le mot  « queue  » est employé au sens figuré.",
                expectedAnswer: ""
            },
            {
                id: 5,
                question: "Trouve un mot de la même famille  que « puits  ».",
                expectedAnswer: ""
            },
            {
                id: 6,
                question: "« Le singe qui jouait entendit ses  cris »  Quel est l’infinitif du verbe soul igné  dans la phrase  ?",
                expectedAnswer: ""
            },
            {
                id: 7,
                question: "« L’hyène tomba dans un puits»   Ecris cette phrase au futur simple de  l’indicatif.",
                expectedAnswer: ""
            },
            {
                id: 8,
                question: "« Je ne comprends pas ».  Donne le participe passé du verbe  souligné.       4-« L’hyène  redescendit  donc dans le  puits.  »  Quel est le mode du verbe soulign é ?",
                expectedAnswer: ""
            },
            {
                id: 9,
                question: "« Le singe vint à son secours  »  Réécris cette phrase en remplaçant «  le  singe  » par  « les singes  ».",
                expectedAnswer: ""
            },
            {
                id: 10,
                question: "« C’est à ce moment que le lièvre   arriva  ».  Donne la nature du mot souligné.",
                expectedAnswer: ""
            },
            {
                id: 11,
                question: "Trouve le pluriel du mot  « trou  ».",
                expectedAnswer: ""
            },
            {
                id: 12,
                question: "« Le singe lui obéit  ».    Trouve la fonction du mot souligné",
                expectedAnswer: ""
            },
            {
                id: 13,
                question: "« Il vit le singe qui se  débattait  ».Donne la nature des  propositions contenues dans cette  phrase.",
                expectedAnswer: ""
            },
            {
                id: 14,
                question: "Donne un titre au texte.",
                expectedAnswer: ""
            },
            {
                id: 15,
                question: "Relève un passage qui montre que  l’hyène ne  reconnait pas le bienfait.",
                expectedAnswer: ""
            },
            {
                id: 16,
                question: "Imagine la suite de l’histoire en 4 ou 5  lignes. ═══════════════════════════════════════════════════════════════════════════════ ═══════════════════════════════════════════════════════════════════════════════",
                expectedAnswer: ""
            },
        ]
    },
    {
        id: 23,
        title: "Sujet 23",
        content: "du bien public.  \n \n        Le bien public  a été acquis avec \nl’effort et l’argent  de tous. Il est alors \nimportant  pour  nous  de bien \nl’entretenir. A l’école, les livres, les \ntable -bancs et tout le matériel remis \ndoivent être utilisés  avec  soin. Le bon \nécolier  cherchera   toujours  à couvrir \nles livres qu’on lui a donnés, à rendre la \nsalle de classe et la cour de l’école propres pour que le travail s’y déroule \ndans  de conditions agréables.  \n        Dans sa vie de tous les jours, \nchaque citoyen burkinabè  doit  avoir le \nsouci permanent de la protection du \nbien public. Les lieux publics  tels que \nles bâtiments de l’Etat, les marchés et \nles feux tricolores ont besoin d’être \nprotégés par tous.  \n          Le respect de ces biens publics est \nun devoir citoyen, car pour bâtir une \nnation prospère, il nous faut de bons \ncomportements.",
        questions: [
            {
                id: 1,
                question: "Explique  : le bien public, entretenir.",
                expectedAnswer: ""
            },
            {
                id: 2,
                question: "Construis une phrase avec le mot  « citoyen  »",
                expectedAnswer: ""
            },
            {
                id: 3,
                question: "Trouve un mot de la même famille  que «  nation  »",
                expectedAnswer: ""
            },
            {
                id: 4,
                question: "Trouve un synonyme du mot  « agréable  »",
                expectedAnswer: ""
            },
            {
                id: 5,
                question: "« chaque citoyen doit avoir le souci de  la protection du bien public.  »Quel est  le verbe conjugué dans cette phrase  ? »",
                expectedAnswer: ""
            },
            {
                id: 6,
                question: "« Le bon écolier cherchera toujours  »  A quel temps est conjugué le verbe  ?",
                expectedAnswer: ""
            },
            {
                id: 7,
                question: "Conjugue le verbe «  protéger  » au passé  simple de l’indicatif, à la 1ère personne  du pluriel.",
                expectedAnswer: ""
            },
            {
                id: 8,
                question: "« Nous bâtissons une nation  prospère  ». Réécris cette phrase en  mettant le verbe au passé composé de  l’indicatif.       5-« Le bien public  a été acquis  ».  Réécris cette phrase en remplaçant «  le  bien public  »par «  ils ».",
                expectedAnswer: ""
            },
            {
                id: 9,
                question: "« Le bien public   est acquis avec  l’argent de tous  ».Donne la nature du  mot souligné.",
                expectedAnswer: ""
            },
            {
                id: 10,
                question: "Trouve le féminin du mot «  citoyen  »",
                expectedAnswer: ""
            },
            {
                id: 11,
                question: "« Les livres qu’on lui a donnés  ».  Donne la fonction du mot souligné.",
                expectedAnswer: ""
            },
            {
                id: 12,
                question: "« A l’école,  les livres et les tables - bancs  doivent être utilisés  avec soin.  »  Trouve la fonction du groupe de mots  souligné.",
                expectedAnswer: ""
            },
            {
                id: 13,
                question: "« Le bon écolier cherchera toujours  à  couvrir les livres qu’on lui a donnés  »  Donne la nature de la proposition  soulignée dans cette phrase.",
                expectedAnswer: ""
            },
            {
                id: 14,
                question: "Selon l’auteur, qui doit protéger le  bien public  ?",
                expectedAnswer: ""
            },
            {
                id: 15,
                question: "Relève dans le texte deux biens  communs.",
                expectedAnswer: ""
            },
            {
                id: 16,
                question: "Donnez en quelques lignes,  l’importance du respect du bien public. ═══════════════════════════════════════════════════════════════════════════════  ═══════════════════════════════════════════════════════════════════════════════",
                expectedAnswer: ""
            },
        ]
    },
    {
        id: 25,
        title: "Sujet 25",
        content: "visiteur inattendu  \n \n     Mon oncle Francis avait quitté le \nvillage  bien avant  ma naissance. Il était \nallé à l’aventure. Un soir, pendant que \nnous  étions assis autour d’un bon \nrepas, nous entendîmes le bruit d’un \nmoteur. Nous aperçûmes un homme. \nC’est Francis  ! C’est Fran cis ! Entendait -on crier. En effet, c’est l’oncle qui était \nde retour.  Il n’avait sur lui qu’un \nbaluchon.  \n      Le lendemain, il nous raconta sa \nmésaventure  : ses compatriotes et lui \navaient été expulsés du pays hôte où ils \nétaient allés chercher fortune. Mais, ils \nsont revenus dépouillés de leurs biens.  \n       Cela me rappela la sagesse de mon \ngrand -père qui disait  : « qui dort sur la \nnatte du voisin, dort à terre  ».",
        questions: [
            {
                id: 1,
                question: "Explique  : « chercher fortune  »",
                expectedAnswer: ""
            },
            {
                id: 2,
                question: "Fais une phrase avec le mot «  visiteur  »",
                expectedAnswer: ""
            },
            {
                id: 3,
                question: "Relève dans le texte le contraire de  « aventure  »",
                expectedAnswer: ""
            },
            {
                id: 4,
                question: "Trouve un nom venant de «  crier  »",
                expectedAnswer: ""
            },
            {
                id: 5,
                question: "Trouve un mot de la même famille que  « voisin  »",
                expectedAnswer: ""
            },
            {
                id: 6,
                question: "« Ils étaient allés  chercher fortune  »  A quel temps est conjugué le verbe  ?",
                expectedAnswer: ""
            },
            {
                id: 7,
                question: "« Nous aperçûmes un homme  »  Mets le verbe au présent de l’indicatif.",
                expectedAnswer: ""
            },
            {
                id: 8,
                question: "« Il nous raconta sa mésaventure  »  Mets le verbe au futur simple de  l’indicatif.",
                expectedAnswer: ""
            },
            {
                id: 9,
                question: "« Il n’avait sur  lui qu’un baluchon  ».  Donne la nature du m ot souligné.",
                expectedAnswer: ""
            },
            {
                id: 10,
                question: "« Il était allé à l’aventure  ». Remplace  dans la phrase «  il » par «  elle »        3-« Nous entendîmes un bruit de  moteur  ».Donne la fonction du mot  souligné.",
                expectedAnswer: ""
            },
            {
                id: 11,
                question: "« C’est l’oncle qui était de  retour  ».Donne la fonction de la  proposition soulignée.",
                expectedAnswer: ""
            },
            {
                id: 12,
                question: "Pourquoi l’oncle Francis  avait -il  quitté le village  ?",
                expectedAnswer: ""
            },
            {
                id: 13,
                question: "Relève le passage qui montre que  Francis est revenu précipitamment   dans  son pays malgré lui.",
                expectedAnswer: ""
            },
            {
                id: 14,
                question: "Pourquoi grand -père dit -il que  « celui  qui dort sur la natte du voisi n, dort à  terre ═══════════════════════════════════════════════════════════════════════════════ ═══════════════════════════════════════════════════════════════════════════════",
                expectedAnswer: ""
            },
        ]
    },
    {
        id: 27,
        title: "Sujet 27",
        content: "reboisement  \n      La désertification menace mon pays \ndepuis des décennies. Si rien n’est fait, \nles générations futures en souffriront. \nChaque arbre que tu regardes mourir \nest un trésor que tu perds. Des f orêts \nsont détruites au bénéfice du bois de \nchauffe, de l’extension des champs, de \nla fabrication d’objets divers…  \n   Et pourtant, les chercheurs ont trouvé \nde nos jours des solutions accessibles à \ntous pour éviter la dégradation de notre \npatrimoine forest ier : l’utilisation des \nfoyers améliorés, du gaz butane, de \nl’énergie solaire…  \n     Ces dernières années, il y a de plus \nen plus des campagnes de reboisement \net d’entretien des arbres. Mobilisons nous pour vaincre la désertification. A \nchacun son arbre pou r un Burkina vert.  \n \nQuestions  :",
        questions: [
            {
                id: 1,
                question: "Explique  : reboisement.",
                expectedAnswer: ""
            },
            {
                id: 2,
                question: "Relève la bonne réponse  : Le  mot « patrimoine  » signifie  :  a -patrie      b –héritier     c –héritage",
                expectedAnswer: ""
            },
            {
                id: 3,
                question: "Fais une phrase avec le mot «  forêt  »",
                expectedAnswer: ""
            },
            {
                id: 4,
                question: "Trouve un homonyme de «  vert »",
                expectedAnswer: ""
            },
            {
                id: 5,
                question: "Trouve un verbe désiré de «entretien",
                expectedAnswer: ""
            },
            {
                id: 6,
                question: "« Les chercheurs ont trouvé  des  solutions  »  Quel est l’infinitif du verbe souligné  dans cette phrase  ?",
                expectedAnswer: ""
            },
            {
                id: 7,
                question: "« La désertification menace mon pays   Mets cette phrase au passé simple de  l’indicatif",
                expectedAnswer: ""
            },
            {
                id: 8,
                question: "« Tu perds un trésor  ». Ecris cette  phrase au passé composé de l’indicatif.",
                expectedAnswer: ""
            },
            {
                id: 9,
                question: "Quelle est la nature du mot  « nos »dans l’expression «  de nos  jours  » ?",
                expectedAnswer: ""
            },
            {
                id: 10,
                question: "« Les générations futures  en  souffriront  » Réécris cette phrase en  remplaçant le groupe de mo ts soulignés  par un pronom personnel qui convient.",
                expectedAnswer: ""
            },
            {
                id: 11,
                question: "–« Chaque arbre que tu regardes  mourir est un trésor  »  Donne la nature des propositions  contenues dans cette phrase.",
                expectedAnswer: ""
            },
            {
                id: 12,
                question: "Relève dans le texte une cause de la  désertification.",
                expectedAnswer: ""
            },
            {
                id: 13,
                question: "Relève dans le texte un moyen mis à  la disposition des populations pour  lutter contre la désertification.",
                expectedAnswer: ""
            },
            {
                id: 14,
                question: "Pourquoi l’auteur dit  : « Mobilisons - nous pour vaincre la désertification  » ═══════════════════════════════════════════════════════════════════════════════  ═══════════════════════════════════════════════════════════════════════════════",
                expectedAnswer: ""
            },
        ]
    },
    {
        id: 29,
        title: "Sujet 29",
        content: "santé  \n \n  Une sagesse africaine nou s enseigne \nque la vie ne s’achète pas. Ainsi, la \nsanté sera toujours le bien le plus \nprécieux de l’homme. C’est pourquoi, il \nvaut mieux prévenir que guérir. La \nvaccination, devenue obligatoire, a \nsauvé des centaines  de millions de \npersonnes. C’est ainsi q ue nos parents \net nous -mêmes n’hésitons plus  à nous \nfaire vacciner et à fréquenter les \ncentres de santé.  \n   Cette année, les enfants de zéro à \ncinq ans ont reçu le vaccin contre la \npoliomyélite. Ce mal est à éradiquer  \ncar il paralyse les membres des enfa nts. \nPréservons notre santé en nous faisant \nvacciner.  \nQuestions  :",
        questions: [
            {
                id: 1,
                question: "Relève la bonne définition  :  « Eradiquer  » signifie  :  a-enrichir  b-supprimer  c-supporter",
                expectedAnswer: ""
            },
            {
                id: 2,
                question: "Fais une phrase avec le  mot « obligatoire  » 3-Relève le suffixe dans ce mot  « vaccination  »",
                expectedAnswer: ""
            },
            {
                id: 3,
                question: "Trouve un nom dérivé de «  guérir  »",
                expectedAnswer: ""
            },
            {
                id: 4,
                question: "Donne un homonyme de «  mal »",
                expectedAnswer: ""
            },
            {
                id: 5,
                question: "« Les enfants ont reçu  le vaccin  »  Donne l’infinitif du verbe souligné.",
                expectedAnswer: ""
            },
            {
                id: 6,
                question: "Conjugue le verbe «  devenir  » à  l’imparfait de l’indicatif  à la 1ère  personne du pluriel.",
                expectedAnswer: ""
            },
            {
                id: 7,
                question: "« Il vaut mieux  ». Réécris la phrase en  remplaçant le pronom «  il » par «  ils »",
                expectedAnswer: ""
            },
            {
                id: 8,
                question: "« Les enfants de zéro  à cinq ans…  ».  Donne la nature du mot souligné.",
                expectedAnswer: ""
            },
            {
                id: 9,
                question: "Forme le féminin de l’adjectif  qualificatif «  précieux  »",
                expectedAnswer: ""
            },
            {
                id: 10,
                question: "« Préservons notre  santé  ». Trouve la  fonction du mot souligné.",
                expectedAnswer: ""
            },
            {
                id: 11,
                question: "« Ce mal est à éradiquer   car il  paralyse les membres des enfants»   Donne la nature des propositions   contenues  dans  cette phrase.",
                expectedAnswer: ""
            },
            {
                id: 12,
                question: "Relève dans le texte, la tranche d’âge  des enfants  concernés par la  vaccination contre la poliomyélite.",
                expectedAnswer: ""
            },
            {
                id: 13,
                question: "Selon le texte, pourquoi faut -il  éradiquer la poliomyélite  ?",
                expectedAnswer: ""
            },
            {
                id: 14,
                question: "En une phrase, dis pourquoi la  vaccination est rendue obligatoire. ═══════════════════════════════════════════════════════════════════════════════  ═══════════════════════════════════════════════════════════════════════════════",
                expectedAnswer: ""
            },
        ]
    },
    {
        id: 31,
        title: "Sujet 31",
        content: "Entretiens ces livres  ! \n \n         L’achat des livres est un \ncauchemar pour les parents. \nCependant, l’insuffisance de ces \nmanuels constitue un handicap à \nl’enseignement du maître et un \nobstacle à l’apprentissage des élèves.  \n         Cette angoisse est désor mais \nterminée. Les élèves disposent  de livres \nofferts gratuitement par l’Etat  soucieux \nde leur éducation.  \n         Ecolier, entretiens donc  ces livres \npour encourager les autorités et les \npartenaires  à t’aider d’avantage. Ne les \ndéchire pas, ne les sa lis pas, ne les \nperds pas mais protège -les car ils te \npermettront de participer à ta \nformation. Seul tu les exploiteras et tu y \ntrouveras  ce dont  tu as besoin. Oui, \nentretiens  ces outils précieux qui te \nseront toujours utiles.  \n     Chers parents, chers maîtres, \naccompagnez les élèves dans l’entretien \nde ces livres car tout le monde y gagne.",
        questions: [
            {
                id: 1,
                question: "Explique  : « angoisse  »",
                expectedAnswer: ""
            },
            {
                id: 2,
                question: "Fais une phrase avec le verbe    « exploiter  »",
                expectedAnswer: ""
            },
            {
                id: 3,
                question: "Quelle est la racine de «  formation  » ?",
                expectedAnswer: ""
            },
            {
                id: 4,
                question: "Trouve un homonyme de   « maître  »",
                expectedAnswer: ""
            },
            {
                id: 5,
                question: "donne un nom venant de «  gagner  »",
                expectedAnswer: ""
            },
            {
                id: 6,
                question: "« Ils te permettront de participer à ta  formation  »  Ecris cette phrase au passé simple de  l’indicatif.",
                expectedAnswer: ""
            },
            {
                id: 7,
                question: "« Les élèves disposent d e livres  » Ecris  cette phrase au subjonctif  présent.",
                expectedAnswer: ""
            },
            {
                id: 8,
                question: "Donne la nature de «  l » dans  « l’achat des livres  »",
                expectedAnswer: ""
            },
            {
                id: 9,
                question: "« Seul tu  les exploiteras  ». Donne la  fonction du mot souligné.",
                expectedAnswer: ""
            },
            {
                id: 10,
                question: "« Cette angoisse  est terminée  ».  Réécris la phrase en rem plaçant  l’expression soulignée par «  ce mal  »",
                expectedAnswer: ""
            },
            {
                id: 11,
                question: "« Protège -les car ils te permettront de  participer à ta formation  »  Trouve la nature des propositions  contenues dans cette phrase.",
                expectedAnswer: ""
            },
            {
                id: 12,
                question: "Relève  dans le texte, deux conseils  pour l’entretien des livres.",
                expectedAnswer: ""
            },
            {
                id: 13,
                question: "En une phrase, dis en quoi tout le  monde gagne dans l’entretien des  livres.",
                expectedAnswer: ""
            },
            {
                id: 14,
                question: "Trouve un notre moyen de protéger  les livres. ═══════════════════════════════════════════════════════════════════════════════  ═══════════════════════════════════════════════════════════════════════════════",
                expectedAnswer: ""
            },
        ]
    },
    {
        id: 33,
        title: "Sujet 33",
        content: "Tôt le matin, les membres du bureau \nde vote étaient déjà installés. La \npopulation, par petits groupes, se rend \nà l’école du village pour élire ses \ndéputés. Deux longues files se forment \n     devant le bureau de vote. Soudain, un \nhomme bien habillé apparut  : c’est le \nprésident. Il prit la parole et déclara  : \n« Il est six heures. Les opérations de \nvote peuvent commencer  ». Puis il \nprésenta l’urne transparente à \nl’assistance. Elle était vide et bien \nscellée à l’aide d’un cadenas. Quelques \ninstants plus tard, les premiers votants  \naccomplissent leur devoir civique dans \nles isoloirs et se  retirent, satisfaits.                                 \nD’après un enseignant burkinabè  \n Questions  :",
        questions: [
            {
                id: 1,
                question: "Relève la bonne réponse.   Une urne est une  :  a-cachette  b-caisse  c-table",
                expectedAnswer: ""
            },
            {
                id: 2,
                question: "Trouve un synonyme de «  files »",
                expectedAnswer: ""
            },
            {
                id: 3,
                question: "Décompose le mot « isoloir  ».",
                expectedAnswer: ""
            },
            {
                id: 4,
                question: "Explique  : « bien scellée  ».",
                expectedAnswer: ""
            },
            {
                id: 5,
                question: "« Il prit la parole et déclara  ».Indique  le temps et le mode des verbes de la  phrase.",
                expectedAnswer: ""
            },
            {
                id: 6,
                question: "« Les opérations de vote peuvent  commencer  ».  Mets cette phrase au futur simple de  l’indicatif.",
                expectedAnswer: ""
            },
            {
                id: 7,
                question: "« La population se rend à l’école du  village  »  Ecris cette phrase au subjonctif présent",
                expectedAnswer: ""
            },
            {
                id: 8,
                question: "Fais l’analyse logique de la phrase ci - dessous.",
                expectedAnswer: ""
            },
            {
                id: 9,
                question: "Relève dans le texte un sujet  commun.",
                expectedAnswer: ""
            },
            {
                id: 10,
                question: "« Quelques instants plus tard, les  premiers votants  accomplissent leur  devoir civique dans les isoloirs et se  retirent, satisfaits.  » Donne la nature  des propositions  contenues dans le  texte.",
                expectedAnswer: ""
            },
            {
                id: 11,
                question: "Donne un titre au texte",
                expectedAnswer: ""
            },
            {
                id: 12,
                question: "2-Pourquoi l’urne vide était -elle scel lée?",
                expectedAnswer: ""
            },
            {
                id: 13,
                question: "Décris en cinq lignes une séance de  vote qui a lieu dans ton secteur ou  village ═══════════════════════════════════════════════════════════════════════════════ ═══════════════════════════════════════════════════════════════════════════════",
                expectedAnswer: ""
            },
        ]
    },
    {
        id: 35,
        title: "Sujet 35",
        content: "en brousse.  \n \n     C’était la saison sèche. Nous \namusions  sous le grand tamarinier du \nvillage. Tout à coup, nous aperçûmes à \nl’horizon une épaisse fumée noire qui \nmontait  au ciel. La masse aveuglante  \ns’approchait de plus en plus des \nmaisons  d’habitation et l’air dev enait  \nirrespirable.  \n        Sans  tarder, les habitants  se \nprécipitèrent  sur les lieux  : les uns \napportant des branchages et des coupe -\ncoupe, les autres de l’eau.  \n       Après plusieurs heures de lutte, ils \nmaîtrisèrent le feu. L’environnement  \ndevint  triste.  \nQuestions  : \n     I-Vocabulaire  (5pts)  \n1-Explique  : Ils maîtrisèrent le feu.  \n2-A quel sens est employé le mot   \n« triste  » \n3-Forme un adverbe à partir du mot  : \naveuglante  \n4-Trouve  deux  mots de la même \nfamille que «tarder  »",
        questions: [
            {
                id: 1,
                question: "« L’en vironnement  devint  triste  ». A  quelle voix est le verbe de cette  phrase  ?  Mets cette phrase à la forme négative.",
                expectedAnswer: ""
            },
            {
                id: 2,
                question: "A quel mode est employé le verbe de  la phrase suivante  : « Nous aperçûmes   à l’horizon  une épaisse fumée noire»",
                expectedAnswer: ""
            },
            {
                id: 3,
                question: "« Nous nous amusions  ».Donne  l’infinitif du verbe conjugué",
                expectedAnswer: ""
            },
            {
                id: 4,
                question: "« La masse aveuglante   s’approchait  ».Mets cette phrase au  passé composé de l’indicatif.",
                expectedAnswer: ""
            },
            {
                id: 5,
                question: "Nature et fonction de  : nous (nous  nous amusions), Irrespirables",
                expectedAnswer: ""
            },
            {
                id: 6,
                question: "« La masse aveuglante   s’approchait  ».Ré écris cette phrase en  remplaçant «  masse  »par «  soleil  »",
                expectedAnswer: ""
            },
            {
                id: 7,
                question: "Relève dans le texte, une phrase  contenant deux propositions   indépendantes coordonnées.",
                expectedAnswer: ""
            },
            {
                id: 8,
                question: "Relève dans le texte un passage qui  montre que le village est en danger.",
                expectedAnswer: ""
            },
            {
                id: 9,
                question: "L’environnement  a été détruit par le  feu. Dis en 5 lignes ce que les habitants  de ce village peuvent faire pour lui  redonner vie. ═══════════════════════════════════════════════════════════════════════════════  ═══════════════════════════════════════════════════════════════════════════════",
                expectedAnswer: ""
            },
        ]
    },
    {
        id: 37,
        title: "Sujet 37",
        content: "grandes luttes.  \n \n       Dans tous les pays, c’est la lutte \npour le développement. Pour cela,  \nchacun  travaille à vaincre certains \nobstacles qui le freinent.  \n        Au Burkina Faso, l’éducation pour  \ntous  est l’une des priorités du \ngouvernement. Des écoles sont \nconstruites partout et la scolarisation \nest obligatoire  pour tous les deux sexes.  \n        Le développement  de notre pays \npasse aussi par la lutte con tre la \npauvreté, le sida, la sécheresse, le \nbanditisme…  \nAlors, contribuons  tous au \ndéveloppement de notre patrie.  \n \nQuestions  :",
        questions: [
            {
                id: 1,
                question: "Explique  : Vaincre, obstacles",
                expectedAnswer: "**Vaincre** : dominer, surmonter, triompher de\n- **Obstacles** : difficultÃ©s, entraves, empÃªchements, barriÃ¨res"
            },
            {
                id: 2,
                question: "Trouve un verbe et un adjectif  qualificatif venant de «  éducation  ».",
                expectedAnswer: "Verbe : Ã©duquer\n- Adjectif : Ã©ducatif / Ã©ducationnel"
            },
            {
                id: 3,
                question: "Donne le  contraire de «  pauvreté  ».",
                expectedAnswer: "Richesse, prospÃ©ritÃ©, aisance"
            },
            {
                id: 4,
                question: "« chacun travaille à vaincre certains  obstacles  »  Remplace le terme «  certains  obstacles  » par un pronom personnel  qui convient.",
                expectedAnswer: "\"Chacun travaille Ã  **les** vaincre\""
            },
            {
                id: 5,
                question: "Donne la nature et la fonction des  mots soulignés dans le texte.        III-Conjugaison",
                expectedAnswer: "DÃ©pend des mots soulignÃ©s dans le texte original"
            },
            {
                id: 6,
                question: "« chacun travaille à vaincre certains  obstacles qui le freinent.  »  A quel temps et mode sont conjugués  les verbes de cette phrase.",
                expectedAnswer: "\"Chacun travaille Ã  **les** vaincre\""
            },
            {
                id: 7,
                question: "Mets -les aux autres temps simples de  l’indicatif  et au passé composé.",
                expectedAnswer: "DÃ©pend des mots soulignÃ©s dans le texte original"
            },
            {
                id: 8,
                question: "Quelles  sont les lut tes engagées dans  ce texte pour accéder au  développement  ?",
                expectedAnswer: "L'Ã©ducation pour tous\n- La lutte contre la pauvretÃ©\n- La lutte contre le sida\n- La lutte contre la sÃ©cheresse\n- La lutte contre le banditisme"
            },
            {
                id: 9,
                question: "Dis en quelques lignes, ce qui est fait  dans ton village ou dans ton secteur  pour participer au développement de  notre pays  ? ══════════════════════════════════════════════════════════════════════════════ ═══════════════════════════════════════════════════════════════════════════════",
                expectedAnswer: "Ã‰valuer : pertinence des actions citÃ©es, cohÃ©rence avec le dÃ©veloppement local"
            },
        ]
    },
    {
        id: 39,
        title: "Sujet 39",
        content: "causes de mon départ . \n \n     Orph elin dès ma naissance, mon \npère  souhaitait  faire de moi un bon \nouvrier. Mais il mourut aussitôt. Je \nrenonçai à l’école pour servir mes \ntuteurs. Je travaillais  du matin au soir. \nJ’avais cru à la générosité de mes \nparents adoptifs. Un jour, malade, \nj’étai s collé au lit par une forte fièvre. \nOn me considérait  comme un \nparesseux, un vaurien qui ne voulait  \nrien faire. Je guéris sans avoir été \nsoigné. Je quittai  alors ma \ncommunauté natale. Je vivais dans la \nnature . Je me plaisais  à dormir partout  \noù le sommeil me prenait.  \nAlioune Fantouré  \nQuestions  : I-Vocabulaire  : \n1-Donne le synonyme de   « les causes, \nla générosité  » \n2-Trouve le contraire de  : « paresseux, \nforte (forte fièvre)  » \n3-Relève les mots qui sont de la même \nfamille que   « natal  » : natté, natif,  \nnatation, nager  et natalité  »",
        questions: [
            {
                id: 1,
                question: "« J’avais cru à la générosité de mes  parents adoptifs.  »  a-A quel temps est conjugué le verbe de  la phrase  ?  b-Mets  cette phrase au présent de  l’indicatif.",
                expectedAnswer: "Plus-que-parfait de l'indicatif\n\n**b) PrÃ©sent de l'indicatif**\n- \"Je crois Ã  la gÃ©nÃ©rositÃ© de mes parents adoptifs\""
            },
            {
                id: 2,
                question: "« Je me plaisais à dormir partout.  »  a- Donne l’infinitif du verbe de la phrase.   b- Remplace «  je » par «  nous  » et mets le  verbe au futur simple de l’indicatif.",
                expectedAnswer: "Se plaire\n\n**b) Futur simple avec \"nous\"**\n- \"Nous nous plairons Ã  dormir partout\""
            },
            {
                id: 3,
                question: "Donne la nature et la fonction des  mots soulignés dans le texte.",
                expectedAnswer: "DÃ©pend des mots soulignÃ©s dans le texte"
            },
            {
                id: 4,
                question: "Quel est le féminin de «  adoptif  » ?",
                expectedAnswer: "Adoptive"
            },
            {
                id: 5,
                question: "L’orphelin était -il bien traité par ses  parents  adoptifs  ? Pourquoi  ?",
                expectedAnswer: "Non, l'orphelin n'Ã©tait pas bien traitÃ©\n- Raisons : il travaillait du matin au soir, considÃ©rÃ© comme paresseux quand malade, guÃ©ri sans avoir Ã©tÃ© soignÃ©"
            },
            {
                id: 6,
                question: "Relève un passage du texte qui  montre que l’orphelin  était  devenu  un  enfant de la rue.",
                expectedAnswer: "\"Je vivais dans la nature\"\n- \"Je me plaisais Ã  dormir partout oÃ¹ le sommeil me prenait\""
            },
            {
                id: 7,
                question: "Tu connais  dans ton village un enfant  maltraité, raconte sa souffrance en  quelques lignes. ═══════════════════════════════════════════════════════════════════════════════  ═══════════════════════════════════════════════════════════════════════════════",
                expectedAnswer: ""
            },
        ]
    },
    {
        id: 41,
        title: "Sujet 41",
        content: "L’idée de découvrir ce beau pays \nnous réjouissait. Après un long voyage à \nbord d’un autobus, un ami de mon père \nnous y conduisit. A peine sommes -nous \narrivés que nos souffrances \ncommencèrent. L’ami de mon père \nnous abandonna entre les mains d’un \nmalhonnête homme qui nous faisait \ntravailler du matin au soir dans des \nplantations.  \n         Sans salaire, souvent battus et très \nmal nourris, nous regrettions notre \nvillage. C’est plus tard que nous avons \ncompris que nous étions victimes d’un \ntrafic d’enfa nts. \n \nQuestions  :",
        questions: [
            {
                id: 1,
                question: "Explique  : Souffrances -abandonna.",
                expectedAnswer: "**Souffrances** : douleurs, peines, malheurs, tourments\n- **Abandonna** : laissa, dÃ©laissa, quitta"
            },
            {
                id: 2,
                question: "Comment est formé le  mot : « malhonnête  » ?",
                expectedAnswer: "PrÃ©fixe \"mal-\" + adjectif \"honnÃªte\" (mot composÃ© par prÃ©fixation)"
            },
            {
                id: 3,
                question: "Trouve un mot de  même famille que  « tard  »",
                expectedAnswer: "Tarder, retard, tardif, tardivement"
            },
            {
                id: 4,
                question: "« réjouissait  ».Donne l’infinitif et le  groupe de ce verbe.",
                expectedAnswer: "Infinitif : rÃ©jouir\n- Groupe : 2e groupe"
            },
            {
                id: 5,
                question: "« un ami de mon p ère nous y  conduisit.  » A quel temps est conjugué  le verbe de cette de phrase  ?",
                expectedAnswer: "PassÃ© simple de l'indicatif"
            },
            {
                id: 6,
                question: "–« nous avons compris  ».Mets cette  phrase au présent de l’indicatif.",
                expectedAnswer: "\"Nous comprenons\""
            },
            {
                id: 7,
                question: "Donne la nature et la fonction des  mots soulignés dans le texte.  2-Relève dans le texte u ne proposition  subordonnée relative.",
                expectedAnswer: "DÃ©pend des mots soulignÃ©s"
            },
            {
                id: 8,
                question: "Donne un titre au texte.",
                expectedAnswer: "\"Le trafic d'enfants\"\n- \"L'exploitation des enfants\"\n- \"Victimes d'un trafic\"\n- \"Le voyage qui tourna mal\""
            },
            {
                id: 9,
                question: "Relève dans le texte, une expression  qui montre que les enfants ont souffert.",
                expectedAnswer: "\"Sans salaire, souvent battus et trÃ¨s mal nourris\"\n- \"nous faisait travailler du matin au soir\"\n- \"nos souffrances commencÃ¨rent\""
            },
            {
                id: 10,
                question: "Un jour, les enfants rencontrent l’ami  de leur père. Imagine ce qu’ils lui  diront. ═══════════════════════════════════════════════════════════════════════════════",
                expectedAnswer: ""
            },
        ]
    },
];
