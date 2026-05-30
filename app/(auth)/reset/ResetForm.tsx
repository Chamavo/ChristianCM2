'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { requestReset, type ResetState } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const initialState: ResetState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Envoi…' : 'Envoyer le lien de réinitialisation'}
    </Button>
  );
}

export function ResetForm() {
  const [state, formAction] = useFormState(requestReset, initialState);

  if (state.success) {
    return (
      <div className="rounded-lg border border-emerald-700/50 bg-emerald-950/30 p-4 text-emerald-100">
        <p className="font-semibold mb-1">Lien envoyé.</p>
        <p className="text-sm">
          Si l’adresse correspond à un compte, tu recevras un e-mail avec un lien
          pour choisir un nouveau mot de passe.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Adresse e-mail du compte parent</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>

      {state.error ? (
        <p className="text-sm text-red-300 bg-red-950/40 border border-red-900/50 rounded-md p-2">
          {state.error}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
