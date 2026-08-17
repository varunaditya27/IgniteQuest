import type { Team, TeamAnswer } from "@prisma/client";

export type Phase1Standing = {
    teamId: string;
    score: number;
    cumulativeResponseTimeMs: number;
};

// Phase 1 finalist ranking: score first, cumulative response time across all answered
// questions as tiebreaker (faster team wins) — same shape as the Phase 2 model, just
// scored by points instead of correctness count.
export function rankPhase1(teams: Team[], answers: TeamAnswer[]): Phase1Standing[] {
    return teams
        .map((t) => ({
            teamId: t.id,
            score: t.score,
            cumulativeResponseTimeMs: answers
                .filter((a) => a.teamId === t.id)
                .reduce((sum, a) => sum + (a.responseTimeMs ?? 0), 0),
        }))
        .sort((a, b) => (b.score !== a.score ? b.score - a.score : a.cumulativeResponseTimeMs - b.cumulativeResponseTimeMs));
}

export function pickFinalists(ranked: Phase1Standing[], finalistCount: number): Set<string> {
    return new Set(ranked.slice(0, finalistCount).map((r) => r.teamId));
}

export type FastestFingersResult = {
    teamId: string;
    correctCount: number;
    totalResponseTimeMs: number;
};

// Phase 2 ranking: correctness first, total response time as tiebreaker.
// See gpt-chat-reference.md section 11.
export function rankFastestFingers(
    teamIds: string[],
    answers: TeamAnswer[]
): FastestFingersResult[] {
    const results = teamIds.map((teamId) => {
        const teamAnswers = answers.filter((a) => a.teamId === teamId);
        return {
            teamId,
            correctCount: teamAnswers.filter((a) => a.isCorrect).length,
            totalResponseTimeMs: teamAnswers.reduce((sum, a) => sum + (a.responseTimeMs ?? 0), 0),
        };
    });

    return results.sort((a, b) => {
        if (b.correctCount !== a.correctCount) return b.correctCount - a.correctCount;
        return a.totalResponseTimeMs - b.totalResponseTimeMs;
    });
}
