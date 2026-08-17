"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { LifelineButtons } from "@/components/host/LifelineButtons";
import { Phase1ScoresList } from "@/components/host/Phase1ScoresList";
import { Timer } from "@/components/shared/Timer";
import {
    revealCurrentQuestion,
    selectActiveTeam,
    recordPhase1Answer,
    advanceToNextPhase1Question,
    lockPhase1AndSelectFinalists,
} from "@/lib/actions/host-phase1";
import { gameConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import { sfx } from "@/lib/sound/sfx";
import type { GameStateWithRelations, TeamForHost, HostBundle } from "@/components/host/HostConsole";

type Props = { gameState: GameStateWithRelations; teams: TeamForHost[]; totalQuestions: number; onBundle: (b: HostBundle) => void };

export function Phase1Panel({ gameState, teams, totalQuestions, onBundle }: Props) {
    const [ending, setEnding] = useState(false);
    // A single in-flight action lock — Reveal/judge/Next all mutate the same
    // GameState/score, so a double-click firing two of them concurrently is
    // exactly the race that made scoring corrections unreliable.
    const [pending, setPending] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);
    const question = gameState.currentQuestion;
    const activeTeam = teams.find((t) => t.id === gameState.activeTeamId);
    const eligibleTeams = teams.filter((t) => !t.eliminated);
    const judgedOption = activeTeam?.answers.find((a) => a.questionId === question?.id)?.selectedOption ?? null;

    async function run<T extends HostBundle>(action: () => Promise<T>, onSuccess?: () => void) {
        setPending(true);
        setActionError(null);
        try {
            const bundle = await action();
            onBundle(bundle);
            onSuccess?.();
        } catch {
            setActionError("Action failed — check your connection and try again.");
            sfx.error();
        } finally {
            setPending(false);
        }
    }

    if (!question) {
        return (
            <Panel className="max-w-md mx-auto mt-24 text-center">
                <p className="text-champagne/60 mb-4">Phase 1 has no more questions.</p>
                <EndPhase1Button ending={ending} setEnding={setEnding} disabled={pending} onBundle={onBundle} />
            </Panel>
        );
    }

    if (!gameState.questionRevealed) {
        return (
            <div className="flex flex-col items-center justify-center gap-10 min-h-[70vh]">
                <p className="font-montserrat text-xs tracking-[0.4em] uppercase text-champagne/40">
                    Question {question.order} / {totalQuestions}
                </p>
                <div className="text-center">
                    <p className="font-montserrat text-sm tracking-[0.3em] uppercase text-foil-gold/70 mb-2">Up Next</p>
                    <h1 className="font-bodoni text-6xl foil-text">{activeTeam?.name ?? "—"}</h1>
                </div>
                <Button size="lg" onClick={() => run(revealCurrentQuestion, sfx.reveal)} disabled={pending} className="px-16">
                    Reveal Question
                </Button>
                <div className="w-full max-w-md">
                    <select
                        value={gameState.activeTeamId ?? ""}
                        onChange={(e) => run(() => selectActiveTeam(e.target.value))}
                        disabled={pending}
                        className="w-full bg-stage-black border border-white/10 rounded-sm p-2 text-sm disabled:opacity-40"
                    >
                        {eligibleTeams.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.name} ({t.score})
                            </option>
                        ))}
                    </select>
                </div>
                {actionError && <p className="text-buzzer-red text-sm">{actionError}</p>}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
            <Panel
                label={`Question ${question.order} / ${totalQuestions} — ${activeTeam?.name}`}
                action={
                    gameState.questionStartedAt && (
                        <div className="scale-[0.4] origin-right -my-4">
                            <Timer startedAt={gameState.questionStartedAt.toISOString()} limitSeconds={question.timeLimitSeconds ?? gameConfig.phase1TimeLimitSeconds} />
                        </div>
                    )
                }
            >
                {question.codeSnippet && (
                    <pre className="bg-stage-black-deep p-4 rounded-sm mb-4 text-sm overflow-x-auto border border-white/5">{question.codeSnippet}</pre>
                )}
                <p className="text-xl mb-2">{question.text}</p>
                <p className="text-xs text-champagne/40 mb-4 font-montserrat uppercase tracking-widest">
                    Click the option {activeTeam?.name} answered
                </p>
                <div className="grid grid-cols-2 gap-2 mb-6">
                    {question.options.map((opt, i) => {
                        const isCorrectOption = i === question.correctOption;
                        const isJudged = judgedOption === i;
                        return (
                            <button
                                key={i}
                                disabled={pending}
                                onClick={() => run(() => recordPhase1Answer(i), () => sfx[isCorrectOption ? "correctDing" : "buzzer"]())}
                                className={cn(
                                    "p-3 rounded-sm border text-left transition-colors disabled:opacity-40",
                                    isJudged
                                        ? isCorrectOption
                                            ? "border-correct-emerald bg-correct-emerald/15 text-correct-emerald"
                                            : "border-buzzer-red bg-buzzer-red/15 text-buzzer-red"
                                        : "border-white/10 hover:border-foil-gold/50"
                                )}
                            >
                                {String.fromCharCode(65 + i)}. {opt}
                            </button>
                        );
                    })}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Button onClick={() => run(advanceToNextPhase1Question, sfx.cardChange)} disabled={pending} variant="secondary">
                        Next Question →
                    </Button>
                    {judgedOption === null && <p className="text-champagne/40 text-xs">Waiting for a verdict before advancing normally.</p>}
                </div>
                {actionError && <p className="text-buzzer-red text-sm mt-4">{actionError}</p>}

                <div className="mt-6">
                    <EndPhase1Button ending={ending} setEnding={setEnding} disabled={pending} onBundle={onBundle} />
                </div>
            </Panel>

            <div className="space-y-4">
                <Panel label="Lifelines">
                    {activeTeam && (
                        <LifelineButtons usedTypes={activeTeam.lifelineUsages.map((u) => u.type)} disabled={pending} onBundle={onBundle} />
                    )}
                </Panel>
                <Phase1ScoresList teams={teams} />
            </div>
        </div>
    );
}

function EndPhase1Button({
    ending,
    setEnding,
    disabled,
    onBundle,
}: {
    ending: boolean;
    setEnding: (v: boolean) => void;
    disabled: boolean;
    onBundle: (b: HostBundle) => void;
}) {
    const [error, setError] = useState<string | null>(null);

    return (
        <div>
            <Button
                variant="destructive"
                size="sm"
                disabled={ending || disabled}
                onClick={async () => {
                    if (!confirm("Lock scores and select finalists? This ends Phase 1.")) return;
                    setEnding(true);
                    setError(null);
                    try {
                        onBundle(await lockPhase1AndSelectFinalists());
                        sfx.cardChange();
                    } catch {
                        setError("Failed to lock Phase 1 — check your connection and try again.");
                        sfx.error();
                        setEnding(false);
                    }
                }}
            >
                {ending ? "Locking…" : "End Phase 1 → Select Finalists"}
            </Button>
            {error && <p className="text-buzzer-red text-sm mt-2">{error}</p>}
        </div>
    );
}
