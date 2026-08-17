"use server";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { requireHost } from "@/lib/actions/guard";
import { getGameState, getNextQuestion, getQualifiedTeams, getPhase2Stats } from "@/lib/game/queries";
import { toPublicQuestion } from "@/lib/game/sanitize";
import { rankPhase2 } from "@/lib/game/scoring";
import { broadcast } from "@/lib/realtime/broadcast";

export async function startPhase2() {
  await requireHost();

  // manualRank is a last-resort tiebreak key shared by both phases' ranking
  // (see lib/game/scoring.ts). A value set to resolve a Phase 1 qualification
  // tie must not silently influence an unrelated Phase 2 tie later.
  await prisma.team.updateMany({ where: { eventId: env.eventId }, data: { manualRank: null } });

  return prisma.gameState.update({
    where: { eventId: env.eventId },
    data: { stage: "PHASE2_LOBBY", currentQuestionId: null, activeTeamId: null },
    include: { currentQuestion: true, activeTeam: true },
  });
}

export async function startPhase2Question() {
  await requireHost();
  const state = await getGameState();
  if (state.stage !== "PHASE2_LOBBY") throw new Error("Not awaiting a Phase 2 question");

  const question = await getNextQuestion("PHASE_2");
  if (!question) throw new Error("No Phase 2 questions remain — call finishPhase2 instead");

  const startedAt = new Date();
  await prisma.question.update({ where: { id: question.id }, data: { presentedAt: startedAt } });
  const updated = await prisma.gameState.update({
    where: { eventId: env.eventId },
    data: { stage: "PHASE2_QUESTION", currentQuestionId: question.id, questionStartedAt: startedAt },
    include: { currentQuestion: true, activeTeam: true },
  });

  await broadcast({
    type: "PHASE2_QUESTION_STARTED",
    question: toPublicQuestion(question),
    startedAt: startedAt.toISOString(),
    timeLimitSeconds: env.phase2TimeLimitSeconds,
  });

  return updated;
}

export async function lockPhase2Question() {
  await requireHost();
  const state = await getGameState();
  if (state.stage !== "PHASE2_QUESTION") throw new Error("No Phase 2 question in progress");

  const updated = await prisma.gameState.update({
    where: { eventId: env.eventId },
    data: { stage: "PHASE2_LOBBY" },
    include: { currentQuestion: true, activeTeam: true },
  });

  await broadcast({ type: "PHASE2_QUESTION_LOCKED" });
  return updated;
}

export type FinishPhase2Result =
  | { kind: "tiebreak"; teamIds: string[] }
  | { kind: "finale_revealed"; podium: { id: string; rank: number }[] };

export async function finishPhase2(): Promise<FinishPhase2Result> {
  await requireHost();
  const state = await getGameState();
  if (state.stage !== "PHASE2_LOBBY") throw new Error("A Phase 2 question is still in progress");

  const teams = await getQualifiedTeams();
  const stats = await getPhase2Stats();
  const { ranked, tiebreak } = rankPhase2(teams, stats, 3);

  if (tiebreak) {
    await prisma.gameState.update({
      where: { eventId: env.eventId },
      data: { stage: "PHASE2_TIEBREAK", tiebreakTeamIds: tiebreak.teamIds },
    });
    return { kind: "tiebreak", teamIds: tiebreak.teamIds };
  }

  await prisma.gameState.update({ where: { eventId: env.eventId }, data: { stage: "FINALE" } });
  return { kind: "finale_revealed", podium: ranked.filter((t) => t.rank <= 3).map((t) => ({ id: t.id, rank: t.rank })) };
}
