/**
 * upload-hero.ts
 * --------------
 * Téléverse public/HERO_Potter.png vers un bucket Supabase Storage PUBLIC
 * et imprime l'URL publique. Permet de sortir l'image binaire du dépôt git.
 *
 * Pré-requis : .env.local avec NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
 * Lancement : npm run upload-hero
 */

import { createClient } from '@supabase/supabase-js';
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
if (!URL || !KEY) {
  console.error('[upload-hero] NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants');
  process.exit(1);
}

const BUCKET = 'public-assets';
const OBJECT = 'HERO_Potter.png';

async function main(): Promise<void> {
  const supabase = createClient(URL as string, KEY as string, {
    auth: { persistSession: false },
  });

  // 1. Créer le bucket public (ignore l'erreur s'il existe déjà)
  const { error: bucketErr } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: '5MB',
  });
  if (bucketErr && !/already exists/i.test(bucketErr.message)) {
    console.error('[upload-hero] createBucket :', bucketErr.message);
    process.exit(1);
  }

  // 2. Téléverser le fichier
  const filePath = path.resolve(__dirname, '..', 'public', OBJECT);
  if (!fs.existsSync(filePath)) {
    console.error(`[upload-hero] Fichier introuvable : ${filePath}`);
    process.exit(1);
  }
  const bytes = fs.readFileSync(filePath);

  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(OBJECT, bytes, { contentType: 'image/png', upsert: true });
  if (upErr) {
    console.error('[upload-hero] upload :', upErr.message);
    process.exit(1);
  }

  // 3. URL publique
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(OBJECT);
  console.log('PUBLIC_URL=' + data.publicUrl);
}

main().catch((err) => {
  console.error('[upload-hero] FATAL', err);
  process.exit(1);
});
