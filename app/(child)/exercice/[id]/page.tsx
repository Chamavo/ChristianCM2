import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ExerciceClient } from '@/components/exercice/ExerciceClient';
import type { Exercise, Progress } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { id: string };
}

const NB_EXOS_PAR_JOUR = 15;

export default async function ExercicePage({ params }: PageProps) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  let exerciseId = params.id;

  // Cas spécial : `next` → redirige vers le prochain exo recommandé
  if (exerciseId === 'next') {
    const { data: nextExo } = await supabase
      .rpc('moteur_next_exercice', { p_child_id: user.id })
      .single<{ exercise_id: string }>();
    if (nextExo?.exercise_id) {
      redirect(`/exercice/${nextExo.exercise_id}`);
    }
    redirect('/accueil');
  }

  // Cas spécial : `J<n>` → premier exo non maîtrisé du jour n
  if (/^J\d+$/.test(exerciseId)) {
    const jour = parseInt(exerciseId.slice(1), 10);
    const { data: exosJour } = await supabase
      .from('exercises')
      .select('id, ordre_jour')
      .eq('jour', jour)
      .order('ordre_jour', { ascending: true })
      .returns<{ id: string; ordre_jour: number }[]>();

    if (!exosJour || exosJour.length === 0) {
      redirect('/accueil');
    }

    const { data: progJour } = await supabase
      .from('progress')
      .select('exercise_id, statut')
      .eq('child_id', user.id)
      .in(
        'exercise_id',
        exosJour.map((e) => e.id)
      )
      .returns<Pick<Progress, 'exercise_id' | 'statut'>[]>();
    const maitrise = new Set(
      (progJour ?? [])
        .filter((p) => p.statut === 'maitrise')
        .map((p) => p.exercise_id)
    );

    const cible = exosJour.find((e) => !maitrise.has(e.id)) ?? exosJour[0];
    redirect(`/exercice/${cible.id}`);
  }

  // Charge l'exercice
  const { data: exercise, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('id', exerciseId)
    .single<Exercise>();

  if (error || !exercise) {
    notFound();
  }

  // Position dans le jour
  const { data: maitrisesJourRaw } = await supabase
    .from('progress')
    .select('exercise_id, statut, exercises!inner(jour)')
    .eq('child_id', user.id)
    .eq('exercises.jour', exercise.jour)
    .returns<{ exercise_id: string; statut: string }[]>();

  const nbMaitrisesJour =
    (maitrisesJourRaw ?? []).filter((p) => p.statut === 'maitrise').length;

  return (
    <ExerciceClient
      exercise={exercise}
      jourActuel={exercise.jour}
      ordreAffiche={exercise.ordre_jour}
      totalExosJour={NB_EXOS_PAR_JOUR}
      nbMaitrisesJour={nbMaitrisesJour}
    />
  );
}
