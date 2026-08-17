"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StageBackdrop } from "@/components/brand/StageBackdrop";
import { sound } from "@/lib/sound/engine";
import type { ClientTeam } from "@/lib/game/client-types";

const MEDALS = ["🥉", "🥈", "🥇"];

export function FinalePanel({
  eventName,
  teams,
  podium,
}: {
  eventName: string;
  teams: ClientTeam[];
  podium: { id: string; rank: number }[];
}) {
  const [revealCount, setRevealCount] = useState(0);
  const ordered = [...podium].sort((a, b) => b.rank - a.rank); // 3rd, 2nd, 1st

  useEffect(() => {
    if (revealCount >= ordered.length) return;
    sound.drumroll();
    const timer = setTimeout(() => {
      setRevealCount((c) => c + 1);
      if (ordered[revealCount]?.rank === 1) sound.cheer();
    }, 2400);
    return () => clearTimeout(timer);
  }, [revealCount, ordered]);

  const teamById = new Map(teams.map((t) => [t.id, t]));

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-4 overflow-hidden px-6">
      <StageBackdrop intensity={2} />
      <span className="relative z-10 font-[family-name:var(--font-ui)] text-xs uppercase tracking-[0.4em] text-champagne-dim">
        {eventName}
      </span>
      <h1 className="foil-text relative z-10 font-[family-name:var(--font-display)] text-5xl font-black italic">
        IgniteQuest Champions
      </h1>

      <div className="relative z-10 mt-10 flex items-end gap-6">
        <AnimatePresence>
          {ordered.slice(0, revealCount).map((entry) => {
            const team = teamById.get(entry.id);
            const height = entry.rank === 1 ? "h-64" : entry.rank === 2 ? "h-52" : "h-40";
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 60, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 180, damping: 16 }}
                className={`stage-panel flex ${height} w-48 flex-col items-center justify-end rounded-sm p-6`}
              >
                <span className="text-5xl">{MEDALS[entry.rank - 1]}</span>
                <p className="mt-3 text-center font-[family-name:var(--font-display)] text-xl font-bold italic text-foil-gold">
                  {team?.name}
                </p>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </main>
  );
}
