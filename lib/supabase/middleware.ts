import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { UserRole } from '@/lib/types';

/**
 * Helper appelé depuis middleware.ts à la racine.
 * 1. Refresh la session Supabase si besoin (rotation des cookies).
 * 2. Récupère le rôle du user via la table public.profiles.
 * 3. Applique les règles de redirection :
 *    - /login, /signup, /reset, / : si déjà loggé → /accueil (child) ou /dashboard (parent/admin)
 *    - (child)/* : exige role=child
 *    - (parent)/* : exige role=parent ou admin
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    // Pas de Supabase configuré : on laisse passer (dev local sans .env).
    return response;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: '', ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value: '', ...options });
      },
    },
  });

  // IMPORTANT : ne rien faire entre createServerClient et getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Routes publiques (auth pages + landing + statiques)
  const isAuthPage =
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/reset' ||
    pathname.startsWith('/login/') ||
    pathname.startsWith('/signup/') ||
    pathname.startsWith('/reset/');

  const isLanding = pathname === '/';

  // Routes enfant : /accueil, /jour, /exercice, /quiz, /revisions, /recompenses, /carte
  const childRoutePrefixes = [
    '/accueil',
    '/jour',
    '/exercice',
    '/quiz',
    '/revisions',
    '/recompenses',
    '/carte',
  ];
  const isChildRoute = childRoutePrefixes.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  );

  // Routes parent : /dashboard, /enfants, /alertes, /reglages
  const parentRoutePrefixes = ['/dashboard', '/enfants', '/alertes', '/reglages'];
  const isParentRoute = parentRoutePrefixes.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  );

  // Pas connecté → on bloque les routes protégées
  if (!user) {
    if (isChildRoute || isParentRoute) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  // User connecté : on récupère son rôle
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle<{ role: UserRole }>();

  const role: UserRole | null = profile?.role ?? null;

  // Auth pages alors que déjà loggé → redirige vers tableau de bord adapté
  if (isAuthPage || isLanding) {
    // On laisse la landing accessible même si loggé (info publique),
    // mais les pages auth (login/signup) redirigent.
    if (isAuthPage) {
      const target = request.nextUrl.clone();
      target.pathname = role === 'child' ? '/accueil' : '/dashboard';
      target.search = '';
      return NextResponse.redirect(target);
    }
    return response;
  }

  // Route enfant : exige role=child
  if (isChildRoute && role !== 'child') {
    const target = request.nextUrl.clone();
    target.pathname = role === 'parent' || role === 'admin' ? '/dashboard' : '/login';
    return NextResponse.redirect(target);
  }

  // Route parent : exige role=parent ou admin
  if (isParentRoute && role !== 'parent' && role !== 'admin') {
    const target = request.nextUrl.clone();
    target.pathname = role === 'child' ? '/accueil' : '/login';
    return NextResponse.redirect(target);
  }

  return response;
}
