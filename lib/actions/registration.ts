"use server";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { createTeamSession } from "@/lib/auth/team";

function generatePin(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export type RegisterTeamResult = { ok: true; teamName: string; pin: string } | { ok: false; error: string };

export async function registerTeam(formData: FormData): Promise<RegisterTeamResult> {
  const name = String(formData.get("teamName") ?? "").trim();
  const leaderName = String(formData.get("leaderName") ?? "").trim();

  if (name.length < 2 || name.length > 40) return { ok: false, error: "Team name must be 2-40 characters." };
  if (leaderName.length < 2 || leaderName.length > 40) return { ok: false, error: "Leader name must be 2-40 characters." };

  const existing = await prisma.team.findUnique({ where: { eventId_name: { eventId: env.eventId, name } } });
  if (existing) return { ok: false, error: "That team name is already taken." };

  const pin = generatePin();
  const team = await prisma.team.create({
    data: { eventId: env.eventId, name, leaderName, pin },
  });

  await createTeamSession(team.id);
  return { ok: true, teamName: team.name, pin };
}
