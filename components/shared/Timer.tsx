"use client";

import { useEffect, useState } from "react";

export function Timer({ startedAt, limitSeconds }: { startedAt: string; limitSeconds: number }) {
    const [remaining, setRemaining] = useState(limitSeconds);

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

    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    const isLow = remaining <= 5;

    return (
        <div className={`text-6xl font-bebas text-center ${isLow ? "text-carmine-red animate-pulse" : "text-prestige-gold"}`}>
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </div>
    );
}
