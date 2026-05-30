'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  icone: string;
  label: string;
  matcher: (path: string) => boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/accueil',
    icone: '🏰',
    label: 'Accueil',
    matcher: (p) => p === '/accueil' || p === '/',
  },
  {
    href: '/exercice',
    icone: '📜',
    label: 'Exercice',
    matcher: (p) => p.startsWith('/exercice') || p.startsWith('/quiz'),
  },
  {
    href: '/carte',
    icone: '🗺',
    label: 'Carte',
    matcher: (p) => p.startsWith('/carte'),
  },
  {
    href: '/recompenses',
    icone: '🏆',
    label: 'Récompenses',
    matcher: (p) => p.startsWith('/recompenses'),
  },
];

export function BottomNav() {
  const pathname = usePathname() ?? '/';

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed bottom-0 inset-x-0 bg-stone-900/95 backdrop-blur border-t-2 border-amber-700 flex justify-around py-2 z-50"
    >
      {NAV_ITEMS.map((item) => {
        const actif = item.matcher(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            aria-current={actif ? 'page' : undefined}
            className={cn(
              'text-center px-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded',
              actif ? 'text-amber-400' : 'text-amber-200 hover:text-amber-300'
            )}
          >
            <div className="text-lg" aria-hidden="true">
              {item.icone}
            </div>
            <div className={cn('text-xs', actif && 'font-bold')}>
              {item.label}
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
