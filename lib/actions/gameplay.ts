"use server";

import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { gameConfig } from "@/lib/config";
import { Prisma } from "@prisma/client";
import { requireTeam } from "@/lib/actions/guard";

export type SubmitAnswerResult = { success: true } | { success: false; error: string };

export async function submitPhase2Answer(selectedOption: number): Promise<SubmitAnswerResult> {
    // Captured before any awaits so DB round-trip latency inside this function never
    // inflates the recorded response time.
    const receivedAt = Date.now();
    const teamId = await requireTeam();

    try {
        return await prisma.$transaction(async (tx) => {
            // Locked/current-question and team-eliminated checks are re-read inside the
            // same transaction as the write, right before it, so the window in which a
            // host's Lock Answers click could race a submission is one held connection's
            // round trip rather than two separate pooled requests.
            const [state, team] = await Promise.all([
                tx.gameState.findUniqueOrThrow({
                    where: { eventId: env.eventId },
                    include: { currentQuestion: true },
                }),
                tx.team.findUniqueOrThrow({ where: { id: teamId }, select: { eliminated: true } }),
            ]);

            if (team.eliminated) {
                return { success: false, error: "This team is not part of the final." };
            }
            if (state.phase !== "PHASE_2" || !state.currentQuestion) {
                return { success: false, error: "No active Phase 2 question." };
            }
            if (state.answerLocked) {
                return { success: false, error: "Answers are locked for this question." };
            }

            const startedAt = state.questionStartedAt?.getTime() ?? receivedAt;
            const responseTimeMs = Math.max(0, receivedAt - startedAt);

            // The on-screen timer must actually mean something: the host's "Lock
            // Answers" click is a manual early-cutoff, but a forgotten click must not
            // leave the deadline purely decorative. Reject anything past the limit
            // regardless of whether the host has locked yet.
            const limitMs = (state.currentQuestion.timeLimitSeconds ?? gameConfig.phase2TimeLimitSeconds) * 1000;
            if (responseTimeMs > limitMs) {
                return { success: false, error: "Time's up for this question." };
            }
            const isCorrect = selectedOption === state.currentQuestion.correctOption;
            const pointsAwarded = isCorrect ? state.currentQuestion.points : 0;

            await tx.teamAnswer.create({
                data: {
                    teamId,
                    questionId: state.currentQuestion.id,
                    selectedOption,
                    isCorrect,
                    pointsAwarded,
                    responseTimeMs,
                },
            });
            return { success: true };
        });
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
            return { success: false, error: "You already answered this question." };
        }
        throw e;
    }
}
