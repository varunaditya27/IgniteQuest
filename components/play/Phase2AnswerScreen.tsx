"use client";
import { useState } from "react";
import { QuestionCard } from "@/components/shared/QuestionCard";
import { Timer } from "@/components/shared/Timer";
import { useGameChannel } from "@/hooks/useGameChannel";
import { submitPhase2Answer } from "@/lib/actions/gameplay";
import type { PublicQuestion } from "@/lib/realtime/events";
import { cn } from "@/lib/cn";

type Live = { question: PublicQuestion; startedAt: string } | null;

export function Phase2AnswerScreen({
  eventId,
  teamName,
  timeLimitSeconds,
  initial,
}: {
  eventId: string;
  teamName: string;
  timeLimitSeconds: number;
  initial: Live;
}) {
  const [live, setLive] = useState<Live>(initial);
  const [selected, setSelected] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "submitted" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useGameChannel(eventId, (event) => {
    if (event.type === "PHASE2_QUESTION_STARTED") {
      setLive({ question: event.question, startedAt: event.startedAt });
      setSelected(null);
      setStatus("idle");
      setError(null);
    } else if (event.type === "PHASE2_QUESTION_LOCKED") {
      setLive(null);
    }
  });

  if (!live) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="font-[family-name:var(--font-ui)] text-xs uppercase tracking-[0.3em] text-champagne-dim">
          {teamName}
        </p>
        <h1 className="foil-text font-[family-name:var(--font-display)] text-3xl font-bold italic">
          Watch the screen
        </h1>
        <p className="text-sm text-champagne-dim">Waiting for the next question.</p>
      </main>
    );
  }

  const letters = ["A", "B", "C", "D"];

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <span className="font-[family-name:var(--font-ui)] text-xs uppercase tracking-[0.3em] text-champagne-dim">
          {teamName}
        </span>
        <Timer startedAt={live.startedAt} limitSeconds={timeLimitSeconds} />
      </div>

      <QuestionCard text={live.question.text} codeSnippet={live.question.codeSnippet} />

      <div className="flex flex-col gap-3">
        {live.question.options.map((option, index) => (
          <button
            key={index}
            disabled={status !== "idle"}
            onClick={async () => {
              setSelected(index);
              setStatus("submitting");
              const result = await submitPhase2Answer(index);
              if (result.ok) setStatus("submitted");
              else {
                setStatus("error");
                setError(result.error);
              }
            }}
            className={cn(
              "flex items-center gap-3 rounded-sm border px-4 py-4 text-left transition disabled:cursor-not-allowed",
              selected === index ? "border-foil-gold bg-foil-gold/10 text-foil-gold" : "border-champagne-dim/25 text-champagne"
            )}
          >
            <span className="font-[family-name:var(--font-impact)] text-sm opacity-60">{letters[index]}</span>
            {option}
          </button>
        ))}
      </div>

      {status === "submitted" ? (
        <p className="text-center text-sm text-emerald-glow">Answer locked in.</p>
      ) : null}
      {error ? <p className="text-center text-sm text-crimson-glow">{error}</p> : null}
    </main>
  );
}
