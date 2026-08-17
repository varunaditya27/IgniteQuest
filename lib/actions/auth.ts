"use server";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { verifyHostPassword, createHostSession, destroyHostSession } from "@/lib/auth/host";
import { createTeamSession, destroyTeamSession } from "@/lib/auth/team";

export type AuthResult = { ok: true } | { ok: false; error: string };

export async function hostLogin(formData: FormData): Promise<AuthResult> {
  const password = String(formData.get("password") ?? "");
  if (!verifyHostPassword(password)) return { ok: false, error: "Incorrect password." };
  await createHostSession();
  return { ok: true };
}

export async function hostLogout(): Promise<void> {
  await destroyHostSession();
}

export async function teamLogin(formData: FormData): Promise<AuthResult> {
  const name = String(formData.get("teamName") ?? "").trim();
  const pin = String(formData.get("pin") ?? "").trim();

  const team = await prisma.team.findUnique({ where: { eventId_name: { eventId: env.eventId, name } } });
  if (!team || team.pin !== pin) return { ok: false, error: "Team name or PIN is incorrect." };

  await createTeamSession(team.id);
  return { ok: true };
}

export async function teamLogout(): Promise<void> {
  await destroyTeamSession();
}
