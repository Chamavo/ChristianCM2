import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Alert, Maison } from '@/lib/types';
import { AlertCircle, AlertTriangle, Info, Bell } from 'lucide-react';
import {
  MarquerLueButton,
  MarquerToutesLuesButton,
  RegenererAlertesButton,
} from './AlertesActions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Alertes — Poudlard Maths' };

const EMOJI_MAISON: Record<Maison, string> = {
  gryffondor: '🦁',
  serdaigle: '🦅',
  poufsouffle: '🦡',
  serpentard: '🐍',
};

interface PageProps {
  searchParams: {
    onglet?: 'non-lues' | 'toutes';
    enfant?: string;
    severite?: string;
    type?: string;
  };
}

function iconSeverite(s: Alert['severite']) {
  switch (s) {
    case 'urgent':
      return <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />;
    case 'attention':
      return <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />;
    default:
      return <Info className="w-5 h-5 text-sky-600 shrink-0" />;
  }
}

function couleurFond(s: Alert['severite']): string {
  switch (s) {
    case 'urgent':
      return 'bg-red-50 border-red-200';
    case 'attention':
      return 'bg-amber-50 border-amber-200';
    default:
      return 'bg-sky-50 border-sky-200';
  }
}

const TYPES_LABEL: Record<Alert['type'], string> = {
  blocage_prolonge: 'Blocage prolongé',
  abandon: 'Abandon',
  pic_erreurs_theme: "Pic d'erreurs",
  objectif_atteint: 'Objectif atteint',
  quiz_faible: 'Quiz faible',
};

export default async function AlertesPage({ searchParams }: PageProps) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>();
  if (!profile) redirect('/login');

  // Enfants accessibles
  let enfantsQ = supabase
    .from('profiles')
    .select('id, display_name, maison_choisie')
    .eq('role', 'child');
  if (profile.role !== 'admin') enfantsQ = enfantsQ.eq('parent_id', user.id);
  const { data: enfants } = await enfantsQ.returns<
    Array<{ id: string; display_name: string | null; maison_choisie: Maison | null }>
  >();
  const childIds = (enfants ?? []).map((e) => e.id);

  const onglet = searchParams.onglet ?? 'non-lues';

  // Query
  let q = supabase
    .from('alerts')
    .select('*')
    .in('child_id', childIds.length > 0 ? childIds : ['__none__']);

  if (onglet === 'non-lues') q = q.eq('lu', false);
  if (searchParams.enfant) q = q.eq('child_id', searchParams.enfant);
  if (searchParams.severite) q = q.eq('severite', searchParams.severite);
  if (searchParams.type) q = q.eq('type', searchParams.type);

  const { data: alertes } = await q
    .order('severite', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(200)
    .returns<Alert[]>();

  const enfantsById: Record<string, { name: string; maison: Maison | null }> = {};
  for (const e of enfants ?? []) {
    enfantsById[e.id] = {
      name: e.display_name ?? 'Enfant',
      maison: e.maison_choisie,
    };
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-start gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 flex items-center gap-2">
            <Bell className="w-7 h-7 text-amber-700" /> Alertes
          </h2>
          <p className="text-stone-500 text-sm">
            {(alertes ?? []).length} alerte{(alertes ?? []).length > 1 ? 's' : ''}{' '}
            affichée{(alertes ?? []).length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <RegenererAlertesButton />
          <MarquerToutesLuesButton />
        </div>
      </div>

      {/* Onglets */}
      <nav className="border-b border-stone-200 flex gap-2 text-sm" aria-label="Onglets alertes">
        <Link
          href={{ pathname: '/alertes', query: { ...searchParams, onglet: 'non-lues' } }}
          className={
            onglet === 'non-lues'
              ? 'px-3 py-2 border-b-2 border-amber-600 text-amber-700 font-semibold'
              : 'px-3 py-2 text-stone-600 hover:text-amber-700'
          }
        >
          Non lues
        </Link>
        <Link
          href={{ pathname: '/alertes', query: { ...searchParams, onglet: 'toutes' } }}
          className={
            onglet === 'toutes'
              ? 'px-3 py-2 border-b-2 border-amber-600 text-amber-700 font-semibold'
              : 'px-3 py-2 text-stone-600 hover:text-amber-700'
          }
        >
          Toutes
        </Link>
      </nav>

      {/* Filtres */}
      <form
        method="get"
        className="bg-white rounded-lg p-4 border border-stone-200 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
      >
        <input type="hidden" name="onglet" value={onglet} />
        <div>
          <label htmlFor="f-enfant" className="block text-xs font-medium text-stone-600 mb-1">
            Enfant
          </label>
          <select
            id="f-enfant"
            name="enfant"
            defaultValue={searchParams.enfant ?? ''}
            className="w-full border border-stone-300 rounded px-2 py-1 text-sm"
          >
            <option value="">Tous</option>
            {(enfants ?? []).map((e) => (
              <option key={e.id} value={e.id}>
                {e.display_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-sev" className="block text-xs font-medium text-stone-600 mb-1">
            Sévérité
          </label>
          <select
            id="f-sev"
            name="severite"
            defaultValue={searchParams.severite ?? ''}
            className="w-full border border-stone-300 rounded px-2 py-1 text-sm"
          >
            <option value="">Toutes</option>
            <option value="urgent">Urgent</option>
            <option value="attention">Attention</option>
            <option value="info">Info</option>
          </select>
        </div>
        <div>
          <label htmlFor="f-type" className="block text-xs font-medium text-stone-600 mb-1">
            Type
          </label>
          <select
            id="f-type"
            name="type"
            defaultValue={searchParams.type ?? ''}
            className="w-full border border-stone-300 rounded px-2 py-1 text-sm"
          >
            <option value="">Tous</option>
            {Object.entries(TYPES_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded text-sm font-semibold"
        >
          Filtrer
        </button>
      </form>

      {/* Liste */}
      {(!alertes || alertes.length === 0) ? (
        <div className="bg-white rounded-lg p-8 border border-stone-200 text-center">
          <Bell className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500">Aucune alerte à afficher.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {alertes.map((a) => {
            const e = enfantsById[a.child_id];
            return (
              <li
                key={a.id}
                className={`border-l-4 p-4 rounded ${couleurFond(a.severite)} ${
                  a.lu ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {iconSeverite(a.severite)}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap justify-between items-baseline gap-2">
                      <p className="font-semibold text-stone-900">
                        {e?.maison && (
                          <span aria-hidden="true">{EMOJI_MAISON[e.maison]} </span>
                        )}
                        {e?.name ?? 'Enfant'}{' '}
                        <span className="text-stone-500 font-normal text-sm">
                          · {TYPES_LABEL[a.type]}
                        </span>
                      </p>
                      <span className="text-xs text-stone-400">
                        {new Date(a.created_at).toLocaleString('fr-FR')}
                      </span>
                    </div>
                    <p className="text-sm text-stone-700 mt-1">{a.message}</p>
                    <div className="flex justify-between items-center mt-2">
                      <Link
                        href={`/enfants/${a.child_id}`}
                        className="text-xs text-amber-700 hover:underline"
                      >
                        Voir le dashboard →
                      </Link>
                      {!a.lu && <MarquerLueButton alertId={a.id} />}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
