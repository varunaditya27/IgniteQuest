import { tone, sweep, noiseBurst, sequence, chord } from "./synth";

const sampleCache = new Map<string, HTMLAudioElement>();

// The two cues that are real recordings (see public/sfx/LICENSE.md) rather
// than synthesized — a drumroll and a crowd cheer don't hold up as oscillator
// math the way a ding or a buzzer does.
function playSample(src: string, volume: number) {
    if (typeof window === "undefined") return;
    let audio = sampleCache.get(src);
    if (!audio) {
        audio = new Audio(src);
        sampleCache.set(src, audio);
    } else {
        audio.currentTime = 0;
    }
    audio.volume = volume;
    audio.play().catch(() => {});
}

export const sfx = {
    // Timer — one tick per second while a question is live, an urgent variant
    // in the closing seconds (Timer.tsx isLow), a buzzer at zero.
    tick: () => tone(1800, 0.03, { type: "square", gain: 0.06, decay: 0.04 }),
    tickUrgent: () => tone(2200, 0.05, { type: "square", gain: 0.14, decay: 0.06 }),
    buzzer: () => {
        tone(110, 0.6, { type: "sawtooth", gain: 0.22, decay: 0.6 });
        tone(90, 0.6, { type: "sawtooth", gain: 0.12, decay: 0.6, delay: 0.02 });
    },

    // Question card flips from "Get ready…" to the live question.
    reveal: () => sweep(300, 900, 0.35, { type: "sine", gain: 0.15 }),

    // Correct option highlighted green (ANSWER_REVEALED) — also reused for the
    // host console's own Correct-button click, since the host knows isCorrect
    // locally even though the projector is never told which team was right.
    correctDing: () => {
        tone(880, 0.18, { type: "sine", gain: 0.18 });
        tone(1318.5, 0.35, { type: "sine", gain: 0.16, delay: 0.09 });
    },

    // Leaderboard re-sorts after a score change (SCORE_UPDATED).
    pointsChime: () => sequence(
        [
            { freq: 660, duration: 0.1, type: "triangle", gain: 0.14 },
            { freq: 880, duration: 0.1, type: "triangle", gain: 0.14 },
            { freq: 1108.73, duration: 0.16, type: "triangle", gain: 0.14 },
        ],
        0.09
    ),

    // 50:50 hides two wrong options.
    fiftyFifty: () => {
        noiseBurst(0.18, { gain: 0.18, filterFreq: 3000 });
        sweep(1200, 400, 0.18, { type: "sine", gain: 0.08 });
    },

    // Question card resets to "Get ready…" — covers both the normal
    // Next-Question advance and the Switch Question lifeline, since neither
    // the client state nor the broadcast events distinguish the two.
    cardChange: () => sequence(
        [
            { freq: 500, duration: 0.05, type: "square", gain: 0.1 },
            { freq: 700, duration: 0.06, type: "square", gain: 0.1 },
        ],
        0.06
    ),

    // Ask Audience / Ask Expert banner (LIFELINE_USED — the only two lifelines
    // that broadcast it; 50:50 and Switch Question only change game state).
    lifelineStinger: () => {
        tone(440, 0.5, { type: "triangle", gain: 0.12 });
        tone(446, 0.5, { type: "triangle", gain: 0.1, delay: 0.02 });
    },

    // Host clicks "Lock Answers".
    hostLock: () => sequence(
        [
            { freq: 200, duration: 0.08, type: "square", gain: 0.16 },
            { freq: 150, duration: 0.06, type: "square", gain: 0.14 },
        ],
        0.06
    ),

    // Team PIN login succeeds.
    pinSuccess: () => sequence(
        [
            { freq: 523.25, duration: 0.12, type: "sine", gain: 0.16 },
            { freq: 783.99, duration: 0.22, type: "sine", gain: 0.16 },
        ],
        0.1
    ),

    // Phase 2 answer submitted successfully — a low, decisive "chunk".
    lockIn: () => tone(160, 0.14, { type: "square", gain: 0.28, decay: 0.14 }),

    // Any actionError / form error across the app.
    error: () => sequence(
        [
            { freq: 300, duration: 0.15, type: "sawtooth", gain: 0.12 },
            { freq: 220, duration: 0.25, type: "sawtooth", gain: 0.12 },
        ],
        0.12
    ),

    // Selecting an option before submitting (Phase 2 answer form).
    tap: () => tone(700, 0.04, { type: "sine", gain: 0.05 }),

    // A podium block landing in the finale reveal.
    podiumThud: () => {
        noiseBurst(0.15, { gain: 0.2, filterFreq: 500, filterType: "lowpass" });
        tone(80, 0.25, { type: "sine", gain: 0.25 });
    },

    // Victory fanfare — a short major-triad arpeggio, brass-ish square timbre.
    fanfare: () => sequence(
        [
            { freq: 523.25, duration: 0.18, type: "square", gain: 0.12 },
            { freq: 659.25, duration: 0.18, type: "square", gain: 0.12 },
            { freq: 783.99, duration: 0.18, type: "square", gain: 0.12 },
            { freq: 1046.5, duration: 0.5, type: "square", gain: 0.14 },
        ],
        0.16
    ),

    // A held major chord under the "CHAMPIONS" title fade-in — a synthesized
    // complement to the sampled drumroll, not a replacement for it.
    suspenseChord: () => chord([220, 277.18, 329.63], 1.2, { type: "triangle", gain: 0.05, attack: 0.3 }),

    // The two sampled cues (see public/sfx/LICENSE.md).
    drumroll: () => playSample("/sfx/drumroll.mp3", 0.5),
    crowdCheer: () => playSample("/sfx/crowd-cheer.mp3", 0.45),
};
