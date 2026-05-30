'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { signIn, type SignInState } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const initialState: SignInState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Connexion…' : 'Se connecter'}
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useFormState(signIn, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Adresse e-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="parent@famille.fr"
        />
        {state.fieldErrors?.email ? (
          <p className="text-sm text-red-300">{state.fieldErrors.email}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={6}
        />
        {state.fieldErrors?.password ? (
          <p className="text-sm text-red-300">{state.fieldErrors.password}</p>
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
