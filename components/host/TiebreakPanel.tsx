"use client";
import { useState } from "react";
import { StageBackdrop } from "@/components/brand/StageBackdrop";
import { Button } from "@/components/ui/Button";
import { resolveTiebreak } from "@/lib/actions/host-tiebreak";
import type { ClientTeam } from "@/lib/game/client-types";
import { cn } from "@/lib/cn";

export function TiebreakPanel({
  teams,
  teamIds,
  onResolved,
}: {
  teams: ClientTeam[];
  teamIds: string[];
  onResolved: (result: Awaited<ReturnType<typeof resolveTiebreak>>) => void;
}) {
  const [order, setOrder] = useState<string[]>([]);
  const [pending, setPending] = useState(false);
  const tied = teams.filter((t) => teamIds.includes(t.id));

  const toggle = (id: string) => {
    setOrder((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-8 overflow-hidden px-6">
      <StageBackdrop intensity={0.6} />
      <div className="relative z-10 text-center">
        <h1 className="foil-text font-[family-name:var(--font-display)] text-4xl font-bold italic">
          It&apos;s a Tie
        </h1>
        <p className="mt-2 font-[family-name:var(--font-ui)] text-sm text-champagne-dim">
          Click teams in order, best to worst, to break the tie.
        </p>
      </div>

      <div className="relative z-10 flex flex-wrap justify-center gap-4">
        {tied.map((team) => {
          const position = order.indexOf(team.id);
          return (
            <button
              key={team.id}
              onClick={() => toggle(team.id)}
              className={cn(
                "stage-panel rounded-sm px-8 py-6 font-[family-name:var(--font-ui)] font-semibold transition",
                position >= 0 ? "border-foil-gold text-foil-gold" : "text-champagne"
              )}
            >
              {position >= 0 ? <span className="mr-2 text-foil-gold">#{position + 1}</span> : null}
              {team.name}
            </button>
          );
        })}
      </div>

      <Button
        size="lg"
        disabled={order.length !== tied.length}
        pending={pending}
        className="relative z-10"
        onClick={async () => {
          setPending(true);
          try {
            onResolved(await resolveTiebreak(order));
          } finally {
            setPending(false);
          }
        }}
      >
        Confirm Order
      </Button>
    </main>
  );
}
