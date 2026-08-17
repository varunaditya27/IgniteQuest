"use server";
import { Prisma } from "@prisma/client";
import { requireTeam } from "@/lib/actions/guard";
import { getGameState } from "@/lib/game/queries";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { scoreAnswer } from "@/lib/game/scoring";
import { broadcast } from "@/lib/realtime/broadcast";

export type SubmitAnswerResult = { ok: true } | { ok: false; error: string };

export async function submitPhase2Answer(selectedOption: number): Promise<SubmitAnswerResult> {
  const teamId = await requireTeam();
  const state = await getGameState();

  if (state.stage !== "PHASE2_QUESTION" || !state.currentQuestion || !state.questionStartedAt) {
    return { ok: false, error: "No question is currently open" };
  }

  const elapsedMs = Date.now() - state.questionStartedAt.getTime();
  if (elapsedMs > env.phase2TimeLimitSeconds * 1000) {
    return { ok: false, error: "Time's up for this question" };
  }

  const { isCorrect, pointsAwarded } = scoreAnswer(
    state.currentQuestion.correctOption,
    state.currentQuestion.points,
    selectedOption
  );

  try {
    await prisma.teamAnswer.create({
      data: {
        teamId,
        questionId: state.currentQuestion.id,
        selectedOption,
        isCorrect,
        pointsAwarded,
        submittedAt: new Date(),
        responseTimeMs: Math.round(elapsedMs),
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, error: "You already answered this question" };
    }
    throw error;
  }

  await broadcast({ type: "PHASE2_SUBMISSION_RECEIVED", teamId });
  return { ok: true };
}
