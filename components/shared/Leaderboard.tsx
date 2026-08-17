"use client";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";

export type LeaderboardTeam = { id: string; name: string; score: number };

export function Leaderboard({ teams, activeTeamId }: { teams: LeaderboardTeam[]; activeTeamId?: string | null }) {
  const ranked = [...teams].sort((a, b) => b.score - a.score);

  return (
    <div className="stage-panel flex h-full flex-col gap-2 rounded-sm p-4">
      <span className="font-[family-name:var(--font-ui)] text-xs uppercase tracking-[0.3em] text-foil-gold/70">
        Live Leaderboard
      </span>
      <ul className="flex flex-col gap-1.5">
        <AnimatePresence initial={false}>
          {ranked.map((team, i) => (
            <motion.li
              key={team.id}
              layout
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={cn(
                "flex items-center justify-between rounded-sm px-3 py-2",
                team.id === activeTeamId ? "bg-foil-gold/15 ring-1 ring-foil-gold/50" : "bg-stage-inset/60"
              )}
            >
              <span className="flex items-center gap-3">
                <span className="w-5 font-[family-name:var(--font-impact)] text-champagne-dim">{i + 1}</span>
                <span className="font-[family-name:var(--font-ui)] font-semibold text-champagne">{team.name}</span>
              </span>
              <span className="font-[family-name:var(--font-impact)] text-foil-gold">
                {team.score.toLocaleString()}
              </span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
