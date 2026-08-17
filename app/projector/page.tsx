import { env } from "@/lib/env";
import { getGameStateWithRelations, getLeaderboard } from "@/lib/game/queries";
import { toPublicQuestion } from "@/lib/game/sanitize";
import { ProjectorView } from "@/components/projector/ProjectorView";

export const dynamic = "force-dynamic";

export default async function ProjectorPage() {
    const [gameState, leaderboard] = await Promise.all([
        getGameStateWithRelations(env.eventId),
        getLeaderboard(env.eventId),
    ]);

    return (
        <ProjectorView
            eventId={env.eventId}
            phase={gameState.phase}
            question={toPublicQuestion(gameState.currentQuestion)}
            activeTeam={gameState.activeTeam ? { id: gameState.activeTeam.id, name: gameState.activeTeam.name } : null}
            questionRevealed={gameState.questionRevealed}
            questionStartedAt={gameState.questionStartedAt?.toISOString() ?? null}
            hiddenOptions={gameState.hiddenOptions}
            initialLeaderboard={leaderboard}
        />
    );
}
