'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, RotateCcw, Trash2 } from 'lucide-react';
import { resetChildPin, resetChildProgress, deleteChild } from '@/app/(parent)/enfants/actions';

interface GestionEnfantProps {
  childId: string;
  childName: string;
}

export function GestionEnfant({ childId, childName }: GestionEnfantProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pin, setPin] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  function handleResetPin() {
    setMsg(null);
    startTransition(async () => {
      const res = await resetChildPin(childId);
      if (res.pin) setPin(res.pin);
      else setMsg(res.error ?? 'Erreur');
      router.refresh();
    });
  }

  function handleResetProgress() {
    if (!window.confirm(`Remettre toute la progression de ${childName} à zéro ? Action irréversible.`)) return;
    setMsg(null);
    startTransition(async () => {
      const res = await resetChildProgress(childId);
      setMsg(res.ok ? 'Progression réinitialisée.' : res.error ?? 'Erreur');
      router.refresh();
    });
  }

  function handleDelete() {
    if (!window.confirm(`Supprimer définitivement ${childName} et toute sa progression ?`)) return;
    startTransition(async () => {
      const res = await deleteChild(childId);
      if (res.error) setMsg(res.error);
      router.refresh();
    });
  }

  return (
    <div className="mt-3 border-t border-stone-100 pt-3">
      {pin && (
        <div className="mb-2 rounded-md bg-emerald-50 border border-emerald-200 p-2 text-center">
          <span className="text-xs text-emerald-700">Nouveau PIN : </span>
          <span className="font-black tracking-[0.3em] text-emerald-900 tabular-nums">{pin}</span>
        </div>
      )}
      {msg && <p className="mb-2 text-xs text-stone-600">{msg}</p>}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleResetPin}
          disabled={isPending}
          className="inline-flex items-center gap-1 rounded-md bg-stone-50 px-2.5 py-1.5 text-xs font-medium text-stone-700 border border-stone-200 hover:bg-stone-100 disabled:opacity-50"
        >
          <KeyRound className="w-3.5 h-3.5" /> Nouveau PIN
        </button>
        <button
          onClick={handleResetProgress}
          disabled={isPending}
          className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-700 border border-amber-200 hover:bg-amber-100 disabled:opacity-50"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Réinitialiser
        </button>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 border border-red-200 hover:bg-red-100 disabled:opacity-50"
        >
          <Trash2 className="w-3.5 h-3.5" /> Supprimer
        </button>
      </div>
    </div>
  );
}
