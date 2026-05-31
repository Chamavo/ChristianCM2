import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { genererRapport } from '@/lib/rapport/genererRapport';

/**
 * GET /api/rapport?child=<uuid>&jour=<1-15>
 * Renvoie le rapport d'analyse de la journée en JSON brut (export enseignant).
 * Réservé aux parents/admins (la RLS filtre l'accès aux données de l'enfant).
 */
export async function GET(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle<{ role: string }>();
  if (!profile || (profile.role !== 'admin' && profile.role !== 'parent')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const childId = req.nextUrl.searchParams.get('child');
  const jour = Number(req.nextUrl.searchParams.get('jour'));
  if (!childId || !jour || jour < 1 || jour > 15) {
    return NextResponse.json({ error: 'params invalides (child, jour)' }, { status: 400 });
  }

  // Vérifie l'accès à cet enfant (RLS protège déjà les lignes, on confirme l'existence)
  const { data: enfant } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', childId)
    .maybeSingle<{ id: string; role: string }>();
  if (!enfant || enfant.role !== 'child') {
    return NextResponse.json({ error: 'enfant introuvable' }, { status: 404 });
  }

  const rapport = await genererRapport(supabase, childId, jour);

  const filename = `rapport-${(rapport.display_name ?? 'apprenant')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')}-jour${jour}.json`;

  return new NextResponse(JSON.stringify(rapport, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
