import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AlertesPanel } from '@/components/dashboard/AlertesPanel';
import { AjouterEnfantDialog } from '@/components/dashboard/AjouterEnfantDialog';
import { GestionEnfant } from '@/components/dashboard/GestionEnfant';
import type { Alert, Maison } from '@/lib/types';
import type { KpiEnfant } from '@/lib/types-dashboard';
import { Clock, Target, Award, ChevronRight } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Dashboard — Maths à l\'école des sorciers',
};

const EMOJI_MAISON: Record<Maison, string> = {
  gryffondor: '🦁',
  serdaigle: '🦅',
  poufsouffle: '🦡',
  serpentard: '🐍',
};

function formatMinutes(min: number): string {
  if (min < 60) return `${min} min`;
  return `${Math.floor(min / 60)} h ${(min % 60).toString().padStart(2, '0')}`;
}

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .single<{ id: string; role: 'admin' | 'parent' | 'child' }>();

  if (!profile) redirect('/login');

  // Liste des enfants
  let enfantsQ = supabase
    .from('profiles')
    .select('id, display_name, maison_choisie')
    .eq('role', 'child');
  if (profile.role !== 'admin') enfantsQ = enfantsQ.eq('parent_id', user.id);

  const { data: enfants } = await enfantsQ
    .order('display_name', { ascending: true })
    .returns<Array<{ id: string; display_name: string | null; maison_choisie: Maison | null }>>();

  // Aucun enfant
  if (!enfants || enfants.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-stone-900">
          Bienvenue !
        </h2>
        <div className="bg-white rounded-lg p-8 border border-stone-200 text-center shadow-sm">
          <p className="text-stone-600 mb-4">
            Tu n&apos;as pas encore d&apos;enfant inscrit. Crée son compte pour
            démarrer le suivi.
          </p>
          <AjouterEnfantDialog />
        </div>
      </div>
    );
  }

  // 1 seul enfant (et pas admin) → redirige vers le détail
  if (profile.role !== 'admin' && enfants.length === 1) {
    redirect(`/enfants/${enfants[0].id}`);
  }

  const childIds = enfants.map((e) => e.id);

  // KPI par enfant via v_kpi_enfant
  const { data: kpis } = await supabase
    .from('v_kpi_enfant')
    .select('*')
    .in('child_id', childIds)
    .returns<KpiEnfant[]>();

  const kpiByChild = new Map<string, KpiEnfant>();
  (kpis ?? []).forEach((k) => kpiByChild.set(k.child_id, k));

  // Top 5 alertes urgentes
  let alertesQ = supabase
    .from('alerts')
    .select('*')
    .eq('lu', false)
    .in('child_id', childIds)
    .order('severite', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: alertes } = await alertesQ.returns<Alert[]>();

  const childNames: Record<string, string> = {};
  for (const e of enfants) childNames[e.id] = e.display_name ?? 'Enfant';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900">
            Vue d&apos;ensemble
          </h2>
          <p className="text-stone-500 text-sm">
            {enfants.length} enfant{enfants.length > 1 ? 's' : ''} suivi
            {enfants.length > 1 ? 's' : ''} {profile.role === 'admin' && '(admin)'}
          </p>
        </div>
        <AjouterEnfantDialog />
      </div>

      {/* Alertes prioritaires */}
      {alertes && alertes.length > 0 && (
        <AlertesPanel alertes={alertes} showSeeAll childNames={childNames} />
      )}

      {/* Grille des enfants */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {enfants.map((e) => {
          const kpi = kpiByChild.get(e.id);
          return (
            <div
              key={e.id}
              className="bg-white rounded-lg p-5 border border-stone-200 shadow-sm hover:shadow-md hover:border-amber-400 transition-all"
            >
            <Link href={`/enfants/${e.id}`} className="group block">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                    <span aria-hidden="true">
                      {e.maison_choisie ? EMOJI_MAISON[e.maison_choisie] : '👤'}
                    </span>
                    {e.display_name ?? 'Enfant'}
                  </h3>
                  <p className="text-xs text-stone-500 capitalize">
                    {e.maison_choisie ?? 'aucune maison'} · Jour{' '}
                    {kpi?.jour_courant ?? 1}/15
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-amber-600 transition-colors" />
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                <div className="bg-stone-50 rounded p-2">
                  <Clock className="w-4 h-4 mx-auto text-stone-400 mb-1" />
                  <p className="text-xs font-bold text-stone-700">
                    {formatMinutes(kpi?.minutes_totales ?? 0)}
                  </p>
                  <p className="text-[10px] text-stone-400">Temps</p>
                </div>
                <div className="bg-stone-50 rounded p-2">
                  <Target className="w-4 h-4 mx-auto text-stone-400 mb-1" />
                  <p className="text-xs font-bold text-stone-700">
                    {kpi?.exercices_maitrises ?? 0}
                    {kpi?.exercices_total ? `/${kpi.exercices_total}` : ''}
                  </p>
                  <p className="text-[10px] text-stone-400">Exos OK</p>
                </div>
                <div className="bg-stone-50 rounded p-2">
                  <Award className="w-4 h-4 mx-auto text-amber-600 mb-1" />
                  <p className="text-xs font-bold text-amber-700">
                    {kpi?.derniere_note_quiz != null
                      ? `${Number(kpi.derniere_note_quiz).toFixed(0)}/20`
                      : '—'}
                  </p>
                  <p className="text-[10px] text-stone-400">Dernier quiz</p>
                </div>
              </div>

              {/* Alertes non lues de cet enfant */}
              {alertes && alertes.some((a) => a.child_id === e.id) && (
                <p className="mt-3 text-xs text-red-600 font-semibold">
                  · {alertes.filter((a) => a.child_id === e.id).length} alerte
                  {alertes.filter((a) => a.child_id === e.id).length > 1 ? 's' : ''}{' '}
                  en cours
                </p>
              )}
            </Link>
              <GestionEnfant childId={e.id} childName={e.display_name ?? 'Enfant'} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
