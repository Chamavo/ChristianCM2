import Link from 'next/link';
import Image from 'next/image';

export default function Landing() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950 text-amber-50 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-4xl space-y-8">
        {/* HERO avec texte sur le tableau noir */}
        <div className="relative w-full aspect-[2816/1536] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-amber-900/40">
          <Image
            src="/HERO_Potter.png"
            alt="Élèves sorciers travaillant les maths dans une salle de Poudlard"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 896px"
            className="object-cover"
          />

          {/* Zone tableau noir : texte superposé, centré sur le tableau */}
          <div className="absolute inset-x-0 top-0 h-1/2 flex items-center justify-center">
            <div className="w-[42%] -translate-y-1 text-center px-2">
              <h1
                className="text-amber-50 font-bold leading-tight tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]
                           text-[clamp(0.7rem,2.4vw,1.6rem)]"
                style={{ fontFamily: '"Comic Sans MS", "Segoe Print", cursive' }}
              >
                Maths à l&apos;école des sorciers
              </h1>
              <p
                className="mt-1 sm:mt-2 text-amber-100/95 leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]
                           text-[clamp(0.5rem,1.45vw,0.95rem)]"
                style={{ fontFamily: '"Comic Sans MS", "Segoe Print", cursive' }}
              >
                15 jours pour devenir bon en résolution de problèmes — préparation du
                concours d&apos;entrée en 6ème, façon sorcier.
              </p>
            </div>
          </div>
        </div>

        {/* Appel à l'action */}
        <div className="flex justify-center">
          <Link href="/login" className="btn-gryffondor text-lg px-8 py-3">
            Entrer à l&apos;école
          </Link>
        </div>
      </div>
    </main>
  );
}
