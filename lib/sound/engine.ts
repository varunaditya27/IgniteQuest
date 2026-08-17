"use client";

let ctx: AudioContext | null = null;
function getContext(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function tone(freq: number, duration: number, type: OscillatorType = "sine", gainPeak = 0.2) {
  const audio = getContext();
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, audio.currentTime);
  gain.gain.linearRampToValueAtTime(gainPeak, audio.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);
  osc.connect(gain).connect(audio.destination);
  osc.start();
  osc.stop(audio.currentTime + duration);
}

function playFile(src: string, volume = 0.6) {
  const audio = new Audio(src);
  audio.volume = volume;
  void audio.play().catch(() => {});
}

export const sound = {
  lock: () => tone(440, 0.1, "square", 0.12),
  correct: () => {
    tone(659, 0.12, "sine", 0.2);
    setTimeout(() => tone(880, 0.25, "sine", 0.22), 100);
  },
  wrong: () => tone(140, 0.35, "sawtooth", 0.18),
  lifeline: () => tone(550, 0.25, "triangle", 0.15),
  tick: () => tone(1200, 0.04, "square", 0.06),
  drumroll: () => playFile("/sfx/drumroll.mp3", 0.5),
  cheer: () => playFile("/sfx/crowd-cheer.mp3", 0.7),
};
