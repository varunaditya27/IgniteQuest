export type PublicQuestion = {
  id: string;
  order: number;
  text: string;
  codeSnippet: string | null;
  topic: string;
  options: string[];
};

// Realtime broadcast is used only where a client other than the acting host
// needs a live push — Phase 2 team phones and the host's live submission
// tally. Phase 1 has no other client (the host's own screen IS the stage),
// so every Phase 1 update goes through a server action's return value
// instead (see CLAUDE.md rule 6).
export type GameEvent =
  | {
      type: "PHASE2_QUESTION_STARTED";
      question: PublicQuestion;
      startedAt: string;
      timeLimitSeconds: number;
    }
  | { type: "PHASE2_QUESTION_LOCKED" }
  | { type: "PHASE2_SUBMISSION_RECEIVED"; teamId: string };

export function channelName(eventId: string): string {
  return `event:${eventId}`;
}
