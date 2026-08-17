import type { GameState, Question, Team } from "@prisma/client";
import type { PublicQuestion, GameStateEvent } from "@/lib/realtime/events";

export function toPublicQuestion(question: Question | null): PublicQuestion | null {
    if (!question) return null;
    return {
        id: question.id,
        phase: question.phase,
        order: question.order,
        type: question.type,
        text: question.text,
        codeSnippet: question.codeSnippet,
        options: question.options,
        points: question.points,
        timeLimitSeconds: question.timeLimitSeconds,
    };
}

type GameStateWithRelations = GameState & {
    currentQuestion: Question | null;
    activeTeam: Team | null;
};

export function toGameStateEvent(state: GameStateWithRelations): GameStateEvent {
    return {
        type: "GAME_STATE_CHANGED",
        payload: {
            phase: state.phase,
            currentQuestion: toPublicQuestion(state.currentQuestion),
            activeTeam: state.activeTeam ? { id: state.activeTeam.id, name: state.activeTeam.name } : null,
            questionRevealed: state.questionRevealed,
            answerLocked: state.answerLocked,
            questionStartedAt: state.questionStartedAt?.toISOString() ?? null,
            hiddenOptions: state.hiddenOptions,
        },
    };
}
