import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import type { Decomposition, Exercise } from '@/lib/types';
import { checkRateLimit, rateLimitKey } from '@/lib/moteur/rate-limit';
import {
  getAnthropicClient,
  CLAUDE_MODELS,
  extractText,
  parseJsonFromClaude,
} from '@/lib/claude/client';
import { buildPromptDecomposition } from '@/lib/claude/prompts';
import { cacheGet, cacheSet, hashPrompt } from '@/lib/claude/cache';

const BodySchema = z.object({
  exercise_id: z.string().min(1),
});

/**
 * POST /api/claude/decomposer
 * - Si l'exo a déjà un champ `decomposition` pré-écrit → on le renvoie sans appel Claude.
 * - Sinon → on génère avec Sonnet (cas complexes) et on cache la réponse.
 */
export async function POST(req: NextRequest) {
  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || null;
  const rl = checkRateLimit(rateLimitKey(user.id, ip, 'claude-decomposer'));
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'rate_limited', retryAfterSec: rl.retryAfterSec },
      { status: 429 }
    );
  }

  const { data: exo } = await supabase
    .from('exercises')
    .select('*')
    .eq('id', parsed.data.exercise_id)
    .single();
  if (!exo) return NextResponse.json({ error: 'exercise_not_found' }, { status: 404 });
  const exercice = exo as Exercise;

  // 1. Décomposition pré-écrite ?
  if (exercice.decomposition && Array.isArray(exercice.decomposition.micro_etapes)) {
    return NextResponse.json({
      decomposition: exercice.decomposition,
      source: 'predefined',
      cached: false,
      tokens: 0,
    });
  }

  // 2. Cache
  const hash = hashPrompt('decomposer', exercice.id, exercice.enonce);
  const cached = await cacheGet<Decomposition>(hash, supabase);
  if (cached.hit && cached.value) {
    return NextResponse.json({
      decomposition: cached.value,
      source: 'claude_cached',
      cached: true,
      tokens: 0,
    });
  }

  // 3. Génération Claude (Sonnet)
  const { systeme, user: userPrompt } = buildPromptDecomposition(exercice);
  try {
    const anthropic = getAnthropicClient();
    const msg = await anthropic.messages.create({
      model: CLAUDE_MODELS.COMPLEX,
      max_tokens: 1200,
      system: systeme,
      messages: [{ role: 'user', content: userPrompt }],
    });
    const tokens = (msg.usage?.input_tokens ?? 0) + (msg.usage?.output_tokens ?? 0);
    const decomposition = parseJsonFromClaude<Decomposition>(extractText(msg));
    if (!decomposition || !Array.isArray(decomposition.micro_etapes)) {
      return NextResponse.json({ error: 'claude_invalid_response' }, { status: 502 });
    }
    await cacheSet(
      hash,
      decomposition,
      {
        model: CLAUDE_MODELS.COMPLEX,
        tokens_input: msg.usage?.input_tokens,
        tokens_output: msg.usage?.output_tokens,
      },
      supabase
    );
    return NextResponse.json({
      decomposition,
      source: 'claude_generated',
      cached: false,
      tokens,
    });
  } catch (e) {
    console.error('[claude/decomposer]', e);
    return NextResponse.json(
      { error: 'claude_call_failed', detail: (e as Error).message },
      { status: 502 }
    );
  }
}
