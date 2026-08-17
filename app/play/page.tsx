import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { getAuthenticatedTeamId } from "@/lib/auth/team";
import { getGameState } from "@/lib/game/queries";
import { toPublicQuestion } from "@/lib/game/sanitize";
import { PinLoginForm } from "@/components/play/PinLoginForm";
import { Phase2AnswerScreen } from "@/components/play/Phase2AnswerScreen";

export default async function PlayPage() {
  const teamId = await getAuthenticatedTeamId();

  if (!teamId) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6">
        <h1 className="foil-text mb-10 font-[family-name:var(--font-display)] text-3xl font-bold italic">
          Finalist Login
        </h1>
        <PinLoginForm />
      </main>
    );
  }

  const [team, gameState] = await Promise.all([
    prisma.team.findUniqueOrThrow({ where: { id: teamId } }),
    getGameState(),
  ]);

  const initial =
    gameState.stage === "PHASE2_QUESTION" && gameState.currentQuestion && gameState.questionStartedAt
      ? { question: toPublicQuestion(gameState.currentQuestion), startedAt: gameState.questionStartedAt.toISOString() }
      : null;

  return (
    <Phase2AnswerScreen
      eventId={env.eventId}
      teamName={team.name}
      timeLimitSeconds={env.phase2TimeLimitSeconds}
      initial={initial}
    />
  );
}
