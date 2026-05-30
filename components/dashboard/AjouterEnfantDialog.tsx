'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { UserPlus, X } from 'lucide-react';
import { useFormState, useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { createChild, type CreateChildState } from '@/app/(parent)/enfants/actions';

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
  variant?: 'primary' | 'ghost';
  label?: string;
}

export function AjouterEnfantDialog({
  variant = 'primary',
  label = 'Ajouter un apprenant',
}: AjouterEnfantDialogProps) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  const [state, formAction] = useFormState<CreateChildState, FormData>(
    createChild,
    {}
  );

  const success = state?.ok && state?.pin;

  const triggerClass =
    variant === 'primary'
      ? 'bg-amber-700 hover:bg-amber-800 text-white px-5 py-3 rounded-lg text-base font-bold shadow-lg inline-flex items-center gap-2 transition-colors'
      : 'text-stone-600 hover:text-stone-900 text-base font-medium inline-flex items-center gap-2';

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
              Nouvel apprenant
            </Dialog.Title>
            <Dialog.Close className="text-stone-400 hover:text-stone-700">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          {success ? (
            <div className="space-y-3">
              <p className="text-sm text-green-700 font-semibold">
                Compte créé pour {state.prenom} !
              </p>
              <div className="rounded-md bg-stone-100 p-4 text-center">
                <p className="text-stone-500 text-sm mb-1">Code PIN de connexion</p>
                <p className="text-4xl font-black tracking-[0.4em] text-stone-900 tabular-nums">
                  {state.pin}
                </p>
              </div>
              <p className="text-xs text-stone-500">
                L&apos;apprenant se connecte avec son <strong>prénom</strong> et ce{' '}
                <strong>code PIN</strong>. Note-le : il ne sera plus affiché (tu pourras en
                régénérer un depuis le tableau de bord).
              </p>
              <button
                onClick={() => setOpen(false)}
                className="bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded text-sm font-semibold w-full"
              >
                Fermer
              </button>
            </div>
          ) : (
            <>
              <Dialog.Description className="text-sm text-stone-500 mb-4">
                Saisis le prénom de l&apos;apprenant. Un code PIN à 4 chiffres sera généré
                automatiquement.
              </Dialog.Description>
              <form action={formAction} className="space-y-4">
                <div>
                  <label htmlFor="dlg-name" className="block text-sm font-medium text-stone-700 mb-1">
                    Prénom de l&apos;apprenant
                  </label>
                  <input
                    id="dlg-name"
                    name="prenom"
                    required
                    maxLength={40}
                    className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Ex : Christian"
                  />
                </div>

                <div>
                  <label htmlFor="dlg-maison" className="block text-sm font-medium text-stone-700 mb-1">
                    Maison de départ (optionnel)
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
                </div>

                {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

                <div className="flex justify-end gap-2 pt-2">
                  <Dialog.Close className="text-stone-500 hover:text-stone-800 px-4 py-2 text-sm">
                    Annuler
                  </Dialog.Close>
                  <SubmitButton />
                </div>
              </form>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
