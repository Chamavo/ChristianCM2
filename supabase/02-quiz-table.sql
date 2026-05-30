-- ============================================================
-- POUDLARD MATHS — Migration additionnelle : table `quiz`
-- À appliquer APRÈS supabase-schema.sql.
-- ============================================================

-- Table catalogue des quiz Libermann (J2, J4, J6, J8, J10, J12, J14)
create table if not exists public.quiz (
  id              text primary key,                -- ex: 'quiz-j02'
  jour            int  not null check (jour between 1 and 15),
  titre           text not null,
  duree_min       int  not null default 45,
  note_max        numeric(4,2) not null default 20,
  themes_couverts text[],
  ponderations    jsonb,                           -- pondérations par thème/exercice
  exercices_ids   text[],                          -- IDs des exos (q-jXX-N) inclus
  contenu         jsonb,                           -- JSON intégral du quiz (sous-questions, narration, critères Claude)
  created_at      timestamptz not null default now(),
  unique(jour)                                     -- un seul quiz par jour
);

create index if not exists idx_quiz_jour on public.quiz(jour);

-- ============================================================
-- RLS — lecture pour tous les authentifiés (parents, enfants, admins)
-- ============================================================
alter table public.quiz enable row level security;

drop policy if exists quiz_select_all on public.quiz;
create policy quiz_select_all on public.quiz
  for select to authenticated using (true);

-- Pas de policy insert/update/delete : la table est alimentée par le seed
-- via la service-role key, qui bypass RLS.
