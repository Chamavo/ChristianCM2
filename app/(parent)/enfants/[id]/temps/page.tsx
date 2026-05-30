import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/server';
import { HeatmapHoraires } from '@/components/dashboard/HeatmapHoraires';
import type { HeatmapCell } from '@/lib/types-dashboard';
import type { Maison, Session } from '@/lib/types';
import { Flame } from 'lucide-react';

const TempsParJourChart = dynamic(
  () => import('@/components/dashboard/TempsParJourChart'),
  { ssr: false, loading: () => <div className="h-40 bg-stone-100 rounded animate-pulse" /> }
);

export const dynamicParams = true;
export const revalidate = 0;

const EMOJI_MAISON: Record<Maison, string> = {
  gryffondor: '🦁',
  serdaigle: '🦅',
  poufsouffle: '🦡',
  serpentard: '🐍',
};

function streakJoursConsecutifs(sessions: { debut_at: string }[]): number {
  if (sessions.length === 0) return 0;
  const jours = new Set(
    sessions.map((s) => new Date(s.debut_at).toISOString().slice(0, 10))
  );

  let streak = 0;
  const cur = new Date();
  for (let i = 0; i < 30; i++) {
    const iso = cur.toISOString().slice(0, 10);
    if (jours.has(iso)) {
      streak++;
      cur.setDate(cur.getDate() - 1);
    } else if (streak > 0) {
      break;
    } else {
      cur.setDate(cur.getDate() - 1);
    }
  }
  return streak;
}

export default async function TempsPage({ params }: { params: { id: string } }) {
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

  // Heatmap
  const { data: heatmap } = await supabase
    .from('v_heatmap_horaires')
    .select('*')
    .eq('child_id', params.id)
    .returns<HeatmapCell[]>();

  // Sessions sur les 15 derniers jours
  const debut15j = new Date();
  debut15j.setDate(debut15j.getDate() - 15);

  const { data: sessions } = await supabase
    .from('sessions')
    .select('id, debut_at, fin_at, duree_sec, jour_travaille, nb_exercices_tentes, nb_exercices_maitrises, child_id')
    .eq('child_id', params.id)
    .gte('debut_at', debut15j.toISOString())
    .order('debut_at', { ascending: true })
    .returns<Session[]>();

  // Total par jour
  const parJour = new Map<string, number>();
  for (const s of sessions ?? []) {
    const date = new Date(s.debut_at).toISOString().slice(0, 10);
    const minutes = Math.round((s.duree_sec ?? 0) / 60);
    parJour.set(date, (parJour.get(date) ?? 0) + minutes);
  }
  const tempsParJour = Array.from(parJour.entries())
    .map(([date, minutes]) => ({ date, minutes }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const totalMin = tempsParJour.reduce((acc, p) => acc + p.minutes, 0);
  const streak = streakJoursConsecutifs(sessions ?? []);
  const joursActifs = parJour.size;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 flex items-center gap-2 flex-wrap">
          <span aria-hidden="true">
            {enfant.maison_choisie ? EMOJI_MAISON[enfant.maison_choisie] : '👤'}
          </span>
          {enfant.display_name} · Temps de travail
        </h2>
        <Link
          href={`/enfants/${params.id}`}
          className="text-amber-700 text-sm hover:underline"
        >
          ← Retour au tableau de bord
        </Link>
      </div>

      {/* Badges régularité */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-5 border border-stone-200 shadow-sm">
          <p className="text-stone-500 text-xs uppercase tracking-wider">
            Sur 15 jours
          </p>
          <p className="text-3xl font-bold text-stone-900 mt-1">
            {Math.floor(totalMin / 60)} h {(totalMin % 60).toString().padStart(2, '0')}
          </p>
        </div>
        <div className="bg-white rounded-lg p-5 border border-stone-200 shadow-sm">
          <p className="text-stone-500 text-xs uppercase tracking-wider">
            Jours actifs
          </p>
          <p className="text-3xl font-bold text-stone-900 mt-1">{joursActifs}/15</p>
        </div>
        <div className="bg-white rounded-lg p-5 border border-stone-200 shadow-sm">
          <p className="text-stone-500 text-xs uppercase tracking-wider inline-flex items-center gap-1">
            <Flame className="w-3 h-3 text-orange-500" /> Série en cours
          </p>
          <p className="text-3xl font-bold text-orange-600 mt-1">
            {streak} jour{streak > 1 ? 's' : ''}
          </p>
          {streak >= 3 && (
            <p className="text-xs text-green-600 mt-1">
              Bravo, régularité au top !
            </p>
          )}
        </div>
      </div>

      {/* Heatmap horaires */}
      <section className="bg-white rounded-lg p-4 sm:p-6 border border-stone-200 shadow-sm">
        <h3 className="font-bold text-lg mb-4">Horaires de connexion (15 derniers jours)</h3>
        <HeatmapHoraires data={heatmap ?? []} />
      </section>

      {/* Bar chart par jour */}
      <section className="bg-white rounded-lg p-4 sm:p-6 border border-stone-200 shadow-sm">
        <h3 className="font-bold text-lg mb-4">Temps cumulé par jour</h3>
        <TempsParJourChart data={tempsParJour} />
      </section>
    </div>
  );
}
