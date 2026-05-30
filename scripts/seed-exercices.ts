/**
 * seed-exercices.ts
 * -----------------
 * Charge les 15 fichiers exercices-jour-XX.json et les 7 quiz-jXX.json
 * depuis data/exercices/ et data/quiz/ vers Supabase.
 *
 * Pré-requis :
 *   - .env.local contient :
 *       NEXT_PUBLIC_SUPABASE_URL=...
 *       SUPABASE_SERVICE_ROLE_KEY=...
 *   - Les migrations Supabase (supabase/*.sql) ont été appliquées dans l'ordre.
 *
 * Lancement :
 *   npm run seed
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { Exercise, JourFichier, Quiz } from '../lib/types';

// ----- Chemins -----
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// scripts/ -> remonte 1 niveau pour atteindre la racine projet
const PROJECT_ROOT = path.resolve(__dirname, '..');
const DATA_EXOS_DIR = path.join(PROJECT_ROOT, 'data', 'exercices');
const DATA_QUIZ_DIR = path.join(PROJECT_ROOT, 'data', 'quiz');
// Fallback : ancien layout (JSON à plat dans data/)
const DATA_DIR_LOCAL = path.join(PROJECT_ROOT, 'data');

// ----- Env -----
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
  console.error('[seed] Variables manquantes : NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis dans .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ----- Helpers -----
const c = {
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  blue: (s: string) => `\x1b[34m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
};

function findFile(filename: string): string | null {
  const isQuiz = filename.startsWith('quiz-');
  const candidates = [
    path.join(isQuiz ? DATA_QUIZ_DIR : DATA_EXOS_DIR, filename),
    path.join(DATA_DIR_LOCAL, filename),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function safeReadJson<T>(filepath: string): T | null {
  try {
    const raw = fs.readFileSync(filepath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(c.red(`  [JSON invalide] ${filepath}`), err instanceof Error ? err.message : err);
    return null;
  }
}

function validateExercise(e: any, jour: number): e is Exercise {
  const required = ['id', 'ordre_jour', 'theme', 'type', 'enonce'];
  for (const f of required) {
    if (e[f] === undefined || e[f] === null || e[f] === '') {
      console.warn(c.yellow(`  [skip] J${jour} exo ${e?.id ?? '???'} — champ manquant : ${f}`));
      return false;
    }
  }
  return true;
}

function exerciseToRow(e: Exercise, jour: number) {
  return {
    id: e.id,
    jour,
    ordre_jour: e.ordre_jour,
    theme: e.theme,
    sous_theme: e.sous_theme ?? null,
    scene_hp: e.scene_hp ?? null,
    narration: e.narration ?? null,
    type: e.type,
    competence: e.competence ?? null,
    difficulte_relative: e.difficulte_relative ?? null,
    duree_estimee_sec: e.duree_estimee_sec ?? null,
    points_maison: e.points_maison ?? 0,
    enonce: e.enonce,
    choix: e.choix ?? null,
    reponse_correcte: e.reponse_correcte ?? null,
    reponse_attendue_redige: e.reponse_attendue_redige ?? null,
    tolerance_numerique: e.tolerance_numerique ?? null,
    regex_validation: e.regex_validation ?? null,
    explication_correcte: e.explication_correcte ?? null,
    explications_erreurs: e.explications_erreurs ?? null,
    indices: e.indices ?? null,
    decomposition: e.decomposition ?? null,
    reformulation_alternative: e.reformulation_alternative ?? null,
    validation_par_claude: e.validation_par_claude ?? false,
    criteres_validation_claude: e.criteres_validation_claude ?? null,
    tags: e.tags ?? null,
    source_inspiration: e.source_inspiration ?? null,
  };
}

// ----- Main -----
async function seedExercices(): Promise<{ inserted: number; skipped: number }> {
  let inserted = 0;
  let skipped = 0;

  console.log(c.blue('\n=== Seed des exercices (J1 à J15) ==='));

  for (let jour = 1; jour <= 15; jour++) {
    const filename = `exercices-jour-${String(jour).padStart(2, '0')}.json`;
    const filepath = findFile(filename);

    if (!filepath) {
      console.warn(c.yellow(`[J${jour}] Fichier introuvable : ${filename}`));
      continue;
    }

    const data = safeReadJson<JourFichier>(filepath);
    if (!data) {
      console.warn(c.yellow(`[J${jour}] Skip (JSON invalide)`));
      continue;
    }

    if (!Array.isArray(data.exercices)) {
      console.warn(c.yellow(`[J${jour}] Pas de tableau "exercices"`));
      continue;
    }

    const rows = [];
    for (const e of data.exercices) {
      if (!validateExercise(e, jour)) {
        skipped++;
        continue;
      }
      rows.push(exerciseToRow(e, jour));
    }

    if (rows.length === 0) {
      console.warn(c.yellow(`[J${jour}] Aucun exercice valide`));
      continue;
    }

    const { error } = await supabase
      .from('exercises')
      .upsert(rows, { onConflict: 'id' });

    if (error) {
      console.error(c.red(`[J${jour}] Erreur upsert : ${error.message}`));
      skipped += rows.length;
      continue;
    }

    inserted += rows.length;
    console.log(c.green(`Importé J${jour}: ${rows.length} exos`));
  }

  return { inserted, skipped };
}

async function seedQuiz(): Promise<{ inserted: number; skipped: number }> {
  let inserted = 0;
  let skipped = 0;

  console.log(c.blue('\n=== Seed des quiz (J2, J4, J6, J8, J10, J12, J14) ==='));

  const jours = [2, 4, 6, 8, 10, 12, 14];

  for (const jour of jours) {
    const filename = `quiz-j${String(jour).padStart(2, '0')}.json`;
    const filepath = findFile(filename);

    if (!filepath) {
      console.warn(c.yellow(`[Quiz J${jour}] Fichier introuvable : ${filename}`));
      continue;
    }

    const data = safeReadJson<Quiz & { titre?: string; exercices?: any[] }>(filepath);
    if (!data) {
      console.warn(c.yellow(`[Quiz J${jour}] Skip (JSON invalide)`));
      continue;
    }

    if (!data.id || !data.jour) {
      console.warn(c.yellow(`[Quiz J${jour}] Champs requis manquants (id, jour)`));
      skipped++;
      continue;
    }

    const row = {
      id: data.id,
      jour: data.jour,
      titre: (data as any).titre ?? `Quiz J${data.jour}`,
      duree_min: data.duree_min ?? 45,
      note_max: data.note_max ?? 20,
      themes_couverts: data.themes_couverts ?? [],
      ponderations: data.ponderations ?? null,
      exercices_ids: Array.isArray(data.exercices)
        ? data.exercices.map((e: any) => e.id).filter(Boolean)
        : [],
      contenu: data, // on garde tout le JSON dans une colonne jsonb pour usage moteur
    };

    const { error } = await supabase
      .from('quiz')
      .upsert(row, { onConflict: 'id' });

    if (error) {
      console.error(c.red(`[Quiz J${jour}] Erreur upsert : ${error.message}`));
      skipped++;
      continue;
    }

    inserted++;
    console.log(c.green(`Importé Quiz J${jour}: ${row.exercices_ids.length} exos`));
  }

  return { inserted, skipped };
}

async function main(): Promise<void> {
  console.log(c.blue('Poudlard Maths — Seed Supabase'));
  console.log(c.dim(`Source exos : ${DATA_EXOS_DIR}`));
  console.log(c.dim(`Source quiz : ${DATA_QUIZ_DIR}`));
  console.log(c.dim(`Fallback : ${DATA_DIR_LOCAL}`));

  const exos = await seedExercices();
  const quiz = await seedQuiz();

  console.log(c.blue('\n=== Récapitulatif ==='));
  console.log(`Exercices  : ${c.green(String(exos.inserted))} importés, ${c.yellow(String(exos.skipped))} ignorés`);
  console.log(`Quiz       : ${c.green(String(quiz.inserted))} importés, ${c.yellow(String(quiz.skipped))} ignorés`);
  console.log(c.green('\nTerminé.\n'));
}

main().catch((err) => {
  console.error(c.red('[FATAL]'), err);
  process.exit(1);
});
