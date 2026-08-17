"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

type Entry = { id: string; name: string; score: number };

export function Leaderboard({ teams }: { teams: Entry[] }) {
    const sorted = [...teams].sort((a, b) => b.score - a.score);

    return (
        <Card className="h-full bg-stage-black-raised/90 backdrop-blur-sm rounded-lg">
            <CardHeader className="pb-4 border-b border-white/5">
                <CardTitle className="text-2xl flex items-center gap-2 font-montserrat tracking-widest uppercase not-italic font-bold">
                    <span className="text-spotlight-amber">&#9733;</span> Leaderboard
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto max-h-[70vh]">
                <ul className="flex flex-col">
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
                                    "relative flex items-center justify-between p-4 border-b border-white/5",
                                    index === 0 ? "bg-gradient-to-r from-foil-gold/15 to-transparent" : ""
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className={cn(
                                            "flex items-center justify-center w-8 h-8 rounded-full font-anton text-lg",
                                            index === 0 ? "bg-foil-gold text-stage-black" :
                                                index === 1 ? "bg-silver-medal text-stage-black" :
                                                    index === 2 ? "bg-bronze-medal text-stage-black" :
                                                        "bg-white/10 text-champagne/50"
                                        )}
                                    >
                                        {index + 1}
                                    </div>
                                    <span className="font-montserrat font-semibold truncate max-w-[150px]">{team.name}</span>
                                </div>
                                <span className="font-anton text-xl text-foil-gold-bright">{team.score.toLocaleString()}</span>
                            </motion.li>
                        ))}
                    </AnimatePresence>
                </ul>
            </CardContent>
        </Card>
    );
}
