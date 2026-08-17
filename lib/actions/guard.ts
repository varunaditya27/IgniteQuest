import "server-only";
import type { GamePhase } from "@prisma/client";
import { isHostAuthenticated } from "@/lib/auth/host";
import { getAuthenticatedTeamId } from "@/lib/auth/team";

export async function requireHost(): Promise<void> {
    if (!(await isHostAuthenticated())) {
        throw new Error("Not authenticated as host.");
    }
}

export async function requireTeam(): Promise<string> {
    const teamId = await getAuthenticatedTeamId();
    if (!teamId) throw new Error("Not authenticated as team.");
    return teamId;
}

// Phase-specific mutations must never fire outside their phase — a second host tab, a
// stale retry after the game has moved on, or a double-click racing a phase
// transition could otherwise corrupt state that belongs to a different phase (e.g.
// re-running the Phase 1 -> Phase 2 transition mid-Phase-2 would wipe live progress).
export function assertPhase(actual: GamePhase, expected: GamePhase): void {
    if (actual !== expected) {
        throw new Error(`This action requires phase ${expected}, but the event is in ${actual}.`);
    }
}
