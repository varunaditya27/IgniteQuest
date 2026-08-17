"use client";

import { useRouter } from "next/navigation";
import type { getGameStateWithRelations, getTeamsForHost, getPhaseQuestionsInOrder } from "@/lib/game/queries";
import { useGameChannel } from "@/hooks/useGameChannel";
import { RegistrationPanel } from "@/components/host/RegistrationPanel";
import { Phase1Panel } from "@/components/host/Phase1Panel";
import { Phase2Panel } from "@/components/host/Phase2Panel";
import { hostLogout } from "@/lib/actions/auth";

export type GameStateWithRelations = Awaited<ReturnType<typeof getGameStateWithRelations>>;
export type TeamForHost = Awaited<ReturnType<typeof getTeamsForHost>>[number];
export type QuestionRow = Awaited<ReturnType<typeof getPhaseQuestionsInOrder>>[number];

type Props = {
    eventId: string;
    initialGameState: GameStateWithRelations;
    initialTeams: TeamForHost[];
    phase1Questions: QuestionRow[];
    phase2Questions: QuestionRow[];
};

export function HostConsole({ eventId, initialGameState, initialTeams, phase1Questions, phase2Questions }: Props) {
    const router = useRouter();

    // Any broadcast (including ones this console caused) means server state
    // moved on — re-fetch the server component so the host always sees the
    // full row data (e.g. correctOption), not the sanitized public payload.
    // Also refresh on every (re)connect: broadcast has no replay, so a host laptop
    // that drops WiFi for a moment must still end up consistent, not stuck stale.
    useGameChannel(
        eventId,
        () => router.refresh(),
        () => router.refresh()
    );

    const gameState = initialGameState;
    const teams = initialTeams;

    return (
        <main className="min-h-screen bg-stage-black p-6 text-champagne">
            <header className="flex items-center justify-between mb-6 pb-4 border-b border-foil-gold/15">
                <h1 className="text-2xl font-bodoni font-bold foil-text">Host Console</h1>
                <div className="flex items-center gap-4">
                    <span className="text-xs text-champagne/50 font-montserrat tracking-widest uppercase">Phase: {gameState.phase}</span>
                    <form action={hostLogout}>
                        <button className="text-sm text-champagne/50 hover:text-buzzer-red underline">
                            Log out
                        </button>
                    </form>
                </div>
            </header>

            {gameState.phase === "REGISTRATION" && (
                <RegistrationPanel teams={teams} hasQuestions={phase1Questions.length > 0} />
            )}

            {gameState.phase === "PHASE_1" && (
                <Phase1Panel gameState={gameState} teams={teams} totalQuestions={phase1Questions.length} />
            )}

            {(gameState.phase === "PHASE_2" || gameState.phase === "FINALE") && (
                <Phase2Panel gameState={gameState} teams={teams} phase2Questions={phase2Questions} />
            )}
        </main>
    );
}
