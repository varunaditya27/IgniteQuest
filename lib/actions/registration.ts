"use server";

import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { Prisma } from "@prisma/client";
import { broadcast } from "@/lib/realtime/broadcast";

const PIN_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I to avoid confusion

function generatePin(length = 6): string {
    let pin = "";
    for (let i = 0; i < length; i++) {
        pin += PIN_CHARS[Math.floor(Math.random() * PIN_CHARS.length)];
    }
    return pin;
}

export type RegisterTeamResult =
    | { success: true; teamId: string; pin: string }
    | { success: false; error: string };

export async function registerTeam(teamName: string, leaderName: string): Promise<RegisterTeamResult> {
    const name = teamName.trim();
    const leader = leaderName.trim();

    if (name.length < 2 || name.length > 40) {
        return { success: false, error: "Team name must be 2-40 characters." };
    }
    if (leader.length < 2 || leader.length > 40) {
        return { success: false, error: "Leader name must be 2-40 characters." };
    }

    const eventId = env.eventId;

    const gameState = await prisma.gameState.findUniqueOrThrow({ where: { eventId } });
    if (gameState.phase !== "REGISTRATION") {
        return { success: false, error: "Registration is closed — the arena has already started." };
    }

    for (let attempt = 0; attempt < 5; attempt++) {
        const pin = generatePin();
        try {
            const team = await prisma.team.create({
                data: { eventId, name, leaderName: leader, pin },
            });
            await broadcast(eventId, { type: "TEAM_REGISTERED", payload: {} });
            return { success: true, teamId: team.id, pin };
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
                const target = (e.meta?.target as string[] | undefined) ?? [];
                if (target.includes("name")) {
                    return { success: false, error: "That team name is already taken for this event." };
                }
                // pin collision — retry with a new one
                continue;
            }
            throw e;
        }
    }

    return { success: false, error: "Could not generate a unique PIN, please try again." };
}
