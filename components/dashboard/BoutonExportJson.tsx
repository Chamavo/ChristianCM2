'use client';

import { useState } from 'react';
import { FileJson } from 'lucide-react';

interface BoutonExportJsonProps {
  childId: string;
  jour: number;
}

/** Télécharge le rapport JSON brut de la journée (données de comportement). */
export function BoutonExportJson({ childId, jour }: BoutonExportJsonProps) {
  const [enCours, setEnCours] = useState(false);

  const exporter = async () => {
    setEnCours(true);
    try {
      const res = await fetch(`/api/rapport?child=${childId}&jour=${jour}`);
      if (!res.ok) throw new Error('export-fail');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport-jour${jour}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert('Export impossible pour le moment. Réessaie.');
    } finally {
      setEnCours(false);
    }
  };

  return (
    <button
      onClick={exporter}
      disabled={enCours}
      className="inline-flex items-center gap-2 bg-stone-800 hover:bg-stone-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-sm disabled:opacity-60"
    >
      <FileJson className="w-5 h-5" />
      {enCours ? 'Export…' : 'Exporter JSON'}
    </button>
  );
}
