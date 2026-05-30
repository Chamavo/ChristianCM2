import Link from 'next/link';
import Image from 'next/image';

export default function Landing() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-stone-950">
      {/* Image HERO plein écran */}
      <Image
        src="/HERO_Potter.png"
        alt="Élèves sorciers travaillant les maths dans une salle de Poudlard"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      {/* Texte d'accroche posé sur le tableau noir (moitié haute, centré) */}
      <div className="absolute inset-x-0 top-0 h-1/2 flex items-center justify-center pointer-events-none">
        <div className="w-[44%] text-center px-2">
          <h1
            className="text-amber-50 font-bold leading-tight tracking-tight drop-shadow-[0_2px_5px_rgba(0,0,0,0.95)]
                       text-[clamp(1rem,3.1vw,2.6rem)]"
            style={{ fontFamily: '"Comic Sans MS", "Segoe Print", cursive' }}
          >
            Maths à l&apos;école des sorciers
          </h1>
          <p
            className="mt-2 sm:mt-3 text-amber-100/95 leading-snug drop-shadow-[0_2px_5px_rgba(0,0,0,0.95)]
                       text-[clamp(0.7rem,1.9vw,1.55rem)]"
            style={{ fontFamily: '"Comic Sans MS", "Segoe Print", cursive' }}
          >
            15 jours pour devenir bon en résolution de problèmes — préparation du
            concours d&apos;entrée en 6ème, façon sorcier.
          </p>
        </div>
      </div>

      {/* Bouton de connexion superposé en bas */}
      <div className="absolute inset-x-0 bottom-[7%] flex justify-center px-4">
        <Link
          href="/login"
          className="btn-gryffondor text-2xl sm:text-3xl px-12 py-5 shadow-2xl"
        >
          Entrer à Poudlard
        </Link>
      </div>
    </main>
  );
}
