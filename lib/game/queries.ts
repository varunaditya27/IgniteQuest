import "server-only";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import type { Phase2Stats } from "@/lib/game/scoring";

export function getGameState() {
  return prisma.gameState.findUniqueOrThrow({
    where: { eventId: env.eventId },
    include: { currentQuestion: true, activeTeam: true },
  });
}

export function getTeams() {
  return prisma.team.findMany({ where: { eventId: env.eventId }, orderBy: { createdAt: "asc" } });
}

export function getQualifiedTeams() {
  return prisma.team.findMany({
    where: { eventId: env.eventId, qualified: true },
    orderBy: { createdAt: "asc" },
  });
}

export function getNextQuestion(phase: "PHASE_1" | "PHASE_2") {
  return prisma.question.findFirst({
    where: { eventId: env.eventId, phase, presentedAt: null },
    orderBy: { order: "asc" },
  });
}

export function getLifelineUsages(teamId: string) {
  return prisma.lifelineUsage.findMany({ where: { teamId } });
}

export async function getPhase2Stats(): Promise<Map<string, Phase2Stats>> {
  const answers = await prisma.teamAnswer.findMany({
    where: { question: { eventId: env.eventId, phase: "PHASE_2" } },
    select: { teamId: true, isCorrect: true, responseTimeMs: true },
  });

  const stats = new Map<string, Phase2Stats>();
  for (const answer of answers) {
    const current = stats.get(answer.teamId) ?? { correctCount: 0, totalResponseTimeMs: 0 };
    stats.set(answer.teamId, {
      correctCount: current.correctCount + (answer.isCorrect ? 1 : 0),
      totalResponseTimeMs: current.totalResponseTimeMs + (answer.responseTimeMs ?? 0),
    });
  }
  return stats;
}
