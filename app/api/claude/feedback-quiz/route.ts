import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, rateLimitKey } from '@/lib/moteur/rate-limit';
import {
  getAnthropicClient,
  CLAUDE_MODELS,
  extractText,
  parseJsonFromClaude,
} from '@/lib/claude/client';
import {
  buildPromptFeedbackQuiz,
  type QuizDetailLigne,
} from '@/lib/claude/prompts';
import { cacheGet, cacheSet, hashPrompt } from '@/lib/claude/cache';

const BodySchema = z.object({
  quiz_result_id: z.number().int().positive(),
});

interface FeedbackQuizOut {
  themes_forts: string[];
  themes_faibles: string[];
  feedback_global: string;
}

/**
 * POST /api/claude/feedback-quiz
 * Analyse un quiz_results et persiste themes_faibles/forts + feedback_global.
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
  const rl = checkRateLimit(rateLimitKey(user.id, ip, 'claude-feedback-quiz'));
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'rate_limited', retryAfterSec: rl.retryAfterSec },
      { status: 429 }
    );
  }

  // Charger le quiz_results
  const { data: quizResult } = await supabase
    .from('quiz_results')
    .select('*')
    .eq('id', parsed.data.quiz_result_id)
    .eq('child_id', user.id) // s'assurer que l'enfant possède ce quiz (au cas où RLS soit off)
    .single();
  if (!quizResult) {
    return NextResponse.json({ error: 'quiz_result_not_found' }, { status: 404 });
  }

  // Construire les details enrichis (avec theme depuis exercices)
  const detailsRaw = (quizResult.details ?? []) as Array<{
    exercise_id: string;
    points_obtenus: number;
    points_max: number;
    reponse_donnee?: string | null;
  }>;

  const ids = detailsRaw.map((d) => d.exercise_id);
  const { data: exos } = await supabase
    .from('exercises')
    .select('id, theme, reponse_correcte')
    .in('id', ids);
  const exoMap = new Map<string, { theme: string; reponse_correcte: string | null }>();
  (exos ?? []).forEach((e) =>
    exoMap.set(e.id, { theme: e.theme, reponse_correcte: e.reponse_correcte })
  );

  const details: QuizDetailLigne[] = detailsRaw.map((d) => ({
    exercise_id: d.exercise_id,
    theme: exoMap.get(d.exercise_id)?.theme ?? 'inconnu',
    points_obtenus: d.points_obtenus,
    points_max: d.points_max,
    reponse_donnee: d.reponse_donnee ?? null,
    reponse_correcte: exoMap.get(d.exercise_id)?.reponse_correcte ?? null,
  }));

  // Cache (clé = quiz_id + jour + note pour partager entre enfants ayant le même résultat — désactivé par souci de personnalisation)
  // Ici on cache par quiz_result_id (chacun a son feedback)
  const hash = hashPrompt('feedback-quiz', String(quizResult.id));
  const cached = await cacheGet<FeedbackQuizOut>(hash, supabase);
  if (cached.hit && cached.value) {
    return NextResponse.json({ ...cached.value, cached: true, tokens: 0 });
  }

  const { systeme, user: userPrompt } = buildPromptFeedbackQuiz(
    {
      jour: quizResult.jour,
      note: quizResult.note,
      note_max: quizResult.note_max,
      duree_sec: quizResult.duree_sec ?? 0,
    },
    details
  );

  try {
    const anthropic = getAnthropicClient();
    const msg = await anthropic.messages.create({
      model: CLAUDE_MODELS.COMPLEX, // Sonnet pour l'analyse multi-exo
      max_tokens: 800,
      system: systeme,
      messages: [{ role: 'user', content: userPrompt }],
    });
    const tokens = (msg.usage?.input_tokens ?? 0) + (msg.usage?.output_tokens ?? 0);
    const feedback = parseJsonFromClaude<FeedbackQuizOut>(extractText(msg));
    if (!feedback || !feedback.feedback_global) {
      return NextResponse.json({ error: 'claude_invalid_response' }, { status: 502 });
    }

    // Cache + persistance dans quiz_results
    await cacheSet(
      hash,
      feedback,
      {
        model: CLAUDE_MODELS.COMPLEX,
        tokens_input: msg.usage?.input_tokens,
        tokens_output: msg.usage?.output_tokens,
      },
      supabase
    );
    await supabase
      .from('quiz_results')
      .update({
        themes_faibles: feedback.themes_faibles ?? [],
        themes_forts: feedback.themes_forts ?? [],
        feedback_global: feedback.feedback_global,
      })
      .eq('id', quizResult.id);

    return NextResponse.json({ ...feedback, cached: false, tokens });
  } catch (e) {
    console.error('[claude/feedback-quiz]', e);
    return NextResponse.json(
      { error: 'claude_call_failed', detail: (e as Error).message },
      { status: 502 }
    );
  }
}
