"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface QuestionCardProps {
    question: {
        id: string;
        text: string;
        options: string[];
        correctOption: number;
    };
    onReveal?: () => void;
}

export function QuestionCard({ question, onReveal }: QuestionCardProps) {
    const [isRevealed, setIsRevealed] = useState(false);

    const handleReveal = () => {
        setIsRevealed(true);
        if (onReveal) onReveal();
    };

    return (
        <Card className="w-full max-w-4xl mx-auto bg-carbon-gray/90 backdrop-blur-md border-prestige-gold/30 shadow-[0_0_30px_rgba(245,197,66,0.1)]">
            <CardHeader className="text-center border-b border-white/5 pb-8">
                <CardTitle className="text-3xl md:text-5xl leading-tight text-ivory-white drop-shadow-md">
                    {question.text}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {question.options.map((option, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div
                                className={cn(
                                    "relative p-6 rounded-xl border-2 transition-all duration-500 flex items-center",
                                    isRevealed && index === question.correctOption
                                        ? "bg-emerald-900/30 border-emerald-signal shadow-[0_0_15px_rgba(62,207,142,0.4)]"
                                        : "bg-royal-black/50 border-white/10 hover:border-prestige-gold/50"
                                )}
                            >
                                <span
                                    className={cn(
                                        "flex items-center justify-center w-10 h-10 rounded-full border-2 mr-4 text-lg font-bold font-montserrat",
                                        isRevealed && index === question.correctOption
                                            ? "border-emerald-signal text-emerald-signal"
                                            : "border-white/20 text-white/50"
                                    )}
                                >
                                    {String.fromCharCode(65 + index)}
                                </span>
                                <span
                                    className={cn(
                                        "text-xl md:text-2xl font-source-sans",
                                        isRevealed && index === question.correctOption
                                            ? "text-emerald-signal font-bold"
                                            : "text-ivory-white"
                                    )}
                                >
                                    {option}
                                </span>

                                {/* Reveal Animation Effect */}
                                {isRevealed && index === question.correctOption && (
                                    <motion.div
                                        layoutId="correct-glow"
                                        className="absolute inset-0 rounded-xl bg-emerald-signal/10"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.5 }}
                                    />
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-10 flex justify-center">
                    {!isRevealed ? (
                        <Button
                            onClick={handleReveal}
                            size="lg"
                            className="text-xl px-10 py-6 rounded-full font-bold tracking-wider bg-prestige-gold text-royal-black hover:bg-electric-yellow shadow-lg hover:shadow-prestige-gold/20"
                        >
                            REVEAL ANSWER
                        </Button>
                    ) : (
                        <div className="h-14 flex items-center text-emerald-signal font-bold text-xl animate-pulse">
                            ANSWER REVEALED
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
