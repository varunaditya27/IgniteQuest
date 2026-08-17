"use server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { requireHost } from "@/lib/actions/guard";
import { getGameState } from "@/lib/game/queries";

export type LifelineResult = { ok: true; state: Awaited<ReturnType<typeof getGameState>> } | { ok: false; error: string };

async function applyLifeline(type: "FIFTY_FIFTY" | "ASK_AUDIENCE" | "ASK_EXPERT"): Promise<
  { activeTeamId: string; question: NonNullable<Awaited<ReturnType<typeof getGameState>>["currentQuestion"]> }
> {
  await requireHost();
  const state = await getGameState();
  if (state.stage !== "PHASE1_QUESTION" || !state.activeTeamId || !state.currentQuestion) {
    throw new Error("No active question to apply a lifeline to");
  }

  try {
    await prisma.lifelineUsage.create({
      data: { teamId: state.activeTeamId, questionId: state.currentQuestion.id, type },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new Error("This team has already used that lifeline");
    }
    throw error;
  }

  return { activeTeamId: state.activeTeamId, question: state.currentQuestion };
}

export async function useFiftyFifty() {
  const { question } = await applyLifeline("FIFTY_FIFTY");
  const options = question.options as string[];

  const wrongIndices = options.map((_, i) => i).filter((i) => i !== question.correctOption);
  const hidden = [...wrongIndices].sort(() => Math.random() - 0.5).slice(0, 2);

  return prisma.gameState.update({
    where: { eventId: env.eventId },
    data: { hiddenOptions: hidden },
    include: { currentQuestion: true, activeTeam: true },
  });
}

export async function useAskAudience() {
  await applyLifeline("ASK_AUDIENCE");
  return getGameState();
}

export async function useAskExpert() {
  await applyLifeline("ASK_EXPERT");
  return getGameState();
}
