import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import type { Exercise, ReformulationAlt } from '@/lib/types';
import { checkRateLimit, rateLimitKey } from '@/lib/moteur/rate-limit';
import {
  getAnthropicClient,
  CLAUDE_MODELS,
  extractText,
  parseJsonFromClaude,
} from '@/lib/claude/client';
import { buildPromptReformulation } from '@/lib/claude/prompts';
import { cacheGet, cacheSet, hashPrompt } from '@/lib/claude/cache';

const BodySchema = z.object({
  exercise_id: z.string().min(1),
});

interface ReformulationOut {
  narration_alt: string;
  enonce_alt: string;
  indice_visuel?: string | null;
}

/**
 * POST /api/claude/reformuler
 * Si l'exo a déjà `reformulation_alternative` pré-écrite → on la renvoie.
 * Sinon → Haiku génère narration_alt + enonce_alt + indice_visuel.
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
  const rl = checkRateLimit(rateLimitKey(user.id, ip, 'claude-reformuler'));
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

  // 1. Reformulation pré-écrite ?
  if (exercice.reformulation_alternative) {
    const r = exercice.reformulation_alternative as ReformulationAlt;
    return NextResponse.json({
      narration_alt: r.narration_alt,
      enonce_alt: r.enonce_alt,
      indice_visuel: r.indice_visuel ?? null,
      source: 'predefined',
      cached: false,
      tokens: 0,
    });
  }

  // 2. Cache
  const hash = hashPrompt('reformuler', exercice.id, exercice.enonce);
  const cached = await cacheGet<ReformulationOut>(hash, supabase);
  if (cached.hit && cached.value) {
    return NextResponse.json({
      ...cached.value,
      source: 'claude_cached',
      cached: true,
      tokens: 0,
    });
  }

  // 3. Génération Claude (Haiku, c'est du reformatage léger)
  const { systeme, user: userPrompt } = buildPromptReformulation(exercice);
  try {
    const anthropic = getAnthropicClient();
    const msg = await anthropic.messages.create({
      model: CLAUDE_MODELS.DEFAULT,
      max_tokens: 600,
      system: systeme,
      messages: [{ role: 'user', content: userPrompt }],
    });
    const tokens = (msg.usage?.input_tokens ?? 0) + (msg.usage?.output_tokens ?? 0);
    const reformulation = parseJsonFromClaude<ReformulationOut>(extractText(msg));
    if (!reformulation || !reformulation.enonce_alt) {
      return NextResponse.json({ error: 'claude_invalid_response' }, { status: 502 });
    }
    await cacheSet(
      hash,
      reformulation,
      {
        model: CLAUDE_MODELS.DEFAULT,
        tokens_input: msg.usage?.input_tokens,
        tokens_output: msg.usage?.output_tokens,
      },
      supabase
    );
    return NextResponse.json({
      ...reformulation,
      source: 'claude_generated',
      cached: false,
      tokens,
    });
  } catch (e) {
    console.error('[claude/reformuler]', e);
    return NextResponse.json(
      { error: 'claude_call_failed', detail: (e as Error).message },
      { status: 502 }
    );
  }
}
