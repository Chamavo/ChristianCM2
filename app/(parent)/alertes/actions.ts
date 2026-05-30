'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function marquerLue(alertId: number) {
  const supabase = createClient();
  await supabase.rpc('marquer_alerte_lue', { p_alert_id: alertId });
  revalidatePath('/alertes');
  revalidatePath('/dashboard');
}

export async function marquerToutesLues(childId?: string) {
  const supabase = createClient();
  await supabase.rpc('marquer_toutes_alertes_lues', {
    p_child_id: childId ?? null,
  });
  revalidatePath('/alertes');
  revalidatePath('/dashboard');
}

export async function regenererAlertes() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Non authentifié' };

  // Liste des enfants du parent (ou tous pour admin)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle<{ role: string }>();
  if (!profile) return { error: 'Profil introuvable' };

  let q = supabase.from('profiles').select('id').eq('role', 'child');
  if (profile.role !== 'admin') q = q.eq('parent_id', user.id);
  const { data: enfants } = await q.returns<Array<{ id: string }>>();

  let total = 0;
  for (const e of enfants ?? []) {
    const { data: n } = await supabase.rpc('generer_alertes_pour_enfant', {
      p_child_id: e.id,
    });
    total += Number(n ?? 0);
  }

  revalidatePath('/alertes');
  revalidatePath('/dashboard');
  return { ok: true, count: total };
}
