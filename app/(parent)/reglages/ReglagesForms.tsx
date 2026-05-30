'use client';

import { useFormState, useFormStatus } from 'react-dom';
import {
  modifierProfil,
  changerMotDePasse,
  type ReglagesProfilState,
  type MotDePasseState,
} from './actions';

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded text-sm font-semibold disabled:opacity-50"
    >
      {pending ? 'Enregistrement…' : label}
    </button>
  );
}

interface Props {
  initialName: string;
  initialEmail: string;
}

export function ReglagesForms({ initialName, initialEmail }: Props) {
  const [profilState, profilAction] = useFormState<ReglagesProfilState, FormData>(
    modifierProfil,
    {}
  );
  const [pwdState, pwdAction] = useFormState<MotDePasseState, FormData>(
    changerMotDePasse,
    {}
  );

  return (
    <div className="space-y-6">
      <form
        action={profilAction}
        className="bg-white rounded-lg p-5 border border-stone-200 shadow-sm space-y-3"
      >
        <h3 className="font-bold text-stone-900">Profil</h3>
        <div>
          <label htmlFor="r-name" className="block text-sm font-medium text-stone-700 mb-1">
            Nom
          </label>
          <input
            id="r-name"
            name="display_name"
            defaultValue={initialName}
            required
            className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          {profilState?.fieldErrors?.display_name && (
            <p className="text-xs text-red-600 mt-1">
              {profilState.fieldErrors.display_name}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="r-email" className="block text-sm font-medium text-stone-700 mb-1">
            Adresse e-mail
          </label>
          <input
            id="r-email"
            name="email"
            type="email"
            defaultValue={initialEmail}
            required
            className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          {profilState?.fieldErrors?.email && (
            <p className="text-xs text-red-600 mt-1">
              {profilState.fieldErrors.email}
            </p>
          )}
        </div>
        {profilState?.error && (
          <p className="text-sm text-red-600">{profilState.error}</p>
        )}
        {profilState?.success && (
          <p className="text-sm text-green-700">{profilState.success}</p>
        )}
        <SubmitButton label="Enregistrer" />
      </form>

      <form
        action={pwdAction}
        className="bg-white rounded-lg p-5 border border-stone-200 shadow-sm space-y-3"
      >
        <h3 className="font-bold text-stone-900">Mot de passe</h3>
        <div>
          <label htmlFor="r-pwd" className="block text-sm font-medium text-stone-700 mb-1">
            Nouveau mot de passe
          </label>
          <input
            id="r-pwd"
            name="password"
            type="password"
            required
            minLength={8}
            className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <p className="text-xs text-stone-400 mt-1">Au moins 8 caractères.</p>
        </div>
        {pwdState?.error && <p className="text-sm text-red-600">{pwdState.error}</p>}
        {pwdState?.success && (
          <p className="text-sm text-green-700">{pwdState.success}</p>
        )}
        <SubmitButton label="Changer" />
      </form>
    </div>
  );
}
