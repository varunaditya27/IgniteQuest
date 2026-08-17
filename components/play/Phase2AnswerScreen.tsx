"use client";

import { useState } from "react";
import { useGameChannel } from "@/hooks/useGameChannel";
import { getPublicSnapshot } from "@/lib/actions/queries";
import { submitPhase2Answer } from "@/lib/actions/gameplay";
import { teamLogout } from "@/lib/actions/auth";
import { Timer } from "@/components/shared/Timer";
import { gameConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import { sfx } from "@/lib/sound/sfx";
import type { PublicQuestion } from "@/lib/realtime/events";
import type { GamePhase } from "@prisma/client";

type LiveState = {
    phase: GamePhase;
    question: PublicQuestion | null;
    revealed: boolean;
    locked: boolean;
    startedAt: string | null;
};

type Props = LiveState & { eventId: string; teamName: string };

export function Phase2AnswerScreen({ eventId, teamName, ...initial }: Props) {
    const [state, setState] = useState<LiveState>(initial);

    useGameChannel(
        eventId,
        (event) => {
            if (event.type === "GAME_STATE_CHANGED") {
                setState({
                    phase: event.payload.phase,
                    question: event.payload.currentQuestion,
                    revealed: event.payload.questionRevealed,
                    locked: event.payload.answerLocked,
                    startedAt: event.payload.questionStartedAt,
                });
            }
        },
        async () => {
            // Resync on connect/reconnect — a team's phone losing signal for even a
            // moment must never leave it stuck showing a stale/finished question.
            const snapshot = await getPublicSnapshot();
            setState({
                phase: snapshot.phase,
                question: snapshot.currentQuestion,
                revealed: snapshot.questionRevealed,
                locked: snapshot.answerLocked,
                startedAt: snapshot.questionStartedAt,
            });
        }
    );

    if (state.phase === "FINALE") {
        return <StatusScreen teamName={teamName} message="Watch the projector." />;
    }
    if (state.phase !== "PHASE_2" || !state.question || !state.revealed) {
        return <StatusScreen teamName={teamName} message="Waiting for the next question…" />;
    }

    return (
        <QuestionAnswerForm
            // Remounts (and resets local answer state) whenever the question changes.
            key={state.question.id}
            teamName={teamName}
            question={state.question}
            startedAt={state.startedAt}
            locked={state.locked}
        />
    );
}

function QuestionAnswerForm({
    teamName,
    question,
    startedAt,
    locked: lockedFromHost,
}: {
    teamName: string;
    question: PublicQuestion;
    startedAt: string | null;
    locked: boolean;
}) {
    const [selected, setSelected] = useState<number | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const locked = lockedFromHost || submitted || submitting;

    async function handleSubmit(optionIndex: number) {
        setSelected(optionIndex);
        sfx.tap();
        setSubmitting(true);
        setError(null);
        try {
            const res = await submitPhase2Answer(optionIndex);
            if (!res.success) {
                setError(res.error);
                sfx.error();
                return;
            }
            sfx.lockIn();
            setSubmitted(true);
        } catch {
            setError("Couldn't submit — check your connection and try again.");
            sfx.error();
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="stage-spotlight min-h-screen flex flex-col p-4">
            <div className="flex items-center justify-between mb-6">
                <span className="font-montserrat text-xs tracking-[0.3em] uppercase text-foil-gold/70">{teamName}</span>
                {startedAt && <Timer startedAt={startedAt} limitSeconds={question.timeLimitSeconds ?? gameConfig.phase2TimeLimitSeconds} />}
            </div>

            <div className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto gap-6">
                {question.codeSnippet && (
                    <pre className="bg-stage-black-deep p-3 rounded-sm text-sm overflow-x-auto border border-white/5">{question.codeSnippet}</pre>
                )}
                <p className="text-xl text-center font-bodoni">{question.text}</p>
                <div className="grid grid-cols-1 gap-3">
                    {question.options.map((opt, i) => (
                        <button
                            key={i}
                            disabled={locked}
                            onClick={() => handleSubmit(i)}
                            className={cn(
                                "flex items-center gap-3 p-4 rounded-sm border text-left text-base transition-colors disabled:opacity-50",
                                selected === i
                                    ? "border-foil-gold bg-foil-gold/15 text-foil-gold-bright"
                                    : "border-white/10 bg-stage-black-raised/60 hover:border-foil-gold/40"
                            )}
                        >
                            <span className="font-anton text-lg">{String.fromCharCode(65 + i)}</span>
                            {opt}
                        </button>
                    ))}
                </div>
                {error && <p className="text-buzzer-red text-sm text-center">{error}</p>}
                {submitted && <p className="text-correct-emerald font-bold text-center">Locked in.</p>}
            </div>
        </main>
    );
}

function StatusScreen({ teamName, message }: { teamName: string; message: string }) {
    return (
        <main className="stage-spotlight min-h-screen flex flex-col items-center justify-center p-4 gap-4 text-center">
            <p className="text-foil-gold-bright font-montserrat tracking-widest uppercase text-sm">{teamName}</p>
            <p className="text-xl text-champagne/70 font-bodoni">{message}</p>
            <form action={teamLogout}>
                <button className="text-sm text-champagne/40 underline mt-8">Log out</button>
            </form>
        </main>
    );
}
