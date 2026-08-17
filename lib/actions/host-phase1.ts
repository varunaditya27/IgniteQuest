"use server";

import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { gameConfig } from "@/lib/config";
import { requireHost, assertPhase } from "@/lib/actions/guard";
import { getGameStateWithRelations, getTeamsForHost, getUnusedQuestions, getHostBundle } from "@/lib/game/queries";
import { teamForTurn } from "@/lib/game/round-robin";
import { rankPhase1, pickFinalists } from "@/lib/game/scoring";
import { toGameStateEvent } from "@/lib/game/sanitize";
import { broadcast } from "@/lib/realtime/broadcast";
import { GamePhase } from "@prisma/client";

async function broadcastState() {
    const state = await getGameStateWithRelations(env.eventId);
    await broadcast(env.eventId, toGameStateEvent(state));
    return state;
}

async function broadcastScores() {
    const teams = await prisma.team.findMany({
        where: { eventId: env.eventId },
        select: { id: true, name: true, score: true },
    });
    await broadcast(env.eventId, { type: "SCORE_UPDATED", payload: { teams } });
}

// Every mutating action below already has its own fresh GameState in hand by
// the time it finishes (from broadcastState() or its own read) — pairing that
// with one getTeamsForHost() call is the whole bundle, instead of re-fetching
// GameState a second time via getHostBundle.
async function bundleWith(gameState: Awaited<ReturnType<typeof getGameStateWithRelations>>) {
    return { gameState, teams: await getTeamsForHost(env.eventId) };
}

// Resync-only — used after a dropped realtime connection reconnects. The
// interactive path never needs this: every mutating action below returns its
// own fresh bundle directly (CLAUDE.md "UI design rules" #6).
export async function getHostSnapshot() {
    await requireHost();
    return getHostBundle(env.eventId);
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
    // `teams` was already fetched above for the round-robin calculation and this
    // action never touches scores, so it's still fresh — no need for bundleWith's
    // extra query to re-fetch what's already in hand.
    return { gameState: await broadcastState(), teams };
}

export async function revealCurrentQuestion() {
    await requireHost();
    const result = await prisma.gameState.updateMany({
        where: { eventId: env.eventId, phase: GamePhase.PHASE_1 },
        data: { questionRevealed: true, questionStartedAt: new Date(), answerLocked: false },
    });
    if (result.count === 0) throw new Error("Not in Phase 1.");
    return bundleWith(await broadcastState());
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
    return bundleWith(await broadcastState());
}

// The host judges by clicking the option the team actually said out loud — the
// server is the only thing that knows/decides correctness (CLAUDE.md rule 6),
// there is no separate "mark correct" vs "mark wrong" control to keep in sync.
// Idempotent under re-judging: if the host picks a different option for the same
// question, the team's score moves by the *difference* from what was previously
// awarded, not by the full new amount again.
export async function recordPhase1Answer(selectedOption: number) {
    await requireHost();
    const state = await getGameStateWithRelations(env.eventId);
    assertPhase(state.phase, GamePhase.PHASE_1);
    if (!state.currentQuestion || !state.activeTeam) {
        throw new Error("No active question/team to record an answer for.");
    }
    if (selectedOption < 0 || selectedOption >= state.currentQuestion.options.length) {
        throw new Error("Not a valid option for this question.");
    }
    // Scoring before Reveal would leave questionStartedAt unset, making
    // responseTimeMs null — which the tiebreak treats as 0ms, unfairly making that
    // team look instantaneous next to every team scored normally.
    if (!state.questionRevealed || !state.questionStartedAt) {
        throw new Error("Reveal the question before recording an answer.");
    }

    const teamId = state.activeTeam.id;
    const questionId = state.currentQuestion.id;
    const isCorrect = selectedOption === state.currentQuestion.correctOption;
    const points = isCorrect ? state.currentQuestion.points : gameConfig.wrongAnswerPoints;
    // Time from question reveal to this verdict — used as the Phase 1 finalist
    // tie-break (see lockPhase1AndSelectFinalists). Only set on the *first* verdict for
    // this question; a later re-judgment shouldn't retroactively change how long the
    // team took to answer, just the outcome.
    const responseTimeMs = Date.now() - state.questionStartedAt.getTime();

    await prisma.$transaction(async (tx) => {
        const existing = await tx.teamAnswer.findUnique({
            where: { teamId_questionId: { teamId, questionId } },
            select: { pointsAwarded: true },
        });
        const delta = points - (existing?.pointsAwarded ?? 0);

        await tx.teamAnswer.upsert({
            where: { teamId_questionId: { teamId, questionId } },
            update: { isCorrect, selectedOption, pointsAwarded: points },
            create: { teamId, questionId, isCorrect, selectedOption, pointsAwarded: points, responseTimeMs },
        });
        await tx.team.update({ where: { id: teamId }, data: { score: { increment: delta } } });
    });

    await Promise.all([
        broadcastScores(),
        broadcast(env.eventId, {
            type: "ANSWER_REVEALED",
            payload: { questionId, correctOption: state.currentQuestion.correctOption },
        }),
    ]);
    return bundleWith(state);
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
    // `teams` was already fetched above and this action never touches scores —
    // reuse it instead of bundleWith's extra round trip.
    return { gameState: await broadcastState(), teams };
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

    const [state] = await Promise.all([broadcastState(), broadcastScores()]);
    return bundleWith(state);
}
