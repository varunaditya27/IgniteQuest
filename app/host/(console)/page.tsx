import { env } from "@/lib/env";
import { getGameStateWithRelations, getTeamsForHost, getPhaseQuestionsInOrder } from "@/lib/game/queries";
import { HostConsole } from "@/components/host/HostConsole";

export const dynamic = "force-dynamic";

export default async function HostPage() {
    const [gameState, teams, phase1Questions, phase2Questions] = await Promise.all([
        getGameStateWithRelations(env.eventId),
        getTeamsForHost(env.eventId),
        getPhaseQuestionsInOrder(env.eventId, "PHASE_1"),
        getPhaseQuestionsInOrder(env.eventId, "PHASE_2"),
    ]);

    return (
        <HostConsole
            eventId={env.eventId}
            initialGameState={gameState}
            initialTeams={teams}
            phase1Questions={phase1Questions}
            phase2Questions={phase2Questions}
        />
    );
}
