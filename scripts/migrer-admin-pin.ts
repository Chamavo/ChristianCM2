/**
 * migrer-admin-pin.ts
 * -------------------
 * Bascule un compte existant (admin/parent) vers l'authentification par PIN :
 *   - fixe le mot de passe Supabase "fort" dérivé de l'id du profil,
 *   - crée/met à jour son PIN (4 chiffres) dans la table `credentials`.
 *
 * Pré-requis : .env.local avec NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *              AUTH_DERIVATION_SECRET.
 *
 * Usage :
 *   tsx scripts/migrer-admin-pin.ts <email> <pin4chiffres>
 *   ex : tsx scripts/migrer-admin-pin.ts yngatchou@cabinet-chrome.com 0000
 */

import { createClient } from '@supabase/supabase-js';
import { randomBytes, scryptSync, createHmac } from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnv(): void {
  const envPath = path.resolve(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf-8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!m) continue;
    const [, key, val] = m;
    if (!process.env[key]) process.env[key] = val.replace(/^["']|["']$/g, '');
  }
}
loadEnv();

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SECRET = process.env.AUTH_DERIVATION_SECRET;

if (!URL || !KEY) {
  console.error('[migrer-admin-pin] NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants');
  process.exit(1);
}
if (!SECRET) {
  console.error('[migrer-admin-pin] AUTH_DERIVATION_SECRET manquant dans .env.local');
  process.exit(1);
}

const [, , email, pin] = process.argv;
if (!email || !/^[0-9]{4}$/.test(pin ?? '')) {
  console.error('Usage : tsx scripts/migrer-admin-pin.ts <email> <pin4chiffres>');
  process.exit(1);
}

// Doivent rester identiques à lib/auth/pin.ts
function hashPin(p: string): string {
  const salt = randomBytes(16);
  return `${salt.toString('hex')}:${scryptSync(p, salt, 32).toString('hex')}`;
}
function deriveAuthPassword(profileId: string): string {
  return createHmac('sha256', SECRET as string).update(profileId).digest('hex');
}

const supabase = createClient(URL, KEY, { auth: { persistSession: false } });

async function main(): Promise<void> {
  // Retrouver le profil par email
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, role, email')
    .eq('email', email)
    .maybeSingle<{ id: string; role: string; email: string }>();

  if (error || !profile) {
    console.error(`[migrer-admin-pin] Profil introuvable pour ${email}`);
    process.exit(1);
  }

  // 1. Mot de passe fort dérivé
  const { error: pwErr } = await supabase.auth.admin.updateUserById(profile.id, {
    password: deriveAuthPassword(profile.id),
  });
  if (pwErr) {
    console.error('[migrer-admin-pin] Échec maj mot de passe :', pwErr.message);
    process.exit(1);
  }

  // 2. PIN
  const { error: credErr } = await supabase.from('credentials').upsert(
    { profile_id: profile.id, pin_hash: hashPin(pin), failed_attempts: 0, locked_until: null, updated_at: new Date().toISOString() },
    { onConflict: 'profile_id' }
  );
  if (credErr) {
    console.error('[migrer-admin-pin] Échec écriture PIN :', credErr.message);
    process.exit(1);
  }

  console.log(`[migrer-admin-pin] OK — ${email} (role=${profile.role}) peut se connecter avec son e-mail + PIN ${pin}`);
}

main().catch((err) => {
  console.error('[migrer-admin-pin] FATAL', err);
  process.exit(1);
});
