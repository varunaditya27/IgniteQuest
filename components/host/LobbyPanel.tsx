"use client";
import { useState } from "react";
import { StageBackdrop } from "@/components/brand/StageBackdrop";
import { Button } from "@/components/ui/Button";
import { startPhase1 } from "@/lib/actions/host-phase1";
import type { ClientTeam } from "@/lib/game/client-types";
import { toClientGameState } from "@/lib/game/client-types";

export function LobbyPanel({
  eventName,
  teams,
  onStarted,
}: {
  eventName: string;
  teams: ClientTeam[];
  onStarted: (raw: Parameters<typeof toClientGameState>[0]) => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      <StageBackdrop />
      <div className="relative z-10 flex flex-col items-center text-center">
        <span className="font-[family-name:var(--font-ui)] text-xs tracking-[0.4em] text-champagne-dim">
          {eventName}
        </span>
        <h1 className="foil-text mt-4 font-[family-name:var(--font-display)] text-6xl font-black italic">
          IgniteQuest
        </h1>
        <p className="mt-3 font-[family-name:var(--font-ui)] text-sm uppercase tracking-[0.3em] text-champagne-dim">
          {teams.length} teams registered
        </p>

        {error ? <p className="mt-4 text-sm text-crimson-glow">{error}</p> : null}

        <Button
          size="lg"
          className="mt-12"
          pending={pending}
          disabled={teams.length === 0}
          onClick={async () => {
            setPending(true);
            setError(null);
            try {
              onStarted(await startPhase1());
            } catch (e) {
              setError(e instanceof Error ? e.message : "Failed to start");
            } finally {
              setPending(false);
            }
          }}
        >
          Start Phase 1 — Main Arena
        </Button>
      </div>
    </main>
  );
}
