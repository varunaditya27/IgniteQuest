import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedTeamId } from "@/lib/auth/team";
import { getGameStateWithRelations } from "@/lib/game/queries";
import { toPublicQuestion } from "@/lib/game/sanitize";
import { teamLogout } from "@/lib/actions/auth";
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

    // A team can log in during Phase 1 (before finalists are decided) and still hold
    // a valid session after being eliminated — the server already rejects their
    // submission, but showing the live, clickable question screen anyway is
    // misleading right up until that rejection. Gate it here instead.
    if (team.eliminated) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center bg-royal-black p-4 gap-4 text-center">
                <p className="text-prestige-gold font-montserrat">{team.name}</p>
                <p className="text-xl text-ivory-white/70">This team did not qualify for the Final Sprint.</p>
                <form action={teamLogout}>
                    <button className="text-sm text-ivory-white/40 underline mt-4">Log out</button>
                </form>
            </main>
        );
    }

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
