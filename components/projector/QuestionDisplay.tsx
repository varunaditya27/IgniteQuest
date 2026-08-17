"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { sfx } from "@/lib/sound/sfx";
import type { PublicQuestion } from "@/lib/realtime/events";

type Props = {
    question: PublicQuestion;
    hiddenOptions: number[];
    revealed: boolean;
    revealedCorrectOption: number | null;
    activeTeamName?: string | null;
};

export function QuestionDisplay({ question, hiddenOptions, revealed, revealedCorrectOption, activeTeamName }: Props) {
    const prev = useRef({ revealed, hiddenOptionsCount: hiddenOptions.length, correctOption: revealedCorrectOption, questionId: question.id });

    useEffect(() => {
        const p = prev.current;
        if (question.id !== p.questionId) {
            sfx.cardChange();
        } else {
            if (revealed && !p.revealed) sfx.reveal();
            if (hiddenOptions.length > p.hiddenOptionsCount) sfx.fiftyFifty();
            if (revealedCorrectOption !== null && p.correctOption === null) sfx.correctDing();
        }
        prev.current = { revealed, hiddenOptionsCount: hiddenOptions.length, correctOption: revealedCorrectOption, questionId: question.id };
    }, [question.id, revealed, hiddenOptions.length, revealedCorrectOption]);

    return (
        <div className="w-full max-w-4xl mx-auto">
            {activeTeamName && (
                <p className="text-center text-foil-gold-bright font-montserrat tracking-[0.3em] uppercase mb-4 text-sm">
                    {activeTeamName}&apos;s turn
                </p>
            )}
            <div className="relative rounded-lg border border-foil-gold/25 bg-stage-black-raised/90 p-8 shadow-[0_0_60px_-10px_rgba(212,169,74,0.15),0_20px_50px_-20px_rgba(0,0,0,0.7)] min-h-[220px] flex flex-col justify-center before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-foil-gold before:to-transparent">
                {!revealed ? (
                    <p className="text-center text-2xl text-champagne/40 font-bodoni tracking-wide animate-pulse">
                        Get ready…
                    </p>
                ) : (
                    <>
                        {question.codeSnippet && (
                            <pre className="bg-stage-black-deep p-4 rounded-lg mb-6 text-lg overflow-x-auto font-mono text-champagne/90 border border-white/5">
                                {question.codeSnippet}
                            </pre>
                        )}
                        <motion.h2
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl md:text-4xl text-center mb-8 font-bodoni"
                        >
                            {question.text}
                        </motion.h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {question.options.map((opt, i) => {
                                if (hiddenOptions.includes(i)) {
                                    return (
                                        <div key={i} className="p-4 rounded-md border-2 border-white/5 opacity-20 font-montserrat">
                                            {String.fromCharCode(65 + i)}. —
                                        </div>
                                    );
                                }
                                const isCorrect = revealedCorrectOption === i;
                                const isWrong = revealedCorrectOption !== null && !isCorrect;
                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 14, scale: 0.97 }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                            scale: isCorrect ? 1.03 : 1,
                                        }}
                                        transition={{ delay: 0.15 + i * 0.12, type: "spring", stiffness: 260, damping: 22 }}
                                        className={cn(
                                            "p-4 rounded-md border-2 text-xl font-montserrat transition-colors",
                                            isCorrect
                                                ? "border-correct-emerald bg-correct-emerald/15 text-correct-emerald font-bold shadow-[0_0_30px_-5px_rgba(47,191,113,0.5)]"
                                                : isWrong
                                                    ? "border-white/5 text-champagne/30"
                                                    : "border-white/15 text-champagne"
                                        )}
                                    >
                                        {String.fromCharCode(65 + i)}. {opt}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
