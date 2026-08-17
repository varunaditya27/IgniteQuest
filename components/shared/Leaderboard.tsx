"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

type Entry = { id: string; name: string; score: number };

export function Leaderboard({ teams }: { teams: Entry[] }) {
    const sorted = [...teams].sort((a, b) => b.score - a.score);

    return (
        <Card className="h-full bg-carbon-gray/80 backdrop-blur-sm border-prestige-gold/20 rounded-2xl">
            <CardHeader className="pb-4 border-b border-white/5">
                <CardTitle className="text-2xl text-prestige-gold flex items-center gap-2">
                    <span className="text-electric-yellow">🏆</span> LEADERBOARD
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
                                    index < 3 ? "bg-gradient-to-r from-prestige-gold/10 to-transparent" : ""
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className={cn(
                                            "flex items-center justify-center w-8 h-8 rounded-full font-bold font-bebas text-lg",
                                            index === 0 ? "bg-prestige-gold text-royal-black" :
                                                index === 1 ? "bg-gray-300 text-royal-black" :
                                                    index === 2 ? "bg-bronze-glow text-white" :
                                                        "bg-white/10 text-white/50"
                                        )}
                                    >
                                        {index + 1}
                                    </div>
                                    <span className="font-montserrat font-semibold truncate max-w-[150px]">{team.name}</span>
                                </div>
                                <span className="font-bebas text-xl text-prestige-gold font-bold">{team.score}</span>
                            </motion.li>
                        ))}
                    </AnimatePresence>
                </ul>
            </CardContent>
        </Card>
    );
}
