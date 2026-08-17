"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { sfx } from "@/lib/sound/sfx";

export function Timer({ startedAt, limitSeconds }: { startedAt: string; limitSeconds: number }) {
    const [remaining, setRemaining] = useState(limitSeconds);
    const prevRemaining = useRef(limitSeconds);

    useEffect(() => {
        const start = new Date(startedAt).getTime();
        const tick = () => {
            const elapsed = (Date.now() - start) / 1000;
            setRemaining(Math.max(0, Math.ceil(limitSeconds - elapsed)));
        };
        tick();
        const interval = setInterval(tick, 250);
        return () => clearInterval(interval);
    }, [startedAt, limitSeconds]);

    useEffect(() => {
        if (remaining === prevRemaining.current) return;
        prevRemaining.current = remaining;
        if (remaining === 0) sfx.buzzer();
        else if (remaining <= 5) sfx.tickUrgent();
        else sfx.tick();
    }, [remaining]);

    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    const isLow = remaining <= 5;

    return (
        <div
            className={cn(
                "inline-flex items-baseline gap-1 rounded-md border px-6 py-2 font-anton text-6xl tabular-nums shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)] transition-colors",
                isLow
                    ? "border-buzzer-red/50 bg-crimson-deep/40 text-buzzer-red animate-pulse"
                    : "border-foil-gold/30 bg-stage-black-deep text-foil-gold-bright"
            )}
        >
            <span className="drop-shadow-[0_0_10px_currentColor]">
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
        </div>
    );
}
