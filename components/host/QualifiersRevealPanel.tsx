"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { StageBackdrop } from "@/components/brand/StageBackdrop";
import { Button } from "@/components/ui/Button";
import { startPhase2 } from "@/lib/actions/host-phase2";
import type { ClientTeam } from "@/lib/game/client-types";
import { toClientGameState } from "@/lib/game/client-types";

export function QualifiersRevealPanel({
  teams,
  onStartedPhase2,
}: {
  teams: ClientTeam[];
  onStartedPhase2: (raw: Parameters<typeof toClientGameState>[0]) => void;
}) {
  const [pending, setPending] = useState(false);
  const finalists = teams.filter((t) => t.qualified);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-10 overflow-hidden px-6">
      <StageBackdrop intensity={1.6} />
      <h1 className="foil-text relative z-10 font-[family-name:var(--font-display)] text-5xl font-black italic">
        The Finalists
      </h1>

      <div className="relative z-10 flex flex-wrap justify-center gap-6">
        {finalists.map((team, i) => (
          <motion.div
            key={team.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.3, type: "spring", stiffness: 200, damping: 18 }}
            className="stage-panel rounded-sm px-10 py-8 text-center"
          >
            <p className="font-[family-name:var(--font-display)] text-3xl font-bold italic text-foil-gold">
              {team.name}
            </p>
            <p className="mt-1 font-[family-name:var(--font-impact)] text-champagne-dim">
              {team.score.toLocaleString()} pts
            </p>
          </motion.div>
        ))}
      </div>

      <Button
        size="lg"
        pending={pending}
        className="relative z-10"
        onClick={async () => {
          setPending(true);
          try {
            onStartedPhase2(await startPhase2());
          } finally {
            setPending(false);
          }
        }}
      >
        Begin Fastest Fingers Finale
      </Button>
    </main>
  );
}
