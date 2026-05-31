import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/triche
 * Body : { exercise_id?: string, jour?: number, type: 'blur'|'hidden', duree_absence_sec: number }
 * Enregistre une perte de focus (sortie d'onglet/fenêtre) pendant un exercice.
 * L'écriture passe par la RLS (insert with check child_id = auth.uid()).
 */
export async function POST(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let body: {
    exercise_id?: string;
    jour?: number;
    type?: string;
    duree_absence_sec?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const type = body.type === 'hidden' ? 'hidden' : 'blur';
  const duree = Math.max(0, Math.min(36000, Math.round(body.duree_absence_sec ?? 0)));

  const { error } = await supabase.from('focus_events').insert({
    child_id: user.id,
    exercise_id: body.exercise_id ?? null,
    jour: typeof body.jour === 'number' ? body.jour : null,
    type,
    duree_absence_sec: duree,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
