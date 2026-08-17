import "server-only";
import { cookies } from "next/headers";
import { encodeSession, decodeSession } from "@/lib/auth/session";

const COOKIE_NAME = "ignitequest_team";
type TeamSession = { role: "team"; teamId: string };

export async function createTeamSession(teamId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, encodeSession<TeamSession>({ role: "team", teamId }), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });
}

export async function getAuthenticatedTeamId(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = decodeSession<TeamSession>(cookieStore.get(COOKIE_NAME)?.value);
  return session?.role === "team" ? session.teamId : null;
}

export async function destroyTeamSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
