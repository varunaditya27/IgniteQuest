import "server-only";
import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "crypto";
import { env } from "@/lib/env";
import { createSessionToken, verifySessionToken } from "@/lib/auth/session";

const COOKIE_NAME = "iq_host_session";

type HostSessionPayload = { role: "host"; exp: number };

function sha256(value: string) {
    return createHash("sha256").update(value).digest();
}

// Hashing first (rather than comparing raw buffers) means both sides are always the
// same fixed length, so there's no length check to short-circuit on and leak timing.
export function checkHostPassword(password: string): boolean {
    return timingSafeEqual(sha256(env.hostPassword), sha256(password));
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
