import Link from 'next/link';
import { AlertTriangle, AlertCircle, Info, Bell } from 'lucide-react';
import type { Alert } from '@/lib/types';

interface AlertesPanelProps {
  alertes: Alert[];
  /** Affiche un lien "voir tout" vers /alertes */
  showSeeAll?: boolean;
  /** Si non vide, on affiche aussi le nom de l'enfant */
  childNames?: Record<string, string>;
  /** Mode compact (utilisé en sidebar / cartes resserrées) */
  compact?: boolean;
}

function severiteStyle(s: Alert['severite']) {
  switch (s) {
    case 'urgent':
      return {
        wrap: 'bg-red-50 border-red-500 text-red-900',
        icon: <AlertCircle className="w-5 h-5 text-red-600" />,
      };
    case 'attention':
      return {
        wrap: 'bg-amber-50 border-amber-500 text-amber-900',
        icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
      };
    default:
      return {
        wrap: 'bg-sky-50 border-sky-500 text-sky-900',
        icon: <Info className="w-5 h-5 text-sky-600" />,
      };
  }
}

export function AlertesPanel({
  alertes,
  showSeeAll = false,
  childNames,
  compact = false,
}: AlertesPanelProps) {
  if (alertes.length === 0) {
    return (
      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-green-600" />
          <p className="text-green-900 text-sm">
            Aucune alerte en cours. Tout roule.
          </p>
        </div>
      </div>
    );
  }

  // On regroupe les plus prioritaires d'abord
  const tri = [...alertes].sort((a, b) => {
    const order = { urgent: 0, attention: 1, info: 2 } as const;
    return order[a.severite] - order[b.severite];
  });

  const principale = tri[0];
  const style = severiteStyle(principale.severite);

  return (
    <div className={`${style.wrap} border-l-4 p-4 rounded`}>
      <div className="flex items-start gap-3">
        {style.icon}
        <div className="flex-1 min-w-0">
          <p className="font-bold">
            {tri.length} alerte{tri.length > 1 ? 's' : ''} nécessite
            {tri.length > 1 ? 'nt' : ''} ton attention
          </p>
          <ul className={`mt-1 space-y-1 ${compact ? 'text-xs' : 'text-sm'}`}>
            {tri.slice(0, 5).map((a) => (
              <li key={a.id} className="truncate">
                ·{' '}
                {childNames?.[a.child_id] && (
                  <strong>{childNames[a.child_id]} — </strong>
                )}
                {a.message}
              </li>
            ))}
          </ul>
          {showSeeAll && (
            <Link
              href="/alertes"
              className="inline-block mt-3 text-xs font-semibold underline hover:no-underline"
            >
              Voir toutes les alertes →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
