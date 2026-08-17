"use server";

import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { gameConfig } from "@/lib/config";
import { requireHost, assertPhase } from "@/lib/actions/guard";
import { getGameStateWithRelations, getTeamsForHost, getUnusedQuestions } from "@/lib/game/queries";
import { teamForTurn } from "@/lib/game/round-robin";
import { rankPhase1, pickFinalists } from "@/lib/game/scoring";
import { toGameStateEvent } from "@/lib/game/sanitize";
import { broadcast } from "@/lib/realtime/broadcast";
import { GamePhase } from "@prisma/client";

async function broadcastState() {
    const state = await getGameStateWithRelations(env.eventId);
    await broadcast(env.eventId, toGameStateEvent(state));
}

async function broadcastScores() {
    const teams = await prisma.team.findMany({
        where: { eventId: env.eventId },
        select: { id: true, name: true, score: true },
    });
    await broadcast(env.eventId, { type: "SCORE_UPDATED", payload: { teams } });
}

export async function startPhase1() {
    await requireHost();
    const current = await prisma.gameState.findUniqueOrThrow({ where: { eventId: env.eventId } });
    assertPhase(current.phase, GamePhase.REGISTRATION);

    const [teams, unused] = await Promise.all([
        getTeamsForHost(env.eventId),
        getUnusedQuestions(env.eventId, "PHASE_1"),
    ]);
    const firstQuestion = unused[0] ?? null;
    const firstTeam = firstQuestion ? teamForTurn(teams, 1) : null;

    await prisma.$transaction(async (tx) => {
        if (firstQuestion) {
            await tx.question.update({ where: { id: firstQuestion.id }, data: { presentedAt: new Date() } });
        }
        await tx.gameState.update({
            where: { eventId: env.eventId },
            data: {
                phase: GamePhase.PHASE_1,
                currentQuestionId: firstQuestion?.id ?? null,
                activeTeamId: firstTeam?.id ?? null,
                turnNumber: firstQuestion ? 1 : 0,
                questionStartedAt: null,
                questionRevealed: false,
                answerLocked: false,
                hiddenOptions: [],
            },
        });
    });
    await broadcastState();
}

export async function revealCurrentQuestion() {
    await requireHost();
    const result = await prisma.gameState.updateMany({
        where: { eventId: env.eventId, phase: GamePhase.PHASE_1 },
        data: { questionRevealed: true, questionStartedAt: new Date(), answerLocked: false },
    });
    if (result.count === 0) throw new Error("Not in Phase 1.");
    await broadcastState();
}

export async function selectActiveTeam(teamId: string) {
    await requireHost();
    // A team plucked from anywhere but this event's non-eliminated roster (a stale
    // client, a forged id) must never become the active team.
    const team = await prisma.team.findUnique({ where: { id: teamId }, select: { eventId: true, eliminated: true } });
    if (!team || team.eventId !== env.eventId || team.eliminated) {
        throw new Error("Not an eligible team for this event.");
    }

    const result = await prisma.gameState.updateMany({
        where: { eventId: env.eventId, phase: GamePhase.PHASE_1 },
        data: { activeTeamId: teamId },
    });
    if (result.count === 0) throw new Error("Not in Phase 1.");
    await broadcastState();
}

// Idempotent under re-scoring: if the host corrects a mistaken Correct/Wrong click,
// the team's score moves by the *difference* from what was previously awarded for
// this question, not by the full new amount again.
export async function recordPhase1Answer(isCorrect: boolean) {
    await requireHost();
    const state = await getGameStateWithRelations(env.eventId);
    assertPhase(state.phase, GamePhase.PHASE_1);
    if (!state.currentQuestion || !state.activeTeam) {
        throw new Error("No active question/team to record an answer for.");
    }
    // Scoring before Reveal would leave questionStartedAt unset, making
    // responseTimeMs null — which the tiebreak treats as 0ms, unfairly making that
    // team look instantaneous next to every team scored normally.
    if (!state.questionRevealed || !state.questionStartedAt) {
        throw new Error("Reveal the question before recording an answer.");
    }

    const teamId = state.activeTeam.id;
    const questionId = state.currentQuestion.id;
    const points = isCorrect ? state.currentQuestion.points : gameConfig.wrongAnswerPoints;
    // Time from question reveal to this verdict — used as the Phase 1 finalist
    // tie-break (see lockPhase1AndSelectFinalists). Only set on the *first* verdict for
    // this question; a later Correct/Wrong correction shouldn't retroactively change
    // how long the team took to answer, just the outcome.
    const responseTimeMs = Date.now() - state.questionStartedAt.getTime();

    await prisma.$transaction(async (tx) => {
        const existing = await tx.teamAnswer.findUnique({
            where: { teamId_questionId: { teamId, questionId } },
            select: { pointsAwarded: true },
        });
        const delta = points - (existing?.pointsAwarded ?? 0);

        await tx.teamAnswer.upsert({
            where: { teamId_questionId: { teamId, questionId } },
            update: { isCorrect, pointsAwarded: points },
            create: { teamId, questionId, isCorrect, pointsAwarded: points, responseTimeMs },
        });
        await tx.team.update({ where: { id: teamId }, data: { score: { increment: delta } } });
    });

    await broadcastScores();
    await broadcast(env.eventId, {
        type: "ANSWER_REVEALED",
        payload: { questionId, correctOption: state.currentQuestion.correctOption },
    });
}

export async function advanceToNextPhase1Question() {
    await requireHost();
    const state = await getGameStateWithRelations(env.eventId);
    assertPhase(state.phase, GamePhase.PHASE_1);

    const [teams, unused] = await Promise.all([
        getTeamsForHost(env.eventId),
        getUnusedQuestions(env.eventId, "PHASE_1"),
    ]);

    const next = unused[0] ?? null;
    const nextTurn = state.turnNumber + 1;
    const nextTeam = next ? teamForTurn(teams, nextTurn) : null;

    await prisma.$transaction(async (tx) => {
        if (next) {
            await tx.question.update({ where: { id: next.id }, data: { presentedAt: new Date() } });
        }
        await tx.gameState.update({
            where: { eventId: env.eventId },
            data: {
                currentQuestionId: next?.id ?? null,
                activeTeamId: nextTeam?.id ?? null,
                turnNumber: next ? nextTurn : state.turnNumber,
                questionStartedAt: null,
                questionRevealed: false,
                answerLocked: false,
                hiddenOptions: [],
            },
        });
    });
    await broadcastState();
}

export async function lockPhase1AndSelectFinalists() {
    await requireHost();
    const current = await prisma.gameState.findUniqueOrThrow({ where: { eventId: env.eventId } });
    assertPhase(current.phase, GamePhase.PHASE_1);

    // Finalist cutoff: score first, cumulative Phase 1 response time as tiebreaker
    // (faster team qualifies) — mirrors the Phase 2 ranking model.
    const [teams, answers] = await Promise.all([
        prisma.team.findMany({ where: { eventId: env.eventId } }),
        prisma.teamAnswer.findMany({ where: { team: { eventId: env.eventId }, question: { phase: "PHASE_1" } } }),
    ]);
    const ranked = rankPhase1(teams, answers);
    const finalistIds = pickFinalists(ranked, gameConfig.finalistCount);

    await prisma.$transaction([
        ...teams.map((team) =>
            prisma.team.update({
                where: { id: team.id },
                data: { eliminated: !finalistIds.has(team.id) },
            })
        ),
        prisma.gameState.update({
            where: { eventId: env.eventId },
            data: {
                phase: GamePhase.PHASE_2,
                currentQuestionId: null,
                activeTeamId: null,
                turnNumber: 0,
                questionStartedAt: null,
                questionRevealed: false,
                answerLocked: false,
                hiddenOptions: [],
            },
        }),
    ]);

    await broadcastState();
    await broadcastScores();
}
