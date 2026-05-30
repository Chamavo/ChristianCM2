import type { ThemeTaux } from '@/lib/types-dashboard';

interface ThemesFaiblesFortsProps {
  themes: ThemeTaux[];
  /** Nb minimum de tentatives pour qu'un thème soit considéré significatif */
  minTotal?: number;
}

function couleurBarre(pct: number): string {
  if (pct < 50) return 'bg-red-500';
  if (pct < 70) return 'bg-orange-400';
  if (pct < 85) return 'bg-amber-400';
  return 'bg-green-500';
}

function couleurTexte(pct: number): string {
  if (pct < 50) return 'text-red-600';
  if (pct < 70) return 'text-orange-600';
  if (pct < 85) return 'text-amber-600';
  return 'text-green-600';
}

export function ThemesFaiblesForts({
  themes,
  minTotal = 3,
}: ThemesFaiblesFortsProps) {
  const significatifs = themes.filter((t) => t.total >= minTotal);
  const faibles = [...significatifs]
    .filter((t) => t.taux_pct < 70)
    .sort((a, b) => a.taux_pct - b.taux_pct)
    .slice(0, 5);

  const forts = [...significatifs]
    .filter((t) => t.taux_pct >= 80)
    .sort((a, b) => b.taux_pct - a.taux_pct)
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <section className="bg-white rounded-lg p-6 border border-stone-200 shadow-sm">
        <h3 className="font-bold text-lg mb-3 text-red-700">
          Thèmes à renforcer
        </h3>
        {faibles.length === 0 ? (
          <p className="text-stone-400 text-sm italic">
            Pas encore assez de tentatives pour identifier des faiblesses.
          </p>
        ) : (
          <ul className="space-y-3">
            {faibles.map((t) => (
              <li key={t.theme}>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm text-stone-700">{t.theme}</span>
                  <span className={`text-sm font-bold ${couleurTexte(t.taux_pct)}`}>
                    {t.taux_pct} %
                  </span>
                </div>
                <div
                  className="w-full bg-stone-100 rounded-full h-2"
                  role="progressbar"
                  aria-valuenow={t.taux_pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Taux de réussite ${t.theme}`}
                >
                  <div
                    className={`${couleurBarre(t.taux_pct)} h-2 rounded-full transition-all`}
                    style={{ width: `${t.taux_pct}%` }}
                  />
                </div>
                <p className="text-xs text-stone-400 mt-0.5">
                  {t.reussis} / {t.total} réussites
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="bg-white rounded-lg p-6 border border-stone-200 shadow-sm">
        <h3 className="font-bold text-lg mb-3 text-green-700">
          Thèmes maîtrisés
        </h3>
        {forts.length === 0 ? (
          <p className="text-stone-400 text-sm italic">
            Aucun thème maîtrisé pour l&apos;instant — courage !
          </p>
        ) : (
          <ul className="space-y-3">
            {forts.map((t) => (
              <li key={t.theme}>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm text-stone-700">{t.theme}</span>
                  <span className={`text-sm font-bold ${couleurTexte(t.taux_pct)}`}>
                    {t.taux_pct} %
                  </span>
                </div>
                <div
                  className="w-full bg-stone-100 rounded-full h-2"
                  role="progressbar"
                  aria-valuenow={t.taux_pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Taux de réussite ${t.theme}`}
                >
                  <div
                    className={`${couleurBarre(t.taux_pct)} h-2 rounded-full transition-all`}
                    style={{ width: `${t.taux_pct}%` }}
                  />
                </div>
                <p className="text-xs text-stone-400 mt-0.5">
                  {t.reussis} / {t.total} réussites
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
