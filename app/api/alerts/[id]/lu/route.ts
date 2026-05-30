import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/alerts/:id/lu
 * Marque l'alerte spécifiée comme lue. Renvoie { ok: true }.
 */
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!id || !Number.isFinite(id)) {
    return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
  }
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { error } = await supabase.rpc('marquer_alerte_lue', { p_alert_id: id });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
