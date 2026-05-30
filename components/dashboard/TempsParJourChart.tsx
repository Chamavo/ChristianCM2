'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export interface TempsParJourPoint {
  date: string; // ISO date (yyyy-mm-dd)
  minutes: number;
}

interface Props {
  data: TempsParJourPoint[];
}

export default function TempsParJourChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-stone-400 text-sm">
        Aucune session enregistrée.
      </div>
    );
  }

  const display = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: '2-digit',
    }),
  }));

  return (
    <div className="w-full" style={{ height: 240 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={display} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
          <XAxis dataKey="label" stroke="#78716c" fontSize={11} />
          <YAxis stroke="#78716c" fontSize={11} />
          <Tooltip
            contentStyle={{
              background: '#fff',
              border: '1px solid #e7e5e4',
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value: number) => [`${value} min`, 'Temps']}
          />
          <Bar dataKey="minutes" fill="#b45309" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
