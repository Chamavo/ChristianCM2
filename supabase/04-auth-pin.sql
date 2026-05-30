-- ============================================================
-- ChristianCM2 — Poudlard Maths · Authentification par PIN
-- Fichier 4/4 : table credentials + unicité prénom enfant
-- ============================================================
-- À exécuter APRÈS 01-schema.sql / 02 / 03 dans Supabase SQL Editor.
-- ============================================================

-- ------------------------------------------------------------
-- 1. CREDENTIALS : hash du PIN par profil (admin/parent/enfant)
--    Accès RÉSERVÉ au service_role : RLS activé SANS aucune policy
--    => anon et authenticated n'y ont AUCUN accès. Le serveur
--       (server actions avec la clé service_role) seul peut lire/écrire.
-- ------------------------------------------------------------
create table if not exists public.credentials (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  pin_hash text not null,
  failed_attempts int not null default 0,
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);

comment on table public.credentials is 'Hash des codes PIN (4 chiffres). Accès service_role uniquement.';

alter table public.credentials enable row level security;
-- Volontairement AUCUNE policy : tout accès via anon/authenticated est refusé.

-- ------------------------------------------------------------
-- 2. Unicité du prénom des enfants (connexion enfant = prénom + PIN)
--    Insensible à la casse, limité aux profils role='child'.
-- ------------------------------------------------------------
create unique index if not exists uniq_child_display_name
  on public.profiles (lower(display_name))
  where role = 'child';

-- ============================================================
-- FIN
-- ============================================================
