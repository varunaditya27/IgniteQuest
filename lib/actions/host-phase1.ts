"use server";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { requireHost } from "@/lib/actions/guard";
import { getGameState, getTeams, getNextQuestion } from "@/lib/game/queries";
import { getActiveTeamForQuestion } from "@/lib/game/round-robin";
import { scoreAnswer, rankPhase1 } from "@/lib/game/scoring";

export async function startPhase1() {
  await requireHost();
  const teams = await getTeams();
  const firstQuestion = await getNextQuestion("PHASE_1");
  if (!firstQuestion) throw new Error("No Phase 1 questions available");

  const activeTeam = getActiveTeamForQuestion(teams, firstQuestion.order);
  return prisma.gameState.update({
    where: { eventId: env.eventId },
    data: {
      stage: "PHASE1_INTERSTITIAL",
      currentQuestionId: firstQuestion.id,
      activeTeamId: activeTeam.id,
      questionStartedAt: null,
      lockedOptionIndex: null,
      answerRevealedAt: null,
      hiddenOptions: [],
    },
    include: { currentQuestion: true, activeTeam: true },
  });
}

export async function advanceToQuestion() {
  await requireHost();
  const state = await getGameState();
  if (state.stage !== "PHASE1_INTERSTITIAL" || !state.currentQuestionId) {
    throw new Error("Not awaiting an interstitial");
  }

  await prisma.question.update({ where: { id: state.currentQuestionId }, data: { presentedAt: new Date() } });
  return prisma.gameState.update({
    where: { eventId: env.eventId },
    data: { stage: "PHASE1_QUESTION", questionStartedAt: new Date() },
    include: { currentQuestion: true, activeTeam: true },
  });
}

export async function lockOption(optionIndex: number) {
  await requireHost();
  const state = await getGameState();
  if (state.stage !== "PHASE1_QUESTION") throw new Error("No question in progress");

  return prisma.gameState.update({
    where: { eventId: env.eventId },
    data: { lockedOptionIndex: optionIndex },
    include: { currentQuestion: true, activeTeam: true },
  });
}

export async function revealAnswer() {
  await requireHost();
  const state = await getGameState();
  if (state.stage !== "PHASE1_QUESTION" || !state.currentQuestion || !state.activeTeamId || state.lockedOptionIndex == null) {
    throw new Error("Nothing locked to reveal");
  }

  const { isCorrect, pointsAwarded } = scoreAnswer(
    state.currentQuestion.correctOption,
    state.currentQuestion.points,
    state.lockedOptionIndex
  );

  const activeTeamId = state.activeTeamId;
  const questionId = state.currentQuestion.id;

  await prisma.$transaction(async (tx) => {
    const existing = await tx.teamAnswer.findUnique({
      where: { teamId_questionId: { teamId: activeTeamId, questionId } },
    });
    // Idempotent under retries: apply the delta against whatever was
    // previously recorded rather than blindly incrementing the score.
    const delta = pointsAwarded - (existing?.pointsAwarded ?? 0);

    await tx.teamAnswer.upsert({
      where: { teamId_questionId: { teamId: activeTeamId, questionId } },
      create: {
        teamId: activeTeamId,
        questionId,
        selectedOption: state.lockedOptionIndex!,
        isCorrect,
        pointsAwarded,
        submittedAt: new Date(),
      },
      update: { selectedOption: state.lockedOptionIndex!, isCorrect, pointsAwarded, submittedAt: new Date() },
    });

    if (delta !== 0) {
      await tx.team.update({ where: { id: activeTeamId }, data: { score: { increment: delta } } });
    }
  });

  const [updatedState, teams] = await Promise.all([
    prisma.gameState.update({
      where: { eventId: env.eventId },
      data: { answerRevealedAt: new Date() },
      include: { currentQuestion: true, activeTeam: true },
    }),
    getTeams(),
  ]);

  return { state: updatedState, teams };
}

export type NextTurnResult =
  | { kind: "interstitial"; state: Awaited<ReturnType<typeof advanceToQuestion>> }
  | { kind: "tiebreak"; teamIds: string[] }
  | { kind: "qualifiers_revealed"; qualifiedTeamIds: string[] };

export async function nextTurn(): Promise<NextTurnResult> {
  await requireHost();
  const state = await getGameState();
  if (!state.currentQuestion) throw new Error("No current question");

  const nextQuestion = await getNextQuestion("PHASE_1");
  if (nextQuestion) {
    const teams = await getTeams();
    const activeTeam = getActiveTeamForQuestion(teams, nextQuestion.order);
    const updated = await prisma.gameState.update({
      where: { eventId: env.eventId },
      data: {
        stage: "PHASE1_INTERSTITIAL",
        currentQuestionId: nextQuestion.id,
        activeTeamId: activeTeam.id,
        questionStartedAt: null,
        lockedOptionIndex: null,
        answerRevealedAt: null,
        hiddenOptions: [],
      },
      include: { currentQuestion: true, activeTeam: true },
    });
    return { kind: "interstitial", state: updated };
  }

  return lockPhase1Qualification();
}

async function lockPhase1Qualification(): Promise<NextTurnResult> {
  const teams = await getTeams();
  const { ranked, tiebreak } = rankPhase1(teams, env.finalistCount);

  if (tiebreak) {
    await prisma.gameState.update({
      where: { eventId: env.eventId },
      data: { stage: "PHASE1_TIEBREAK", tiebreakTeamIds: tiebreak.teamIds },
    });
    return { kind: "tiebreak", teamIds: tiebreak.teamIds };
  }

  const qualifiedIds = ranked.filter((t) => t.rank <= env.finalistCount).map((t) => t.id);
  await prisma.$transaction([
    prisma.team.updateMany({ where: { id: { in: qualifiedIds } }, data: { qualified: true } }),
    prisma.gameState.update({
      where: { eventId: env.eventId },
      data: { stage: "PHASE1_QUALIFIERS_REVEAL", tiebreakTeamIds: [], currentQuestionId: null, activeTeamId: null },
    }),
  ]);

  return { kind: "qualifiers_revealed", qualifiedTeamIds: qualifiedIds };
}
