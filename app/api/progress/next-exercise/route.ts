import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { nextExercise } from '@/lib/moteur/selecteur-prochain-exo';
import { checkRateLimit, rateLimitKey } from '@/lib/moteur/rate-limit';

/**
 * GET /api/progress/next-exercise
 * Retourne le prochain exercice (ou quiz, ou completed) selon le moteur adaptatif.
 */
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || null;
  const rl = checkRateLimit(rateLimitKey(user.id, ip, 'next-exercise'));
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'rate_limited', retryAfterSec: rl.retryAfterSec },
      { status: 429 }
    );
  }

  try {
    const result = await nextExercise(user.id, supabase);
    return NextResponse.json(result);
  } catch (e) {
    console.error('[next-exercise] error:', e);
    return NextResponse.json(
      { error: 'internal_error', detail: (e as Error).message },
      { status: 500 }
    );
  }
}
