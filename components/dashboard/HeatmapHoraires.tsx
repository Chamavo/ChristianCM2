import type { HeatmapCell } from '@/lib/types-dashboard';

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const HEURES = Array.from({ length: 15 }, (_, i) => 8 + i); // 8h → 22h

interface HeatmapHorairesProps {
  data: HeatmapCell[];
}

function colorFor(minutes: number): string {
  if (minutes <= 0) return 'bg-stone-100';
  if (minutes < 15) return 'bg-amber-100';
  if (minutes < 30) return 'bg-amber-200';
  if (minutes < 60) return 'bg-amber-400';
  return 'bg-amber-700';
}

function textColorFor(minutes: number): string {
  return minutes >= 60 ? 'text-amber-50' : 'text-stone-700';
}

export function HeatmapHoraires({ data }: HeatmapHorairesProps) {
  // Bucket : Map[`${jour}-${heure}`] = minutes
  const bucket = new Map<string, number>();
  for (const c of data) {
    bucket.set(`${c.jour_semaine}-${c.heure}`, (bucket.get(`${c.jour_semaine}-${c.heure}`) ?? 0) + c.total_minutes);
  }

  // Détecte pic d'activité
  let picJour = -1;
  let picHeure = -1;
  let picMinutes = 0;
  for (const [k, v] of bucket) {
    if (v > picMinutes) {
      picMinutes = v;
      const [j, h] = k.split('-').map(Number);
      picJour = j;
      picHeure = h;
    }
  }

  const empty = bucket.size === 0;

  return (
    <div>
      <div className="overflow-x-auto" role="region" aria-label="Heatmap des horaires de connexion">
        <table className="text-xs border-collapse">
          <thead>
            <tr>
              <th></th>
              {HEURES.map((h) => (
                <th
                  key={h}
                  className="px-1 py-1 font-medium text-stone-500 min-w-[1.75rem]"
                >
                  {h}h
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {JOURS.map((nom, j) => (
              <tr key={nom}>
                <td className="pr-2 py-1 text-stone-500 font-medium">{nom}</td>
                {HEURES.map((h) => {
                  const m = bucket.get(`${j}-${h}`) ?? 0;
                  return (
                    <td
                      key={h}
                      className={`${colorFor(m)} ${textColorFor(m)} w-7 h-7 text-center rounded-sm border border-white text-[10px] leading-none`}
                      title={`${nom} ${h}h : ${m} min`}
                      aria-label={`${nom} ${h}h, ${m} minutes`}
                    >
                      {m > 0 ? m : ''}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-2 mt-4 text-xs text-stone-500 flex-wrap">
        <span>Moins</span>
        <span className="w-4 h-4 bg-stone-100 rounded-sm border border-stone-200" />
        <span className="w-4 h-4 bg-amber-100 rounded-sm" />
        <span className="w-4 h-4 bg-amber-200 rounded-sm" />
        <span className="w-4 h-4 bg-amber-400 rounded-sm" />
        <span className="w-4 h-4 bg-amber-700 rounded-sm" />
        <span>Plus</span>
      </div>

      {empty ? (
        <p className="text-stone-400 text-xs mt-3 italic">
          Aucune session enregistrée sur les 15 derniers jours.
        </p>
      ) : (
        <p className="text-stone-500 text-xs mt-3">
          Pic d&apos;activité : {JOURS[picJour]} {picHeure}h ({picMinutes} min)
        </p>
      )}
    </div>
  );
}
