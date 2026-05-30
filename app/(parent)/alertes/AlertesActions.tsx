'use client';

import { useState, useTransition } from 'react';
import { marquerLue, marquerToutesLues, regenererAlertes } from './actions';
import { Check, RefreshCw, CheckCheck } from 'lucide-react';

interface MarquerLueButtonProps {
  alertId: number;
}

export function MarquerLueButton({ alertId }: MarquerLueButtonProps) {
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() => start(() => marquerLue(alertId))}
      disabled={pending}
      className="text-xs text-stone-500 hover:text-green-700 inline-flex items-center gap-1 disabled:opacity-50"
      aria-label="Marquer cette alerte comme lue"
    >
      <Check className="w-3 h-3" /> {pending ? '…' : 'Marquer lue'}
    </button>
  );
}

export function MarquerToutesLuesButton() {
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() => start(() => marquerToutesLues())}
      disabled={pending}
      className="bg-stone-200 hover:bg-stone-300 px-3 py-1.5 rounded text-xs font-semibold inline-flex items-center gap-1 disabled:opacity-50"
    >
      <CheckCheck className="w-3 h-3" /> Tout marquer comme lu
    </button>
  );
}

export function RegenererAlertesButton() {
  const [pending, start] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  return (
    <div className="inline-flex items-center gap-2">
      <button
        onClick={() =>
          start(async () => {
            const r = await regenererAlertes();
            setFeedback(
              r.ok
                ? `${r.count} alerte${r.count > 1 ? 's' : ''} régénérée${r.count > 1 ? 's' : ''}`
                : r.error ?? 'Erreur'
            );
          })
        }
        disabled={pending}
        className="bg-amber-700 hover:bg-amber-800 text-white px-3 py-1.5 rounded text-xs font-semibold inline-flex items-center gap-1 disabled:opacity-50"
      >
        <RefreshCw className={`w-3 h-3 ${pending ? 'animate-spin' : ''}`} />
        Régénérer
      </button>
      {feedback && <span className="text-xs text-stone-500">{feedback}</span>}
    </div>
  );
}
