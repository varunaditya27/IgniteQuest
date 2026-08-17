"use server";

import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { GamePhase } from "@prisma/client";
import { requireHost } from "@/lib/actions/guard";
import { getGameStateWithRelations, getPhaseQuestionsInOrder, getFinalStandings } from "@/lib/game/queries";
import type { FastestFingersResult } from "@/lib/game/scoring";
import { toGameStateEvent } from "@/lib/game/sanitize";
import { broadcast } from "@/lib/realtime/broadcast";

async function broadcastState() {
    const state = await getGameStateWithRelations(env.eventId);
    await broadcast(env.eventId, toGameStateEvent(state));
}

export async function startPhase2Question(order: number) {
    await requireHost();
    const questions = await getPhaseQuestionsInOrder(env.eventId, "PHASE_2");
    const question = questions.find((q) => q.order === order);
    if (!question) throw new Error(`No Phase 2 question with order ${order}.`);
    // Re-opening an already-shown question would let teams who hadn't answered yet
    // answer late, out of sync with everyone else — "everyone starts together" is the
    // whole point of Fastest Fingers (gpt-chat-reference.md section 8.1).
    if (question.presentedAt) throw new Error("This question has already been shown and cannot be restarted.");

    await prisma.$transaction([
        prisma.question.update({ where: { id: question.id }, data: { presentedAt: new Date() } }),
        prisma.gameState.update({
            where: { eventId: env.eventId },
            data: {
                phase: GamePhase.PHASE_2,
                currentQuestionId: question.id,
                activeTeamId: null,
                questionRevealed: true,
                answerLocked: false,
                questionStartedAt: new Date(),
                hiddenOptions: [],
            },
        }),
    ]);
    await broadcastState();
}

export async function lockPhase2Question() {
    await requireHost();
    await prisma.gameState.update({
        where: { eventId: env.eventId },
        data: { answerLocked: true },
    });
    await broadcastState();
}

// No live leaderboard during Phase 2 — see gpt-chat-reference.md section 10.
// This computes final standings for the host's eyes only, without broadcasting scores.
export async function computeFinalStandings(): Promise<(FastestFingersResult & { name: string })[]> {
    await requireHost();
    return getFinalStandings(env.eventId);
}

export async function revealFinale() {
    await requireHost();
    await prisma.gameState.update({
        where: { eventId: env.eventId },
        data: { phase: GamePhase.FINALE, currentQuestionId: null, questionStartedAt: null },
    });
    await broadcastState();
}
