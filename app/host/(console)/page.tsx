import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { getGameState, getTeams } from "@/lib/game/queries";
import { toClientGameState } from "@/lib/game/client-types";
import { HostConsole } from "@/components/host/HostConsole";

export default async function HostConsolePage() {
  const [event, gameState, teams, lifelineUsages] = await Promise.all([
    prisma.event.findUniqueOrThrow({ where: { id: env.eventId } }),
    getGameState(),
    getTeams(),
    prisma.lifelineUsage.findMany({
      where: { team: { eventId: env.eventId } },
      select: { teamId: true, type: true },
    }),
  ]);

  return (
    <HostConsole
      eventName={event.name}
      eventId={event.id}
      phase1TimeLimitSeconds={env.phase1TimeLimitSeconds}
      phase2TimeLimitSeconds={env.phase2TimeLimitSeconds}
      initialState={toClientGameState(gameState)}
      initialTeams={teams.map((t) => ({
        id: t.id,
        name: t.name,
        leaderName: t.leaderName,
        score: t.score,
        qualified: t.qualified,
        manualRank: t.manualRank,
      }))}
      initialLifelineUsages={lifelineUsages}
    />
  );
}
