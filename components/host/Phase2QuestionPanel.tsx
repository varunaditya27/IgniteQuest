"use client";
import { useState } from "react";
import { QuestionCard } from "@/components/shared/QuestionCard";
import { Timer } from "@/components/shared/Timer";
import { Button } from "@/components/ui/Button";
import { lockPhase2Question } from "@/lib/actions/host-phase2";
import { useGameChannel } from "@/hooks/useGameChannel";
import type { ClientGameState, ClientTeam } from "@/lib/game/client-types";
import { toClientGameState } from "@/lib/game/client-types";

export function Phase2QuestionPanel({
  state,
  teams,
  applyRaw,
  eventId,
  phase2TimeLimitSeconds,
}: {
  state: ClientGameState;
  teams: ClientTeam[];
  applyRaw: (raw: Parameters<typeof toClientGameState>[0]) => void;
  eventId: string;
  phase2TimeLimitSeconds: number;
}) {
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState<Set<string>>(new Set());
  const question = state.currentQuestion!;
  const finalistCount = teams.filter((t) => t.qualified).length;

  useGameChannel(eventId, (event) => {
    if (event.type === "PHASE2_SUBMISSION_RECEIVED") {
      setSubmitted((prev) => new Set(prev).add(event.teamId));
    }
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 bg-stage-black p-8">
      <div className="flex items-center justify-between">
        <span className="font-[family-name:var(--font-ui)] text-xs uppercase tracking-[0.3em] text-champagne-dim">
          Question {question.order}
        </span>
        {state.questionStartedAt ? (
          <Timer startedAt={state.questionStartedAt} limitSeconds={phase2TimeLimitSeconds} />
        ) : null}
      </div>

      <div className="stage-panel rounded-sm p-8">
        <QuestionCard text={question.text} codeSnippet={question.codeSnippet} />
      </div>

      <p className="text-center font-[family-name:var(--font-ui)] text-sm text-champagne-dim">
        {submitted.size} / {finalistCount} teams answered
      </p>

      <Button
        size="lg"
        className="mx-auto"
        pending={pending}
        onClick={async () => {
          setPending(true);
          try {
            applyRaw(await lockPhase2Question());
          } finally {
            setPending(false);
          }
        }}
      >
        Lock Question
      </Button>
    </main>
  );
}
