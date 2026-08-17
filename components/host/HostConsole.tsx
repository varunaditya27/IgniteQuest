"use client";

import { useState } from "react";
import type { getGameStateWithRelations, getTeamsForHost, getPhaseQuestionsInOrder } from "@/lib/game/queries";
import { useGameChannel } from "@/hooks/useGameChannel";
import { getHostSnapshot } from "@/lib/actions/host-phase1";
import { RegistrationPanel } from "@/components/host/RegistrationPanel";
import { Phase1Panel } from "@/components/host/Phase1Panel";
import { Phase2Panel } from "@/components/host/Phase2Panel";
import { hostLogout } from "@/lib/actions/auth";
import { sfx } from "@/lib/sound/sfx";

export type GameStateWithRelations = Awaited<ReturnType<typeof getGameStateWithRelations>>;
export type TeamForHost = Awaited<ReturnType<typeof getTeamsForHost>>[number];
export type QuestionRow = Awaited<ReturnType<typeof getPhaseQuestionsInOrder>>[number];
export type HostBundle = { gameState: GameStateWithRelations; teams: TeamForHost[] };

type Props = {
    eventId: string;
    initialGameState: GameStateWithRelations;
    initialTeams: TeamForHost[];
    phase1Questions: QuestionRow[];
    phase2Questions: QuestionRow[];
};

export function HostConsole({ eventId, initialGameState, initialTeams, phase1Questions, phase2Questions }: Props) {
    const [gameState, setGameState] = useState(initialGameState);
    const [teams, setTeams] = useState(initialTeams);

    function applyBundle(bundle: HostBundle) {
        setGameState(bundle.gameState);
        setTeams(bundle.teams);
    }

    // Every host action already returns its own fresh bundle (applied by the
    // caller directly) — this channel exists only to (a) chime when a team
    // registers and (b) resync after a dropped connection, e.g. a second host
    // tab or a laptop that briefly lost WiFi. It is not the primary update path.
    useGameChannel(
        eventId,
        (event) => {
            if (event.type === "TEAM_REGISTERED") {
                sfx.pinSuccess();
                getHostSnapshot().then(applyBundle);
            }
        },
        () => {
            getHostSnapshot().then(applyBundle);
        }
    );

    return (
        <div className="min-h-screen bg-stage-black text-champagne grid grid-cols-[auto_1fr] grid-rows-[auto_1fr]">
            <div className="col-span-2 flex items-center justify-between border-b border-foil-gold/15 px-6 py-3">
                <div className="flex items-baseline gap-3">
                    <span className="font-bodoni text-lg foil-text">IgniteQuest</span>
                    <span className="text-champagne/30">/</span>
                    <span className="font-montserrat text-xs tracking-[0.3em] uppercase text-champagne/50">Host Console</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="font-anton text-sm tracking-widest text-foil-gold-bright">{gameState.phase.replace("_", " ")}</span>
                    <form action={hostLogout}>
                        <button className="text-xs text-champagne/40 hover:text-buzzer-red uppercase tracking-widest">
                            Log out
                        </button>
                    </form>
                </div>
            </div>

            <main className="col-span-2 p-6">
                {gameState.phase === "REGISTRATION" && (
                    <RegistrationPanel teams={teams} hasQuestions={phase1Questions.length > 0} onBundle={applyBundle} />
                )}

                {gameState.phase === "PHASE_1" && (
                    <Phase1Panel gameState={gameState} teams={teams} totalQuestions={phase1Questions.length} onBundle={applyBundle} />
                )}

                {(gameState.phase === "PHASE_2" || gameState.phase === "FINALE") && (
                    <Phase2Panel gameState={gameState} teams={teams} phase2Questions={phase2Questions} onBundle={applyBundle} />
                )}
            </main>
        </div>
    );
}
