/**
 * Célébrations visuelles + sonores (côté client uniquement).
 *
 * - `celebrerPalier()`   : petit éclat de confettis + court carillon
 *                          (toutes les 10 questions : après la 10e et la 20e).
 * - `celebrerFinJournee()` : pluie de confettis + sirène de victoire
 *                            (fin de journée = 30e question réussie).
 *
 * Les sons sont SYNTHÉTISÉS via la Web Audio API (aucun fichier audio dans le
 * dépôt). Tout est protégé par des try/catch : une célébration ne doit jamais
 * interrompre l'apprenant.
 */

const COULEURS = ['#FFD700', '#FF8C00', '#E63946', '#2A9D8F', '#457B9D', '#F1FAEE'];

/** Récupère/crée un AudioContext partagé (gère le préfixe webkit). */
function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const w = window as unknown as {
      __celebAudio?: AudioContext;
      webkitAudioContext?: typeof AudioContext;
    };
    if (!w.__celebAudio) {
      const Ctor = window.AudioContext ?? w.webkitAudioContext;
      if (!Ctor) return null;
      w.__celebAudio = new Ctor();
    }
    // Certains navigateurs suspendent le contexte tant qu'il n'y a pas d'interaction
    if (w.__celebAudio.state === 'suspended') void w.__celebAudio.resume();
    return w.__celebAudio;
  } catch {
    return null;
  }
}

/** Joue une note (oscillateur) avec enveloppe douce pour éviter les clics. */
function jouerNote(
  ctx: AudioContext,
  freq: number,
  debut: number,
  duree: number,
  type: OscillatorType = 'triangle',
  volume = 0.25
): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, debut);
  gain.gain.setValueAtTime(0, debut);
  gain.gain.linearRampToValueAtTime(volume, debut + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, debut + duree);
  osc.connect(gain).connect(ctx.destination);
  osc.start(debut);
  osc.stop(debut + duree + 0.05);
}

/** Court carillon ascendant (palier des 10 questions). */
function sonPalier(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const t = ctx.currentTime;
  jouerNote(ctx, 659.25, t, 0.18); // mi
  jouerNote(ctx, 987.77, t + 0.14, 0.28); // si
}

/** Sirène de victoire + petite fanfare (fin de journée). */
function sonVictoire(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const t = ctx.currentTime;

  // Fanfare : arpège ascendant do–mi–sol–do
  const arpege = [523.25, 659.25, 783.99, 1046.5];
  arpege.forEach((f, i) => jouerNote(ctx, f, t + i * 0.16, 0.3, 'triangle', 0.28));

  // Sirène : balayage montant/descendant répété (sawtooth)
  try {
    const debut = t + 0.7;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    gain.gain.setValueAtTime(0, debut);
    gain.gain.linearRampToValueAtTime(0.18, debut + 0.05);
    osc.frequency.setValueAtTime(440, debut);
    // 2 allers-retours 440 → 880 → 440
    osc.frequency.linearRampToValueAtTime(880, debut + 0.4);
    osc.frequency.linearRampToValueAtTime(440, debut + 0.8);
    osc.frequency.linearRampToValueAtTime(880, debut + 1.2);
    osc.frequency.linearRampToValueAtTime(440, debut + 1.6);
    gain.gain.exponentialRampToValueAtTime(0.0001, debut + 1.7);
    osc.connect(gain).connect(ctx.destination);
    osc.start(debut);
    osc.stop(debut + 1.8);
  } catch {
    /* sirène optionnelle */
  }
}

/** Petit éclat de confettis depuis le centre. */
async function confettisPalier(): Promise<void> {
  try {
    const confetti = (await import('canvas-confetti')).default;
    confetti({
      particleCount: 80,
      spread: 70,
      startVelocity: 35,
      origin: { y: 0.6 },
      colors: COULEURS,
      disableForReducedMotion: true,
    });
  } catch {
    /* confettis optionnels */
  }
}

/** Pluie de confettis soutenue (~2,5 s) tombant du haut de l'écran. */
async function confettisPluie(): Promise<void> {
  try {
    const confetti = (await import('canvas-confetti')).default;
    const fin = Date.now() + 2500;
    const tirer = () => {
      confetti({
        particleCount: 6,
        angle: 60,
        spread: 70,
        origin: { x: 0, y: 0 },
        colors: COULEURS,
        disableForReducedMotion: true,
      });
      confetti({
        particleCount: 6,
        angle: 120,
        spread: 70,
        origin: { x: 1, y: 0 },
        colors: COULEURS,
        disableForReducedMotion: true,
      });
      confetti({
        particleCount: 8,
        angle: 90,
        spread: 100,
        startVelocity: 45,
        origin: { x: 0.5, y: 0 },
        colors: COULEURS,
        disableForReducedMotion: true,
      });
      if (Date.now() < fin) requestAnimationFrame(tirer);
    };
    tirer();
  } catch {
    /* confettis optionnels */
  }
}

/** Palier des 10 questions : petit signe visuel + sonore. */
export function celebrerPalier(): void {
  void confettisPalier();
  sonPalier();
}

/** Fin de journée : pluie de confettis + sirène de victoire. */
export function celebrerFinJournee(): void {
  void confettisPluie();
  sonVictoire();
}
