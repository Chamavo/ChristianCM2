'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useState } from 'react';
import { Sparkles, ShieldCheck, GraduationCap } from 'lucide-react';
import { signInAdmin, signInChild, type SignInState } from './actions';

const initialState: SignInState = {};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-700 transition disabled:opacity-60"
    >
      {pending ? 'Connexion…' : label}
    </button>
  );
}

function PinInput() {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-200 mb-1">Code PIN (4 chiffres)</label>
      <input
        name="pin"
        inputMode="numeric"
        autoComplete="off"
        pattern="[0-9]*"
        maxLength={4}
        required
        placeholder="••••"
        className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-center text-2xl tracking-[0.5em] text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />
    </div>
  );
}

export function LoginForm() {
  const [tab, setTab] = useState<'eleve' | 'admin'>('eleve');
  const [adminState, adminAction] = useFormState(signInAdmin, initialState);
  const [childState, childAction] = useFormState(signInChild, initialState);

  return (
    <div className="w-full max-w-md rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-8 shadow-2xl">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 mb-3">
          <Sparkles className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">Maths à l&apos;école des sorciers</h1>
        <p className="text-slate-300 text-sm mt-1">Connecte-toi pour continuer ton marathon</p>
      </div>

      {/* Onglets */}
      <div className="grid grid-cols-2 gap-2 mb-6 p-1 rounded-xl bg-white/5 border border-white/10">
        <button
          onClick={() => setTab('eleve')}
          className={`inline-flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition ${
            tab === 'eleve' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'
          }`}
        >
          <GraduationCap className="w-4 h-4" /> Élève
        </button>
        <button
          onClick={() => setTab('admin')}
          className={`inline-flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition ${
            tab === 'admin' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> Administrateur
        </button>
      </div>

      {tab === 'eleve' ? (
        <form action={childAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Prénom</label>
            <input
              name="prenom"
              type="text"
              required
              autoComplete="off"
              placeholder="Ton prénom"
              className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <PinInput />
          {childState?.error && <p className="text-sm text-red-300">{childState.error}</p>}
          <SubmitButton label="C’est parti !" />
        </form>
      ) : (
        <form action={adminAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Adresse e-mail</label>
            <input
              name="email"
              type="email"
              required
              autoComplete="username"
              placeholder="parent@exemple.com"
              className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <PinInput />
          {adminState?.error && <p className="text-sm text-red-300">{adminState.error}</p>}
          <SubmitButton label="Se connecter" />
        </form>
      )}
    </div>
  );
}
