import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { genererRapport } from '@/lib/rapport/genererRapport';
import { BoutonExportJson } from '@/components/dashboard/BoutonExportJson';
import { formatDuree } from '@/lib/utils';
import { AlertTriangle, Clock, Target, Eye } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { id: string };
  searchParams: { jour?: string };
}

export default async function RapportPage({ params, searchParams }: PageProps) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: enfant } = await supabase
    .from('profiles')
    .select('id, display_name, role')
    .eq('id', params.id)
    .single<{ id: string; display_name: string | null; role: string }>();
  if (!enfant || enfant.role !== 'child') notFound();

  // Jour : paramètre, sinon dernier jour avec activité
  let jour = Number(searchParams.jour);
  if (!jour || jour < 1 || jour > 15) {
    const { data: dernier } = await supabase
      .from('attempts')
      .select('jour')
      .eq('child_id', params.id)
      .order('jour', { ascending: false })
      .limit(1)
      .maybeSingle<{ jour: number }>();
    jour = dernier?.jour ?? 1;
  }

  const r = await genererRapport(supabase, params.id, jour);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900">
            Rapport — {enfant.display_name ?? 'Apprenant'}
          </h2>
          <p className="text-stone-500 text-sm">
            Analyse de la journée · généré le{' '}
            {new Date(r.genere_le).toLocaleString('fr-FR')}
          </p>
          <Link
            href={`/enfants/${params.id}`}
            className="text-amber-700 text-sm hover:underline"
          >
            ← Retour au tableau de bord
          </Link>
        </div>
        <BoutonExportJson childId={params.id} jour={jour} />
      </div>

      {/* Sélecteur de jour */}
      <form method="get" className="flex items-end gap-2">
        <div>
          <label htmlFor="jour" className="block text-xs font-medium text-stone-600 mb-1">
            Jour
          </label>
          <select
            id="jour"
            name="jour"
            defaultValue={jour}
            className="border border-stone-300 rounded px-3 py-2 text-sm"
          >
            {Array.from({ length: 15 }, (_, i) => i + 1).map((j) => (
              <option key={j} value={j}>
                Jour {j}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded text-sm font-semibold"
        >
          Afficher
        </button>
      </form>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          icon={<Target className="w-5 h-5" />}
          label="Questions tentées"
          value={`${r.total_questions_tentees}`}
          sub={`${r.total_maitrisees} maîtrisées · ${r.total_reportees} passées`}
        />
        <KpiCard
          icon={<Clock className="w-5 h-5" />}
          label="Temps total"
          value={formatDuree(r.temps_total_sec)}
          sub={`~${formatDuree(r.temps_moyen_par_question_sec)} / question`}
        />
        <KpiCard
          icon={<AlertTriangle className="w-5 h-5" />}
          label="Questions à revoir"
          value={`${r.questions_problematiques.length}`}
          sub="difficulté ou abandon"
        />
        <KpiCard
          icon={<Eye className="w-5 h-5" />}
          label="Sorties d'onglet"
          value={`${r.nb_sorties_onglet}`}
          sub={`${formatDuree(r.duree_absence_totale_sec)} hors écran`}
          alerte={r.nb_sorties_onglet >= 3}
        />
      </div>

      {/* Synthèse / patterns */}
      <section className="bg-white rounded-lg p-5 border border-stone-200 shadow-sm">
        <h3 className="font-bold text-lg mb-3">Synthèse</h3>
        <ul className="space-y-2">
          {r.patterns.map((p, i) => (
            <li key={i} className="text-stone-700 text-sm flex gap-2">
              <span aria-hidden="true">•</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Thèmes */}
      <section className="bg-white rounded-lg p-5 border border-stone-200 shadow-sm">
        <h3 className="font-bold text-lg mb-3">Réussite par thème</h3>
        {r.themes.length === 0 ? (
          <p className="text-stone-400 italic text-sm">
            Aucune donnée pour ce jour.
          </p>
        ) : (
          <div className="space-y-2">
            {r.themes.map((t) => {
              const pct = Math.round(t.taux_reussite * 100);
              const couleur =
                pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500';
              return (
                <div key={t.theme} className="flex items-center gap-3">
                  <span className="w-40 shrink-0 text-sm text-stone-700 truncate">
                    {t.theme}
                  </span>
                  <div className="flex-1 bg-stone-100 rounded-full h-3 overflow-hidden">
                    <div className={`${couleur} h-3 rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-28 shrink-0 text-right text-xs text-stone-500 tabular-nums">
                    {pct}% · ~{t.duree_moyenne_sec}s
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Questions problématiques — énoncé SANS corrigé */}
      <section className="bg-white rounded-lg p-5 border border-stone-200 shadow-sm">
        <h3 className="font-bold text-lg mb-1">
          Questions qui ont posé problème
        </h3>
        <p className="text-xs text-stone-400 mb-4">
          L&apos;énoncé est rappelé pour repérer la question ; le corrigé n&apos;est
          volontairement pas affiché.
        </p>
        {r.questions_problematiques.length === 0 ? (
          <p className="text-green-700 text-sm">
            Aucune question problématique sur cette journée 🎉
          </p>
        ) : (
          <ul className="space-y-3">
            {r.questions_problematiques.map((q) => (
              <li
                key={q.exercise_id}
                className="border border-stone-200 rounded-lg p-3 bg-stone-50"
              >
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  {q.theme && (
                    <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2 py-0.5 rounded">
                      {q.theme}
                    </span>
                  )}
                  {q.competence && (
                    <span className="text-xs text-stone-500">{q.competence}</span>
                  )}
                  <span className="ml-auto text-xs text-stone-500">
                    {formatDuree(q.duree_totale_sec)} · {q.nb_tentatives} essai
                    {q.nb_tentatives > 1 ? 's' : ''}
                  </span>
                </div>
                <p className="text-stone-800 text-sm mb-2">{q.enonce}</p>
                <div className="flex flex-wrap gap-1.5">
                  {q.raisons.map((raison, i) => (
                    <span
                      key={i}
                      className="text-xs bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded"
                    >
                      {raison}
                    </span>
                  ))}
                  {q.maitrise && (
                    <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded">
                      finalement maîtrisée
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  sub,
  alerte = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  alerte?: boolean;
}) {
  return (
    <div
      className={`rounded-lg p-4 border shadow-sm ${
        alerte ? 'bg-red-50 border-red-200' : 'bg-white border-stone-200'
      }`}
    >
      <div
        className={`inline-flex items-center gap-1.5 text-xs font-medium mb-1 ${
          alerte ? 'text-red-600' : 'text-stone-500'
        }`}
      >
        {icon}
        {label}
      </div>
      <p className="text-2xl font-bold text-stone-900">{value}</p>
      {sub && <p className="text-xs text-stone-400 mt-0.5">{sub}</p>}
    </div>
  );
}
