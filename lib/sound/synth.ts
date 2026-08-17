import { getAudioContext } from "./context";

type ToneOptions = {
    type?: OscillatorType;
    gain?: number;
    delay?: number;
    attack?: number;
    decay?: number;
};

// A single oscillator note with a percussive envelope — the building block
// for every synthesized cue (ticks, dings, chimes, chords).
export function tone(freq: number, duration: number, opts: ToneOptions = {}) {
    const ctx = getAudioContext();
    if (!ctx) return;
    const { type = "sine", gain = 0.2, delay = 0, attack = 0.005, decay = duration } = opts;

    const start = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    amp.gain.setValueAtTime(0, start);
    amp.gain.linearRampToValueAtTime(gain, start + attack);
    amp.gain.exponentialRampToValueAtTime(0.0001, start + decay);
    osc.connect(amp).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + decay + 0.05);
}

// A note that glides between two frequencies — reveal whooshes, error dips.
export function sweep(freqFrom: number, freqTo: number, duration: number, opts: ToneOptions = {}) {
    const ctx = getAudioContext();
    if (!ctx) return;
    const { type = "sine", gain = 0.2, delay = 0, attack = 0.005 } = opts;

    const start = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freqFrom, start);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqTo), start + duration);
    amp.gain.setValueAtTime(0, start);
    amp.gain.linearRampToValueAtTime(gain, start + attack);
    amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(amp).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.05);
}

// Filtered white noise burst — swipes, thuds, anything with a textured
// (non-tonal) attack rather than a pure pitch.
export function noiseBurst(duration: number, opts: { gain?: number; delay?: number; filterFreq?: number; filterType?: BiquadFilterType } = {}) {
    const ctx = getAudioContext();
    if (!ctx) return;
    const { gain = 0.2, delay = 0, filterFreq, filterType = "bandpass" } = opts;

    const start = ctx.currentTime + delay;
    const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const amp = ctx.createGain();
    amp.gain.setValueAtTime(gain, start);
    amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    let node: AudioNode = src;
    if (filterFreq) {
        const filter = ctx.createBiquadFilter();
        filter.type = filterType;
        filter.frequency.value = filterFreq;
        src.connect(filter);
        node = filter;
    }
    node.connect(amp).connect(ctx.destination);
    src.start(start);
}

// Multiple tones fired in sequence — arpeggios, ascending/descending runs.
export function sequence(notes: { freq: number; duration: number; type?: OscillatorType; gain?: number }[], gap: number) {
    notes.forEach((note, i) => {
        tone(note.freq, note.duration, { type: note.type, gain: note.gain, delay: i * gap });
    });
}

// Multiple tones fired together — chords.
export function chord(freqs: number[], duration: number, opts: ToneOptions = {}) {
    freqs.forEach((freq) => tone(freq, duration, opts));
}
