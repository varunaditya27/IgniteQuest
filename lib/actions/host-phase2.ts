"use server";

import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { GamePhase } from "@prisma/client";
import { requireHost } from "@/lib/actions/guard";
import { getGameStateWithRelations, getUnusedQuestions, getFinalStandings } from "@/lib/game/queries";
import type { FastestFingersResult } from "@/lib/game/scoring";
import { toGameStateEvent } from "@/lib/game/sanitize";
import { broadcast } from "@/lib/realtime/broadcast";

async function broadcastState() {
    const state = await getGameStateWithRelations(env.eventId);
    await broadcast(env.eventId, toGameStateEvent(state));
}

// Always the lowest-order not-yet-shown Phase 2 question — strictly sequential, no
// picking out of order. A question already marked presentedAt can never be reopened:
// that would let teams who hadn't answered yet answer late, out of sync with everyone
// else, which defeats the point of Fastest Fingers (gpt-chat-reference.md section
// 8.1), so there's nothing to guard against re-showing beyond just not selecting it.
export async function startNextPhase2Question() {
    await requireHost();
    const [question] = await getUnusedQuestions(env.eventId, "PHASE_2");
    if (!question) throw new Error("No more Phase 2 questions.");

    await prisma.$transaction(async (tx) => {
        await tx.question.update({ where: { id: question.id }, data: { presentedAt: new Date() } });
        // Phase transitions into PHASE_2 happen exclusively via
        // lockPhase1AndSelectFinalists — this only ever advances within Phase 2.
        const result = await tx.gameState.updateMany({
            where: { eventId: env.eventId, phase: GamePhase.PHASE_2 },
            data: {
                currentQuestionId: question.id,
                activeTeamId: null,
                questionRevealed: true,
                answerLocked: false,
                questionStartedAt: new Date(),
                hiddenOptions: [],
            },
        });
        if (result.count === 0) throw new Error("Not in Phase 2.");
    });
    await broadcastState();
}

export async function lockPhase2Question() {
    await requireHost();
    const result = await prisma.gameState.updateMany({
        where: { eventId: env.eventId, phase: GamePhase.PHASE_2 },
        data: { answerLocked: true },
    });
    if (result.count === 0) throw new Error("Not in Phase 2.");
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
    const result = await prisma.gameState.updateMany({
        where: { eventId: env.eventId, phase: GamePhase.PHASE_2 },
        data: { phase: GamePhase.FINALE, currentQuestionId: null, questionStartedAt: null },
    });
    if (result.count === 0) throw new Error("Not in Phase 2.");
    await broadcastState();
}
