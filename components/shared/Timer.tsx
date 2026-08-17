"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

export function Timer({ startedAt, limitSeconds }: { startedAt: string; limitSeconds: number }) {
  const [remaining, setRemaining] = useState(limitSeconds);

  useEffect(() => {
    const start = new Date(startedAt).getTime();
    const tick = () => {
      const elapsed = (Date.now() - start) / 1000;
      setRemaining(Math.max(0, Math.ceil(limitSeconds - elapsed)));
    };
    tick();
    const id = setInterval(tick, 200);
    return () => clearInterval(id);
  }, [startedAt, limitSeconds]);

  const low = remaining <= 10;

  return (
    <div
      className={cn(
        "flex h-20 w-20 items-center justify-center rounded-full border-2 font-[family-name:var(--font-impact)] text-3xl",
        low ? "timer-warning border-amber text-amber" : "border-foil-gold/50 text-foil-gold"
      )}
    >
      {remaining}
    </div>
  );
}
