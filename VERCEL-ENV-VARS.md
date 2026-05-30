# Variables Vercel à configurer

## Étapes
1. Va sur https://vercel.com → projet ChristianCM2
2. **Settings → Environment Variables**
3. **SUPPRIME** d'abord les anciennes variables `VITE_SUPABASE_*` (l'ancien projet Vite)
4. Ajoute les **6 variables ci-dessous**, scope : **Production + Preview + Development**

---

## Les 6 variables à créer

| Nom | Où la trouver | Visibilité |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → "Project URL" | Publique (NEXT_PUBLIC_) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → "anon public" | Publique |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → "service_role" ⚠️ secret | **Secrète** |
| `ANTHROPIC_API_KEY` | https://console.anthropic.com/settings/keys | **Secrète** |
| `NEXT_PUBLIC_APP_URL` | À mettre : `https://christiancm2.vercel.app` | Publique |
| `NEXT_PUBLIC_NB_EXOS_PAR_JOUR` | À mettre : `30` (optionnel, défaut codé) | Publique |

⚠️ **`SUPABASE_SERVICE_ROLE_KEY`** : ne la partage JAMAIS. C'est la clé qui bypass RLS. Elle ne doit exister que dans Vercel (côté serveur) et dans ton `.env.local` (jamais commit).

---

## Vérification après le 1er déploiement

Une fois Vercel a redéployé, va sur https://christiancm2.vercel.app — tu dois voir la landing **Poudlard Maths** (et non l'ancien projet Vite).

Si tu vois encore l'ancien projet : Vercel → Deployments → trois points sur le dernier deploy → **Redeploy** (en décochant "Use existing build cache").

---

## Changement de framework Vite → Next.js

Vercel détecte automatiquement Next.js via `package.json` au prochain build. Pas besoin de toucher au framework preset. Si jamais Vercel reste bloqué sur "Vite" : **Settings → General → Build & Development Settings** → choisir manuellement **Next.js**.
