'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

export interface ProgressionPoint {
  jour: number;
  note: number;
  quiz_id: string;
}

interface ProgressionChartProps {
  data: ProgressionPoint[];
  /** Si vrai, l'axe Y est compressé pour mobile */
  compact?: boolean;
}

export default function ProgressionChart({
  data,
  compact = false,
}: ProgressionChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-stone-400 text-sm">
        Aucun quiz passé pour l&apos;instant — la courbe apparaîtra ici dès le
        premier quiz.
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height: compact ? 200 : 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
          <XAxis
            dataKey="jour"
            tickFormatter={(v) => `J${v}`}
            stroke="#78716c"
            fontSize={12}
          />
          <YAxis
            domain={[0, 20]}
            stroke="#78716c"
            fontSize={12}
            tickCount={5}
          />
          <Tooltip
            contentStyle={{
              background: '#fff',
              border: '1px solid #e7e5e4',
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value: number) => [`${value}/20`, 'Note']}
            labelFormatter={(v) => `Quiz du jour ${v}`}
          />
          <ReferenceLine
            y={10}
            stroke="#dc2626"
            strokeDasharray="4 4"
            label={{ value: 'Seuil', fontSize: 10, fill: '#dc2626' }}
          />
          <Line
            type="monotone"
            dataKey="note"
            stroke="#b45309"
            strokeWidth={3}
            dot={{ r: 5, fill: '#b45309' }}
            activeDot={{ r: 7 }}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
