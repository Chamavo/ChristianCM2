-- ============================================================
-- ChristianCM2 — Anti-triche : journal des pertes de focus
-- ============================================================
-- Enregistre quand l'apprenant quitte l'onglet/la fenêtre pendant un exercice
-- (changement d'onglet, fenêtre minimisée, app externe). Sert à détecter une
-- éventuelle triche (aller chercher la réponse ailleurs).
-- À exécuter dans Supabase SQL Editor (idempotent).
-- ============================================================

create table if not exists public.focus_events (
  id bigserial primary key,
  child_id uuid not null references public.profiles(id) on delete cascade,
  exercise_id text references public.exercises(id),
  jour int,
  type text not null check (type in ('blur', 'hidden')),
  duree_absence_sec int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_focus_child_date
  on public.focus_events(child_id, created_at desc);
create index if not exists idx_focus_child_jour
  on public.focus_events(child_id, jour);

comment on table public.focus_events is
  'Journal anti-triche : sorties d''onglet/fenêtre pendant un exercice.';

alter table public.focus_events enable row level security;

-- L'enfant insère ses propres événements
drop policy if exists focus_insert_self on public.focus_events;
create policy focus_insert_self on public.focus_events
  for insert with check (child_id = auth.uid());

-- Lecture : l'enfant (le sien), le parent de l'enfant, l'admin
drop policy if exists focus_select on public.focus_events;
create policy focus_select on public.focus_events
  for select using (
    child_id = auth.uid()
    or public.is_parent_of(child_id)
    or public.current_user_role() = 'admin'
  );

-- ============================================================
-- FIN
-- ============================================================
