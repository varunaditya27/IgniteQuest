// Sanitized realtime event payloads. Never include `correctOption`, team PINs,
// or Phase 2 scores here — see CLAUDE.md rule 9.

import type { GamePhase, LifelineType } from "@prisma/client";

export type PublicQuestion = {
    id: string;
    phase: string;
    order: number;
    type: string;
    text: string;
    codeSnippet: string | null;
    options: string[];
    points: number;
    timeLimitSeconds: number | null;
};

export type GameStateEvent = {
    type: "GAME_STATE_CHANGED";
    payload: {
        phase: GamePhase;
        currentQuestion: PublicQuestion | null;
        activeTeam: { id: string; name: string } | null;
        questionRevealed: boolean;
        answerLocked: boolean;
        questionStartedAt: string | null;
        hiddenOptions: number[];
    };
};

export type ScoreUpdatedEvent = {
    type: "SCORE_UPDATED";
    payload: { teams: { id: string; name: string; score: number }[] };
};

export type AnswerRevealedEvent = {
    type: "ANSWER_REVEALED";
    payload: { questionId: string; correctOption: number };
};

export type LifelineUsedEvent = {
    type: "LIFELINE_USED";
    payload: { teamId: string; lifeline: LifelineType };
};

// Fired on every successful registration so the host console's team list/count stays
// live without a manual reload — the one moment in the event where the host most
// needs to watch things fill up in real time. No payload: HostConsole refreshes on
// any broadcast regardless of type, and no other screen needs to react to this at all.
export type TeamRegisteredEvent = {
    type: "TEAM_REGISTERED";
    payload: Record<string, never>;
};

export type GameEvent =
    | GameStateEvent
    | ScoreUpdatedEvent
    | AnswerRevealedEvent
    | LifelineUsedEvent
    | TeamRegisteredEvent;

export const GAME_CHANNEL_EVENT = "game_event";

export function gameChannelName(eventId: string) {
    return `event:${eventId}`;
}
