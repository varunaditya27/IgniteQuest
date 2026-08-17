"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { checkHostPassword, createHostSession, clearHostSession } from "@/lib/auth/host";
import { createTeamSession, clearTeamSession } from "@/lib/auth/team";

export async function hostLogin(password: string): Promise<{ success: boolean; error?: string }> {
    if (!checkHostPassword(password)) {
        return { success: false, error: "Incorrect password." };
    }
    await createHostSession();
    return { success: true };
}

export async function hostLogout() {
    await clearHostSession();
    redirect("/host/login");
}

export async function teamLogin(pin: string): Promise<{ success: boolean; error?: string; teamName?: string }> {
    const team = await prisma.team.findUnique({
        where: { eventId_pin: { eventId: env.eventId, pin: pin.trim().toUpperCase() } },
    });

    if (!team) return { success: false, error: "Invalid PIN." };
    if (team.eliminated) return { success: false, error: "This team did not qualify for the final." };

    await createTeamSession(team.id);
    return { success: true, teamName: team.name };
}

export async function teamLogout() {
    await clearTeamSession();
    redirect("/play");
}
