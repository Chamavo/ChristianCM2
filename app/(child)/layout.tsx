import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { BottomNav } from '@/components/layout/BottomNav';
import type { Profile, Maison, ScoreMaison } from '@/lib/types';

export const dynamic = 'force-dynamic';

const EMOJI_MAISON: Record<Maison, string> = {
  gryffondor: '🦁',
  serdaigle: '🦅',
  poufsouffle: '🦡',
  serpentard: '🐍',
};

export default async function ChildLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>();

  if (!profile) {
    redirect('/login');
  }

  if (profile.role !== 'child') {
    // Redirige les parents/admins vers leur espace
    redirect('/dashboard');
  }

  const maison = profile.maison_choisie ?? 'gryffondor';

  // Score de la maison de l'enfant
  let pointsMaison = 0;
  const { data: scores } = await supabase
    .from('scores_maison')
    .select('maison, points')
    .eq('child_id', user.id)
    .returns<ScoreMaison[]>();
  if (scores) {
    pointsMaison = scores.find((s) => s.maison === maison)?.points ?? 0;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1f] via-[#1a1a3e] to-[#2a1a4e] text-amber-50">
      {/* HEADER global enfant */}
      <header className="px-4 py-4 flex items-center justify-between sticky top-0 bg-stone-900/95 backdrop-blur z-40 border-b border-amber-900/30">
        <div>
          <p className="text-xs uppercase tracking-wider opacity-60">Salut</p>
          <h1 className="text-lg font-bold">
            {profile.display_name ?? 'Sorcier'}{' '}
            <span aria-hidden="true">{EMOJI_MAISON[maison]}</span>
          </h1>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase opacity-60">
            Points {maison.charAt(0).toUpperCase() + maison.slice(1)}
          </p>
          <p className="text-amber-300 font-bold text-xl">
            {pointsMaison} <span aria-hidden="true">⚡</span>
          </p>
        </div>
      </header>

      <main className="pb-24">{children}</main>

      <BottomNav />
    </div>
  );
}
