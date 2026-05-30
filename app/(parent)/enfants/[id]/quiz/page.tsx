import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Maison, QuizResult } from '@/lib/types';
import { formatDuree } from '@/lib/utils';

export const dynamicParams = true;
export const revalidate = 0;

const EMOJI_MAISON: Record<Maison, string> = {
  gryffondor: '🦁',
  serdaigle: '🦅',
  poufsouffle: '🦡',
  serpentard: '🐍',
};

function colorNote(n: number): string {
  if (n < 10) return 'text-red-600';
  if (n < 14) return 'text-amber-600';
  return 'text-green-600';
}

export default async function QuizPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: enfant } = await supabase
    .from('profiles')
    .select('id, display_name, maison_choisie, role')
    .eq('id', params.id)
    .single<{
      id: string;
      display_name: string | null;
      maison_choisie: Maison | null;
      role: string;
    }>();
  if (!enfant || enfant.role !== 'child') notFound();

  const { data: quizzes } = await supabase
    .from('quiz_results')
    .select('*')
    .eq('child_id', params.id)
    .order('jour', { ascending: true })
    .returns<QuizResult[]>();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 flex items-center gap-2 flex-wrap">
          <span aria-hidden="true">
            {enfant.maison_choisie ? EMOJI_MAISON[enfant.maison_choisie] : '👤'}
          </span>
          {enfant.display_name} · Quiz Libermann
        </h2>
        <Link
          href={`/enfants/${params.id}`}
          className="text-amber-700 text-sm hover:underline"
        >
          ← Retour au tableau de bord
        </Link>
      </div>

      {!quizzes || quizzes.length === 0 ? (
        <div className="bg-white rounded-lg p-8 border border-stone-200 text-center">
          <p className="text-stone-400 italic">
            Aucun quiz passé pour l&apos;instant. Le premier quiz est à la fin du
            jour 2.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizzes.map((q) => (
            <article
              key={q.id}
              className="bg-white rounded-lg p-5 border border-stone-200 shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg text-stone-900">
                    Quiz du jour {q.jour}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {new Date(q.created_at).toLocaleDateString('fr-FR')} ·{' '}
                    {q.duree_sec ? formatDuree(q.duree_sec) : '—'}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-3xl font-bold ${colorNote(Number(q.note))}`}>
                    {Number(q.note).toFixed(1)}
                  </p>
                  <p className="text-xs text-stone-400">/ {q.note_max ?? 20}</p>
                </div>
              </div>

              {q.themes_forts && q.themes_forts.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs font-semibold text-green-700 mb-1">
                    Points forts
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {q.themes_forts.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {q.themes_faibles && q.themes_faibles.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs font-semibold text-red-700 mb-1">
                    À retravailler
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {q.themes_faibles.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {q.feedback_global && (
                <details className="mt-3 text-sm">
                  <summary className="cursor-pointer text-amber-700 font-semibold text-xs">
                    Feedback de Claude
                  </summary>
                  <p className="mt-2 text-stone-600 text-sm whitespace-pre-line">
                    {q.feedback_global}
                  </p>
                </details>
              )}

              {q.details && Array.isArray(q.details) && q.details.length > 0 && (
                <details className="mt-2 text-xs">
                  <summary className="cursor-pointer text-stone-500">
                    Détail par exercice ({q.details.length})
                  </summary>
                  <ul className="mt-2 space-y-1">
                    {(q.details as Array<{
                      id?: string;
                      points?: number;
                      points_max?: number;
                    }>).map((d, i) => (
                      <li key={i} className="flex justify-between text-stone-600">
                        <span>{d.id ?? `Exo ${i + 1}`}</span>
                        <span className="font-mono">
                          {d.points ?? 0}/{d.points_max ?? 1}
                        </span>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
