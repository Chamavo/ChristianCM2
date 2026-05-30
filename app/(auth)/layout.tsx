import Link from 'next/link';
import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950 text-amber-50 flex flex-col">
      <header className="p-4 sm:p-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-amber-200/80 hover:text-amber-100 transition-colors"
        >
          <span className="text-2xl">🪄</span>
          <span className="font-bold tracking-tight">Maths à l&apos;école des sorciers</span>
        </Link>
      </header>
      <div className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </main>
  );
}
