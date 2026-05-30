-- ============================================================
-- POUDLARD MATHS — Vues + RPC pour le dashboard parent/admin
-- À exécuter APRÈS supabase-schema.sql
-- ============================================================

-- ============================================================
-- V_HEATMAP_HORAIRES
-- Agrège sessions sur les 15 derniers jours, regroupe par
-- (jour_semaine, heure). Convention : 0 = Lundi ... 6 = Dimanche.
-- En Postgres EXTRACT(DOW) renvoie 0=Dim..6=Sam → on remappe.
-- ============================================================
create or replace view public.v_heatmap_horaires as
with bornes as (
  select
    s.child_id,
    s.debut_at,
    coalesce(s.fin_at, s.debut_at + interval '5 minutes') as fin_at
  from public.sessions s
  where s.debut_at >= (now() - interval '15 days')
),
expanded as (
  -- Pour chaque session, on étale la durée par tranches d'heures.
  -- Approximation : on attribue la totalité de la session à l'heure de debut_at.
  -- (Pour > 1h on splitterait — acceptable ici, sessions enfants ~30-45 min.)
  select
    child_id,
    ((extract(dow from debut_at)::int + 6) % 7) as jour_semaine, -- 0=Lun..6=Dim
    extract(hour from debut_at)::int as heure,
    extract(epoch from (fin_at - debut_at))::int / 60 as minutes
  from bornes
)
select
  child_id,
  jour_semaine,
  heure,
  sum(minutes)::int as total_minutes
from expanded
group by child_id, jour_semaine, heure;

-- ============================================================
-- V_THEMES_TAUX_REUSSITE
-- Pour chaque (enfant, thème) : total, réussis, taux %.
-- ============================================================
create or replace view public.v_themes_taux_reussite as
select
  a.child_id,
  e.theme,
  count(*)::int as total,
  count(*) filter (where a.est_correcte)::int as reussis,
  case when count(*) = 0 then 0
       else round((count(*) filter (where a.est_correcte))::numeric * 100.0 / count(*), 1)
  end as taux_pct
from public.attempts a
join public.exercises e on e.id = a.exercise_id
group by a.child_id, e.theme;

-- ============================================================
-- V_RESUME_JOUR
-- Pour chaque (enfant, jour) : exos totaux, maîtrisés, ratés, %.
-- ============================================================
create or replace view public.v_resume_jour as
select
  p.child_id,
  p.exercise_id,
  e.jour,
  p.statut
from public.progress p
join public.exercises e on e.id = p.exercise_id;

create or replace view public.v_resume_jour_agg as
select
  child_id,
  jour,
  count(*)::int as nb_exos_total,
  count(*) filter (where statut = 'maitrise')::int as nb_maitrises,
  count(*) filter (where statut = 'bloque')::int as nb_rates,
  case when count(*) = 0 then 0
       else round((count(*) filter (where statut = 'maitrise'))::numeric * 100.0 / count(*), 1)
  end as pct_maitrise
from public.v_resume_jour
group by child_id, jour;

-- ============================================================
-- V_KPI_ENFANT
-- Enrichit v_dashboard_enfant : derniere_note_quiz, points_maison_total,
-- badges_count, jour_courant (max jour avec activité), exercices_total.
-- ============================================================
create or replace view public.v_kpi_enfant as
select
  d.child_id,
  d.display_name,
  d.maison_choisie,
  d.exercices_maitrises,
  d.exercices_tentes,
  (select count(*) from public.exercises) as exercices_total,
  d.points_totaux,
  d.minutes_totales,
  d.derniere_activite,
  d.note_moyenne_quiz,
  (
    select q.note
    from public.quiz_results q
    where q.child_id = d.child_id
    order by q.created_at desc
    limit 1
  ) as derniere_note_quiz,
  coalesce(
    (
      select sum(sm.points)::int
      from public.scores_maison sm
      where sm.child_id = d.child_id
    ),
    0
  ) as points_maison_total,
  coalesce(
    (
      select count(*)::int
      from public.rewards r
      where r.child_id = d.child_id and r.type = 'badge'
    ),
    0
  ) as badges_count,
  coalesce(
    (
      select max(a.jour)
      from public.attempts a
      where a.child_id = d.child_id
    ),
    1
  ) as jour_courant
from public.v_dashboard_enfant d;

-- ============================================================
-- RPC : MARQUER_ALERTE_LUE
-- ============================================================
create or replace function public.marquer_alerte_lue(p_alert_id bigint)
returns void
language plpgsql
security definer
as $$
begin
  update public.alerts
  set lu = true
  where id = p_alert_id
    and (parent_id = auth.uid() or public.current_user_role() = 'admin');
end;
$$;

grant execute on function public.marquer_alerte_lue(bigint) to authenticated;

-- ============================================================
-- RPC : MARQUER_TOUTES_ALERTES_LUES (pour un enfant donné, optionnel)
-- ============================================================
create or replace function public.marquer_toutes_alertes_lues(p_child_id uuid default null)
returns int
language plpgsql
security definer
as $$
declare
  v_count int;
begin
  update public.alerts
  set lu = true
  where lu = false
    and (parent_id = auth.uid() or public.current_user_role() = 'admin')
    and (p_child_id is null or child_id = p_child_id);
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

grant execute on function public.marquer_toutes_alertes_lues(uuid) to authenticated;

-- ============================================================
-- RPC : GENERER_ALERTES_POUR_ENFANT
-- Détecte 4 types d'alertes et les insère dans `alerts`.
--   1. blocage_prolonge : un blockage actif (resolu=false) ouvert depuis > 15 min
--   2. abandon : >24h sans aucune tentative ET l'enfant a déjà été actif au moins 3 jours
--   3. pic_erreurs_theme : >50% d'erreurs sur un même thème sur 24h (min 4 tentatives)
--   4. quiz_faible : un quiz récent (<48h) avec note < 10/20
-- Renvoie le nb d'alertes générées.
-- Évite les doublons grâce à un dedup logique (même type+child_id+metadata.exo dans la dernière journée).
-- ============================================================
create or replace function public.generer_alertes_pour_enfant(p_child_id uuid)
returns int
language plpgsql
security definer
as $$
declare
  v_parent_id uuid;
  v_inserts int := 0;
  v_display text;
  v_count int;
  r record;
begin
  -- Récupère le parent de l'enfant
  select parent_id, display_name
    into v_parent_id, v_display
  from public.profiles
  where id = p_child_id and role = 'child';

  if v_parent_id is null then
    return 0;
  end if;

  -- 1. BLOCAGE PROLONGÉ -----------------------------------------------------
  for r in
    select b.id, b.exercise_id, e.theme, b.created_at
    from public.blockages b
    join public.exercises e on e.id = b.exercise_id
    where b.child_id = p_child_id
      and b.resolu = false
      and b.created_at < now() - interval '15 minutes'
      and not exists (
        select 1 from public.alerts al
        where al.child_id = p_child_id
          and al.type = 'blocage_prolonge'
          and al.created_at > now() - interval '24 hours'
          and (al.metadata->>'exercise_id') = b.exercise_id
      )
  loop
    insert into public.alerts (child_id, parent_id, type, severite, message, metadata)
    values (
      p_child_id,
      v_parent_id,
      'blocage_prolonge',
      'urgent',
      coalesce(v_display, 'L''enfant') || ' bloque depuis plus de 15 min sur l''exo ' || r.exercise_id || ' (' || r.theme || ')',
      jsonb_build_object('exercise_id', r.exercise_id, 'theme', r.theme, 'blockage_id', r.id)
    );
    v_inserts := v_inserts + 1;
  end loop;

  -- 2. ABANDON --------------------------------------------------------------
  select count(distinct jour) into v_count
  from public.attempts where child_id = p_child_id;

  if v_count >= 3 then
    if not exists (
      select 1 from public.attempts
      where child_id = p_child_id and created_at > now() - interval '24 hours'
    ) then
      if not exists (
        select 1 from public.alerts al
        where al.child_id = p_child_id
          and al.type = 'abandon'
          and al.created_at > now() - interval '24 hours'
      ) then
        insert into public.alerts (child_id, parent_id, type, severite, message, metadata)
        values (
          p_child_id, v_parent_id, 'abandon', 'attention',
          coalesce(v_display, 'L''enfant') || ' ne s''est pas connecté depuis plus de 24 h.',
          jsonb_build_object('derniere_activite', (
            select max(created_at) from public.attempts where child_id = p_child_id
          ))
        );
        v_inserts := v_inserts + 1;
      end if;
    end if;
  end if;

  -- 3. PIC ERREURS SUR UN THÈME --------------------------------------------
  for r in
    select e.theme,
           count(*) as total,
           count(*) filter (where not a.est_correcte) as nb_err,
           round(count(*) filter (where not a.est_correcte)::numeric * 100.0 / count(*), 0) as pct_err
    from public.attempts a
    join public.exercises e on e.id = a.exercise_id
    where a.child_id = p_child_id
      and a.created_at > now() - interval '24 hours'
    group by e.theme
    having count(*) >= 4
       and count(*) filter (where not a.est_correcte)::numeric / count(*) > 0.5
  loop
    if not exists (
      select 1 from public.alerts al
      where al.child_id = p_child_id
        and al.type = 'pic_erreurs_theme'
        and al.created_at > now() - interval '24 hours'
        and (al.metadata->>'theme') = r.theme
    ) then
      insert into public.alerts (child_id, parent_id, type, severite, message, metadata)
      values (
        p_child_id, v_parent_id, 'pic_erreurs_theme', 'attention',
        coalesce(v_display, 'L''enfant') || ' : ' || r.pct_err || ' % d''erreurs sur "' || r.theme || '" en 24 h.',
        jsonb_build_object('theme', r.theme, 'pct_err', r.pct_err, 'total', r.total)
      );
      v_inserts := v_inserts + 1;
    end if;
  end loop;

  -- 4. QUIZ FAIBLE ---------------------------------------------------------
  for r in
    select id, note, jour, created_at
    from public.quiz_results
    where child_id = p_child_id
      and created_at > now() - interval '48 hours'
      and note < 10
  loop
    if not exists (
      select 1 from public.alerts al
      where al.child_id = p_child_id
        and al.type = 'quiz_faible'
        and (al.metadata->>'quiz_result_id')::bigint = r.id
    ) then
      insert into public.alerts (child_id, parent_id, type, severite, message, metadata)
      values (
        p_child_id, v_parent_id, 'quiz_faible',
        case when r.note < 7 then 'urgent' else 'attention' end,
        coalesce(v_display, 'L''enfant') || ' a obtenu ' || r.note || '/20 au quiz du jour ' || r.jour || '.',
        jsonb_build_object('quiz_result_id', r.id, 'jour', r.jour, 'note', r.note)
      );
      v_inserts := v_inserts + 1;
    end if;
  end loop;

  return v_inserts;
end;
$$;

grant execute on function public.generer_alertes_pour_enfant(uuid) to authenticated;

-- ============================================================
-- VUE EXERCICES RATÉS ENRICHIE (avec bonne réponse)
-- ============================================================
create or replace view public.v_exercices_rates_detail as
select
  a.id as attempt_id,
  a.child_id,
  a.exercise_id,
  e.jour,
  e.theme,
  e.enonce,
  a.reponse_donnee,
  coalesce(e.reponse_correcte, e.reponse_attendue_redige) as reponse_correcte,
  a.duree_sec,
  a.nb_indices_utilises,
  a.created_at
from public.attempts a
join public.exercises e on e.id = a.exercise_id
where a.est_correcte = false;
