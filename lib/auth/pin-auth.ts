import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { verifyPin } from './pin';

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

export interface CheckPinResult {
  ok: boolean;
  error?: string;
}

/**
 * Vérifie le PIN d'un profil avec verrouillage anti-bruteforce.
 * Utilise OBLIGATOIREMENT un client admin (service_role) car la table
 * `credentials` n'est lisible que par le service_role.
 */
export async function checkPin(
  admin: SupabaseClient,
  profileId: string,
  pin: string
): Promise<CheckPinResult> {
  const { data: cred, error } = await admin
    .from('credentials')
    .select('pin_hash, failed_attempts, locked_until')
    .eq('profile_id', profileId)
    .maybeSingle<{ pin_hash: string; failed_attempts: number; locked_until: string | null }>();

  if (error || !cred) {
    return { ok: false, error: 'Identifiants incorrects.' };
  }

  // Verrouillage actif ?
  if (cred.locked_until && new Date(cred.locked_until) > new Date()) {
    return {
      ok: false,
      error: 'Trop d’essais. Compte bloqué quelques minutes, réessaie plus tard.',
    };
  }

  if (verifyPin(pin, cred.pin_hash)) {
    // Succès : on remet les compteurs à zéro
    await admin
      .from('credentials')
      .update({ failed_attempts: 0, locked_until: null, updated_at: new Date().toISOString() })
      .eq('profile_id', profileId);
    return { ok: true };
  }

  // Échec : on incrémente, on verrouille si seuil atteint
  const attempts = (cred.failed_attempts ?? 0) + 1;
  const update: Record<string, unknown> = {
    failed_attempts: attempts,
    updated_at: new Date().toISOString(),
  };
  if (attempts >= MAX_ATTEMPTS) {
    update.locked_until = new Date(Date.now() + LOCK_MINUTES * 60_000).toISOString();
    update.failed_attempts = 0;
  }
  await admin.from('credentials').update(update).eq('profile_id', profileId);

  return {
    ok: false,
    error:
      attempts >= MAX_ATTEMPTS
        ? 'Trop d’essais. Compte bloqué quelques minutes.'
        : 'PIN incorrect.',
  };
}
