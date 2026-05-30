import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/alerts/regenerer
 * Déclenche generer_alertes_pour_enfant pour chaque enfant du parent (ou tous pour admin).
 * Renvoie le total d'alertes créées.
 */
export async function POST() {
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

  let q = supabase.from('profiles').select('id').eq('role', 'child');
  if (profile.role !== 'admin') q = q.eq('parent_id', user.id);

  const { data: enfants } = await q.returns<Array<{ id: string }>>();

  let total = 0;
  for (const e of enfants ?? []) {
    const { data, error } = await supabase.rpc('generer_alertes_pour_enfant', {
      p_child_id: e.id,
    });
    if (!error && data != null) total += Number(data);
  }

  return NextResponse.json({ ok: true, count: total });
}
