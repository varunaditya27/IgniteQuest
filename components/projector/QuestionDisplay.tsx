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

    if (!revealed) {
        return (
            <div className="flex flex-col items-center gap-6">
                <p className="font-montserrat text-sm tracking-[0.4em] uppercase text-foil-gold/70">Up Next</p>
                <h1 className="font-bodoni text-7xl foil-text text-center">{activeTeamName ?? "—"}</h1>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto">
            {activeTeamName && (
                <p className="text-center text-foil-gold-bright font-montserrat tracking-[0.3em] uppercase mb-6 text-sm">
                    {activeTeamName}
                </p>
            )}
            {question.codeSnippet && (
                <pre className="bg-stage-black-deep p-4 rounded-sm mb-6 text-lg overflow-x-auto font-mono text-champagne/90 border border-white/5">
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
                            <div key={i} className="p-4 rounded-sm border border-white/5 opacity-20 font-montserrat">
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
                            animate={{ opacity: 1, y: 0, scale: isCorrect ? 1.03 : 1 }}
                            transition={{ delay: 0.15 + i * 0.12, type: "spring", stiffness: 260, damping: 22 }}
                            className={cn(
                                "p-4 rounded-sm border text-xl font-montserrat transition-colors",
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
        </div>
    );
}
