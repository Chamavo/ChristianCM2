# Schéma JSON — Exercice Poudlard Maths

## Champs d'un exercice

```json
{
  "id": "j01-e07",
  "jour": 1,
  "ordre_jour": 7,
  "theme": "grands_nombres",
  "sous_theme": "lecture_ecriture_grands_nombres",
  "scene_hp": "chemin_de_traverse",
  "narration": "Harry entre chez Gringotts. Le gobelin lui tend le registre de son coffre.",
  "type": "qcm",
  "competence": "Lire un nombre à 7 chiffres",
  "competences_prerequises": ["j01-e05", "j01-e06"],
  "difficulte_relative": 7,
  "duree_estimee_sec": 90,
  "points_maison": 5,
  "maison_bonus": "gryffondor",

  "enonce": "Le coffre de Harry contient 1 250 460 Gallions. Comment se lit ce nombre ?",
  "image_url": null,
  "donnees_supplementaires": null,

  "choix": [
    { "id": "a", "texte": "Un million deux cent cinquante mille quatre cent soixante" },
    { "id": "b", "texte": "Un million deux cent cinq mille quatre cent soixante" },
    { "id": "c", "texte": "Douze millions cinquante mille quatre cent soixante" },
    { "id": "d", "texte": "Un million deux cent cinquante mille quarante-six" }
  ],
  "reponse_correcte": "a",

  "reponse_attendue_redige": null,
  "tolerance_numerique": null,
  "regex_validation": null,

  "explication_correcte": "Bravo Harry ! 1 250 460 = 1 million + 250 mille + 460. Le gobelin acquiesce.",
  "explications_erreurs": {
    "b": "Attention au chiffre des dizaines de mille : c'est 5, pas 0. Relis 1 2[5]0 460.",
    "c": "12 millions aurait 8 chiffres, pas 7. Compte les chiffres : il y en a 7.",
    "d": "Les 3 derniers chiffres se lisent ensemble : 460 = quatre cent soixante."
  },

  "indices": [
    {
      "niveau": 1,
      "texte": "Sépare le nombre en tranches de 3 chiffres en partant de la droite : 1 / 250 / 460.",
      "cout_points": 1
    },
    {
      "niveau": 2,
      "texte": "La première tranche à gauche se lit 'un million'. La deuxième : '250 mille'. La dernière : '460'.",
      "cout_points": 2
    }
  ],

  "decomposition": {
    "declenchee_si": "2_erreurs_OU_temps_sup_180s",
    "micro_etapes": [
      {
        "id": "j01-e07-d1",
        "enonce": "Combien y a-t-il de chiffres dans 1 250 460 ?",
        "type": "numerique",
        "reponse": 7
      },
      {
        "id": "j01-e07-d2",
        "enonce": "Sépare 1250460 en tranches de 3 en partant de la droite. Écris-le avec des espaces.",
        "type": "redige",
        "reponse_attendue": "1 250 460",
        "regex_validation": "^1\\s*250\\s*460$"
      },
      {
        "id": "j01-e07-d3",
        "enonce": "Comment se lit '1' tout seul à gauche (tranche des millions) ? Choisis.",
        "type": "qcm",
        "choix": [
          { "id": "a", "texte": "Un million" },
          { "id": "b", "texte": "Un milliard" },
          { "id": "c", "texte": "Cent mille" }
        ],
        "reponse_correcte": "a"
      },
      {
        "id": "j01-e07-d4",
        "enonce": "Maintenant, lis le nombre entier 1 250 460.",
        "type": "redige_libre",
        "validation_par_claude": true
      }
    ]
  },

  "reformulation_alternative": {
    "declenchee_si": "echec_decomposition",
    "narration_alt": "Imagine que tu comptes des bonbons de Bertie Crochue. Tu en as 1 250 460. Combien ça fait ?",
    "enonce_alt": "Comment lis-tu '1 250 460' à voix haute, comme si tu disais à un ami combien tu as de bonbons ?",
    "indice_visuel": "tranches_couleur:milliards|millions|mille|unites"
  },

  "report_jour_suivant": {
    "declenchee_si": "echec_reformulation",
    "exercice_replay_id": "j01-e07-replay",
    "delai_jours": 1
  },

  "tags": ["numeration", "millions", "lecture"],
  "source_inspiration_libermann": "Épreuve N°1 - lecture nombres élevés"
}
```

## Types d'exercices supportés

| `type` | Description | Validation |
|---|---|---|
| `qcm` | 3-4 choix | `reponse_correcte` (id) |
| `vrai_faux` | 2 choix | `reponse_correcte` ("vrai"\|"faux") |
| `numerique` | Réponse chiffrée | `reponse_attendue_redige` + `tolerance_numerique` |
| `redige_court` | 1 ligne (ex: opération posée) | `regex_validation` OU Claude API |
| `redige_libre` | Plusieurs lignes | Claude API obligatoire |
| `appariement` | Glisser-déposer | tableau de paires |
| `ordre` | Ranger éléments | tableau ordonné |

## Champs structurels — explications

- **`competences_prerequises`** : tableau d'IDs. Le moteur ne propose un exo que si tous les prérequis sont à 100% maîtrisés.
- **`difficulte_relative`** : 1-30 dans le jour. Garantit le delta minime entre voisins.
- **`indices`** : 0-3 niveaux. Coût en points pour ne pas en abuser. **1 indice utilisé + bonne réponse = maîtrisé** (cf. règle métier validée).
- **`decomposition`** : déclenchée auto si seuil de blocage atteint (1 erreur + >180s OU 2 erreurs).
- **`reformulation_alternative`** : si la décomposition échoue, Claude reformule avec un angle différent.
- **`report_jour_suivant`** : ultime recours. L'exo réapparaît J+1 dans la file de révision (spaced repetition).
- **`maison_bonus`** : optionnel. Certains exos rapportent double à une maison si l'enfant a choisi cette maison.

## Schéma d'un quiz noté /20

```json
{
  "id": "quiz-j02",
  "jour": 2,
  "duree_min": 30,
  "note_max": 20,
  "exercices": ["q-j02-1", "q-j02-2", "q-j02-3"],
  "ponderations": { "q-j02-1": 6, "q-j02-2": 7, "q-j02-3": 7 },
  "themes_couverts": ["grands_nombres", "operations_posees"]
}
```

La pondération somme à 20. Chaque exercice du quiz a sa propre structure (mêmes champs qu'un exo normal mais sans indices/décomposition — c'est une éval).
