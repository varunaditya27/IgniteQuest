import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { env } from "@/lib/env";

const MAX_AGE_MS = 12 * 60 * 60 * 1000; // 12h — long enough to cover a single event

function sign(payload: string): string {
    return createHmac("sha256", env.sessionSecret).update(payload).digest("hex");
}

export function createSessionToken<T extends object>(data: T): string {
    const payload = JSON.stringify({ ...data, exp: Date.now() + MAX_AGE_MS });
    const encoded = Buffer.from(payload).toString("base64url");
    return `${encoded}.${sign(encoded)}`;
}

export function verifySessionToken<T>(token: string | undefined): T | null {
    if (!token) return null;
    const [encoded, signature] = token.split(".");
    if (!encoded || !signature) return null;

    const expected = sign(encoded);
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

    try {
        const payload = JSON.parse(Buffer.from(encoded, "base64url").toString());
        if (typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
        return payload as T;
    } catch {
        return null;
    }
}
