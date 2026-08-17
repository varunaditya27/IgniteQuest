"use server";

import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { Prisma, LifelineType } from "@prisma/client";
import { requireHost } from "@/lib/actions/guard";
import { getGameStateWithRelations, getUnusedPhase1Questions } from "@/lib/game/queries";
import { toGameStateEvent } from "@/lib/game/sanitize";
import { broadcast } from "@/lib/realtime/broadcast";

type LifelineResult = { success: true } | { success: false; error: string };

async function broadcastState() {
    const state = await getGameStateWithRelations(env.eventId);
    await broadcast(env.eventId, toGameStateEvent(state));
}

async function recordUsage(teamId: string, type: LifelineType, questionId: string, replacementQuestionId?: string) {
    try {
        await prisma.lifelineUsage.create({
            data: { teamId, type, questionId, replacementQuestionId },
        });
        return true;
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
            return false; // already used this lifeline
        }
        throw e;
    }
}

type TurnCheck =
    | { ok: true; question: NonNullable<Awaited<ReturnType<typeof getGameStateWithRelations>>["currentQuestion"]>; team: NonNullable<Awaited<ReturnType<typeof getGameStateWithRelations>>["activeTeam"]> }
    | { ok: false; error: string };

// All four lifelines are Phase 1 only (gpt-chat-reference.md section 4) — Phase 2
// has no lifelines, teams answer simultaneously with no host-mediated turn.
async function requireActivePhase1Turn(): Promise<TurnCheck> {
    const state = await getGameStateWithRelations(env.eventId);
    if (state.phase !== "PHASE_1") {
        return { ok: false, error: "Lifelines can only be used during Phase 1." };
    }
    if (!state.currentQuestion || !state.activeTeam) {
        return { ok: false, error: "No active question/team." };
    }
    return { ok: true, question: state.currentQuestion, team: state.activeTeam };
}

// 50:50 hides two of the three wrong options (see gpt-chat-reference.md section 4.1).
export async function useFiftyFifty(): Promise<LifelineResult> {
    await requireHost();
    const check = await requireActivePhase1Turn();
    if (!check.ok) return { success: false, error: check.error };
    const { question, team } = check;

    const recorded = await recordUsage(team.id, LifelineType.FIFTY_FIFTY, question.id);
    if (!recorded) return { success: false, error: "50:50 already used by this team." };

    const wrongIndices = question.options.map((_, i) => i).filter((i) => i !== question.correctOption);
    const toHide = wrongIndices.sort(() => Math.random() - 0.5).slice(0, 2);

    await prisma.gameState.update({ where: { eventId: env.eventId }, data: { hiddenOptions: toHide } });
    await broadcastState();
    return { success: true };
}

export async function useAskAudience(): Promise<LifelineResult> {
    await requireHost();
    const check = await requireActivePhase1Turn();
    if (!check.ok) return { success: false, error: check.error };
    const { question, team } = check;

    const recorded = await recordUsage(team.id, LifelineType.ASK_AUDIENCE, question.id);
    if (!recorded) return { success: false, error: "Ask the Audience already used by this team." };
    await broadcast(env.eventId, { type: "LIFELINE_USED", payload: { teamId: team.id, lifeline: LifelineType.ASK_AUDIENCE } });
    return { success: true };
}

export async function useAskExpert(): Promise<LifelineResult> {
    await requireHost();
    const check = await requireActivePhase1Turn();
    if (!check.ok) return { success: false, error: check.error };
    const { question, team } = check;

    const recorded = await recordUsage(team.id, LifelineType.ASK_EXPERT, question.id);
    if (!recorded) return { success: false, error: "Ask the Expert already used by this team." };
    await broadcast(env.eventId, { type: "LIFELINE_USED", payload: { teamId: team.id, lifeline: LifelineType.ASK_EXPERT } });
    return { success: true };
}

export async function useSwitchQuestion(): Promise<LifelineResult> {
    await requireHost();
    const check = await requireActivePhase1Turn();
    if (!check.ok) return { success: false, error: check.error };
    const { question: original, team } = check;

    // Same "unused" pool the normal round-robin draws from (presentedAt === null), so
    // a switched-away question — original or replacement — can never resurface later.
    const candidates = await getUnusedPhase1Questions(env.eventId);
    if (candidates.length === 0) {
        return { success: false, error: "No eligible replacement question available." };
    }
    const replacement = candidates[Math.floor(Math.random() * candidates.length)];

    const recorded = await recordUsage(team.id, LifelineType.SWITCH_QUESTION, original.id, replacement.id);
    if (!recorded) return { success: false, error: "Switch Question already used by this team." };

    await prisma.$transaction([
        prisma.question.update({ where: { id: replacement.id }, data: { presentedAt: new Date() } }),
        prisma.gameState.update({
            where: { eventId: env.eventId },
            data: {
                currentQuestionId: replacement.id,
                questionRevealed: false,
                answerLocked: false,
                questionStartedAt: null,
                hiddenOptions: [],
            },
        }),
    ]);
    await broadcastState();
    return { success: true };
}
