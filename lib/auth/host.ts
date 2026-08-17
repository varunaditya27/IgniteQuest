import "server-only";
import { cookies } from "next/headers";
import { timingSafeEqual } from "crypto";
import { env } from "@/lib/env";
import { encodeSession, decodeSession } from "@/lib/auth/session";

const COOKIE_NAME = "ignitequest_host";
type HostSession = { role: "host" };

export function verifyHostPassword(password: string): boolean {
  const a = Buffer.from(password);
  const b = Buffer.from(env.hostPassword);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function createHostSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, encodeSession<HostSession>({ role: "host" }), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });
}

export async function isHostAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = decodeSession<HostSession>(cookieStore.get(COOKIE_NAME)?.value);
  return session?.role === "host";
}

export async function destroyHostSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
