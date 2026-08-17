"use server";

import { env } from "@/lib/env";
import { getGameStateWithRelations, getLeaderboard } from "@/lib/game/queries";
import { toGameStateEvent } from "@/lib/game/sanitize";

// Public, unauthenticated, already-sanitized (no correctOption) — same shape already
// pushed over broadcast. Realtime broadcast is fire-and-forget with no replay of
// missed messages, so a client that drops its websocket for even a moment (a laptop
// briefly losing WiFi, a phone backgrounded) has no way to recover the state changes
// it missed except by asking for a fresh snapshot. Called on every (re)connect —
// see hooks/useGameChannel.ts's onResync.
export async function getPublicSnapshot() {
    const [state, leaderboard] = await Promise.all([
        getGameStateWithRelations(env.eventId),
        getLeaderboard(env.eventId),
    ]);
    return {
        ...toGameStateEvent(state).payload,
        leaderboard: leaderboard.map(({ id, name, score }) => ({ id, name, score })),
    };
}
