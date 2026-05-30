'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ExerciceRedigeProps {
  type: 'redige_court' | 'redige_libre';
  valeur: string;
  onChange: (v: string) => void;
  desactive?: boolean;
  placeholder?: string;
}

export function ExerciceRedige({
  type,
  valeur,
  onChange,
  desactive = false,
  placeholder,
}: ExerciceRedigeProps) {
  if (type === 'redige_court') {
    return (
      <div className="space-y-2">
        <Label htmlFor="reponse-courte" className="text-amber-100 text-sm">
          Ta réponse
        </Label>
        <Input
          id="reponse-courte"
          type="text"
          value={valeur}
          onChange={(e) => onChange(e.target.value)}
          disabled={desactive}
          placeholder={placeholder ?? 'Ta réponse…'}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className="bg-white text-stone-900 text-lg p-4 h-14"
          aria-label="Réponse courte"
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="reponse-libre" className="text-amber-100 text-sm">
        Explique ton raisonnement
      </Label>
      <textarea
        id="reponse-libre"
        value={valeur}
        onChange={(e) => onChange(e.target.value)}
        disabled={desactive}
        rows={6}
        placeholder={
          placeholder ??
          'Écris ta démarche, tes calculs et la réponse finale…'
        }
        className="w-full bg-white text-stone-900 text-base p-4 rounded-lg border-2 border-stone-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:opacity-60"
        aria-label="Réponse rédigée"
      />
      <p className="text-xs text-amber-200/70">
        Astuce : pose tes calculs, puis termine par « Donc … »
      </p>
    </div>
  );
}
