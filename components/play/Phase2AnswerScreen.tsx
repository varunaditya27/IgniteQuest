"use client";

import { useState } from "react";
import { useGameChannel } from "@/hooks/useGameChannel";
import { getPublicSnapshot } from "@/lib/actions/queries";
import { submitPhase2Answer } from "@/lib/actions/gameplay";
import { teamLogout } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";
import { Timer } from "@/components/shared/Timer";
import { gameConfig } from "@/lib/config";
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
        return <StatusScreen teamName={teamName} message="The Final Sprint is complete. Watch the projector!" />;
    }
    if (state.phase !== "PHASE_2" || !state.question || !state.revealed) {
        return <StatusScreen teamName={teamName} message="Waiting for the host to start the next question…" />;
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
        setSubmitting(true);
        setError(null);
        try {
            const res = await submitPhase2Answer(optionIndex);
            if (!res.success) {
                setError(res.error);
                return;
            }
            setSubmitted(true);
        } catch {
            setError("Couldn't submit — check your connection and try again.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="min-h-screen bg-royal-black text-ivory-white flex flex-col items-center justify-center p-4 gap-6">
            <p className="text-prestige-gold font-montserrat">{teamName}</p>
            {startedAt && (
                <Timer startedAt={startedAt} limitSeconds={question.timeLimitSeconds ?? gameConfig.phase2TimeLimitSeconds} />
            )}
            {question.codeSnippet && (
                <pre className="bg-black/50 p-3 rounded text-sm w-full max-w-md overflow-x-auto">{question.codeSnippet}</pre>
            )}
            <p className="text-xl text-center">{question.text}</p>
            <div className="grid grid-cols-1 gap-3 w-full max-w-md">
                {question.options.map((opt, i) => (
                    <Button
                        key={i}
                        disabled={locked}
                        onClick={() => handleSubmit(i)}
                        className={
                            selected === i
                                ? "bg-prestige-gold text-royal-black font-bold"
                                : "bg-carbon-gray border border-white/10 text-ivory-white"
                        }
                    >
                        {String.fromCharCode(65 + i)}. {opt}
                    </Button>
                ))}
            </div>
            {error && <p className="text-carmine-red text-sm">{error}</p>}
            {submitted && <p className="text-emerald-signal font-bold">Answer locked in!</p>}
        </main>
    );
}

function StatusScreen({ teamName, message }: { teamName: string; message: string }) {
    return (
        <main className="min-h-screen bg-royal-black text-ivory-white flex flex-col items-center justify-center p-4 gap-4 text-center">
            <p className="text-prestige-gold font-montserrat">{teamName}</p>
            <p className="text-xl text-ivory-white/70">{message}</p>
            <form action={teamLogout}>
                <button className="text-sm text-ivory-white/40 underline mt-8">Log out</button>
            </form>
        </main>
    );
}
