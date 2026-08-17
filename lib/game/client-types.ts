import type { Prisma, Stage } from "@prisma/client";

type GameStateWithRelations = Prisma.GameStateGetPayload<{ include: { currentQuestion: true; activeTeam: true } }>;

export type ClientQuestion = {
  id: string;
  order: number;
  text: string;
  codeSnippet: string | null;
  topic: string;
  options: string[];
  correctOption: number;
  points: number;
};

export type ClientTeam = {
  id: string;
  name: string;
  leaderName: string;
  score: number;
  qualified: boolean;
  manualRank: number | null;
};

export type ClientGameState = {
  id: string;
  stage: Stage;
  currentQuestionId: string | null;
  currentQuestion: ClientQuestion | null;
  activeTeamId: string | null;
  activeTeam: ClientTeam | null;
  questionStartedAt: string | null;
  lockedOptionIndex: number | null;
  answerRevealedAt: string | null;
  hiddenOptions: number[];
  tiebreakTeamIds: string[];
};

function toClientQuestion(q: GameStateWithRelations["currentQuestion"]): ClientQuestion | null {
  if (!q) return null;
  return {
    id: q.id,
    order: q.order,
    text: q.text,
    codeSnippet: q.codeSnippet,
    topic: q.topic,
    options: q.options as string[],
    correctOption: q.correctOption,
    points: q.points,
  };
}

function toClientTeam(t: GameStateWithRelations["activeTeam"]): ClientTeam | null {
  if (!t) return null;
  return { id: t.id, name: t.name, leaderName: t.leaderName, score: t.score, qualified: t.qualified, manualRank: t.manualRank };
}

export function toClientGameState(state: GameStateWithRelations): ClientGameState {
  return {
    id: state.id,
    stage: state.stage,
    currentQuestionId: state.currentQuestionId,
    currentQuestion: toClientQuestion(state.currentQuestion),
    activeTeamId: state.activeTeamId,
    activeTeam: toClientTeam(state.activeTeam),
    questionStartedAt: state.questionStartedAt?.toISOString() ?? null,
    lockedOptionIndex: state.lockedOptionIndex,
    answerRevealedAt: state.answerRevealedAt?.toISOString() ?? null,
    hiddenOptions: state.hiddenOptions,
    tiebreakTeamIds: state.tiebreakTeamIds,
  };
}
