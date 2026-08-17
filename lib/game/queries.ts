import { prisma } from "@/lib/prisma";
import { rankFastestFingers, type FastestFingersResult } from "@/lib/game/scoring";

export async function getGameStateWithRelations(eventId: string) {
    return prisma.gameState.findUniqueOrThrow({
        where: { eventId },
        include: { currentQuestion: true, activeTeam: true },
    });
}

export async function getLeaderboard(eventId: string) {
    return prisma.team.findMany({
        where: { eventId },
        orderBy: { score: "desc" },
        select: { id: true, name: true, score: true, eliminated: true },
    });
}

export async function getTeamsForHost(eventId: string) {
    return prisma.team.findMany({
        where: { eventId },
        orderBy: { createdAt: "asc" },
        include: {
            lifelineUsages: { select: { type: true } },
            // Phase 1 response times only, for the host to see the finalist tie-break
            // signal (score, then cumulative time) before locking scores.
            answers: {
                where: { question: { phase: "PHASE_1" } },
                select: { responseTimeMs: true },
            },
        },
    });
}

export async function getPhaseQuestionsInOrder(eventId: string, phase: "PHASE_1" | "PHASE_2") {
    return prisma.question.findMany({
        where: { eventId, phase },
        orderBy: { order: "asc" },
    });
}

// Phase 1 questions never yet shown on screen. A question is "used up" by being
// displayed (GameState.currentQuestion), not just by being scored — see
// Question.presentedAt. Ordered ascending, so "next in the curriculum sequence" is
// just the first entry.
export async function getUnusedPhase1Questions(eventId: string) {
    return prisma.question.findMany({
        where: { eventId, phase: "PHASE_1", presentedAt: null },
        orderBy: { order: "asc" },
    });
}

// Only meaningful to reveal once GameState.phase === FINALE — callers must gate on that.
export async function getFinalStandings(eventId: string): Promise<(FastestFingersResult & { name: string })[]> {
    const [finalists, answers] = await Promise.all([
        prisma.team.findMany({ where: { eventId, eliminated: false }, select: { id: true, name: true } }),
        prisma.teamAnswer.findMany({
            where: { team: { eventId, eliminated: false }, question: { phase: "PHASE_2" } },
        }),
    ]);
    const ranked = rankFastestFingers(finalists.map((f) => f.id), answers);
    return ranked.map((r) => ({ ...r, name: finalists.find((f) => f.id === r.teamId)?.name ?? "" }));
}
