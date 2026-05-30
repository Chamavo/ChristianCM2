# Guide de déploiement — Poudlard Maths

Bienvenue ! Ce guide t'accompagne pas à pas pour déployer **Poudlard Maths** en production. Aucune expérience préalable Next.js / Supabase / Vercel n'est requise — chaque étape est détaillée avec les commandes exactes.

**Architecture** : Next.js 14 (App Router) + Supabase (PostgreSQL + Auth) + Claude API (Anthropic) pour la validation des réponses rédigées.

**Temps total estimé** : environ 1 h 15 min (premier déploiement).

---

## Table des matières

1. [Prérequis (5 min)](#1-prérequis-5-min)
2. [Configuration locale (15 min)](#2-configuration-locale-15-min)
3. [Setup Supabase (20 min)](#3-setup-supabase-20-min)
4. [Seed des exercices (5 min)](#4-seed-des-exercices-5-min)
5. [Créer le premier compte admin (3 min)](#5-créer-le-premier-compte-admin-3-min)
6. [Test local complet (10 min)](#6-test-local-complet-10-min)
7. [Déploiement Vercel (15 min)](#7-déploiement-vercel-15-min)
8. [Domaine personnalisé — optionnel (5 min)](#8-domaine-personnalisé--optionnel-5-min)
9. [Monitoring & coûts](#9-monitoring--coûts)
10. [Troubleshooting](#10-troubleshooting)
11. [Maintenance](#11-maintenance)

---

## 1. Prérequis (5 min)

### 1.1. Outils à installer sur ton PC

| Outil | Version min | Lien de téléchargement |
|---|---|---|
| **Node.js** | 20 LTS ou + | https://nodejs.org/fr/download (choisis "Windows Installer .msi") |
| **Git** | 2.40+ | https://git-scm.com/download/win |
| **VS Code** (recommandé) | dernière | https://code.visualstudio.com/ |

**Vérifier l'installation** (ouvre **PowerShell**, touche Windows puis tape "PowerShell") :

```powershell
node --version    # doit afficher v20.x.x ou plus
npm --version     # doit afficher 10.x.x ou plus
git --version     # doit afficher git version 2.x
```

Si une commande n'est pas reconnue, redémarre PowerShell (ou ton PC) après l'installation.

### 1.2. Comptes en ligne à créer (tous gratuits)

1. **Supabase** — https://supabase.com → "Start your project" → s'inscrire avec GitHub (plus simple)
2. **Vercel** — https://vercel.com → "Sign Up" → s'inscrire avec GitHub
3. **GitHub** (si pas déjà) — https://github.com → utile pour héberger ton code et le brancher à Vercel
4. **Anthropic Console** — https://console.anthropic.com → s'inscrire et **ajouter du crédit**

### 1.3. Coûts estimés Anthropic (Claude API)

> **Important** : la clé Anthropic est la seule dépense quasi-certaine. Tout le reste reste dans les free tiers.

Poudlard Maths utilise Claude **uniquement** pour valider les réponses rédigées libres (pas pour les QCM, vrai/faux, numériques — gérés en local). Le système de cache (prompts identiques mémorisés 7 jours en base) réduit fortement la facture.

| Usage | Coût estimé |
|---|---|
| 1 enfant, 15 jours d'usage régulier | **~5 USD** |
| 3 enfants, 15 jours | **~12 USD** |
| 5 enfants, 15 jours | **~20 USD** |

**Recommandation depuis le Cameroun** : commence par charger **10 USD** sur ton compte Anthropic (paiement par carte Visa/Mastercard internationale). Active aussi l'**alerte de seuil** dans `Settings > Limits` pour recevoir un email à 5 USD consommés.

---

## 2. Configuration locale (15 min)

### 2.1. Cloner le projet (si ce n'est pas déjà fait)

Si tu as déjà le dossier `MathsCM2` localement, passe directement à l'étape 2.2.

```powershell
# PowerShell (Windows)
cd C:\Users\ACER\Dropbox\TOOLBOX
git clone https://github.com/TON-COMPTE/poudlard-maths.git
cd poudlard-maths
```

### 2.2. Installer les dépendances

```powershell
# PowerShell (Windows)
cd C:\Users\ACER\Dropbox\TOOLBOX\MathsCM2\poudlard-maths\app\web
npm install
```

```bash
# Mac/Linux (équivalent)
cd ~/poudlard-maths/app/web
npm install
```

Patiente 2-3 minutes (téléchargement de ~300 Mo de modules).

### 2.3. Créer le fichier `.env.local`

Le fichier `.env.example` contient déjà la liste des variables nécessaires. On le copie en `.env.local` (ce dernier est **ignoré par Git** — c'est volontaire, il contient des secrets).

```powershell
# PowerShell
copy .env.example .env.local
```

```bash
# Mac/Linux
cp .env.example .env.local
```

Ouvre `.env.local` dans VS Code :

```powershell
code .env.local
```

Tu dois remplir 5 variables (on les récupère aux étapes 2.4 et 2.5) :

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **AVERTISSEMENT CRITIQUE** : `SUPABASE_SERVICE_ROLE_KEY` est une clé **god mode** qui contourne toutes les sécurités RLS. Elle ne doit **JAMAIS** être committée sur Git, partagée par email, ni utilisée côté navigateur. Si elle fuite : régénère-la immédiatement depuis le dashboard Supabase.

### 2.4. Récupérer les clés Supabase (on le fait à l'étape 3 — saute pour l'instant)

Tu vas créer ton projet Supabase à l'étape 3. Reviens ici une fois fait pour copier les clés.

### 2.5. Récupérer la clé Anthropic

1. Va sur https://console.anthropic.com/settings/keys
2. Clique sur **"Create Key"**
3. Nom : `poudlard-maths-dev` (mets `poudlard-maths-prod` plus tard pour la prod)
4. Copie la clé (commence par `sk-ant-...`) — **elle ne sera affichée qu'une seule fois**
5. Colle-la dans `.env.local` à la ligne `ANTHROPIC_API_KEY=...`

### 2.6. Tester en local (à faire APRÈS Supabase configuré, étape 3)

Une fois les 5 variables remplies :

```powershell
npm run dev
```

Ouvre http://localhost:3000 dans Chrome. Si tu vois la page d'accueil avec le titre "Poudlard Maths", c'est bon. Sinon → section [Troubleshooting](#10-troubleshooting).

Stoppe avec `Ctrl+C` quand tu as vérifié.

---

## 3. Setup Supabase (20 min)

### 3.1. Créer le projet

1. Connecte-toi à https://supabase.com/dashboard
2. Clique sur **"New Project"**
3. Remplis :
   - **Name** : `poudlard-maths`
   - **Database Password** : génère un mot de passe fort (clique sur le bouton dé) et **garde-le dans un gestionnaire de mots de passe**. Tu en auras besoin si tu utilises `pg_dump` plus tard.
   - **Region** : **`Europe West (Ireland)` (eu-west-1)** ou **`Europe Central (Frankfurt)` (eu-central-1)**. Ce sont les plus proches du Cameroun (latence ~150-200 ms). **Évite US-East et Asia.**
   - **Pricing Plan** : `Free`
4. Clique sur **"Create new project"** — attend 1-2 minutes que la base soit prête.

### 3.2. Récupérer les 3 clés Supabase

Une fois le projet créé :

1. Dans le menu de gauche, va dans **`Project Settings`** (icône engrenage tout en bas) → **`API`**
2. Tu vois 3 informations à copier dans `.env.local` :

| Champ Supabase | Variable `.env.local` |
|---|---|
| **Project URL** (`https://xxxxx.supabase.co`) | `NEXT_PUBLIC_SUPABASE_URL` |
| **anon public** key (commence par `eyJ...`) | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| **service_role secret** key (commence par `eyJ...`, clique "Reveal" pour voir) | `SUPABASE_SERVICE_ROLE_KEY` |

> **RAPPEL** : `service_role` est ultra-sensible. Ne la mets **jamais** dans une variable préfixée `NEXT_PUBLIC_*`.

### 3.3. Appliquer les schémas SQL — ordre OBLIGATOIRE

Dans le menu de gauche, va dans **`SQL Editor`** (icône `<>`).

> **Ordre exact à respecter** — le 2e et le 3e fichier dépendent du 1er. Si tu inverses, tu auras des erreurs "table does not exist".

#### Fichier 1 : `supabase-schema.sql` (principal)

1. Clique sur **"+ New query"**
2. Ouvre dans VS Code : `C:\Users\ACER\Dropbox\TOOLBOX\MathsCM2\poudlard-maths\supabase-schema.sql`
3. **Sélectionne tout** (`Ctrl+A`) et **copie** (`Ctrl+C`)
4. **Colle** dans l'éditeur SQL Supabase (`Ctrl+V`)
5. Clique sur **"Run"** (ou `Ctrl+Enter`)
6. Tu dois voir `Success. No rows returned` en bas. Si erreur → voir [Troubleshooting](#10-troubleshooting).

#### Fichier 2 : `scripts/supabase-add-quiz-table.sql`

1. **"+ New query"** à nouveau
2. Ouvre : `C:\Users\ACER\Dropbox\TOOLBOX\MathsCM2\poudlard-maths\app\web\scripts\supabase-add-quiz-table.sql`
3. Copie/colle tout le contenu, puis **Run**

#### Fichier 3 : `scripts/supabase-views-dashboard.sql`

1. **"+ New query"**
2. Ouvre : `C:\Users\ACER\Dropbox\TOOLBOX\MathsCM2\poudlard-maths\app\web\scripts\supabase-views-dashboard.sql`
3. Copie/colle, puis **Run**

#### Vérifier que tout est OK

Dans le menu de gauche, **`Table Editor`** : tu dois voir au minimum les tables `profiles`, `exercises`, `quiz`, `attempts`, `child_states`, `claude_cache`, `alerts` (selon le schéma).

### 3.4. Activer l'authentification Email

1. Menu de gauche → **`Authentication`** → **`Providers`**
2. Clique sur **`Email`**
3. Active **"Enable Email provider"** (toggle vert)
4. **IMPORTANT pour les tests** : désactive **"Confirm email"** (toggle gris). Sans ça, chaque création de compte attend un clic dans un email avant de pouvoir se connecter.
5. Clique sur **"Save"**

> **AVERTISSEMENT PROD** : réactive **"Confirm email"** quand tu passes en production publique. Configure aussi un **SMTP custom** (Mailgun, Resend, SendGrid) car le SMTP par défaut Supabase est limité à 3 emails/heure.

### 3.5. Configurer les URL de redirection (à faire après Vercel — étape 7.5)

On y revient à l'étape 7. Pour l'instant les valeurs par défaut suffisent en local.

---

## 4. Seed des exercices (5 min)

Maintenant on importe les **450 exercices** + **7 quiz Libermann** depuis les JSON vers Supabase.

### 4.1. Vérifier que `.env.local` est complet

Les 4 premières variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`) doivent toutes être remplies. Sans `SUPABASE_SERVICE_ROLE_KEY`, le seed plantera (les RLS bloquent les insertions massives).

### 4.2. Copier les JSON dans le dossier `data/` (optionnel mais recommandé)

Cette étape rapatrie les JSON depuis `poudlard-maths/` (racine) vers `app/web/data/`. C'est requis pour que Vercel puisse les retrouver au build.

```powershell
cd C:\Users\ACER\Dropbox\TOOLBOX\MathsCM2\poudlard-maths\app\web
npm run copy-data
```

Tu dois voir `copié : exercices-jour-01.json`, etc. (15 + 7 = 22 fichiers).

### 4.3. Lancer le seed

```powershell
npm run seed
```

Sortie attendue (extrait) :

```
Poudlard Maths — Seed Supabase
=== Seed des exercices (J1 à J15) ===
Importé J1: 30 exos
Importé J2: 30 exos
...
=== Seed des quiz ===
Importé Quiz J2: 12 exos
...
=== Récapitulatif ===
Exercices  : 450 importés, 0 ignorés
Quiz       : 7 importés, 0 ignorés
Terminé.
```

### 4.4. Vérifier en base

Dans Supabase → **SQL Editor** → "+ New query" :

```sql
select count(*) from exercises;
-- Doit retourner : 450

select count(*) from quiz;
-- Doit retourner : 7
```

Si tu n'as pas 450, regarde les warnings du seed (lignes en jaune) — un JSON pourrait être malformé.

---

## 5. Créer le premier compte admin (3 min)

### Option A — Via le script CLI (recommandé)

```powershell
# PowerShell — remplace par ton email et un mot de passe fort (8 caractères min)
$env:ADMIN_EMAIL="ton.email@gmail.com"
$env:ADMIN_PASSWORD="MotDePasseFort123!"
$env:ADMIN_DISPLAY_NAME="Sizler Admin"
npm run create-admin
```

```bash
# Mac/Linux
ADMIN_EMAIL=ton.email@gmail.com ADMIN_PASSWORD=MotDePasseFort123! ADMIN_DISPLAY_NAME="Sizler Admin" npm run create-admin
```

Sortie attendue :

```
[create-admin] OK — compte admin créé avec succès.
               id : 8f3a...
               email : ton.email@gmail.com
```

### Option B — Via l'UI puis SQL

1. Lance `npm run dev`, va sur http://localhost:3000/signup
2. Crée un compte avec ton email
3. Dans Supabase → **SQL Editor** :
   ```sql
   update profiles set role = 'admin' where email = 'ton.email@gmail.com';
   ```

### Créer un enfant

Une fois connecté en parent/admin, va dans l'UI parent → **"Ajouter un enfant"**. Le compte enfant est créé avec un email/mot de passe que tu choisis (tu peux utiliser `enfant.prenom@local.test` — Supabase n'exige pas un domaine réel si Confirm Email est désactivé).

---

## 6. Test local complet (10 min)

Avant de déployer, vérifie que tout marche en local.

### 6.1. Démarrer le dev server

```powershell
npm run dev
```

Ouvre http://localhost:3000.

### 6.2. Parcours de test

1. **Login parent** : http://localhost:3000/login → tes identifiants admin
2. **Créer un enfant** : depuis le dashboard parent, "Ajouter un enfant" — choisis maison Gryffondor par exemple
3. **Déconnexion** puis **login en enfant**
4. **Faire l'exercice `j01-e01`** :
   - Va sur la page Jour 1
   - Réponds à l'exercice 1 (consulte le contenu en base si besoin)
   - Vérifie que la validation marche : feedback affiché, score incrémenté
5. **Tester un exercice rédigé libre** (validation Claude) : ils sont marqués `validation_par_claude=true`. Vérifie qu'une réponse approchée est bien évaluée (peut prendre 2-5 secondes — appel API).
6. **Re-login en parent** → onglet "Mes enfants" → clique sur ton enfant → tu dois voir la tentative dans son historique.

Si **tout** fonctionne, tu es prêt pour le déploiement.

---

## 7. Déploiement Vercel (15 min)

### 7.1. Pousser le code sur GitHub

Si le code n'est pas encore sur GitHub :

1. Va sur https://github.com/new → crée un repo **privé** nommé `poudlard-maths`
2. Dans PowerShell :

```powershell
cd C:\Users\ACER\Dropbox\TOOLBOX\MathsCM2\poudlard-maths

# Vérifier que .gitignore exclut bien .env.local (CRITIQUE)
git status
# Tu ne dois PAS voir .env.local dans la liste !

git init    # si pas déjà fait
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TON-COMPTE/poudlard-maths.git
git push -u origin main
```

> **AVERTISSEMENT CRITIQUE** : avant le `git push`, vérifie absolument que **`.env.local` n'est PAS dans le commit**. Sinon ta clé `service_role` et ta clé Anthropic seront publiques. Si c'est arrivé : régénère les deux immédiatement.

### 7.2. Importer le projet dans Vercel

1. Connecte-toi à https://vercel.com/dashboard
2. Clique sur **"Add New..."** → **"Project"**
3. **"Import Git Repository"** → choisis `poudlard-maths`
4. **Configuration** (étape cruciale) :

| Champ | Valeur |
|---|---|
| **Project Name** | `poudlard-maths` |
| **Framework Preset** | `Next.js` (auto-détecté) |
| **Root Directory** | **`app/web`** — clique sur "Edit" et tape ça. Très important car le repo a une structure imbriquée. |
| **Build Command** | (laisse par défaut : `next build`) |
| **Output Directory** | (laisse par défaut) |
| **Install Command** | (laisse par défaut : `npm install`) |
| **Node.js Version** | `20.x` (sous Settings → General après création si besoin de changer) |

### 7.3. Ajouter les variables d'environnement

Toujours dans l'écran d'import, **avant** de cliquer Deploy, déroule **"Environment Variables"** et ajoute :

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` (anon key) |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` (service_role) |
| `ANTHROPIC_API_KEY` | `sk-ant-...` |

> Tu ajouteras `NEXT_PUBLIC_APP_URL` après le premier déploiement (étape 7.5), une fois que tu connais ton URL Vercel.

### 7.4. Premier déploiement

Clique sur **"Deploy"**. Patiente 2-3 minutes. Tu vois "Congratulations!" quand c'est fini, avec une URL type `https://poudlard-maths-xyz.vercel.app`.

**Test rapide** : clique sur l'URL. La page d'accueil doit s'afficher. Si build échoué → [Troubleshooting](#10-troubleshooting).

### 7.5. Mettre à jour `NEXT_PUBLIC_APP_URL` + URL de redirection Supabase

#### Côté Vercel

1. Dashboard Vercel → ton projet → **Settings** → **Environment Variables**
2. **"Add New"** :
   - Name : `NEXT_PUBLIC_APP_URL`
   - Value : `https://poudlard-maths-xyz.vercel.app` (ton vrai domaine)
3. Sauvegarde, puis **redeploy** (onglet "Deployments" → ⋯ sur le dernier deploy → "Redeploy")

#### Côté Supabase

1. Dashboard Supabase → **Authentication** → **URL Configuration**
2. **Site URL** : `https://poudlard-maths-xyz.vercel.app`
3. **Redirect URLs** (ajoute toutes celles-ci, une par ligne) :
   ```
   https://poudlard-maths-xyz.vercel.app/**
   http://localhost:3000/**
   ```
4. Sauvegarde

Sans cette étape, l'auth en prod renverra "Invalid redirect URL".

### 7.6. Re-tester en prod

Ouvre ton URL Vercel, login en parent, fait un exercice. Tout doit marcher comme en local.

---

## 8. Domaine personnalisé — optionnel (5 min)

Si tu as un domaine (ex : `poudlard-maths.cm` ou `mathsdesmiens.com`) :

1. Vercel → ton projet → **Settings** → **Domains**
2. **"Add"** → tape `poudlard-maths.cm`
3. Vercel t'affiche les **enregistrements DNS** à créer chez ton registrar (Namecheap, OVH, GoDaddy...) :
   - Type `A` → IP fournie par Vercel (`76.76.21.21` typiquement)
   - **OU** Type `CNAME` pour `www` → `cname.vercel-dns.com`
4. Va chez ton registrar (interface DNS) et crée ces enregistrements.
5. Patiente 5 min à 2 h (propagation DNS). Vercel affichera "Valid Configuration" quand prêt.
6. **N'oublie pas** : mets à jour `NEXT_PUBLIC_APP_URL` en `https://poudlard-maths.cm` ET les URL de redirection Supabase.

---

## 9. Monitoring & coûts

### 9.1. Où surveiller quoi

| Métrique | Outil | Lien |
|---|---|---|
| Trafic, performance, erreurs Next.js | Vercel Analytics | Dashboard Vercel → ton projet → **Analytics** |
| Logs runtime (erreurs API, timeouts) | Vercel Logs | Dashboard Vercel → **Logs** |
| Requêtes DB, RLS bloqués, slow queries | Supabase Logs | Dashboard Supabase → **Logs** |
| Conso bande passante, storage, MAU | Supabase Usage | Dashboard Supabase → **Settings** → **Usage** |
| Coût Claude, requêtes, tokens | Anthropic Console | https://console.anthropic.com → **Usage** |

### 9.2. Coûts mensuels estimés (free tier)

| Service | Free tier inclus | Devrait suffire pour |
|---|---|---|
| **Vercel Hobby** | 100 GB bandwidth, projets non-commerciaux, build illimités | Jusqu'à ~5 000 visiteurs/mois |
| **Supabase Free** | 500 MB DB, 5 GB bandwidth, 50 000 MAU, 2 projets actifs | Jusqu'à ~50 enfants actifs |
| **Anthropic** | Pas de free tier — pay-as-you-go | Voir section 1.3 |

**Pour ton usage (1-5 enfants sur 15 jours)** : tu restes à ~5-20 USD/mois (Anthropic uniquement). Vercel et Supabase restent gratuits.

### 9.3. Quand passer en payant

- **Supabase Pro (25 USD/mois)** : si tu dépasses 500 MB DB (improbable avant ~1 000 enfants), ou si tu veux des backups quotidiens automatiques.
- **Vercel Pro (20 USD/mois/utilisateur)** : seulement si tu fais un usage commercial ou dépasses 100 GB bandwidth.
- **Anthropic** : pas de palier — tu paies à l'usage. Configure une **alerte de seuil** dans Settings pour ne pas être surpris.

---

## 10. Troubleshooting

### "supabaseUrl is required" au démarrage de `npm run dev`

→ `.env.local` est manquant ou mal nommé. Vérifie :
- Le fichier s'appelle exactement `.env.local` (pas `.env`, pas `.env.local.txt` — Windows masque les extensions par défaut, vérifie dans VS Code).
- Il est dans `app/web/` (pas à la racine du repo).
- Les 4 variables sont remplies sans espace après le `=`.

### Build qui échoue sur Vercel : `Module not found` ou `ENOENT`

→ Vérifie le **Root Directory** dans Vercel Settings : doit être `app/web` (pas vide, pas `/`).
→ Vérifie la **Node version** : Settings → General → Node.js Version = `20.x`.

### Auth qui marche en local mais pas en prod : "Invalid redirect URL"

→ Tu as oublié l'étape 7.5. Va dans Supabase → Authentication → URL Configuration et ajoute ton domaine Vercel dans **Redirect URLs**.

### `npm run seed` échoue : "permission denied" ou "new row violates RLS"

→ Tu utilises la mauvaise clé. Le seed **doit** utiliser `SUPABASE_SERVICE_ROLE_KEY` (pas `anon`). Vérifie dans `.env.local` que la 3e ligne est bien remplie avec la clé "service_role secret" (clique "Reveal" dans Supabase API settings pour la voir).

### Erreur RLS en navigation enfant : "row violates row-level security policy"

→ Une policy est manquante ou un fichier SQL n'a pas été appliqué. Re-vérifie l'**ordre exact** des 3 fichiers SQL (section 3.3). Tu peux ré-appliquer le fichier 1 ou 3 sans danger (les `create table if not exists` et `create policy` sont idempotents).

### `Error: fetch failed` quand Claude valide une réponse

→ Format de `ANTHROPIC_API_KEY` invalide. Doit commencer par `sk-ant-` (pas `sk-` simple — c'était l'ancienne convention OpenAI). Va dans https://console.anthropic.com/settings/keys et regénère.
→ Vérifie aussi que tu as **du crédit** sur ton compte Anthropic (Usage → Billing).

### Page blanche / erreur 500 en prod sans message clair

→ Va dans Vercel → **Logs** (filtrer sur "Error"). 90 % du temps c'est une variable d'env manquante ou un secret invalide. Compare avec `.env.example`.

### `npm run copy-data` ne trouve aucun fichier

→ Tu as cloné le repo sans les JSON. Vérifie que `C:\Users\ACER\Dropbox\TOOLBOX\MathsCM2\poudlard-maths\exercices-jour-01.json` (et les autres) existent bien à la racine du repo.

---

## 11. Maintenance

### 11.1. Mettre à jour le contenu des exercices

1. Édite les fichiers `exercices-jour-XX.json` à la racine du repo
2. `cd app/web && npm run copy-data` (rapatrie dans `data/`)
3. `npm run seed` — utilise `upsert` sur l'`id`, donc les exercices existants sont **mis à jour** et les nouveaux ajoutés (pas de doublons).

> **Note** : si tu veux supprimer des exercices retirés, fais un `delete` manuel en SQL :
> ```sql
> delete from exercises where id in ('j01-e99', 'j02-e99');
> ```
> Il n'y a pas d'option `--truncate` dans le seed actuel — c'est intentionnel pour éviter de perdre les `attempts` qui référencent ces exos.

### 11.2. Ajouter un nouvel enfant

Connecte-toi en parent → dashboard → bouton **"Ajouter un enfant"**. Pas besoin de SQL.

### 11.3. Sauvegarder la base

**Option simple** (dashboard Supabase) :
- Settings → **Database** → **Backups** → bouton pour télécharger. (Free tier = backups quotidiens 7 jours, en lecture seule.)

**Option avancée** (`pg_dump` en local — utile si tu veux exporter en SQL) :

```powershell
# Récupère la connection string dans Supabase → Settings → Database → Connection string (URI)
pg_dump "postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres" > backup-$(Get-Date -Format yyyy-MM-dd).sql
```

```bash
# Mac/Linux
pg_dump "postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres" > backup-$(date +%Y-%m-%d).sql
```

### 11.4. Consulter les logs en prod

- **Erreurs Next.js / API routes** : Vercel → ton projet → **Logs** → filtre "Error"
- **Erreurs SQL / RLS** : Supabase → **Logs** → **Postgres Logs** ou **Auth Logs**
- **Coût Claude en temps réel** : https://console.anthropic.com/settings/usage

### 11.5. Rotation des clés (sécurité)

Tous les 6 mois (ou si fuite suspectée) :

1. **Supabase service_role** : Settings → API → bouton **"Reset"** sur la clé service_role. Mets à jour dans Vercel + `.env.local`.
2. **Anthropic** : console → Settings → Keys → supprime l'ancienne, crée une nouvelle. Mets à jour partout.

---

## Annexe : récap des commandes utiles

```powershell
# Dev local
cd C:\Users\ACER\Dropbox\TOOLBOX\MathsCM2\poudlard-maths\app\web
npm install                      # installer / mettre à jour les dépendances
npm run dev                      # serveur local sur :3000
npm run build                    # tester le build prod en local
npm run lint                     # vérifier le code

# Données
npm run copy-data                # copie JSON racine → app/web/data
npm run seed                     # importe exercices + quiz dans Supabase
npm run create-admin             # crée un compte admin (voir section 5)

# Git
git add .
git commit -m "feat: ..."
git push                         # déclenche un re-deploy auto sur Vercel
```

---

**Bon déploiement !** En cas de problème non couvert ici, consulte les logs (Vercel et Supabase), c'est 90 % de la résolution.
