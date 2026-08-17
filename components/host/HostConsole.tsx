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
    useGameChannel(eventId, () => router.refresh());

    const gameState = initialGameState;
    const teams = initialTeams;

    return (
        <main className="min-h-screen bg-royal-black p-6 text-ivory-white">
            <header className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-playfair font-bold text-prestige-gold">Host Console</h1>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-ivory-white/50 font-montserrat">Phase: {gameState.phase}</span>
                    <form action={hostLogout}>
                        <button className="text-sm text-ivory-white/50 hover:text-carmine-red underline">
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
