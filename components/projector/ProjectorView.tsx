"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameChannel } from "@/hooks/useGameChannel";
import { getPublicSnapshot } from "@/lib/actions/queries";
import { QuestionDisplay } from "@/components/projector/QuestionDisplay";
import { Timer } from "@/components/shared/Timer";
import { Leaderboard } from "@/components/shared/Leaderboard";
import { EventBranding } from "@/components/shared/EventBranding";
import { gameConfig } from "@/lib/config";
import type { GamePhase } from "@prisma/client";
import type { GameStateEvent, PublicQuestion } from "@/lib/realtime/events";

type LiveState = {
    phase: GamePhase;
    question: PublicQuestion | null;
    activeTeam: { id: string; name: string } | null;
    questionRevealed: boolean;
    questionStartedAt: string | null;
    hiddenOptions: number[];
};

type Props = LiveState & {
    eventId: string;
    initialLeaderboard: { id: string; name: string; score: number }[];
};

function toState(payload: GameStateEvent["payload"]): LiveState {
    return {
        phase: payload.phase,
        question: payload.currentQuestion,
        activeTeam: payload.activeTeam,
        questionRevealed: payload.questionRevealed,
        questionStartedAt: payload.questionStartedAt,
        hiddenOptions: payload.hiddenOptions,
    };
}

export function ProjectorView({ eventId, initialLeaderboard, ...initial }: Props) {
    const router = useRouter();
    const [state, setState] = useState<LiveState>(initial);
    const [leaderboard, setLeaderboard] = useState(initialLeaderboard);
    const [revealedAnswer, setRevealedAnswer] = useState<{ questionId: string; correctOption: number } | null>(null);
    const [lifelineNotice, setLifelineNotice] = useState<string | null>(null);

    useGameChannel(
        eventId,
        (event) => {
            if (event.type === "GAME_STATE_CHANGED") {
                setState(toState(event.payload));
                if (event.payload.currentQuestion?.id !== state.question?.id) setRevealedAnswer(null);
            } else if (event.type === "SCORE_UPDATED") {
                setLeaderboard(event.payload.teams);
            } else if (event.type === "ANSWER_REVEALED") {
                setRevealedAnswer(event.payload);
            } else if (event.type === "LIFELINE_USED") {
                setLifelineNotice(`Lifeline used: ${event.payload.lifeline.replace("_", " ")}`);
                setTimeout(() => setLifelineNotice(null), 4000);
            }
        },
        async () => {
            // Resync on connect/reconnect — broadcast is fire-and-forget, so this is the
            // only way to recover from a missed message after a network drop.
            const snapshot = await getPublicSnapshot();
            setState(toState(snapshot));
            setLeaderboard(snapshot.leaderboard);
            setRevealedAnswer(null);
        }
    );

    useEffect(() => {
        if (state.phase === "FINALE") router.push("/finale");
    }, [state.phase, router]);

    return (
        <main className="stage-spotlight curtain-edges min-h-screen text-champagne flex flex-col items-center justify-center p-8 relative overflow-hidden">
            <div className="absolute top-8 left-8 foil-text font-bodoni text-2xl tracking-widest">IGNITEQUEST</div>
            <div className="absolute top-8 right-8">
                <EventBranding className="scale-90 origin-top-right" />
            </div>

            {state.phase === "REGISTRATION" && (
                <div className="flex flex-col items-center gap-10">
                    <h1 className="text-5xl font-bodoni foil-text">Registration Open</h1>
                    <EventBranding className="scale-125" />
                </div>
            )}

            {(state.phase === "PHASE_1" || state.phase === "PHASE_2") && state.question && (
                <div className="w-full flex flex-col items-center gap-8">
                    {state.questionRevealed && state.questionStartedAt && (
                        <Timer
                            startedAt={state.questionStartedAt}
                            limitSeconds={
                                state.question.timeLimitSeconds ??
                                (state.phase === "PHASE_1" ? gameConfig.phase1TimeLimitSeconds : gameConfig.phase2TimeLimitSeconds)
                            }
                        />
                    )}
                    <QuestionDisplay
                        question={state.question}
                        hiddenOptions={state.hiddenOptions}
                        revealed={state.questionRevealed}
                        revealedCorrectOption={revealedAnswer?.questionId === state.question.id ? revealedAnswer.correctOption : null}
                        activeTeamName={state.phase === "PHASE_1" ? state.activeTeam?.name : null}
                    />
                </div>
            )}

            {state.phase === "PHASE_1" && (
                <div className="absolute right-8 top-24 w-80">
                    <Leaderboard teams={leaderboard} />
                </div>
            )}

            {lifelineNotice && (
                <div className="absolute bottom-8 text-xl text-spotlight-amber font-montserrat uppercase tracking-widest animate-pulse">
                    {lifelineNotice}
                </div>
            )}
        </main>
    );
}
