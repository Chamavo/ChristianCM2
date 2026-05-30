# Instructions de commit et push

## Étape 1 — Ouvrir un terminal dans le dossier ChristianCM2

```bash
cd "C:\Users\ACER\Downloads\Projets GitHub\ChristianCM2"
```

## Étape 2 — Vérifier l'état

```bash
git status
```

Tu devrais voir ~170 fichiers : beaucoup de `D` (deleted = ancien projet Vite) et beaucoup de `??` (untracked = nouveau projet Next.js).

## Étape 3 — Tout ajouter (suppressions + nouveaux fichiers)

```bash
git add -A
```

## Étape 4 — Vérifier que rien de secret ne va être commit

```bash
git status | grep -E "\.env$|\.env\.local$"
```

Cette commande ne doit **rien retourner**. Si tu vois `.env` ou `.env.local` apparaître, **STOP** et fais :
```bash
git rm --cached .env .env.local
git commit -m "fix: untrack env files"
```

## Étape 5 — Commit

```bash
git commit -m "feat: remplacement complet par Poudlard Maths (Next.js + Supabase + Claude API)

- Migration framework Vite -> Next.js 14 (App Router)
- 450 exercices CM2 micro-progressifs sur 15 jours (gamification Harry Potter)
- 7 quiz Libermann notes /20
- Moteur adaptatif (indices, decomposition, reformulation, spaced repetition)
- Auth Supabase multi-roles (enfant, parent, admin) avec RLS
- Dashboard parent : KPI, courbe quiz, heatmap horaires, alertes
- Integration Claude API (Haiku + Sonnet) avec cache LLM
- Mobile responsive

BREAKING CHANGE: ce commit remplace integralement le projet precedent.
Variables d'env Vite (VITE_*) a remplacer par les variables Next.js (NEXT_PUBLIC_*).
Voir VERCEL-ENV-VARS.md pour la liste complete."
```

## Étape 6 — Push sur GitHub

```bash
git push origin main
```

⚠️ **Force push si nécessaire** : si GitHub rejette le push à cause d'un historique divergent, tu peux forcer :
```bash
git push origin main --force-with-lease
```

## Étape 7 — Vercel se réveille

Dès que le push atteint GitHub :
1. Vercel détecte le commit sur `main` et lance un build automatique.
2. Va sur https://vercel.com → projet `ChristianCM2` → onglet **Deployments**.
3. Le build va probablement **échouer** la première fois (variables d'env manquantes ou framework Vite encore configuré). C'est normal.

## Étape 8 — Configurer Vercel pour Next.js

Sur Vercel → Settings → General → **Build & Development Settings** :
- Framework Preset : **Next.js** (si "Other" ou "Vite" est sélectionné, change-le)
- Build Command : `next build` (ou laisser vide pour auto-détection)
- Output Directory : `.next` (laisser vide)
- Install Command : `npm install`

Puis Settings → **Environment Variables** : suivre `VERCEL-ENV-VARS.md`.

**Supprimer** les anciennes variables `VITE_SUPABASE_*` qui ne servent plus.

## Étape 9 — Redéployer

Vercel → Deployments → trois points sur le dernier build → **Redeploy** (décocher "Use existing build cache").

Si tout est bon, https://christiancm2.vercel.app affiche la landing Poudlard Maths.

## Étape 10 — Configurer Supabase

Avant que l'app puisse vraiment fonctionner :
1. Créer un projet Supabase (nouveau, comme convenu) : https://supabase.com
2. Exécuter dans **SQL Editor** dans cet ordre :
   - `supabase/01-schema.sql`
   - `supabase/02-quiz-table.sql`
   - `supabase/03-views-dashboard.sql`
3. Récupérer les 3 clés Supabase et les coller dans Vercel (étape 8)
4. En local : créer `.env.local` (voir `.env.example`) et lancer :
   ```bash
   npm install
   npm run seed        # charge les 450 exos
   npm run create-admin parent@example.com motdepasse "Papa"
   ```

---

Tu m'appelles si un truc bloque à n'importe quelle étape.
