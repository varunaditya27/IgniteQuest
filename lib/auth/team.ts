import "server-only";
import { cookies } from "next/headers";
import { createSessionToken, verifySessionToken } from "@/lib/auth/session";

const COOKIE_NAME = "iq_team_session";

type TeamSessionPayload = { role: "team"; teamId: string; exp: number };

export async function createTeamSession(teamId: string) {
    const token = createSessionToken<{ role: "team"; teamId: string }>({ role: "team", teamId });
    const store = await cookies();
    store.set(COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 12,
    });
}

export async function getAuthenticatedTeamId(): Promise<string | null> {
    const store = await cookies();
    const token = store.get(COOKIE_NAME)?.value;
    const payload = verifySessionToken<TeamSessionPayload>(token);
    return payload?.role === "team" ? payload.teamId : null;
}

export async function clearTeamSession() {
    const store = await cookies();
    store.delete(COOKIE_NAME);
}
