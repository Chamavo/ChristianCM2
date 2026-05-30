import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import type { Exercise } from '@/lib/types';
import { checkRateLimit, rateLimitKey } from '@/lib/moteur/rate-limit';
import {
  getAnthropicClient,
  CLAUDE_MODELS,
  extractText,
  parseJsonFromClaude,
} from '@/lib/claude/client';
import { buildPromptValidationRedige } from '@/lib/claude/prompts';
import { cacheGet, cacheSet, hashPrompt } from '@/lib/claude/cache';

const BodySchema = z.object({
  exercise_id: z.string().min(1),
  reponse_donnee: z.string().min(1).max(2000),
});

interface ClaudeResp {
  correct: boolean;
  score_partiel?: number;
  feedback?: string;
}

/**
 * POST /api/claude/valider-redige
 * Renvoie : { correct, score_partiel, feedback, cached: boolean, tokens?: number }
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
  const rl = checkRateLimit(rateLimitKey(user.id, ip, 'claude-valider'));
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

  const hash = hashPrompt('valider-redige', exo.id, parsed.data.reponse_donnee);
  const cached = await cacheGet<ClaudeResp>(hash, supabase);
  if (cached.hit && cached.value) {
    return NextResponse.json({ ...cached.value, cached: true, tokens: 0 });
  }

  const { systeme, user: userPrompt } = buildPromptValidationRedige(
    exo as Exercise,
    parsed.data.reponse_donnee
  );

  try {
    const anthropic = getAnthropicClient();
    const model =
      (exo as Exercise).type === 'redige_libre'
        ? CLAUDE_MODELS.COMPLEX
        : CLAUDE_MODELS.DEFAULT;
    const msg = await anthropic.messages.create({
      model,
      max_tokens: 400,
      system: systeme,
      messages: [{ role: 'user', content: userPrompt }],
    });
    const tokens = (msg.usage?.input_tokens ?? 0) + (msg.usage?.output_tokens ?? 0);
    const parsedClaude = parseJsonFromClaude<ClaudeResp>(extractText(msg));
    if (!parsedClaude || typeof parsedClaude.correct !== 'boolean') {
      return NextResponse.json(
        { error: 'claude_invalid_response' },
        { status: 502 }
      );
    }
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
    return NextResponse.json({ ...parsedClaude, cached: false, tokens });
  } catch (e) {
    console.error('[claude/valider-redige]', e);
    return NextResponse.json(
      { error: 'claude_call_failed', detail: (e as Error).message },
      { status: 502 }
    );
  }
}
