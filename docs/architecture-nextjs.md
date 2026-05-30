# Poudlard Maths — Architecture Next.js

## Stack technique finale

| Couche | Technologie |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| UI | Tailwind CSS + shadcn/ui |
| Animation | Framer Motion (transitions, badges) |
| Auth + DB | Supabase (Postgres + Auth + RLS) |
| Client Supabase | `@supabase/ssr` (cookies-based auth) |
| API IA | `@anthropic-ai/sdk` (Claude Haiku 4.5 + Sonnet 4.6 fallback) |
| Cache LLM | Redis (Upstash, serverless) ou table Postgres `llm_cache` |
| Charts dashboard | Recharts |
| Déploiement | Vercel (preview branches + prod) |
| Monitoring | Vercel Analytics + Supabase logs |

## Arborescence

```
poudlard-maths/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx           # Login enfant/parent
│   │   ├── signup/page.tsx          # Inscription parent
│   │   └── reset/page.tsx
│   ├── (child)/
│   │   ├── layout.tsx               # Layout enfant (mobile-first)
│   │   ├── accueil/page.tsx         # Tableau de bord enfant
│   │   ├── jour/[n]/page.tsx        # Vue d'un jour (liste exos)
│   │   ├── exercice/[id]/page.tsx   # Exercice unique
│   │   ├── quiz/[id]/page.tsx       # Quiz noté /20
│   │   ├── revisions/page.tsx       # File de spaced repetition
│   │   ├── recompenses/page.tsx     # Badges et paliers
│   │   └── carte/page.tsx           # Carte du Maraudeur (progression visuelle)
│   ├── (parent)/
│   │   ├── layout.tsx               # Layout parent (desktop)
│   │   ├── dashboard/page.tsx       # Vue d'ensemble enfants
│   │   ├── enfants/[id]/
│   │   │   ├── page.tsx             # Détail d'un enfant
│   │   │   ├── exercices/page.tsx   # Liste exos faits/ratés
│   │   │   ├── temps/page.tsx       # Heatmap horaires
│   │   │   ├── blocages/page.tsx    # Blocages détaillés
│   │   │   └── quiz/page.tsx        # Notes /20
│   │   ├── alertes/page.tsx
│   │   └── reglages/page.tsx
│   ├── api/
│   │   ├── claude/
│   │   │   ├── valider-redige/route.ts    # Valide une réponse rédigée
│   │   │   ├── decomposer/route.ts        # Génère décomposition à la demande
│   │   │   ├── reformuler/route.ts        # Reformule un énoncé
│   │   │   └── feedback-quiz/route.ts     # Feedback global d'un quiz
│   │   ├── progress/
│   │   │   ├── route.ts                   # GET/POST progression
│   │   │   └── next-exercise/route.ts     # Renvoie le prochain exo selon moteur adaptatif
│   │   └── alerts/route.ts                # Génère/lit alertes
│   ├── layout.tsx
│   ├── page.tsx                     # Landing
│   └── globals.css
├── components/
│   ├── ui/                          # shadcn/ui (Button, Card, etc.)
│   ├── exercice/
│   │   ├── ExerciceQcm.tsx
│   │   ├── ExerciceRedige.tsx
│   │   ├── ExerciceNumerique.tsx
│   │   ├── IndiceModal.tsx
│   │   ├── DecompositionWizard.tsx
│   │   └── ChronoExercice.tsx
│   ├── gamification/
│   │   ├── PointsMaisonBadge.tsx
│   │   ├── BadgeUnlocked.tsx
│   │   ├── CoupeMaisons.tsx         # 4 sabliers animés
│   │   └── ChapitreDebloque.tsx
│   ├── dashboard/
│   │   ├── ProgressionChart.tsx
│   │   ├── HeatmapHoraires.tsx
│   │   ├── ListeExercicesRates.tsx
│   │   └── AlertesPanel.tsx
│   └── narration/
│       ├── ScenePotter.tsx          # Illustration + texte d'intro
│       └── TransitionChapitre.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                # Client browser
│   │   ├── server.ts                # Client server (RSC + actions)
│   │   └── middleware.ts            # Refresh tokens
│   ├── claude/
│   │   ├── client.ts                # SDK init
│   │   ├── prompts.ts               # Prompts templates
│   │   └── cache.ts                 # Cache wrapper
│   ├── moteur/
│   │   ├── selecteur-prochain-exo.ts    # Logique : qui vient après ?
│   │   ├── detecteur-blocage.ts         # Détecte si l'enfant bloque
│   │   ├── calcul-maitrise.ts           # Critère 80% + 1 indice
│   │   ├── spaced-repetition.ts         # Algo de révision
│   │   └── rattrapage.ts                # Réduit volume si retard
│   ├── types.ts                     # Types TS partagés
│   └── utils.ts
├── public/
│   ├── images/                      # Illustrations HP
│   └── sons/                        # Sons gamification (optionnel)
├── data/
│   ├── exercices/
│   │   ├── jour-01.json
│   │   ├── jour-02.json
│   │   └── ... (15 jours)
│   ├── quiz/
│   │   ├── quiz-j02.json
│   │   └── ... (7 quiz)
│   └── seed.ts                      # Script de seed Supabase
├── scripts/
│   ├── seed-exercices.ts
│   └── creer-admin.ts
├── middleware.ts                    # Auth check global
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Routes & permissions

| Route | Qui y accède | Rendering |
|---|---|---|
| `/` | Tous | SSG |
| `/login` | Non-authentifié | SSR |
| `/accueil` | child uniquement | SSR (Supabase) |
| `/jour/[n]` | child | SSR |
| `/exercice/[id]` | child | CSR partiel (chrono, indices, validation live) |
| `/dashboard` | parent, admin | SSR + RSC |
| `/enfants/[id]/*` | parent (si is_parent_of) ou admin | SSR |
| `/api/claude/*` | Authentifié, rate-limited | Edge runtime |

## Moteur adaptatif — pseudo-code

### Sélecteur du prochain exercice

```ts
async function nextExercise(childId: string): Promise<Exercise | Quiz | null> {
  // 1. Y a-t-il un quiz à passer aujourd'hui ?
  const today = currentJour(childId);
  if (today % 2 === 0 && !quizPasseAujourdhui(childId, today)) {
    return loadQuiz(`quiz-j${pad(today)}`);
  }

  // 2. Exercice de révision dû (spaced repetition) ?
  const revision = await getRevisionDue(childId);
  if (revision) return loadExercise(revision.exercise_id);

  // 3. Y a-t-il un exercice en cours non maîtrisé ?
  const enCours = await getCurrentNonMaitrise(childId);
  if (enCours) return loadExercise(enCours.exercise_id);

  // 4. Sinon, prochain exo dans l'ordre du jour
  const prochain = await getNextInJour(childId, today);
  if (prochain) return prochain;

  // 5. Jour terminé → passer au suivant si critère 80% atteint
  if (await jourMaitrise(childId, today)) {
    if (retardCumule(childId) > 0) appliquerRattrapage(childId);
    return getFirstOfJour(childId, today + 1);
  }

  return null; // attente, message de félicitations
}
```

### Détecteur de blocage

```ts
function detecterBlocage(attempt: Attempt, exo: Exercise) {
  const seuilTemps = exo.duree_estimee_sec * 2;
  const tentativesEchouees = countEchecsRecent(attempt.child_id, attempt.exercise_id);

  if (tentativesEchouees >= 2) return { strategie: 'decomposition' };
  if (attempt.duree_sec > seuilTemps && !attempt.est_correcte) {
    return { strategie: attempt.nb_indices_utilises >= 2 ? 'reformulation' : 'indice' };
  }
  if (attempt.help_clicked) return { strategie: 'indice' };
  return null;
}
```

### Critère de maîtrise

```ts
function estMaitrise(attempt: Attempt): boolean {
  return attempt.est_correcte
      && attempt.nb_indices_utilises <= 1
      && !attempt.est_decomposition;
}
```

## Intégration Claude API — patterns

### 1. Validation de réponse rédigée (`/api/claude/valider-redige`)

```
Model: claude-haiku-4-5-20251001
Prompt: tu reçois l'énoncé, la réponse attendue, et la réponse de l'enfant.
        Renvoie JSON: { correct: bool, score_partiel: 0-1, feedback: string }
Cache: hash(exo_id + reponse_normalisee) → résultat
```

### 2. Décomposition (`/api/claude/decomposer`)

```
Model: claude-sonnet-4-6 (cas complexes)
Si l'exo a déjà un champ `decomposition` pré-écrit → l'utiliser sans appeler Claude.
Sinon : générer 3-5 micro-étapes en JSON.
```

### 3. Reformulation (`/api/claude/reformuler`)

```
Model: claude-haiku-4-5-20251001
Reformule l'énoncé avec un angle différent (concret, visuel, ou avec autre métaphore HP).
```

### 4. Feedback quiz (`/api/claude/feedback-quiz`)

```
Model: claude-sonnet-4-6
Analyse les 3-4 résultats du quiz, identifie thèmes faibles/forts,
écrit un feedback encourageant style Dumbledore.
```

## Sécurité & limites

- **RLS Supabase** : tout enfant ne voit que ses données, parent voit ses enfants.
- **Rate limit API Claude** : 60 req/min par enfant côté Vercel Edge.
- **Cache LLM** : table `llm_cache(prompt_hash, response, created_at)` ou Upstash Redis. TTL 30 jours.
- **Validation côté serveur** : toute soumission de réponse repasse par `/api/progress` (jamais de calcul de score côté client).
- **Anti-triche basique** : timestamp serveur sur chrono, pas de réponse correcte renvoyée au client avant soumission.

## Responsive mobile-first

- Breakpoint principal : `sm` (640px) et `md` (768px).
- Écran exercice optimisé pour pouce droit (gros boutons QCM, clavier numérique flottant pour les rédigés courts).
- Le chrono est toujours visible mais discret (haut droite).
- Animations limitées sur mobile (économie batterie).
- Mode hors-ligne partiel : exos du jour mis en cache localStorage, sync au retour réseau.

## Déploiement

1. **Supabase** : créer projet, run `supabase-schema.sql`.
2. **Seed** : `npm run seed` charge les 450 exercices dans table `exercises`.
3. **Vercel** : connecter le repo GitHub, variables d'env (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE`, `ANTHROPIC_API_KEY`).
4. **Domaine** : poudlard-maths.vercel.app puis custom domain si voulu.
