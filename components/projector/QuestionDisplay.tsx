"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { PublicQuestion } from "@/lib/realtime/events";

type Props = {
    question: PublicQuestion;
    hiddenOptions: number[];
    revealed: boolean;
    revealedCorrectOption: number | null;
    activeTeamName?: string | null;
};

export function QuestionDisplay({ question, hiddenOptions, revealed, revealedCorrectOption, activeTeamName }: Props) {
    return (
        <div className="w-full max-w-4xl mx-auto">
            {activeTeamName && (
                <p className="text-center text-prestige-gold font-montserrat tracking-widest uppercase mb-4">
                    {activeTeamName}&apos;s turn
                </p>
            )}
            <div className="bg-carbon-gray/90 border border-prestige-gold/30 rounded-2xl p-8 shadow-[0_0_30px_rgba(245,197,66,0.1)]">
                {question.codeSnippet && (
                    <pre className="bg-black/60 p-4 rounded-lg mb-6 text-lg overflow-x-auto font-mono text-ivory-white/90">
                        {question.codeSnippet}
                    </pre>
                )}
                <h2 className="text-3xl md:text-4xl text-center mb-8">{question.text}</h2>

                {revealed && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {question.options.map((opt, i) => {
                            if (hiddenOptions.includes(i)) {
                                return (
                                    <div key={i} className="p-4 rounded-xl border-2 border-white/5 opacity-20">
                                        {String.fromCharCode(65 + i)}. —
                                    </div>
                                );
                            }
                            const isCorrect = revealedCorrectOption === i;
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={cn(
                                        "p-4 rounded-xl border-2 text-xl transition-colors",
                                        isCorrect
                                            ? "border-emerald-signal bg-emerald-900/30 text-emerald-signal font-bold"
                                            : "border-white/10 text-ivory-white"
                                    )}
                                >
                                    {String.fromCharCode(65 + i)}. {opt}
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
