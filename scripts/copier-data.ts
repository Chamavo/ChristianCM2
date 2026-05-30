/**
 * copier-data.ts
 * --------------
 * Copie les fichiers JSON (exercices-jour-XX.json, quiz-jXX.json)
 * depuis le dossier parent `poudlard-maths/` vers `app/web/data/`.
 *
 * Utile pour le packaging Vercel : le dossier `data/` est inclus dans le
 * build, ce qui permet au seed (ou à un éventuel chargement runtime) de
 * trouver les JSON même hors monorepo.
 *
 * Usage : npm run copy-data  (ou : tsx scripts/copier-data.ts)
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_DIR = path.resolve(__dirname, '..', '..', '..');
const DEST_DIR = path.resolve(__dirname, '..', 'data');

const PATTERNS = [
  /^exercices-jour-\d{2}\.json$/,
  /^quiz-j\d{2}\.json$/,
];

function shouldCopy(filename: string): boolean {
  return PATTERNS.some((p) => p.test(filename));
}

function main(): void {
  console.log('Poudlard Maths — Copie des données JSON vers app/web/data/');
  console.log(`  source : ${SOURCE_DIR}`);
  console.log(`  cible  : ${DEST_DIR}`);

  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`Dossier source introuvable : ${SOURCE_DIR}`);
    process.exit(1);
  }

  if (!fs.existsSync(DEST_DIR)) {
    fs.mkdirSync(DEST_DIR, { recursive: true });
  }

  const files = fs.readdirSync(SOURCE_DIR).filter(shouldCopy);

  if (files.length === 0) {
    console.warn('Aucun fichier JSON à copier.');
    return;
  }

  let copied = 0;
  for (const f of files) {
    const src = path.join(SOURCE_DIR, f);
    const dst = path.join(DEST_DIR, f);
    fs.copyFileSync(src, dst);
    console.log(`  copié : ${f}`);
    copied++;
  }

  console.log(`\nTerminé. ${copied} fichier(s) copié(s).`);
}

main();
