'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/** Déconnecte l'apprenant et revient à l'écran de connexion. */
export async function signOutChild() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
