"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { EventBranding } from "@/components/shared/EventBranding";
import type { FastestFingersResult } from "@/lib/game/scoring";

type Winner = FastestFingersResult & { name: string };

const PODIUM = [
    { place: 2, heightClass: "h-48", from: "from-gray-800 to-gray-600", border: "border-gray-400" },
    { place: 1, heightClass: "h-64", from: "from-yellow-700 to-prestige-gold", border: "border-electric-yellow" },
    { place: 3, heightClass: "h-32", from: "from-orange-900 to-bronze-glow", border: "border-orange-400" },
] as const;

export function FinaleReveal({ winners }: { winners: Winner[] }) {
    const byPlace = (place: number) => winners[place - 1];

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-royal-black overflow-hidden relative">
            <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-prestige-gold/20 via-royal-black to-royal-black" />

            <div className="z-10 flex flex-col items-center w-full max-w-6xl">
                <motion.h1
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="text-6xl md:text-8xl font-playfair font-bold text-prestige-gold mb-16 drop-shadow-[0_0_20px_rgba(245,197,66,0.5)]"
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
                                transition={{ duration: 0.8, delay: 0.8 + i * 0.2 }}
                                className="flex flex-col items-center"
                            >
                                <div className="mb-4 text-center">
                                    <div className="text-2xl md:text-3xl font-montserrat font-bold text-ivory-white">{winner.name}</div>
                                    <div className="text-lg text-ivory-white/60">
                                        {winner.correctCount} correct · {(winner.totalResponseTimeMs / 1000).toFixed(1)}s
                                    </div>
                                </div>
                                <div
                                    className={`w-32 md:w-48 ${heightClass} bg-gradient-to-t ${from} rounded-t-lg flex items-center justify-center border-t-4 ${border}`}
                                >
                                    <span className="text-6xl font-bebas text-white/30">{place}</span>
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
                        <Button variant="outline" className="border-white/20 text-white/50 hover:text-white hover:border-white">
                            RETURN TO HOME
                        </Button>
                    </Link>
                </motion.div>
            </div>
        </main>
    );
}
