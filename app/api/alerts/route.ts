import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Alert } from '@/lib/types';

/**
 * GET /api/alerts
 * Query params :
 *   - non_lu=true|false
 *   - child_id=<uuid>
 *   - severite=info|attention|urgent
 *   - type=blocage_prolonge|abandon|...
 *   - limit (def 50)
 */
export async function GET(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>();
  if (!profile) return NextResponse.json({ error: 'Profil introuvable' }, { status: 403 });

  // Enfants accessibles (le RLS filtre déjà, mais on construit la requête de manière déterministe)
  let enfantsQ = supabase.from('profiles').select('id').eq('role', 'child');
  if (profile.role !== 'admin') enfantsQ = enfantsQ.eq('parent_id', user.id);
  const { data: enfants } = await enfantsQ.returns<Array<{ id: string }>>();
  const ids = (enfants ?? []).map((e) => e.id);
  if (ids.length === 0) return NextResponse.json({ alertes: [] });

  const sp = req.nextUrl.searchParams;
  let q = supabase.from('alerts').select('*').in('child_id', ids);

  if (sp.get('non_lu') === 'true') q = q.eq('lu', false);
  if (sp.get('child_id')) q = q.eq('child_id', sp.get('child_id')!);
  if (sp.get('severite')) q = q.eq('severite', sp.get('severite')!);
  if (sp.get('type')) q = q.eq('type', sp.get('type')!);

  const limit = Math.min(200, Number(sp.get('limit')) || 50);

  const { data, error } = await q
    .order('severite', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(limit)
    .returns<Alert[]>();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ alertes: data ?? [] });
}

/**
 * POST /api/alerts
 * Body : { id: number, action: 'mark_read' }
 * Permet de marquer une alerte comme lue depuis du JS client (fallback).
 */
export async function POST(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  let body: { id?: number; action?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON invalide' }, { status: 400 });
  }

  if (!body.id || body.action !== 'mark_read') {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
  }

  const { error } = await supabase.rpc('marquer_alerte_lue', { p_alert_id: body.id });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
