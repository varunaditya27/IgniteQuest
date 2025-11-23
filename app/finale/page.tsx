"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getParticipants } from "@/app/actions";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Mock data for fallback
const MOCK_WINNERS = [
    { id: "p1", name: "Team Alpha", score: 120 },
    { id: "p2", name: "Team Beta", score: 110 },
    { id: "p3", name: "Team Gamma", score: 95 },
];

export default function FinalePage() {
    const [winners, setWinners] = useState<any[]>(MOCK_WINNERS);

    useEffect(() => {
        const fetchWinners = async () => {
            const p = await getParticipants();
            if (p && p.length > 0) {
                setWinners(p.slice(0, 3));
            }
        };
        fetchWinners();
    }, []);

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-royal-black overflow-hidden relative">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-prestige-gold/20 via-royal-black to-royal-black"></div>
                {/* Animated particles or glow could go here */}
            </div>

            <div className="z-10 flex flex-col items-center w-full max-w-6xl">
                <motion.h1
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="text-6xl md:text-8xl font-playfair font-bold text-prestige-gold mb-16 drop-shadow-[0_0_20px_rgba(245,197,66,0.5)]"
                >
                    CHAMPIONS
                </motion.h1>

                <div className="flex items-end justify-center gap-4 md:gap-12 w-full h-[400px]">
                    {/* 2nd Place */}
                    {winners[1] && (
                        <motion.div
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 1.2 }}
                            className="flex flex-col items-center"
                        >
                            <div className="mb-4 text-center">
                                <div className="text-2xl font-montserrat font-bold text-ivory-white/80">{winners[1].name}</div>
                                <div className="text-3xl font-bebas text-gray-300">{winners[1].score} PTS</div>
                            </div>
                            <div className="w-32 md:w-48 h-48 bg-gradient-to-t from-gray-800 to-gray-600 rounded-t-lg flex items-center justify-center border-t-4 border-gray-400 shadow-[0_0_30px_rgba(156,163,175,0.3)]">
                                <span className="text-6xl font-bebas text-white/20">2</span>
                            </div>
                        </motion.div>
                    )}

                    {/* 1st Place */}
                    {winners[0] && (
                        <motion.div
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 1.0 }}
                            className="flex flex-col items-center z-20"
                        >
                            <div className="mb-6 text-center">
                                <div className="text-4xl font-montserrat font-bold text-prestige-gold drop-shadow-md">{winners[0].name}</div>
                                <div className="text-5xl font-bebas text-electric-yellow">{winners[0].score} PTS</div>
                            </div>
                            <div className="w-40 md:w-64 h-64 bg-gradient-to-t from-yellow-700 to-prestige-gold rounded-t-lg flex items-center justify-center border-t-4 border-electric-yellow shadow-[0_0_50px_rgba(245,197,66,0.6)] relative overflow-hidden">
                                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
                                <span className="text-8xl font-bebas text-white/30">1</span>
                            </div>
                        </motion.div>
                    )}

                    {/* 3rd Place */}
                    {winners[2] && (
                        <motion.div
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 1.4 }}
                            className="flex flex-col items-center"
                        >
                            <div className="mb-4 text-center">
                                <div className="text-2xl font-montserrat font-bold text-ivory-white/80">{winners[2].name}</div>
                                <div className="text-3xl font-bebas text-bronze-glow">{winners[2].score} PTS</div>
                            </div>
                            <div className="w-32 md:w-48 h-32 bg-gradient-to-t from-orange-900 to-bronze-glow rounded-t-lg flex items-center justify-center border-t-4 border-orange-400 shadow-[0_0_30px_rgba(192,133,82,0.3)]">
                                <span className="text-6xl font-bebas text-white/20">3</span>
                            </div>
                        </motion.div>
                    )}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.5, duration: 1 }}
                    className="mt-16"
                >
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
