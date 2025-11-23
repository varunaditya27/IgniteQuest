"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface Participant {
    id: string;
    name: string;
    score: number;
    rank?: number;
}

interface LeaderboardProps {
    participants: Participant[];
}

export function Leaderboard({ participants }: LeaderboardProps) {
    // Sort participants by score descending
    const sortedParticipants = [...participants].sort((a, b) => b.score - a.score);

    return (
        <Card className="h-full bg-carbon-gray/80 backdrop-blur-sm border-l border-prestige-gold/20 rounded-none rounded-l-2xl">
            <CardHeader className="pb-4 border-b border-white/5">
                <CardTitle className="text-2xl text-prestige-gold flex items-center gap-2">
                    <span className="text-electric-yellow">🏆</span> LEADERBOARD
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto max-h-[calc(100vh-120px)] scrollbar-hide">
                <ul className="flex flex-col">
                    <AnimatePresence>
                        {sortedParticipants.map((participant, index) => (
                            <motion.li
                                key={participant.id}
                                layout
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className={cn(
                                    "relative flex items-center justify-between p-4 border-b border-white/5 hover:bg-white/5 transition-colors",
                                    index < 3 ? "bg-gradient-to-r from-prestige-gold/10 to-transparent" : ""
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className={cn(
                                            "flex items-center justify-center w-8 h-8 rounded-full font-bold font-bebas text-lg",
                                            index === 0 ? "bg-prestige-gold text-royal-black shadow-[0_0_10px_#F5C542]" :
                                                index === 1 ? "bg-gray-300 text-royal-black" :
                                                    index === 2 ? "bg-bronze-glow text-white" :
                                                        "bg-white/10 text-white/50"
                                        )}
                                    >
                                        {index + 1}
                                    </div>
                                    <span className="font-montserrat font-semibold text-ivory-white truncate max-w-[150px]">
                                        {participant.name}
                                    </span>
                                </div>
                                <span className="font-bebas text-xl text-prestige-gold font-bold">
                                    {participant.score}
                                </span>

                                {/* Highlight effect for top 3 */}
                                {index < 3 && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-prestige-gold" />
                                )}
                            </motion.li>
                        ))}
                    </AnimatePresence>
                </ul>
            </CardContent>
        </Card>
    );
}
