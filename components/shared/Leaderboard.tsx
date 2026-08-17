"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { sfx } from "@/lib/sound/sfx";

type Entry = { id: string; name: string; score: number };

export function Leaderboard({ teams }: { teams: Entry[] }) {
    const sorted = [...teams].sort((a, b) => b.score - a.score);
    const totalScore = teams.reduce((sum, t) => sum + t.score, 0);
    const prevTotal = useRef(totalScore);

    useEffect(() => {
        if (totalScore !== prevTotal.current) sfx.pointsChime();
        prevTotal.current = totalScore;
    }, [totalScore]);

    return (
        <div className="w-full">
            <p className="font-montserrat text-[11px] tracking-[0.35em] uppercase text-foil-gold/70 mb-2 px-1">Leaderboard</p>
            <ol className="flex flex-col">
                <AnimatePresence>
                    {sorted.map((team, index) => (
                        <motion.li
                            key={team.id}
                            layout
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className={cn(
                                "flex items-center gap-3 border-b border-white/5 py-2.5 px-1",
                                index === 0 && "border-l-2 border-l-foil-gold pl-2"
                            )}
                        >
                            <span
                                className={cn(
                                    "font-anton text-lg w-6 text-center",
                                    index === 0 ? "text-foil-gold" : index === 1 ? "text-silver-medal" : index === 2 ? "text-bronze-medal" : "text-champagne/30"
                                )}
                            >
                                {index + 1}
                            </span>
                            <span className="flex-1 font-montserrat text-sm truncate">{team.name}</span>
                            <span className="font-anton text-lg text-foil-gold-bright">{team.score.toLocaleString()}</span>
                        </motion.li>
                    ))}
                </AnimatePresence>
            </ol>
        </div>
    );
}
