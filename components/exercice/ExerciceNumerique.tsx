'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ExerciceNumeriqueProps {
  valeur: string;
  onChange: (v: string) => void;
  unite?: string;
  desactive?: boolean;
  /** Tolère décimaux (virgule ou point) */
  decimal?: boolean;
}

export function ExerciceNumerique({
  valeur,
  onChange,
  unite,
  desactive = false,
  decimal = true,
}: ExerciceNumeriqueProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="reponse-num" className="text-amber-100 text-sm">
        Ta réponse {unite ? <>(en {unite})</> : null}
      </Label>
      <div className="flex items-center gap-3">
        <Input
          id="reponse-num"
          type="text"
          inputMode={decimal ? 'decimal' : 'numeric'}
          pattern={decimal ? '[0-9]*[.,]?[0-9]*' : '[0-9]*'}
          value={valeur}
          onChange={(e) => {
            // Filtre : chiffres + virgule/point + signe -
            const v = e.target.value.replace(
              decimal ? /[^0-9.,\-]/g : /[^0-9\-]/g,
              ''
            );
            onChange(v);
          }}
          disabled={desactive}
          autoComplete="off"
          placeholder="0"
          className="bg-white text-stone-900 text-2xl font-bold text-center h-16 tabular-nums"
          aria-label={`Réponse numérique${unite ? ` en ${unite}` : ''}`}
        />
        {unite && (
          <span className="text-amber-200 text-lg font-semibold">{unite}</span>
        )}
      </div>
    </div>
  );
}
