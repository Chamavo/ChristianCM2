import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { QuizClient } from './QuizClient';
import type { Quiz, Exercise } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { id: string };
}

export default async function QuizPage({ params }: PageProps) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  let quizId = params.id;

  // Cas alias `J<n>` → charger le quiz du jour n
  if (/^J\d+$/.test(quizId)) {
    const jour = parseInt(quizId.slice(1), 10);
    const { data: q } = await supabase
      .from('quizzes')
      .select('id')
      .eq('jour', jour)
      .single<{ id: string }>();
    if (!q) notFound();
    quizId = q.id;
  }

  const { data: quiz, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('id', quizId)
    .single<Quiz>();
  if (error || !quiz) notFound();

  // Charge les exos du quiz (table de jointure quiz_exercises)
  const { data: quizExos } = await supabase
    .from('quiz_exercises')
    .select('ordre, exercise:exercises(*)')
    .eq('quiz_id', quizId)
    .order('ordre', { ascending: true })
    .returns<{ ordre: number; exercise: Exercise }[]>();

  const exercises = (quizExos ?? []).map((qe) => qe.exercise);

  if (exercises.length === 0) {
    notFound();
  }

  return <QuizClient quiz={quiz} exercises={exercises} />;
}
