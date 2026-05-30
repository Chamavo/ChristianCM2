import 'server-only';
import {
  randomInt,
  randomBytes,
  scryptSync,
  createHmac,
  timingSafeEqual,
} from 'node:crypto';

/**
 * Authentification par PIN (4 chiffres) au-dessus de Supabase Auth.
 *
 * Principe : l'utilisateur ne saisit qu'un PIN. Le serveur :
 *  1. vérifie le PIN contre un hash stocké (table `credentials`, service_role only),
 *  2. dérive le "vrai" mot de passe Supabase (fort, jamais saisi) à partir d'un
 *     secret serveur + l'id du profil,
 *  3. ouvre la session Supabase avec ce mot de passe fort.
 * => Les RLS basées sur auth.uid() restent intactes.
 */

/** Génère un PIN aléatoire à 4 chiffres (0000–9999). */
export function generatePin(): string {
  return randomInt(0, 10000).toString().padStart(4, '0');
}

/** Hache un PIN avec scrypt + sel aléatoire. Format stocké : "saltHex:hashHex". */
export function hashPin(pin: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(pin, salt, 32);
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

/** Vérifie un PIN contre un hash stocké, en temps constant. */
export function verifyPin(pin: string, stored: string): boolean {
  const [saltHex, hashHex] = stored.split(':');
  if (!saltHex || !hashHex) return false;
  const salt = Buffer.from(saltHex, 'hex');
  const expected = Buffer.from(hashHex, 'hex');
  const actual = scryptSync(pin, salt, expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

/** Vrai si la chaîne est exactement 4 chiffres. */
export function isValidPinFormat(pin: string): boolean {
  return /^[0-9]{4}$/.test(pin);
}

/**
 * Dérive le mot de passe Supabase fort (64 hex) à partir de l'id du profil.
 * Déterministe : on peut le re-calculer à chaque connexion sans le stocker.
 */
export function deriveAuthPassword(profileId: string): string {
  const secret = process.env.AUTH_DERIVATION_SECRET;
  if (!secret) {
    throw new Error('AUTH_DERIVATION_SECRET manquant dans les variables d’environnement');
  }
  return createHmac('sha256', secret).update(profileId).digest('hex');
}
