import type { Team } from "@prisma/client";

// Deterministic: question order N goes to teams[(N - 1) % teams.length],
// where teams are ordered by registration time. No separate "turn" counter
// is needed since there is no lifeline that can desync a question's order
// from whose turn it is (Switch Question was removed from this build).
export function getActiveTeamForQuestion(teams: Team[], questionOrder: number): Team {
  if (teams.length === 0) throw new Error("No teams registered");
  const index = (questionOrder - 1) % teams.length;
  return teams[index];
}
