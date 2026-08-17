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
            // Phase 1 answers — responseTimeMs for the finalist tie-break signal, plus
            // questionId/selectedOption so the host console can show which option was
            // already judged for the current question without a second query.
            answers: {
                where: { question: { phase: "PHASE_1" } },
                select: { questionId: true, selectedOption: true, responseTimeMs: true },
            },
        },
    });
}

// The full privileged snapshot a host action hands back to its own caller so the
// console can update instantly from the response instead of a second round trip
// (router.refresh()) — see CLAUDE.md "UI design rules" #6.
export async function getHostBundle(eventId: string) {
    const [gameState, teams] = await Promise.all([getGameStateWithRelations(eventId), getTeamsForHost(eventId)]);
    return { gameState, teams };
}

export async function getPhaseQuestionsInOrder(eventId: string, phase: "PHASE_1" | "PHASE_2") {
    return prisma.question.findMany({
        where: { eventId, phase },
        orderBy: { order: "asc" },
    });
}

// Questions never yet shown on screen, in either phase. A question is "used up" by
// being displayed (GameState.currentQuestion), not just by being scored — see
// Question.presentedAt. Ordered ascending, so "next in the curriculum sequence" is
// just the first entry.
export async function getUnusedQuestions(eventId: string, phase: "PHASE_1" | "PHASE_2") {
    return prisma.question.findMany({
        where: { eventId, phase, presentedAt: null },
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
