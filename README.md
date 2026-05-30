# ChristianCM2 — Poudlard Maths

Plateforme adaptative de préparation au concours d'entrée en 6ème **Libermann** (Cameroun).
15 jours, 450 exercices micro-progressifs, gamification Harry Potter tome 1.

🌐 **Production** : https://christiancm2.vercel.app

## Stack

- **Frontend** : Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui
- **Backend** : Supabase (Postgres + Auth + RLS)
- **IA** : Claude API (Haiku pour validation rédigée, Sonnet pour décomposition complexe)
- **Charts** : Recharts
- **Animations** : Framer Motion
- **Déploiement** : Vercel

## Démarrage rapide (local)

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer les variables d'env
cp .env.example .env.local
# → Éditer .env.local avec tes clés Supabase + Anthropic

# 3. Lancer le serveur de dev
npm run dev
```

L'app démarre sur `http://localhost:3000`.

## Configurer Supabase (1ère fois)

1. Créer un projet sur https://supabase.com
2. Dans **SQL Editor**, exécuter dans cet ordre :
   - `supabase/01-schema.sql` (tables + RLS)
   - `supabase/02-quiz-table.sql` (table quiz)
   - `supabase/03-views-dashboard.sql` (vues + RPC pour le dashboard parent)
3. Charger les 450 exercices dans la base : `npm run seed`
4. Créer le 1er compte admin :
   ```bash
   ADMIN_EMAIL=parent@example.com \
   ADMIN_PASSWORD=motdepassesecure \
   ADMIN_DISPLAY_NAME="Papa Maths" \
   npm run create-admin
   ```

Voir `DEPLOIEMENT.md` pour la procédure détaillée.

## Déployer sur Vercel

Le repo est connecté à Vercel sur `christiancm2.vercel.app`. Chaque push sur `main` déclenche un déploiement automatique.

**Avant le 1er push** : configurer les variables d'env Vercel selon `VERCEL-ENV-VARS.md`.

## Architecture

```
ChristianCM2/
├── app/
│   ├── (auth)/         # Login, signup, reset
│   ├── (child)/        # Espace enfant : exercices, quiz, accueil, carte
│   ├── (parent)/       # Dashboard parent/admin (KPI, alertes, heatmap)
│   └── api/            # Routes API (Claude, progress, alerts)
├── components/
│   ├── exercice/       # ExerciceClient, IndiceModal, DecompositionWizard…
│   ├── dashboard/      # KPI, charts, heatmap
│   ├── gamification/   # Points, badges, coupe des maisons
│   └── ui/             # shadcn/ui (Button, Card, Input, Label)
├── lib/
│   ├── supabase/       # Clients browser + server
│   ├── claude/         # Intégration Anthropic + cache
│   ├── moteur/         # Moteur adaptatif (sélecteur, blocage, maîtrise…)
│   └── types.ts        # Types TypeScript partagés
├── data/
│   ├── exercices/      # 15 fichiers JSON × 30 exos = 450 exercices
│   └── quiz/           # 7 quiz Libermann notés /20
├── supabase/           # Migrations SQL (à exécuter dans l'ordre)
├── scripts/            # seed-exercices, creer-admin, copier-data
└── docs/               # Plan 15 jours, schéma JSON, audit qualité, maquettes
```

## Moteur pédagogique

- **Maîtrise** = bonne réponse avec ≤ 1 indice utilisé
- **Blocage détecté** = 1 erreur + temps > seuil OU 2 erreurs OU clic "Aide"
- **Stratégies adaptatives** (par l'API Claude) :
  1. Indice progressif (2 niveaux)
  2. Décomposition en micro-étapes
  3. Reformulation alternative
  4. Report à J+1 (spaced repetition)
- **80 % de maîtrise** requis pour avancer au jour suivant
- **Rattrapage automatique** si retard : réduction du nombre d'exos sur les jours suivants
- **Quiz Libermann** notés /20 tous les 2 jours (J2, J4, J6, J8, J10, J12, J14)

## Sécurité

- RLS Supabase strict : enfant ne voit que ses données, parent ne voit que ses enfants
- `SUPABASE_SERVICE_ROLE_KEY` jamais exposée au client
- Rate-limit sur les routes Claude API (60 req/min/enfant)
- Cache LLM en mémoire (table `llm_cache` ou Upstash Redis en option) pour limiter les coûts

## Commandes utiles

```bash
npm run dev              # serveur local
npm run build            # build production
npm run lint             # ESLint
npm run seed             # charger les 450 exos dans Supabase
npm run create-admin     # créer un compte admin
npm run copy-data        # copier data/ depuis sources externes (interne)
```

## Ajouter de nouveaux exercices

1. Éditer le JSON correspondant dans `data/exercices/` ou `data/quiz/`
2. Respecter le schéma documenté dans `docs/schema-exercice.md`
3. Valider le JSON : `node -e "JSON.parse(require('fs').readFileSync('data/exercices/exercices-jour-05.json','utf8'))"`
4. Relancer le seed : `npm run seed` (upsert, idempotent)

## Monitorer la consommation Claude API

Chaque tentative d'exercice rédigé stocke `cout_tokens_claude` dans la table `attempts`.
Requête SQL rapide pour suivre les coûts :

```sql
select
  date_trunc('day', created_at) as jour,
  count(*) as nb_validations_claude,
  sum(cout_tokens_claude) as tokens_total,
  round(sum(cout_tokens_claude) * 0.000003, 2) as cout_usd_estime
from attempts
where cout_tokens_claude > 0
group by 1
order by 1 desc;
```

Configure aussi un **budget mensuel + alerte email** dans la console Anthropic.

## Coût estimé

- **Supabase** : free tier suffisant pour 1 enfant (base < 500 MB)
- **Vercel** : free tier suffisant (Hobby)
- **Anthropic** : $5 à $20 sur 15 jours selon usage validations rédigées + décompositions

## FAQ

**Combien d'enfants par compte parent ?** Pas de limite côté schéma (relation `parent_id` 1-N). Recommandé : max 3-4 pour garder le dashboard lisible.

**Connexion Internet obligatoire ?** Oui — l'app est en SSR et appelle Claude pour les rédigés. Version offline (PWA + validation locale QCM) dans la roadmap.

**Réinitialiser la progression d'un enfant ?** Via le dashboard parent → fiche enfant → bouton "Réinitialiser". Ou en SQL :
```sql
delete from attempts where child_id = '...';
delete from progress where child_id = '...';
```

**Les enfants peuvent-ils voir les bonnes réponses côté client ?** Non. La validation se fait côté serveur (`/api/progress`). La RLS bloque la lecture de `reponse_correcte`.

**Fallback si Claude API échoue ?** La route de validation retombe sur la regex définie dans le JSON (`regex_validation`). Sinon, l'exercice est marqué "en attente" et l'enfant peut continuer.

## Documentation complète

- `DEPLOIEMENT.md` — guide pas à pas pour le déploiement initial Supabase + Vercel
- `VERCEL-ENV-VARS.md` — liste exacte des variables d'env à créer dans Vercel
- `docs/plan-15-jours.md` — plan thématique des 15 jours
- `docs/schema-exercice.md` — format JSON d'un exercice
- `docs/architecture-nextjs.md` — vue d'ensemble technique
- `docs/rapport-audit-qualite.md` — audit qualité des 450 exos

---

**Versions** : `next@14.2.18`, `@supabase/supabase-js@2.46.1`, `@anthropic-ai/sdk@0.32.1`.

Construit pour aider Christian à intégrer le Collège Libermann. 🦁⚡
