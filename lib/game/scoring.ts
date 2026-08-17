import "server-only";
import type { Team } from "@prisma/client";
import { env } from "@/lib/env";

export function scoreAnswer(correctOption: number, points: number, selectedOption: number) {
  const isCorrect = selectedOption === correctOption;
  return { isCorrect, pointsAwarded: isCorrect ? points : env.wrongAnswerPoints };
}

export type RankedTeam<T extends Team = Team> = T & { rank: number };
export type RankResult<T extends Team = Team> = {
  ranked: RankedTeam<T>[];
  tiebreak: { teamIds: string[] } | null;
};

// Phase 1 qualification: score only. Only a tie straddling the cutoff
// matters here — teams tied for, say, 1st place both qualify regardless of
// their order, since Phase 2 starts finalists on equal footing. If the
// cutoff itself falls inside an unresolved tie, the caller must not
// proceed — it should send those team ids to the host's tiebreak screen.
export function rankPhase1(teams: Team[], finalistCount: number): RankResult {
  const ranked = sortAndRank(teams, (a, b) => b.score - a.score);
  return { ranked, tiebreak: findBoundaryTie(ranked, (t) => [t.score], finalistCount) };
}

export type Phase2Stats = { correctCount: number; totalResponseTimeMs: number };

// Phase 2 final ranking: correctness first, then total response time
// (reference doc section 11). Every podium position is a distinct medal, so
// unlike Phase 1, a tie *anywhere* in the top `podiumSize` — not just at its
// edge — needs a host decision (e.g. two teams tied for 1st).
export function rankPhase2<T extends Team>(teams: T[], stats: Map<string, Phase2Stats>, podiumSize = 3): RankResult<T> {
  const statFor = (t: T) => stats.get(t.id) ?? { correctCount: 0, totalResponseTimeMs: Infinity };
  const ranked = sortAndRank(teams, (a, b) => {
    const sa = statFor(a);
    const sb = statFor(b);
    if (sa.correctCount !== sb.correctCount) return sb.correctCount - sa.correctCount;
    return sa.totalResponseTimeMs - sb.totalResponseTimeMs;
  });
  const tieKey = (t: T) => {
    const s = statFor(t);
    return [s.correctCount, s.totalResponseTimeMs];
  };
  return { ranked, tiebreak: findTieWithinTop(ranked, tieKey, podiumSize) };
}

function sortAndRank<T extends Team>(teams: T[], compare: (a: T, b: T) => number): RankedTeam<T>[] {
  const sorted = [...teams].sort((a, b) => {
    const primary = compare(a, b);
    if (primary !== 0) return primary;
    const ra = a.manualRank ?? Number.MAX_SAFE_INTEGER;
    const rb = b.manualRank ?? Number.MAX_SAFE_INTEGER;
    return ra - rb;
  });
  return sorted.map((team, i) => ({ ...team, rank: i + 1 }));
}

function keyOf<T extends Team>(tieKey: (t: T) => number[], t: T): string {
  return JSON.stringify(tieKey(t));
}

// Only flags a tie that straddles index `cutoff` (0-based boundary between
// the last qualifier and the first non-qualifier).
function findBoundaryTie<T extends Team>(
  ranked: RankedTeam<T>[],
  tieKey: (t: T) => number[],
  cutoff: number
): { teamIds: string[] } | null {
  if (cutoff >= ranked.length) return null;

  const boundaryKey = keyOf(tieKey, ranked[cutoff - 1]);
  const tiedGroup = ranked.filter((t) => keyOf(tieKey, t) === boundaryKey);
  const unresolvedTie = tiedGroup.length > 1 && tiedGroup.some((t) => t.manualRank == null);
  const straddlesBoundary =
    tiedGroup.length > 0 &&
    ranked.indexOf(tiedGroup[0]) < cutoff &&
    ranked.indexOf(tiedGroup[tiedGroup.length - 1]) >= cutoff;

  return unresolvedTie && straddlesBoundary ? { teamIds: tiedGroup.map((t) => t.id) } : null;
}

// Flags the first unresolved tie found anywhere among the top `topN`
// positions (adjacent equal-tieKey runs, since sorting already groups them).
function findTieWithinTop<T extends Team>(
  ranked: RankedTeam<T>[],
  tieKey: (t: T) => number[],
  topN: number
): { teamIds: string[] } | null {
  const limit = Math.min(topN, ranked.length - 1);
  for (let i = 0; i < limit; i++) {
    if (keyOf(tieKey, ranked[i]) !== keyOf(tieKey, ranked[i + 1])) continue;

    const groupKey = keyOf(tieKey, ranked[i]);
    const group = ranked.filter((t) => keyOf(tieKey, t) === groupKey);
    if (group.some((t) => t.manualRank == null)) {
      return { teamIds: group.map((t) => t.id) };
    }
  }
  return null;
}
