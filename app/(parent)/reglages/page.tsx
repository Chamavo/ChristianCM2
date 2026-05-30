import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ReglagesForms } from './ReglagesForms';
import { AjouterEnfantDialog } from '@/components/dashboard/AjouterEnfantDialog';
import type { Profile, Maison } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Réglages — Poudlard Maths' };

const EMOJI_MAISON: Record<Maison, string> = {
  gryffondor: '🦁',
  serdaigle: '🦅',
  poufsouffle: '🦡',
  serpentard: '🐍',
};

export default async function ReglagesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, display_name, role, parent_id, maison_choisie, date_inscription')
    .eq('id', user.id)
    .single<Profile>();
  if (!profile) redirect('/login');

  let enfantsQ = supabase
    .from('profiles')
    .select('id, display_name, maison_choisie, date_inscription')
    .eq('role', 'child');
  if (profile.role !== 'admin') enfantsQ = enfantsQ.eq('parent_id', user.id);
  const { data: enfants } = await enfantsQ.order('display_name').returns<
    Array<{
      id: string;
      display_name: string | null;
      maison_choisie: Maison | null;
      date_inscription: string;
    }>
  >();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl sm:text-3xl font-bold text-stone-900">Réglages</h2>

      <ReglagesForms
        initialName={profile.display_name ?? ''}
        initialEmail={profile.email ?? ''}
      />

      <section>
        <div className="flex flex-wrap justify-between items-center mb-3">
          <h3 className="text-lg font-bold text-stone-900">
            Enfants ({enfants?.length ?? 0})
          </h3>
          <AjouterEnfantDialog variant="primary" label="Ajouter" />
        </div>
        {!enfants || enfants.length === 0 ? (
          <p className="text-stone-400 text-sm italic">
            Aucun enfant inscrit.
          </p>
        ) : (
          <ul className="space-y-2">
            {enfants.map((e) => (
              <li
                key={e.id}
                className="bg-white border border-stone-200 rounded p-3 flex flex-wrap items-center justify-between gap-2"
              >
                <div>
                  <p className="font-semibold">
                    <span aria-hidden="true">
                      {e.maison_choisie ? EMOJI_MAISON[e.maison_choisie] : '👤'}
                    </span>{' '}
                    {e.display_name}
                  </p>
                  <p className="text-xs text-stone-500 capitalize">
                    {e.maison_choisie ?? '—'} · Inscrit le{' '}
                    {new Date(e.date_inscription).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <Link
                  href={`/enfants/${e.id}`}
                  className="text-amber-700 text-sm hover:underline"
                >
                  Gérer →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
