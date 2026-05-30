import Link from 'next/link';

export default function Landing() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950 text-amber-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl text-center space-y-6">
        <div className="text-6xl">🪄</div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Poudlard Maths</h1>
        <p className="text-lg text-amber-200/80">
          15 jours pour devenir bon en résolution de problèmes — préparation du concours d&apos;entrée en 6ème, façon sorcier.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link href="/login" className="btn-gryffondor">Se connecter</Link>
          <Link href="/signup" className="border border-amber-700 text-amber-100 py-3 px-6 rounded-lg hover:bg-amber-900/30">Créer un compte parent</Link>
        </div>
      </div>
    </main>
  );
}
