import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { SidebarParent } from '@/components/dashboard/SidebarParent';
import type { Profile, Maison } from '@/lib/types';
import { LogOut } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function signOutAction() {
  'use server';
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export default async function ParentLayout({
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
    .select('id, email, display_name, role, parent_id, maison_choisie, date_inscription')
    .eq('id', user.id)
    .single<Profile>();

  if (!profile) {
    redirect('/login');
  }

  if (profile.role !== 'parent' && profile.role !== 'admin') {
    redirect('/accueil');
  }

  // Récupère les enfants
  // - admin : tous les enfants
  // - parent : ses enfants
  let enfantsQuery = supabase
    .from('profiles')
    .select('id, display_name, maison_choisie')
    .eq('role', 'child');

  if (profile.role !== 'admin') {
    enfantsQuery = enfantsQuery.eq('parent_id', user.id);
  }

  const { data: enfantsRaw } = await enfantsQuery
    .order('display_name', { ascending: true })
    .returns<Array<{ id: string; display_name: string | null; maison_choisie: Maison | null }>>();

  const enfants = enfantsRaw ?? [];

  // Compte des alertes non lues (parent uniquement, admin = toutes)
  let alertesQuery = supabase
    .from('alerts')
    .select('id', { count: 'exact', head: true })
    .eq('lu', false);
  if (profile.role !== 'admin') {
    alertesQuery = alertesQuery.eq('parent_id', user.id);
  }
  const { count: alertesNonLues } = await alertesQuery;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-sans">
      {/* HEADER */}
      <header className="bg-stone-900 text-amber-100 px-4 sm:px-6 py-3 flex items-center justify-between border-b-4 border-amber-700 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden="true">🪄</span>
          <h1 className="text-lg sm:text-xl font-bold">
            Maths à l&apos;école des sorciers{' '}
            <span className="text-amber-300 font-normal">· Espace Parent</span>
          </h1>
        </div>
        <div className="flex items-center gap-3 sm:gap-5 text-base">
          <span className="hidden sm:inline truncate max-w-[200px] font-medium">
            {profile.display_name ?? profile.email}
            {profile.role === 'admin' && (
              <span className="ml-1 text-amber-300 text-sm">(admin)</span>
            )}
          </span>
          <form action={signOutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-5 py-3 rounded-lg text-base font-bold shadow-lg ring-2 ring-red-400/40 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-300"
              aria-label="Se déconnecter"
            >
              <LogOut className="w-6 h-6" />
              <span>Déconnexion</span>
            </button>
          </form>
        </div>
      </header>

      <div className="flex">
        <SidebarParent
          enfants={enfants}
          alertesNonLues={alertesNonLues ?? 0}
        />

        {/* Navigation mobile compacte (visible sous le header) */}
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 z-30 flex justify-around py-2 text-xs"
          aria-label="Navigation mobile"
        >
          <Link href="/dashboard" className="text-stone-700 px-3 py-1">
            Dashboard
          </Link>
          <Link
            href="/alertes"
            className="text-stone-700 px-3 py-1 inline-flex items-center gap-1"
          >
            Alertes
            {(alertesNonLues ?? 0) > 0 && (
              <span className="bg-red-600 text-white px-1.5 py-0.5 rounded-full text-[10px]">
                {alertesNonLues}
              </span>
            )}
          </Link>
          <Link href="/reglages" className="text-stone-700 px-3 py-1">
            Réglages
          </Link>
        </nav>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto pb-24 md:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
