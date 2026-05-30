'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { signUp, type SignUpState } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const initialState: SignUpState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Création du compte…' : 'Créer mon compte parent'}
    </Button>
  );
}

export function SignupForm() {
  const [state, formAction] = useFormState(signUp, initialState);

  if (state.success) {
    return (
      <div className="rounded-lg border border-emerald-700/50 bg-emerald-950/30 p-4 text-emerald-100">
        <p className="font-semibold mb-1">Compte créé !</p>
        <p className="text-sm">
          Vérifie ta boîte mail pour confirmer ton adresse, puis reviens te connecter.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="display_name">Ton prénom</Label>
        <Input
          id="display_name"
          name="display_name"
          type="text"
          autoComplete="given-name"
          required
          minLength={2}
          maxLength={60}
        />
        {state.fieldErrors?.display_name ? (
          <p className="text-sm text-red-300">{state.fieldErrors.display_name}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Adresse e-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
        {state.fieldErrors?.email ? (
          <p className="text-sm text-red-300">{state.fieldErrors.email}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe (8 caractères min.)</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
        {state.fieldErrors?.password ? (
          <p className="text-sm text-red-300">{state.fieldErrors.password}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm">Confirmer le mot de passe</Label>
        <Input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
        {state.fieldErrors?.confirm ? (
          <p className="text-sm text-red-300">{state.fieldErrors.confirm}</p>
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
