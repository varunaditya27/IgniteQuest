"use client";
import { useState } from "react";
import { QuestionCard } from "@/components/shared/QuestionCard";
import { OptionsGrid } from "@/components/host/OptionsGrid";
import { Leaderboard } from "@/components/shared/Leaderboard";
import { Timer } from "@/components/shared/Timer";
import { LifelineButtons, type LifelineType } from "@/components/host/LifelineButtons";
import { Button } from "@/components/ui/Button";
import { lockOption, revealAnswer, nextTurn, type NextTurnResult } from "@/lib/actions/host-phase1";
import { useFiftyFifty, useAskAudience, useAskExpert } from "@/lib/actions/host-lifelines";
import type { ClientGameState, ClientTeam } from "@/lib/game/client-types";
import { toClientGameState } from "@/lib/game/client-types";
import type { LifelineUsageLite } from "@/components/host/HostConsole";
import { sound } from "@/lib/sound/engine";

export function Phase1Panel({
  state,
  teams,
  applyRaw,
  lifelineUsages,
  setLifelineUsages,
  onRevealed,
  onNextTurn,
  phase1TimeLimitSeconds,
}: {
  eventName: string;
  state: ClientGameState;
  teams: ClientTeam[];
  setTeams: (t: ClientTeam[]) => void;
  applyRaw: (raw: Parameters<typeof toClientGameState>[0]) => void;
  lifelineUsages: LifelineUsageLite[];
  setLifelineUsages: (u: LifelineUsageLite[]) => void;
  onRevealed: (raw: Parameters<typeof toClientGameState>[0], teams: ClientTeam[]) => void;
  onNextTurn: (result: NextTurnResult) => void;
  phase1TimeLimitSeconds: number;
}) {
  const [busy, setBusy] = useState(false);
  const [pendingLifeline, setPendingLifeline] = useState<LifelineType | null>(null);

  const question = state.currentQuestion!;
  const revealed = state.answerRevealedAt != null;
  const usedTypes = new Set(lifelineUsages.filter((u) => u.teamId === state.activeTeamId).map((u) => u.type));

  const handleUseLifeline = async (type: LifelineType) => {
    setPendingLifeline(type);
    try {
      const action = { FIFTY_FIFTY: useFiftyFifty, ASK_AUDIENCE: useAskAudience, ASK_EXPERT: useAskExpert }[type];
      const raw = await action();
      sound.lifeline();
      applyRaw(raw);
      setLifelineUsages([...lifelineUsages, { teamId: state.activeTeamId!, type }]);
    } finally {
      setPendingLifeline(null);
    }
  };

  return (
    <main className="grid min-h-screen grid-cols-1 gap-6 bg-stage-black p-6 lg:grid-cols-[1fr_320px]">
      <section className="stage-panel flex flex-col gap-6 rounded-sm p-8">
        <div className="flex items-start justify-between">
          <div>
            <span className="font-[family-name:var(--font-ui)] text-xs uppercase tracking-[0.3em] text-champagne-dim">
              Question {question.order} — {question.points.toLocaleString()} pts
            </span>
            <p className="font-[family-name:var(--font-ui)] text-sm text-foil-gold/80">{state.activeTeam?.name}</p>
          </div>
          {state.questionStartedAt ? (
            <Timer startedAt={state.questionStartedAt} limitSeconds={phase1TimeLimitSeconds} />
          ) : null}
        </div>

        <QuestionCard text={question.text} codeSnippet={question.codeSnippet} />

        <OptionsGrid
          options={question.options}
          hiddenOptions={state.hiddenOptions}
          lockedOptionIndex={state.lockedOptionIndex}
          correctOption={question.correctOption}
          revealed={revealed}
          disabled={busy}
          onSelect={async (index) => {
            setBusy(true);
            try {
              sound.lock();
              applyRaw(await lockOption(index));
            } finally {
              setBusy(false);
            }
          }}
        />

        <LifelineButtons usedTypes={usedTypes} disabled={revealed} pendingType={pendingLifeline} onUse={handleUseLifeline} />

        <div className="mt-auto flex justify-end gap-3">
          {!revealed ? (
            <Button
              variant="correct"
              size="lg"
              disabled={state.lockedOptionIndex == null}
              pending={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  const isCorrect = state.lockedOptionIndex === question.correctOption;
                  if (isCorrect) sound.correct();
                  else sound.wrong();
                  const result = await revealAnswer();
                  onRevealed(result.state, result.teams);
                } finally {
                  setBusy(false);
                }
              }}
            >
              Reveal Answer
            </Button>
          ) : (
            <Button
              size="lg"
              pending={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  onNextTurn(await nextTurn());
                } finally {
                  setBusy(false);
                }
              }}
            >
              Next Team
            </Button>
          )}
        </div>
      </section>

      <Leaderboard teams={teams} activeTeamId={state.activeTeamId} />
    </main>
  );
}
