let ctx: AudioContext | null = null;

// Browsers suspend a fresh AudioContext until a user gesture. The projector
// and team screens don't always get a same-page click before the first cue
// needs to fire (e.g. a kiosk loaded once and left running), so we retry
// resume() on the next pointer/key event rather than assume one has happened.
export function getAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!ctx) {
        const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Ctor) return null;
        ctx = new Ctor();
    }
    if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
    }
    return ctx;
}

if (typeof window !== "undefined") {
    const unlock = () => getAudioContext();
    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("keydown", unlock, { passive: true });
}
