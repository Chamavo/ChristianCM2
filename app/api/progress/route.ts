import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import type { Exercise, ValidationResult } from '@/lib/types';
import { validerReponse } from '@/lib/moteur/validation';
import { calculerPoints } from '@/lib/moteur/scoring';
import { estMaitrise, countEchecsRecents } from '@/lib/moteur/calcul-maitrise';
import { detecterBlocage } from '@/lib/moteur/detecteur-blocage';
import { prochaineRevision } from '@/lib/moteur/spaced-repetition';
import { checkRateLimit, rateLimitKey } from '@/lib/moteur/rate-limit';
import {
  getAnthropicClient,
  CLAUDE_MODELS,
  extractText,
  parseJsonFromClaude,
  totalTokens,
} from '@/lib/claude/client';
import { buildPromptValidationRedige } from '@/lib/claude/prompts';
import { cacheGet, cacheSet, hashPrompt } from '@/lib/claude/cache';

// ============================================================
// Schéma d'entrée
// ============================================================
const BodySchema = z.object({
  exercise_id: z.string().min(1),
  reponse_donnee: z.string().min(1).max(2000),
  duree_sec: z.number().int().min(0).max(7200),
  nb_indices_utilises: z.number().int().min(0).max(5).default(0),
  est_decomposition: z.boolean().default(false),
  est_reformulation: z.boolean().default(false),
  est_replay: z.boolean().default(false),
  aide_demandee: z.boolean().optional(),
  device: z.enum(['mobile', 'desktop', 'tablette']).optional(),
});

interface ClaudeRedigeResponse {
  correct: boolean;
  score_partiel?: number;
  feedback?: string;
}

// ============================================================
// POST /api/progress — enregistre une tentative
// ============================================================
export async function POST(req: NextRequest) {
  // 1. Body + auth
  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_body', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const childId = user.id;

  // 2. Rate-limit
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || null;
  const rl = checkRateLimit(rateLimitKey(childId, ip, 'progress'));
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'rate_limited', retryAfterSec: rl.retryAfterSec },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec ?? 60) } }
    );
  }

  // 3. Charger l'exo
  const { data: exoRow, error: errExo } = await supabase
    .from('exercises')
    .select('*')
    .eq('id', parsed.data.exercise_id)
    .single();
  if (errExo || !exoRow) {
    return NextResponse.json({ error: 'exercise_not_found' }, { status: 404 });
  }
  const exo = exoRow as Exercise;

  // 4. Validation locale
  const local = validerReponse(exo, parsed.data.reponse_donnee);
  let correct = local.correct;
  let scorePartiel = local.score_partiel ?? (correct ? 1 : 0);
  let feedbackClaude: string | null = null;
  let coutTokensClaude = 0;
  let indetermine = false;

  // 5. Si validation locale impossible (rédigé libre / Claude requis) → on appelle Claude
  if (local.needs_claude) {
    const { systeme, user: userPrompt } = buildPromptValidationRedige(
      exo,
      parsed.data.reponse_donnee
    );
    const hash = hashPrompt('valider-redige', exo.id, parsed.data.reponse_donnee);
    const cached = await cacheGet<ClaudeRedigeResponse>(hash, supabase);

    let claudeResp: ClaudeRedigeResponse | null = null;
    if (cached.hit && cached.value) {
      claudeResp = cached.value;
    } else {
      try {
        const anthropic = getAnthropicClient();
        // Sonnet pour redige_libre, Haiku pour redige_court
        const model =
          exo.type === 'redige_libre' ? CLAUDE_MODELS.COMPLEX : CLAUDE_MODELS.DEFAULT;
        const msg = await anthropic.messages.create({
          model,
          max_tokens: 400,
          system: systeme,
          messages: [{ role: 'user', content: userPrompt }],
        });
        coutTokensClaude = totalTokens(msg.usage);
        const parsedClaude = parseJsonFromClaude<ClaudeRedigeResponse>(extractText(msg));
        if (parsedClaude && typeof parsedClaude.correct === 'boolean') {
          claudeResp = parsedClaude;
          await cacheSet(
            hash,
            parsedClaude,
            {
              model,
              tokens_input: msg.usage?.input_tokens,
              tokens_output: msg.usage?.output_tokens,
            },
            supabase
          );
        }
      } catch (e) {
        // En cas d'échec Claude, on enregistre comme incorrect mais sans bloquer
        console.error('[api/progress] Claude error:', e);
      }
    }

    if (claudeResp) {
      correct = claudeResp.correct;
      scorePartiel = claudeResp.score_partiel ?? (correct ? 1 : 0);
      feedbackClaude = claudeResp.feedback ?? null;
    } else {
      // Correction IA indisponible (panne / clé absente / réponse illisible).
      // On ne bloque PAS l'élève : exercice laissé non maîtrisé, il pourra avancer
      // et devra le revalider avant de débloquer le jour suivant.
      correct = false;
      scorePartiel = 0;
      indetermine = true;
      feedbackClaude =
        'La correction automatique est momentanément indisponible. Tu peux passer à la suite et y revenir plus tard.';
    }
  }

  // 6. Maîtrise + points
  const attemptForMaitrise = {
    est_correcte: correct,
    nb_indices_utilises: parsed.data.nb_indices_utilises,
    est_decomposition: parsed.data.est_decomposition,
  };
  const maitrise = estMaitrise(attemptForMaitrise, exo);
  const points = calculerPoints(exo, parsed.data.nb_indices_utilises, correct);

  // 7. INSERT attempt
  const { error: errInsert } = await supabase.from('attempts').insert({
    child_id: childId,
    exercise_id: exo.id,
    jour: exo.jour,
    reponse_donnee: parsed.data.reponse_donnee,
    est_correcte: correct,
    duree_sec: parsed.data.duree_sec,
    nb_indices_utilises: parsed.data.nb_indices_utilises,
    est_decomposition: parsed.data.est_decomposition,
    est_reformulation: parsed.data.est_reformulation,
    est_replay: parsed.data.est_replay,
    points_gagnes: points,
    maitrise,
    feedback_claude: feedbackClaude,
    cout_tokens_claude: coutTokensClaude,
    device: parsed.data.device ?? null,
  });
  if (errInsert) {
    return NextResponse.json(
      { error: 'attempt_insert_failed', detail: errInsert.message },
      { status: 500 }
    );
  }

  // 8. Calculer le nb d'échecs récents pour décider blocage + spaced repetition
  const nbEchecs = await countEchecsRecents(childId, exo.id, supabase);
  const blocage = detecterBlocage(
    {
      attempt: {
        est_correcte: correct,
        duree_sec: parsed.data.duree_sec,
        nb_indices_utilises: parsed.data.nb_indices_utilises,
        est_decomposition: parsed.data.est_decomposition,
        est_reformulation: parsed.data.est_reformulation,
      },
      nb_echecs_consecutifs: nbEchecs,
      aide_demandee: parsed.data.aide_demandee,
    },
    exo
  );

  // 9. UPSERT progress
  const nowIso = new Date().toISOString();
  const nouveauStatut = maitrise
    ? 'maitrise'
    : blocage.bloque
    ? 'bloque'
    : correct
    ? 'en_cours' // correct mais non-maîtrisé (trop d'indices ou décomposition)
    : 'en_cours';

  const revisionDate = !maitrise ? prochaineRevision(nbEchecs) : null;

  // Récupérer le progress existant pour incrémenter nb_tentatives
  const { data: existing } = await supabase
    .from('progress')
    .select('nb_tentatives, premiere_tentative_at')
    .eq('child_id', childId)
    .eq('exercise_id', exo.id)
    .maybeSingle();

  await supabase.from('progress').upsert(
    {
      child_id: childId,
      exercise_id: exo.id,
      statut: nouveauStatut,
      nb_tentatives: (existing?.nb_tentatives ?? 0) + 1,
      premiere_tentative_at: existing?.premiere_tentative_at ?? nowIso,
      maitrise_at: maitrise ? nowIso : null,
      prochaine_revision_at: revisionDate ? revisionDate.toISOString() : null,
    },
    { onConflict: 'child_id,exercise_id' }
  );

  // 10. Si blocage : log dans blockages
  if (blocage.bloque && blocage.declencheur) {
    await supabase.from('blockages').insert({
      child_id: childId,
      exercise_id: exo.id,
      declencheur: blocage.declencheur,
      strategie_appliquee: blocage.strategie,
      resolu: false,
      duree_blocage_sec: parsed.data.duree_sec,
    });
  }

  // 11. Réponse
  const result: ValidationResult = {
    correct,
    indetermine,
    score_partiel: scorePartiel,
    feedback: feedbackClaude ?? (correct ? exo.explication_correcte ?? undefined : undefined),
    points_gagnes: points,
    maitrise,
    nouvelle_strategie: blocage.strategie ?? undefined,
  };
  return NextResponse.json(result);
}
