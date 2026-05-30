'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { UserPlus, X } from 'lucide-react';
import { useFormState, useFormStatus } from 'react-dom';
import { creerEnfant, type NouvelEnfantState } from '@/app/(parent)/enfants/nouveau/actions';
import { useRouter } from 'next/navigation';

const MAISONS = [
  { value: 'gryffondor', label: 'Gryffondor 🦁' },
  { value: 'serdaigle', label: 'Serdaigle 🦅' },
  { value: 'poufsouffle', label: 'Poufsouffle 🦡' },
  { value: 'serpentard', label: 'Serpentard 🐍' },
] as const;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded text-sm font-semibold disabled:opacity-50"
    >
      {pending ? 'Création…' : 'Créer le compte'}
    </button>
  );
}

interface AjouterEnfantDialogProps {
  /** Variant pour bouton trigger : "primary" amber ou "ghost" texte simple */
  variant?: 'primary' | 'ghost';
  label?: string;
}

export function AjouterEnfantDialog({
  variant = 'primary',
  label = 'Ajouter un enfant',
}: AjouterEnfantDialogProps) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  const [state, formAction] = useFormState<NouvelEnfantState, FormData>(
    creerEnfant,
    {}
  );

  // Si succès, on garde le dialog ouvert pour montrer les credentials
  const success = state?.success;

  const triggerClass =
    variant === 'primary'
      ? 'bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded text-sm font-semibold inline-flex items-center gap-2'
      : 'text-stone-500 hover:text-stone-800 text-sm inline-flex items-center gap-1';

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o && success) router.refresh();
      }}
    >
      <Dialog.Trigger className={triggerClass}>
        <UserPlus className="w-4 h-4" /> {label}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md bg-white rounded-lg shadow-xl p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-bold text-stone-900">
              Ajouter un enfant
            </Dialog.Title>
            <Dialog.Close className="text-stone-400 hover:text-stone-700">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          {!success && (
            <Dialog.Description className="text-sm text-stone-500 mb-4">
              Crée un compte pour ton enfant et choisis sa maison de départ.
            </Dialog.Description>
          )}

          {success ? (
            <div className="space-y-3">
              <p className="text-sm text-green-700 font-semibold">
                Compte créé pour {success.display_name} !
              </p>
              <div className="bg-stone-100 rounded p-3 text-sm font-mono break-all">
                <p>
                  <strong>E-mail :</strong> {success.email}
                </p>
                <p>
                  <strong>Mot de passe :</strong> {success.password}
                </p>
              </div>
              <p className="text-xs text-stone-500">
                Note ces informations — elles ne seront plus affichées.
              </p>
              <button
                onClick={() => setOpen(false)}
                className="bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded text-sm font-semibold w-full"
              >
                Fermer
              </button>
            </div>
          ) : (
            <form action={formAction} className="space-y-4">
              <div>
                <label
                  htmlFor="dlg-name"
                  className="block text-sm font-medium text-stone-700 mb-1"
                >
                  Prénom de l&apos;enfant
                </label>
                <input
                  id="dlg-name"
                  name="display_name"
                  required
                  className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Ex : Léo"
                />
                {state?.fieldErrors?.display_name && (
                  <p className="text-xs text-red-600 mt-1">
                    {state.fieldErrors.display_name}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="dlg-maison"
                  className="block text-sm font-medium text-stone-700 mb-1"
                >
                  Maison de départ
                </label>
                <select
                  id="dlg-maison"
                  name="maison_choisie"
                  defaultValue="gryffondor"
                  className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {MAISONS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
                {state?.fieldErrors?.maison_choisie && (
                  <p className="text-xs text-red-600 mt-1">
                    {state.fieldErrors.maison_choisie}
                  </p>
                )}
              </div>

              {state?.error && (
                <p className="text-sm text-red-600">{state.error}</p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Dialog.Close className="text-stone-500 hover:text-stone-800 px-4 py-2 text-sm">
                  Annuler
                </Dialog.Close>
                <SubmitButton />
              </div>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
