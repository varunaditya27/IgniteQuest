import "server-only";
import { cookies } from "next/headers";
import { timingSafeEqual } from "crypto";
import { env } from "@/lib/env";
import { createSessionToken, verifySessionToken } from "@/lib/auth/session";

const COOKIE_NAME = "iq_host_session";

type HostSessionPayload = { role: "host"; exp: number };

export function checkHostPassword(password: string): boolean {
    const expected = Buffer.from(env.hostPassword);
    const given = Buffer.from(password);
    return expected.length === given.length && timingSafeEqual(expected, given);
}

export async function createHostSession() {
    const token = createSessionToken<{ role: "host" }>({ role: "host" });
    const store = await cookies();
    store.set(COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 12,
    });
}

export async function isHostAuthenticated(): Promise<boolean> {
    const store = await cookies();
    const token = store.get(COOKIE_NAME)?.value;
    return verifySessionToken<HostSessionPayload>(token)?.role === "host";
}

export async function clearHostSession() {
    const store = await cookies();
    store.delete(COOKIE_NAME);
}
