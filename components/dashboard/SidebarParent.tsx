'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Bell,
  Settings,
  UserPlus,
  GraduationCap,
} from 'lucide-react';
import type { Maison } from '@/lib/types';

const EMOJI_MAISON: Record<Maison, string> = {
  gryffondor: '🦁',
  serdaigle: '🦅',
  poufsouffle: '🦡',
  serpentard: '🐍',
};

export interface SidebarEnfant {
  id: string;
  display_name: string | null;
  maison_choisie: Maison | null;
}

interface SidebarParentProps {
  enfants: SidebarEnfant[];
  alertesNonLues: number;
}

export function SidebarParent({ enfants, alertesNonLues }: SidebarParentProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/dashboard'
      ? pathname === '/dashboard'
      : pathname?.startsWith(href);

  return (
    <aside
      className="w-64 shrink-0 bg-stone-100 border-r border-stone-200 min-h-[calc(100vh-4rem)] p-4 space-y-2.5 text-base hidden md:block"
      aria-label="Navigation principale"
    >
      <div className="text-xs uppercase tracking-wider text-stone-500 mb-2 font-bold">
        Vue d&apos;ensemble
      </div>

      <Link
        href="/dashboard"
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors',
          isActive('/dashboard')
            ? 'bg-amber-200 text-amber-900 font-bold'
            : 'hover:bg-stone-200 text-stone-700'
        )}
      >
        <LayoutDashboard className="w-6 h-6" /> Dashboard
      </Link>

      <Link
        href="/alertes"
        className={cn(
          'flex items-center justify-between px-4 py-3 rounded-lg text-base font-medium transition-colors',
          isActive('/alertes')
            ? 'bg-amber-200 text-amber-900 font-bold'
            : 'hover:bg-stone-200 text-stone-700'
        )}
      >
        <span className="flex items-center gap-3">
          <Bell className="w-6 h-6" /> Alertes
        </span>
        {alertesNonLues > 0 && (
          <span
            className="bg-red-600 text-white text-sm px-2.5 py-0.5 rounded-full font-bold"
            aria-label={`${alertesNonLues} alertes non lues`}
          >
            {alertesNonLues}
          </span>
        )}
      </Link>

      <Link
        href="/reglages"
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors',
          isActive('/reglages')
            ? 'bg-amber-200 text-amber-900 font-bold'
            : 'hover:bg-stone-200 text-stone-700'
        )}
      >
        <Settings className="w-6 h-6" /> Réglages
      </Link>

      <div className="text-xs uppercase tracking-wider text-stone-500 mb-2 mt-6 font-bold">
        Mes enfants
      </div>

      {enfants.length === 0 && (
        <p className="text-sm text-stone-400 px-4 py-2">
          Aucun enfant pour le moment.
        </p>
      )}

      {enfants.map((e) => (
        <Link
          key={e.id}
          href={`/enfants/${e.id}`}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-lg text-base transition-colors',
            pathname?.startsWith(`/enfants/${e.id}`)
              ? 'bg-stone-200 font-bold text-stone-900'
              : 'hover:bg-stone-200 text-stone-700'
          )}
        >
          <span className="text-xl" aria-hidden="true">
            {e.maison_choisie ? EMOJI_MAISON[e.maison_choisie] : '👤'}
          </span>
          <span className="truncate">
            {e.display_name ?? 'Enfant sans nom'}
          </span>
        </Link>
      ))}

      <Link
        href="/enfants/nouveau"
        className="flex items-center gap-3 px-4 py-3 rounded-lg text-base hover:bg-stone-200 text-stone-600 font-medium"
      >
        <UserPlus className="w-6 h-6" /> Ajouter un enfant
      </Link>

      <div className="pt-6 mt-6 border-t border-stone-200 text-sm text-stone-400 px-3">
        <GraduationCap className="w-4 h-4 inline mr-1" /> Maths à l&apos;école des sorciers · CM2
      </div>
    </aside>
  );
}
