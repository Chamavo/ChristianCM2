import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { cn } from '@/lib/utils';
import type { Reward } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface BadgeCatalogue {
  code: string;
  libelle: string;
  description: string;
  emoji: string;
  type: 'badge' | 'palier' | 'chapitre_debloque';
}

// Catalogue des badges potentiellement à obtenir
const CATALOGUE: BadgeCatalogue[] = [
  {
    code: 'sans_faute_j1',
    libelle: 'Sans-faute J1',
    description: '15/15 au jour 1 sans indice',
    emoji: '🥇',
    type: 'badge',
  },
  {
    code: 'serie_5',
    libelle: '5 jours d\'affilée',
    description: 'Travaille 5 jours sans interruption',
    emoji: '🔥',
    type: 'badge',
  },
  {
    code: 'eclair',
    libelle: 'Éclair',
    description: '100 points en moins d\'1 h',
    emoji: '⚡',
    type: 'badge',
  },
  {
    code: 'maitre_grands_nombres',
    libelle: 'Maître des grands nombres',
    description: 'Maîtrise tous les exos de lecture/écriture',
    emoji: '🔢',
    type: 'badge',
  },
  {
    code: 'sorcier_proportions',
    libelle: 'Sorcier des proportions',
    description: 'Maîtrise tout le thème proportionnalité',
    emoji: '⚖️',
    type: 'badge',
  },
  {
    code: 'geometre',
    libelle: 'Géomètre Sorcier',
    description: 'Maîtrise tout le thème géométrie',
    emoji: '📐',
    type: 'badge',
  },
  {
    code: 'palier_100',
    libelle: 'Palier 100',
    description: '100 points pour ta maison',
    emoji: '⭐',
    type: 'palier',
  },
  {
    code: 'palier_250',
    libelle: 'Palier 250',
    description: '250 points pour ta maison',
    emoji: '🌟',
    type: 'palier',
  },
  {
    code: 'palier_500',
    libelle: 'Palier 500',
    description: '500 points pour ta maison',
    emoji: '🪄',
    type: 'palier',
  },
  {
    code: 'chap_1',
    libelle: 'Chapitre 1 lu',
    description: 'École des Sorciers — Privet Drive',
    emoji: '📖',
    type: 'chapitre_debloque',
  },
  {
    code: 'chap_7',
    libelle: 'Chapitre 7 lu',
    description: 'Le Choixpeau magique',
    emoji: '📖',
    type: 'chapitre_debloque',
  },
  {
    code: 'champion_maison',
    libelle: 'Champion de ta maison',
    description: 'Plus haut score parmi les sorciers',
    emoji: '👑',
    type: 'badge',
  },
];

export default async function RecompensesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: rewards } = await supabase
    .from('rewards')
    .select('*')
    .eq('child_id', user.id)
    .order('date_obtention', { ascending: false })
    .returns<Reward[]>();

  const obtenusMap = new Map<string, Reward>();
  for (const r of rewards ?? []) obtenusMap.set(r.code, r);

  const badges = CATALOGUE.filter((b) => b.type === 'badge');
  const paliers = CATALOGUE.filter((b) => b.type === 'palier');
  const chapitres = CATALOGUE.filter((b) => b.type === 'chapitre_debloque');

  // Récompenses obtenues qui ne sont pas dans le catalogue (badges custom)
  const codesCatalogue = new Set(CATALOGUE.map((c) => c.code));
  const obtenusHorsCatalogue = (rewards ?? []).filter(
    (r) => !codesCatalogue.has(r.code)
  );

  const renduGrille = (items: BadgeCatalogue[], labelGroupe: string) => (
    <section className="mb-8" aria-labelledby={`titre-${labelGroupe}`}>
      <h2
        id={`titre-${labelGroupe}`}
        className="text-xs uppercase tracking-wider text-amber-300/70 mb-3"
      >
        {labelGroupe}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map((item) => {
          const obtenu = obtenusMap.get(item.code);
          return (
            <div
              key={item.code}
              className={cn(
                'rounded-xl p-4 text-center border-2 transition-all',
                obtenu
                  ? 'bg-gradient-to-br from-amber-700/40 to-amber-900/40 border-amber-400/60 shadow-lg'
                  : 'bg-stone-800/40 border-stone-700 opacity-60'
              )}
              aria-label={
                obtenu
                  ? `${item.libelle} : obtenu`
                  : `${item.libelle} : à débloquer`
              }
            >
              <div
                className={cn(
                  'text-4xl mb-2',
                  !obtenu && 'grayscale opacity-60'
                )}
                aria-hidden="true"
              >
                {item.emoji}
              </div>
              <p
                className={cn(
                  'text-sm font-bold leading-tight',
                  obtenu ? 'text-amber-100' : 'text-stone-300'
                )}
              >
                {item.libelle}
              </p>
              <p className="text-xs text-amber-200/60 mt-1 leading-tight">
                {item.description}
              </p>
              {obtenu && (
                <p className="text-[10px] uppercase tracking-wider text-amber-300 mt-2">
                  ✓ Obtenu
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <header className="text-center mb-6">
        <h1 className="text-2xl font-bold text-amber-100 mb-1">
          <span aria-hidden="true">🏆</span> Tes récompenses
        </h1>
        <p className="text-amber-200/70 text-sm">
          {obtenusMap.size} sur {CATALOGUE.length} débloqués
        </p>
      </header>

      {renduGrille(badges, 'Badges')}
      {renduGrille(paliers, 'Paliers de points')}
      {renduGrille(chapitres, 'Chapitres débloqués')}

      {obtenusHorsCatalogue.length > 0 && (
        <section className="mb-8" aria-labelledby="titre-bonus">
          <h2
            id="titre-bonus"
            className="text-xs uppercase tracking-wider text-amber-300/70 mb-3"
          >
            Bonus
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {obtenusHorsCatalogue.map((r) => (
              <div
                key={r.id}
                className="rounded-xl p-4 text-center bg-gradient-to-br from-amber-700/40 to-amber-900/40 border-2 border-amber-400/60"
              >
                <div className="text-4xl mb-2" aria-hidden="true">
                  {r.type === 'badge'
                    ? '🏆'
                    : r.type === 'palier'
                      ? '⭐'
                      : '📖'}
                </div>
                <p className="text-sm font-bold text-amber-100">
                  {r.libelle}
                </p>
                {r.description && (
                  <p className="text-xs text-amber-200/60 mt-1">
                    {r.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
