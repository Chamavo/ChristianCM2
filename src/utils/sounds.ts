/**
 * Sound effects using Web Audio API (no external files needed)
 */

const audioCtx = () => new (window.AudioContext || (window as any).webkitAudioContext)();

/** Play a success/fanfare sound when leveling up */
export function playLevelUpSound() {
    try {
        const ctx = audioCtx();
        const now = ctx.currentTime;

        // Siren/Fanfare: ascending major 7th chord feel
        const notes = [
            { f: 523.25, type: 'triangle' as OscillatorType }, // C5
            { f: 659.25, type: 'triangle' as OscillatorType }, // E5
            { f: 783.99, type: 'triangle' as OscillatorType }, // G5
            { f: 987.77, type: 'triangle' as OscillatorType }, // B5
            { f: 1046.50, type: 'square' as OscillatorType },   // C6 (alarm feel)
        ];
        const noteDuration = 0.12;
        const gap = 0.04;

        notes.forEach((note, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = note.type;
            osc.frequency.value = note.f;

            const start = now + i * (noteDuration + gap);
            gain.gain.setValueAtTime(0, start);
            gain.gain.linearRampToValueAtTime(0.4, start + 0.02);
            gain.gain.linearRampToValueAtTime(0, start + noteDuration);

            osc.start(start);
            osc.stop(start + noteDuration + 0.01);
        });

        // Final triumphant blast
        const chordStart = now + notes.length * (noteDuration + gap);
        [523.25, 783.99, 1046.50, 1318.51].forEach((freq) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sawtooth';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, chordStart);
            gain.gain.linearRampToValueAtTime(0.2, chordStart + 0.05);
            gain.gain.linearRampToValueAtTime(0, chordStart + 1.0);
            osc.start(chordStart);
            osc.stop(chordStart + 1.1);
        });
    } catch (e) {
        console.warn('Could not play level up sound:', e);
    }
}

/** Play a short correct answer ding */
export function playCorrectSound() {
    try {
        const ctx = audioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.16);
    } catch (e) {
        console.warn('Could not play correct sound:', e);
    }
}

/** Play a short wrong answer buzz */
export function playWrongSound() {
    try {
        const ctx = audioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'square';
        osc.frequency.value = 200;
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.26);
    } catch (e) {
        console.warn('Could not play wrong sound:', e);
    }
}

/** Play the ultimate victory fanfare for completing all 25 levels */
export function playAllCompleteSound() {
    try {
        const ctx = audioCtx();
        const now = ctx.currentTime;

        // Grand ascending scale
        const notes = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.50];
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'triangle';
            osc.frequency.value = freq;
            const start = now + i * 0.12;
            gain.gain.setValueAtTime(0, start);
            gain.gain.linearRampToValueAtTime(0.25, start + 0.03);
            gain.gain.linearRampToValueAtTime(0, start + 0.2);
            osc.start(start);
            osc.stop(start + 0.22);
        });

        // Final triumphant chord held longer
        const chordStart = now + notes.length * 0.12 + 0.1;
        [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((freq) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, chordStart);
            gain.gain.linearRampToValueAtTime(0.12, chordStart + 0.08);
            gain.gain.linearRampToValueAtTime(0, chordStart + 1.2);
            osc.start(chordStart);
            osc.stop(chordStart + 1.25);
        });
    } catch (e) {
        console.warn('Could not play all complete sound:', e);
    }
}

/**
 * Compatibility wrapper for legacy code calling playSound('type')
 */
export function playSound(type: 'correct' | 'incorrect' | 'level-up' | 'complete') {
    switch (type) {
        case 'correct':
            playCorrectSound();
            break;
        case 'incorrect':
            playWrongSound();
            break;
        case 'level-up':
            playLevelUpSound();
            break;
        case 'complete':
            playAllCompleteSound();
            break;
        default:
            console.warn(`Sound type not found: ${type}`);
    }
}
