'use client';

import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { creerEnfant, type NouvelEnfantState } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Maison } from '@/lib/types';

const initialState: NouvelEnfantState = {};

const MAISONS: { value: Maison; label: string; couleur: string }[] = [
  { value: 'gryffondor', label: 'Gryffondor', couleur: 'border-[#740001] hover:bg-[#740001]/20' },
  { value: 'serdaigle', label: 'Serdaigle', couleur: 'border-[#0E1A40] hover:bg-[#0E1A40]/40' },
  { value: 'poufsouffle', label: 'Poufsouffle', couleur: 'border-[#FFDB00] hover:bg-[#FFDB00]/10' },
  { value: 'serpentard', label: 'Serpentard', couleur: 'border-[#1A472A] hover:bg-[#1A472A]/30' },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Création…' : 'Créer le compte enfant'}
    </Button>
  );
}

export function NouvelEnfantForm() {
  const [state, formAction] = useFormState(creerEnfant, initialState);

  if (state.success) {
    const { display_name, email, password, maison_choisie } = state.success;
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-emerald-700/50 bg-emerald-950/30 p-4 text-emerald-100">
          <p className="font-semibold mb-2">Compte de {display_name} créé !</p>
          <p className="text-sm mb-3">
            Note bien ces identifiants — ils ne seront plus affichés ensuite.
          </p>
          <div className="rounded-md border border-amber-900/40 bg-stone-900/80 p-3 font-mono text-sm space-y-1 text-amber-100">
            <div>
              <span className="text-amber-300/70">Identifiant :</span> {email}
            </div>
            <div>
              <span className="text-amber-300/70">Mot de passe :</span> {password}
            </div>
            <div>
              <span className="text-amber-300/70">Maison :</span> {maison_choisie}
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Link href="/dashboard" className="flex-1">
            <Button variant="secondary" className="w-full">
              Retour au tableau de bord
            </Button>
          </Link>
          <Link href="/enfants/nouveau" className="flex-1">
            <Button className="w-full">Ajouter un autre enfant</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="display_name">Prénom de l’enfant</Label>
        <Input
          id="display_name"
          name="display_name"
          type="text"
          required
          minLength={2}
          maxLength={40}
          placeholder="Ex : Léa"
        />
        {state.fieldErrors?.display_name ? (
          <p className="text-sm text-red-300">{state.fieldErrors.display_name}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label>Maison choisie</Label>
        <div className="grid grid-cols-2 gap-2">
          {MAISONS.map((m) => (
            <label
              key={m.value}
              className={`cursor-pointer rounded-lg border-2 p-3 text-center text-sm font-semibold transition-colors ${m.couleur} has-[:checked]:bg-amber-900/40 has-[:checked]:ring-2 has-[:checked]:ring-amber-400`}
            >
              <input
                type="radio"
                name="maison_choisie"
                value={m.value}
                required
                className="sr-only"
              />
              {m.label}
            </label>
          ))}
        </div>
        {state.fieldErrors?.maison_choisie ? (
          <p className="text-sm text-red-300">{state.fieldErrors.maison_choisie}</p>
        ) : null}
      </div>

      {state.error && !state.fieldErrors ? (
        <p className="text-sm text-red-300 bg-red-950/40 border border-red-900/50 rounded-md p-2">
          {state.error}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
