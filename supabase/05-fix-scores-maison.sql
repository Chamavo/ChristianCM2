-- ============================================================
-- ChristianCM2 — Correctif points maison (bug : compteur bloqué à 0)
-- ============================================================
-- À exécuter dans Supabase SQL Editor (idempotent).
--
-- Le correctif PRINCIPAL est côté code (calculerPoints : 0 → 5 par défaut,
-- sinon points_gagnes valait 0 et le trigger n'incrémentait jamais).
-- Ce fichier durcit le trigger pour le cas limite « maison_choisie NULL » :
-- on rattache alors les points à Gryffondor (la maison affichée par défaut).
-- ============================================================

create or replace function public.update_scores_after_attempt()
returns trigger as $$
declare
  v_maison text;
begin
  if NEW.est_correcte and NEW.points_gagnes > 0 then
    select coalesce(maison_choisie, 'gryffondor')
      into v_maison
      from public.profiles
      where id = NEW.child_id;

    insert into public.scores_maison(child_id, maison, points)
    values (NEW.child_id, coalesce(v_maison, 'gryffondor'), NEW.points_gagnes)
    on conflict (child_id, maison) do update
      set points = scores_maison.points + NEW.points_gagnes;
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

-- ============================================================
-- FIN
-- ============================================================
