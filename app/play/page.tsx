import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedTeamId } from "@/lib/auth/team";
import { getGameStateWithRelations } from "@/lib/game/queries";
import { toPublicQuestion } from "@/lib/game/sanitize";
import { PinLoginForm } from "@/components/play/PinLoginForm";
import { Phase2AnswerScreen } from "@/components/play/Phase2AnswerScreen";

export default async function PlayPage() {
    const teamId = await getAuthenticatedTeamId();

    if (!teamId) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center bg-royal-black p-4">
                <PinLoginForm />
            </main>
        );
    }

    const [team, gameState] = await Promise.all([
        prisma.team.findUniqueOrThrow({ where: { id: teamId } }),
        getGameStateWithRelations(env.eventId),
    ]);

    return (
        <Phase2AnswerScreen
            eventId={env.eventId}
            teamName={team.name}
            phase={gameState.phase}
            question={toPublicQuestion(gameState.currentQuestion)}
            revealed={gameState.questionRevealed}
            locked={gameState.answerLocked}
            startedAt={gameState.questionStartedAt?.toISOString() ?? null}
        />
    );
}
