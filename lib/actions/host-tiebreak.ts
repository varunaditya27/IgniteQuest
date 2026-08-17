"use server";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { requireHost } from "@/lib/actions/guard";
import { getGameState, getTeams, getPhase2Stats, getQualifiedTeams } from "@/lib/game/queries";
import { rankPhase1, rankPhase2 } from "@/lib/game/scoring";

export type TiebreakResolution =
  | { kind: "tiebreak"; teamIds: string[] }
  | { kind: "qualifiers_revealed"; qualifiedTeamIds: string[] }
  | { kind: "finale_revealed"; podium: { id: string; rank: number }[] };

// orderedTeamIds: the tied teams, host-ranked best-to-worst. Assigns
// manualRank 1..n so the existing score/time comparator resolves cleanly,
// then re-runs whichever finalize step was waiting on this tie. Resolving
// one tie (e.g. 1st place) can surface a *different* tie elsewhere in the
// same ranking (e.g. 3rd place) — that's reported back as another
// "tiebreak" round rather than treated as an error.
export async function resolveTiebreak(orderedTeamIds: string[]): Promise<TiebreakResolution> {
  await requireHost();
  const state = await getGameState();
  if (state.stage !== "PHASE1_TIEBREAK" && state.stage !== "PHASE2_TIEBREAK") {
    throw new Error("No tiebreak in progress");
  }

  await prisma.$transaction(
    orderedTeamIds.map((teamId, i) => prisma.team.update({ where: { id: teamId }, data: { manualRank: i + 1 } }))
  );

  if (state.stage === "PHASE1_TIEBREAK") {
    const teams = await getTeams();
    const { ranked, tiebreak } = rankPhase1(teams, env.finalistCount);

    if (tiebreak) {
      await prisma.gameState.update({
        where: { eventId: env.eventId },
        data: { tiebreakTeamIds: tiebreak.teamIds },
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

  const teams = await getQualifiedTeams();
  const stats = await getPhase2Stats();
  const { ranked, tiebreak } = rankPhase2(teams, stats, 3);

  if (tiebreak) {
    await prisma.gameState.update({
      where: { eventId: env.eventId },
      data: { tiebreakTeamIds: tiebreak.teamIds },
    });
    return { kind: "tiebreak", teamIds: tiebreak.teamIds };
  }

  await prisma.gameState.update({
    where: { eventId: env.eventId },
    data: { stage: "FINALE", tiebreakTeamIds: [] },
  });
  return { kind: "finale_revealed", podium: ranked.filter((t) => t.rank <= 3) };
}
