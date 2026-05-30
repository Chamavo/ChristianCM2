/**
 * creer-admin.ts
 * --------------
 * Crée un utilisateur Supabase (auth) + son profil avec role='admin'.
 *
 * Usage :
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... ADMIN_DISPLAY_NAME="..." npm run create-admin
 *
 * Ou en arguments CLI :
 *   tsx scripts/creer-admin.ts email@x.com motdepasse "Nom Affiché"
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ----- Env loader minimal -----
function loadEnv(): void {
  const envPath = path.resolve(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, 'utf-8');
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!m) continue;
    const [, key, val] = m;
    if (!process.env[key]) {
      process.env[key] = val.replace(/^["']|["']$/g, '');
    }
  }
}
loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('[create-admin] Manque NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// ----- Arguments -----
const [, , argEmail, argPassword, ...argName] = process.argv;

const email = process.env.ADMIN_EMAIL ?? argEmail;
const password = process.env.ADMIN_PASSWORD ?? argPassword;
const displayName = process.env.ADMIN_DISPLAY_NAME ?? argName.join(' ') ?? null;

if (!email || !password) {
  console.error('Usage : tsx scripts/creer-admin.ts <email> <password> [display_name]');
  console.error('   ou : ADMIN_EMAIL=... ADMIN_PASSWORD=... ADMIN_DISPLAY_NAME=... npm run create-admin');
  process.exit(1);
}

if (password.length < 8) {
  console.error('[create-admin] Mot de passe trop court (8 caractères minimum)');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function main(): Promise<void> {
  console.log(`[create-admin] Création du compte admin : ${email}`);

  // 1. Créer l'utilisateur (avec email confirmé)
  const { data: created, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: displayName },
  });

  if (authError) {
    // Si déjà existant, récupère son id
    if (authError.message.toLowerCase().includes('already')) {
      console.warn('[create-admin] Utilisateur déjà existant — on met à jour son profil');
      const { data: users, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) {
        console.error('[create-admin] Impossible de lister :', listError.message);
        process.exit(1);
      }
      const existing = users.users.find((u) => u.email === email);
      if (!existing) {
        console.error('[create-admin] Utilisateur introuvable');
        process.exit(1);
      }
      await upsertProfile(existing.id, email, displayName);
      console.log('[create-admin] OK — profil mis à jour, role=admin');
      return;
    }
    console.error('[create-admin] Erreur création auth :', authError.message);
    process.exit(1);
  }

  const userId = created.user?.id;
  if (!userId) {
    console.error('[create-admin] Pas d\'ID utilisateur retourné');
    process.exit(1);
  }

  await upsertProfile(userId, email, displayName);
  console.log('[create-admin] OK — compte admin créé avec succès.');
  console.log(`               id : ${userId}`);
  console.log(`               email : ${email}`);
}

async function upsertProfile(id: string, email: string, displayName: string | null): Promise<void> {
  const { error } = await supabase.from('profiles').upsert(
    {
      id,
      email,
      display_name: displayName,
      role: 'admin',
      parent_id: null,
    },
    { onConflict: 'id' },
  );
  if (error) {
    console.error('[create-admin] Erreur upsert profile :', error.message);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('[create-admin] FATAL', err);
  process.exit(1);
});
