import type { Team } from "@prisma/client";

// Turn N goes to the (N-1)th team, wrapping around — see gpt-chat-reference.md
// section 3.3. Eliminated teams don't take a turn. Keyed by turn number, not by
// question identity, so a Switch Question lifeline (which can swap in a question
// with an unrelated order) never changes whose turn it is.
export function teamForTurn(teams: Team[], turnNumber: number): Team | null {
    const eligible = teams.filter((t) => !t.eliminated);
    if (eligible.length === 0) return null;
    return eligible[(turnNumber - 1) % eligible.length];
}
