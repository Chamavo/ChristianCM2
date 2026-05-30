-- ============================================================
-- POUDLARD MATHS — Schéma Supabase
-- Multi-enfants, RLS strict, traçabilité complète
-- ============================================================

-- =========================
-- 1. PROFILES (étend auth.users)
-- =========================
create type user_role as enum ('admin', 'parent', 'child');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  display_name text,
  role user_role not null default 'child',
  parent_id uuid references public.profiles(id) on delete set null, -- pour enfants : pointe vers le parent
  maison_choisie text check (maison_choisie in ('gryffondor', 'serdaigle', 'poufsouffle', 'serpentard')),
  date_inscription timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_parent on public.profiles(parent_id) where role = 'child';

-- =========================
-- 2. EXERCISES (catalogue statique — chargé depuis JSON)
-- =========================
create table public.exercises (
  id text primary key, -- ex: 'j01-e07'
  jour int not null check (jour between 1 and 15),
  ordre_jour int not null,
  theme text not null,
  sous_theme text,
  scene_hp text,
  narration text,
  type text not null check (type in ('qcm', 'vrai_faux', 'numerique', 'redige_court', 'redige_libre', 'appariement', 'ordre')),
  competence text,
  difficulte_relative int,
  duree_estimee_sec int,
  points_maison int default 0,
  enonce text not null,
  -- contenu structuré stocké en JSONB
  choix jsonb,
  reponse_correcte text,
  reponse_attendue_redige text,
  tolerance_numerique numeric,
  regex_validation text,
  explication_correcte text,
  explications_erreurs jsonb,
  indices jsonb,
  decomposition jsonb,
  reformulation_alternative jsonb,
  validation_par_claude boolean default false,
  criteres_validation_claude jsonb,
  tags text[],
  source_inspiration text,
  created_at timestamptz default now(),
  unique(jour, ordre_jour)
);

create index idx_exercises_jour on public.exercises(jour);
create index idx_exercises_theme on public.exercises(theme);

-- =========================
-- 3. ATTEMPTS (toutes les tentatives, succès ou échec)
-- =========================
create table public.attempts (
  id bigserial primary key,
  child_id uuid not null references public.profiles(id) on delete cascade,
  exercise_id text not null references public.exercises(id),
  jour int not null,
  -- réponse de l'enfant
  reponse_donnee text,
  est_correcte boolean not null,
  -- métriques
  duree_sec int, -- temps pris
  nb_indices_utilises int default 0,
  est_decomposition boolean default false, -- vrai si l'enfant a fait la décomposition
  est_reformulation boolean default false,
  est_replay boolean default false, -- vrai si c'est une 2e/3e tentative
  points_gagnes int default 0,
  maitrise boolean default false, -- bonne réponse + max 1 indice
  -- analyse Claude
  feedback_claude text, -- explication générée pour réponse rédigée
  cout_tokens_claude int default 0,
  -- contexte
  device text check (device in ('mobile', 'desktop', 'tablette')),
  created_at timestamptz not null default now()
);

create index idx_attempts_child_date on public.attempts(child_id, created_at desc);
create index idx_attempts_exercise on public.attempts(exercise_id);
create index idx_attempts_jour on public.attempts(child_id, jour);

-- =========================
-- 4. PROGRESS (état actuel par enfant et par exercice)
-- =========================
create table public.progress (
  id bigserial primary key,
  child_id uuid not null references public.profiles(id) on delete cascade,
  exercise_id text not null references public.exercises(id),
  statut text not null check (statut in ('non_commence', 'en_cours', 'bloque', 'maitrise', 'reporte')),
  nb_tentatives int default 0,
  premiere_tentative_at timestamptz,
  maitrise_at timestamptz,
  prochaine_revision_at timestamptz, -- pour spaced repetition
  unique(child_id, exercise_id)
);

create index idx_progress_child_statut on public.progress(child_id, statut);
create index idx_progress_revision on public.progress(child_id, prochaine_revision_at) where prochaine_revision_at is not null;

-- =========================
-- 5. SESSIONS (suivi temps de travail)
-- =========================
create table public.sessions (
  id bigserial primary key,
  child_id uuid not null references public.profiles(id) on delete cascade,
  debut_at timestamptz not null default now(),
  fin_at timestamptz,
  duree_sec int generated always as (extract(epoch from (fin_at - debut_at))::int) stored,
  jour_travaille int,
  nb_exercices_tentes int default 0,
  nb_exercices_maitrises int default 0,
  device text,
  ip_address inet
);

create index idx_sessions_child on public.sessions(child_id, debut_at desc);

-- =========================
-- 6. QUIZ_RESULTS (mini-épreuves Libermann tous les 2 jours)
-- =========================
create table public.quiz_results (
  id bigserial primary key,
  child_id uuid not null references public.profiles(id) on delete cascade,
  quiz_id text not null, -- ex: 'quiz-j02'
  jour int not null,
  note numeric(4,2) not null check (note >= 0 and note <= 20),
  note_max numeric(4,2) default 20,
  duree_sec int,
  details jsonb, -- détail par exo : id, points obtenus, points max
  themes_faibles text[], -- thèmes où l'enfant a perdu le plus de points
  themes_forts text[],
  feedback_global text, -- texte généré par Claude
  created_at timestamptz default now()
);

create index idx_quiz_child on public.quiz_results(child_id, jour);

-- =========================
-- 7. BLOCKAGES (suivi explicite des blocages détectés)
-- =========================
create table public.blockages (
  id bigserial primary key,
  child_id uuid not null references public.profiles(id) on delete cascade,
  exercise_id text not null references public.exercises(id),
  declencheur text not null check (declencheur in ('2_erreurs', 'temps_long', 'aide_demandee', 'echec_decomposition')),
  strategie_appliquee text check (strategie_appliquee in ('indice', 'decomposition', 'reformulation', 'report')),
  resolu boolean default false,
  duree_blocage_sec int,
  created_at timestamptz default now(),
  resolu_at timestamptz
);

create index idx_blockages_child on public.blockages(child_id, created_at desc);

-- =========================
-- 8. REWARDS (badges et paliers atteints)
-- =========================
create table public.rewards (
  id bigserial primary key,
  child_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('badge', 'palier', 'chapitre_debloque')),
  code text not null, -- ex: 'sans_faute_j01', 'palier_500_pts', 'chapitre_2'
  libelle text not null,
  description text,
  points_associes int,
  date_obtention timestamptz default now()
);

create index idx_rewards_child on public.rewards(child_id, date_obtention desc);

-- =========================
-- 9. SCORES_MAISON (points cumulés par maison pour l'enfant)
-- =========================
create table public.scores_maison (
  child_id uuid not null references public.profiles(id) on delete cascade,
  maison text not null check (maison in ('gryffondor', 'serdaigle', 'poufsouffle', 'serpentard')),
  points int default 0,
  primary key (child_id, maison)
);

-- =========================
-- 10. ALERTS (notifications pour le parent/admin)
-- =========================
create table public.alerts (
  id bigserial primary key,
  child_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid references public.profiles(id) on delete cascade,
  type text not null check (type in ('blocage_prolonge', 'abandon', 'pic_erreurs_theme', 'objectif_atteint', 'quiz_faible')),
  severite text not null check (severite in ('info', 'attention', 'urgent')),
  message text not null,
  metadata jsonb,
  lu boolean default false,
  created_at timestamptz default now()
);

create index idx_alerts_parent_non_lus on public.alerts(parent_id, lu, created_at desc) where lu = false;

-- ============================================================
-- ROW-LEVEL SECURITY (RLS)
-- ============================================================

-- Activer RLS sur toutes les tables sensibles
alter table public.profiles enable row level security;
alter table public.attempts enable row level security;
alter table public.progress enable row level security;
alter table public.sessions enable row level security;
alter table public.quiz_results enable row level security;
alter table public.blockages enable row level security;
alter table public.rewards enable row level security;
alter table public.scores_maison enable row level security;
alter table public.alerts enable row level security;
alter table public.exercises enable row level security;

-- Fonction utilitaire : récupérer le rôle de l'utilisateur courant
create or replace function public.current_user_role() returns text as $$
  select role::text from public.profiles where id = auth.uid()
$$ language sql security definer stable;

-- Fonction utilitaire : est-ce que l'utilisateur courant est parent de child_id ?
create or replace function public.is_parent_of(child uuid) returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = child and parent_id = auth.uid()
  )
$$ language sql security definer stable;

-- ========== PROFILES ==========
-- L'enfant ne voit que son propre profil
-- Le parent voit son profil + ceux de ses enfants
-- L'admin voit tout

create policy profiles_select on public.profiles for select using (
  id = auth.uid()
  or parent_id = auth.uid()
  or current_user_role() = 'admin'
);

create policy profiles_update_self on public.profiles for update using (
  id = auth.uid() or current_user_role() = 'admin'
);

-- ========== EXERCISES (catalogue lisible par tous les utilisateurs authentifiés) ==========
create policy exercises_select_all on public.exercises for select to authenticated using (true);

-- ========== ATTEMPTS ==========
create policy attempts_select on public.attempts for select using (
  child_id = auth.uid()
  or is_parent_of(child_id)
  or current_user_role() = 'admin'
);

create policy attempts_insert_self on public.attempts for insert with check (
  child_id = auth.uid()
);

-- ========== PROGRESS ==========
create policy progress_select on public.progress for select using (
  child_id = auth.uid()
  or is_parent_of(child_id)
  or current_user_role() = 'admin'
);

create policy progress_upsert_self on public.progress for all using (
  child_id = auth.uid()
);

-- ========== SESSIONS ==========
create policy sessions_select on public.sessions for select using (
  child_id = auth.uid()
  or is_parent_of(child_id)
  or current_user_role() = 'admin'
);

create policy sessions_insert_self on public.sessions for insert with check (
  child_id = auth.uid()
);

create policy sessions_update_self on public.sessions for update using (
  child_id = auth.uid()
);

-- ========== QUIZ_RESULTS ==========
create policy quiz_select on public.quiz_results for select using (
  child_id = auth.uid()
  or is_parent_of(child_id)
  or current_user_role() = 'admin'
);

create policy quiz_insert_self on public.quiz_results for insert with check (
  child_id = auth.uid()
);

-- ========== BLOCKAGES ==========
create policy blockages_select on public.blockages for select using (
  child_id = auth.uid()
  or is_parent_of(child_id)
  or current_user_role() = 'admin'
);

-- ========== REWARDS ==========
create policy rewards_select on public.rewards for select using (
  child_id = auth.uid()
  or is_parent_of(child_id)
  or current_user_role() = 'admin'
);

-- ========== SCORES_MAISON ==========
create policy scores_select on public.scores_maison for select using (
  child_id = auth.uid()
  or is_parent_of(child_id)
  or current_user_role() = 'admin'
);

-- ========== ALERTS ==========
-- Le parent ne voit que ses alertes
create policy alerts_select_parent on public.alerts for select using (
  parent_id = auth.uid() or current_user_role() = 'admin'
);

create policy alerts_update_parent on public.alerts for update using (
  parent_id = auth.uid()
);

-- ============================================================
-- VUES UTILES POUR LE DASHBOARD
-- ============================================================

-- Vue : progression globale par enfant
create or replace view public.v_dashboard_enfant as
select
  p.id as child_id,
  p.display_name,
  p.maison_choisie,
  count(distinct pr.exercise_id) filter (where pr.statut = 'maitrise') as exercices_maitrises,
  count(distinct pr.exercise_id) as exercices_tentes,
  coalesce(sum(a.points_gagnes), 0) as points_totaux,
  coalesce(sum(s.duree_sec), 0) / 60 as minutes_totales,
  max(a.created_at) as derniere_activite,
  (select avg(note) from public.quiz_results where child_id = p.id) as note_moyenne_quiz
from public.profiles p
left join public.progress pr on pr.child_id = p.id
left join public.attempts a on a.child_id = p.id
left join public.sessions s on s.child_id = p.id
where p.role = 'child'
group by p.id;

-- Vue : exercices ratés récents (pour debug)
create or replace view public.v_exercices_rates as
select
  a.child_id,
  a.exercise_id,
  e.jour,
  e.theme,
  e.enonce,
  a.reponse_donnee,
  a.duree_sec,
  a.nb_indices_utilises,
  a.created_at
from public.attempts a
join public.exercises e on e.id = a.exercise_id
where a.est_correcte = false
order by a.created_at desc;

-- ============================================================
-- TRIGGERS UTILES
-- ============================================================

-- Trigger : mettre à jour scores_maison après une tentative correcte
create or replace function public.update_scores_after_attempt()
returns trigger as $$
declare
  v_maison text;
begin
  if NEW.est_correcte and NEW.points_gagnes > 0 then
    select maison_choisie into v_maison from public.profiles where id = NEW.child_id;
    if v_maison is not null then
      insert into public.scores_maison(child_id, maison, points)
      values (NEW.child_id, v_maison, NEW.points_gagnes)
      on conflict (child_id, maison) do update
        set points = scores_maison.points + NEW.points_gagnes;
    end if;
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger trg_attempts_update_scores
after insert on public.attempts
for each row execute function public.update_scores_after_attempt();

-- Trigger : initialiser scores_maison à 0 pour les 4 maisons à la création du profil
create or replace function public.init_scores_for_new_child()
returns trigger as $$
begin
  if NEW.role = 'child' then
    insert into public.scores_maison(child_id, maison, points) values
      (NEW.id, 'gryffondor', 0),
      (NEW.id, 'serdaigle', 0),
      (NEW.id, 'poufsouffle', 0),
      (NEW.id, 'serpentard', 0)
    on conflict do nothing;
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger trg_init_scores
after insert on public.profiles
for each row execute function public.init_scores_for_new_child();
