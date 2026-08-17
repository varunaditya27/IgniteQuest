"use client";
import { useState } from "react";
import { StageBackdrop } from "@/components/brand/StageBackdrop";
import { Button } from "@/components/ui/Button";
import { startPhase2Question, finishPhase2, type FinishPhase2Result } from "@/lib/actions/host-phase2";
import { toClientGameState } from "@/lib/game/client-types";

export function Phase2LobbyPanel({
  applyRaw,
  onFinished,
}: {
  applyRaw: (raw: Parameters<typeof toClientGameState>[0]) => void;
  onFinished: (result: FinishPhase2Result) => void;
}) {
  const [pending, setPending] = useState<"start" | "finish" | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-8 overflow-hidden px-6">
      <StageBackdrop intensity={0.8} />
      <div className="relative z-10 text-center">
        <h1 className="foil-text font-[family-name:var(--font-display)] text-4xl font-bold italic">
          Fastest Fingers First
        </h1>
        <p className="mt-2 font-[family-name:var(--font-ui)] text-sm text-champagne-dim">
          Standings are hidden until the finale reveal.
        </p>
      </div>

      {error ? <p className="relative z-10 text-sm text-crimson-glow">{error}</p> : null}

      <div className="relative z-10 flex gap-4">
        <Button
          size="lg"
          pending={pending === "start"}
          disabled={pending !== null}
          onClick={async () => {
            setPending("start");
            setError(null);
            try {
              applyRaw(await startPhase2Question());
            } catch (e) {
              setError(e instanceof Error ? e.message : "Failed to start question");
            } finally {
              setPending(null);
            }
          }}
        >
          Start Next Question
        </Button>
        <Button
          variant="secondary"
          size="lg"
          pending={pending === "finish"}
          disabled={pending !== null}
          onClick={async () => {
            setPending("finish");
            setError(null);
            try {
              onFinished(await finishPhase2());
            } catch (e) {
              setError(e instanceof Error ? e.message : "Failed to finish");
            } finally {
              setPending(null);
            }
          }}
        >
          Finish &amp; Reveal Champions
        </Button>
      </div>
    </main>
  );
}
