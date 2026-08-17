"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { StageBackdrop } from "@/components/brand/StageBackdrop";
import { Button } from "@/components/ui/Button";
import { advanceToQuestion } from "@/lib/actions/host-phase1";
import type { ClientGameState } from "@/lib/game/client-types";
import { toClientGameState } from "@/lib/game/client-types";

export function InterstitialPanel({
  state,
  onAdvanced,
}: {
  state: ClientGameState;
  onAdvanced: (raw: Parameters<typeof toClientGameState>[0]) => void;
}) {
  const [pending, setPending] = useState(false);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      <StageBackdrop intensity={1.4} />
      <motion.div
        key={state.activeTeamId}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="relative z-10 flex flex-col items-center text-center"
      >
        <span className="font-[family-name:var(--font-ui)] text-xs uppercase tracking-[0.4em] text-champagne-dim">
          Now Answering
        </span>
        <h1 className="foil-text mt-6 font-[family-name:var(--font-display)] text-7xl font-black italic sm:text-8xl">
          {state.activeTeam?.name}
        </h1>

        <Button size="lg" className="mt-16" pending={pending} onClick={async () => {
          setPending(true);
          try {
            onAdvanced(await advanceToQuestion());
          } finally {
            setPending(false);
          }
        }}>
          Reveal Question
        </Button>
      </motion.div>
    </main>
  );
}
