"use server";

import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { gameConfig } from "@/lib/config";
import { requireHost } from "@/lib/actions/guard";
import { getGameStateWithRelations, getTeamsForHost, getUnusedPhase1Questions } from "@/lib/game/queries";
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
    const [teams, unused] = await Promise.all([
        getTeamsForHost(env.eventId),
        getUnusedPhase1Questions(env.eventId),
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
    await prisma.gameState.update({
        where: { eventId: env.eventId },
        data: { questionRevealed: true, questionStartedAt: new Date(), answerLocked: false },
    });
    await broadcastState();
}

export async function lockCurrentAnswer() {
    await requireHost();
    await prisma.gameState.update({
        where: { eventId: env.eventId },
        data: { answerLocked: true },
    });
    await broadcastState();
}

export async function selectActiveTeam(teamId: string) {
    await requireHost();
    await prisma.gameState.update({
        where: { eventId: env.eventId },
        data: { activeTeamId: teamId },
    });
    await broadcastState();
}

// Idempotent under re-scoring: if the host corrects a mistaken Correct/Wrong click,
// the team's score moves by the *difference* from what was previously awarded for
// this question, not by the full new amount again.
export async function recordPhase1Answer(isCorrect: boolean) {
    await requireHost();
    const state = await getGameStateWithRelations(env.eventId);
    if (!state.currentQuestion || !state.activeTeam) {
        throw new Error("No active question/team to record an answer for.");
    }

    const teamId = state.activeTeam.id;
    const questionId = state.currentQuestion.id;
    const points = isCorrect ? state.currentQuestion.points : gameConfig.wrongAnswerPoints;
    // Time from question reveal to this verdict — used as the Phase 1 finalist
    // tie-break (see lockPhase1AndSelectFinalists). Only set on the *first* verdict for
    // this question; a later Correct/Wrong correction shouldn't retroactively change
    // how long the team took to answer, just the outcome.
    const responseTimeMs = state.questionStartedAt ? Date.now() - state.questionStartedAt.getTime() : null;

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
    const [teams, unused] = await Promise.all([
        getTeamsForHost(env.eventId),
        getUnusedPhase1Questions(env.eventId),
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
    // Finalist cutoff: score first, cumulative Phase 1 response time as tiebreaker
    // (faster team qualifies) — mirrors the Phase 2 ranking model.
    const [teams, answers] = await Promise.all([
        prisma.team.findMany({ where: { eventId: env.eventId } }),
        prisma.teamAnswer.findMany({ where: { team: { eventId: env.eventId }, question: { phase: "PHASE_1" } } }),
    ]);
    const ranked = rankPhase1(teams, answers);
    const finalistIds = pickFinalists(ranked, gameConfig.finalistCount);

    await prisma.$transaction(
        teams.map((team) =>
            prisma.team.update({
                where: { id: team.id },
                data: { eliminated: !finalistIds.has(team.id) },
            })
        )
    );

    await prisma.gameState.update({
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
    });

    await broadcastState();
    await broadcastScores();
}
