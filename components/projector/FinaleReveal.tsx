"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { EventBranding } from "@/components/shared/EventBranding";
import type { FastestFingersResult } from "@/lib/game/scoring";

type Winner = FastestFingersResult & { name: string };

const PODIUM = [
    { place: 2, heightClass: "h-48", from: "from-stage-black-raised to-silver-medal/40", border: "border-silver-medal" },
    { place: 1, heightClass: "h-64", from: "from-foil-gold-deep to-foil-gold-bright", border: "border-foil-gold-bright" },
    { place: 3, heightClass: "h-32", from: "from-stage-black-raised to-bronze-medal/40", border: "border-bronze-medal" },
] as const;

export function FinaleReveal({ winners }: { winners: Winner[] }) {
    const byPlace = (place: number) => winners[place - 1];

    return (
        <main className="stage-spotlight curtain-edges flex min-h-screen flex-col items-center justify-center overflow-hidden relative">
            <div className="z-10 flex flex-col items-center w-full max-w-6xl">
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="text-spotlight-amber font-montserrat text-sm tracking-[0.5em] uppercase mb-4"
                >
                    IgniteQuest — Python Arena
                </motion.p>
                <motion.h1
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="text-6xl md:text-8xl font-bodoni font-bold foil-text mb-16"
                >
                    CHAMPIONS
                </motion.h1>

                <div className="flex items-end justify-center gap-4 md:gap-12 w-full">
                    {PODIUM.map(({ place, heightClass, from, border }, i) => {
                        const winner = byPlace(place);
                        if (!winner) return null;
                        return (
                            <motion.div
                                key={place}
                                initial={{ opacity: 0, y: 100 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.8 + i * 0.2, type: "spring", stiffness: 120, damping: 16 }}
                                className="flex flex-col items-center"
                            >
                                <div className="mb-4 text-center">
                                    <div className="text-2xl md:text-3xl font-bodoni font-bold text-champagne">{winner.name}</div>
                                    <div className="text-lg text-champagne/60 font-montserrat">
                                        {winner.correctCount} correct · {(winner.totalResponseTimeMs / 1000).toFixed(1)}s
                                    </div>
                                </div>
                                <div
                                    className={`w-32 md:w-48 ${heightClass} bg-gradient-to-t ${from} rounded-t-lg flex items-center justify-center border-t-4 ${border} shadow-[0_-10px_40px_-10px_rgba(212,169,74,0.2)]`}
                                >
                                    <span className="text-6xl font-anton text-stage-black/40">{place}</span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2, duration: 1 }}
                    className="mt-16 flex flex-col items-center gap-8"
                >
                    <EventBranding />
                    <Link href="/">
                        <Button variant="ghost">Return to Home</Button>
                    </Link>
                </motion.div>
            </div>
        </main>
    );
}
