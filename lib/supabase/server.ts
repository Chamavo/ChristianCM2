import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

/**
 * Client Supabase pour Server Components, Route Handlers et Server Actions.
 * Utilise next/headers cookies() pour lire/écrire la session.
 *
 * Note : dans les RSC (lecture seule des cookies), Next renverra une erreur
 * si on tente de set un cookie — on l'attrape silencieusement, le middleware
 * se charge du refresh global de la session.
 */
export function createClient() {
  const cookieStore = cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Variables Supabase manquantes : NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  return createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Server Component : ignore (le middleware refresh la session).
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options });
        } catch {
          // Server Component : ignore.
        }
      },
    },
  });
}

/**
 * Client Supabase "admin" (service role) pour opérations privilégiées
 * (ex: création d'un compte enfant par le parent).
 *
 * ATTENTION : utilise SUPABASE_SERVICE_ROLE_KEY — ne jamais exposer côté client.
 * Réservé aux server actions et route handlers serveur.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY manquant — opération admin impossible'
    );
  }

  // On utilise createServerClient avec un cookie-store factice : la service-role
  // key bypass déjà la RLS et n'a pas besoin de session utilisateur.
  return createServerClient(url, serviceKey, {
    cookies: {
      get: () => undefined,
      set: () => {},
      remove: () => {},
    },
  });
}
