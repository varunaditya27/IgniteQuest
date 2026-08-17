"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
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
import type { GameStateWithRelations, TeamForHost } from "@/components/host/HostConsole";

type Props = { gameState: GameStateWithRelations; teams: TeamForHost[]; totalQuestions: number };

export function Phase1Panel({ gameState, teams, totalQuestions }: Props) {
    const [ending, setEnding] = useState(false);
    // A single in-flight action lock across Reveal/Lock/Correct/Wrong/Next — these all
    // mutate the same GameState/score, so a double-click firing two of them
    // concurrently (e.g. Correct then Wrong before the first response lands) is exactly
    // the race that made scoring corrections unreliable. One flag, not per-button state,
    // since only one of these should ever be in flight at a time regardless of which.
    const [pending, setPending] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);
    const question = gameState.currentQuestion;
    const activeTeam = teams.find((t) => t.id === gameState.activeTeamId);
    const eligibleTeams = teams.filter((t) => !t.eliminated);

    async function run(action: () => Promise<unknown>) {
        setPending(true);
        setActionError(null);
        try {
            await action();
        } catch {
            setActionError("Action failed — check your connection and try again.");
        } finally {
            setPending(false);
        }
    }

    if (!question) {
        return (
            <Card>
                <CardContent className="p-8 text-center text-ivory-white/60">
                    Phase 1 has no more questions. Lock scores and move to finalists below.
                    <div className="mt-4">
                        <EndPhase1Button ending={ending} setEnding={setEnding} disabled={pending} />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>
                        Question {question.order} / {totalQuestions} — {question.type}
                    </CardTitle>
                    {gameState.questionRevealed && gameState.questionStartedAt && (
                        <div className="scale-50 origin-right">
                            <Timer
                                startedAt={gameState.questionStartedAt.toISOString()}
                                limitSeconds={question.timeLimitSeconds ?? gameConfig.phase1TimeLimitSeconds}
                            />
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    {question.codeSnippet && (
                        <pre className="bg-black/50 p-4 rounded mb-4 text-sm overflow-x-auto">{question.codeSnippet}</pre>
                    )}
                    <p className="text-xl mb-4">{question.text}</p>
                    <div className="grid grid-cols-2 gap-2 mb-6">
                        {question.options.map((opt, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "p-3 rounded border",
                                    i === question.correctOption
                                        ? "border-emerald-signal bg-emerald-900/20 text-emerald-signal"
                                        : "border-white/10"
                                )}
                            >
                                {String.fromCharCode(65 + i)}. {opt}
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-wrap gap-3 mb-4">
                        <Button onClick={() => run(revealCurrentQuestion)} disabled={pending || gameState.questionRevealed} className="bg-prestige-gold text-royal-black disabled:opacity-40">
                            Reveal
                        </Button>
                        <Button onClick={() => run(() => recordPhase1Answer(true))} disabled={pending} className="bg-emerald-signal text-royal-black font-bold disabled:opacity-40">
                            Correct
                        </Button>
                        <Button onClick={() => run(() => recordPhase1Answer(false))} disabled={pending} variant="destructive" className="font-bold disabled:opacity-40">
                            Wrong
                        </Button>
                        <Button onClick={() => run(advanceToNextPhase1Question)} disabled={pending} className="bg-carbon-gray border border-prestige-gold/40 text-prestige-gold ml-auto disabled:opacity-40">
                            Next Question →
                        </Button>
                    </div>
                    {actionError && <p className="text-carmine-red text-sm mb-4">{actionError}</p>}

                    <EndPhase1Button ending={ending} setEnding={setEnding} disabled={pending} />
                </CardContent>
            </Card>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Active Team</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-ivory-white/40 mb-2">
                            Overrides this question only — round-robin picks the team again on Next Question.
                        </p>
                        <select
                            value={gameState.activeTeamId ?? ""}
                            onChange={(e) => run(() => selectActiveTeam(e.target.value))}
                            disabled={pending}
                            className="w-full bg-royal-black border border-white/10 rounded p-2 mb-4 disabled:opacity-40"
                        >
                            {eligibleTeams.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name} ({t.score})
                                </option>
                            ))}
                        </select>
                        {activeTeam && (
                            <LifelineButtons
                                usedTypes={activeTeam.lifelineUsages.map((u) => u.type)}
                                disabled={pending || !gameState.questionRevealed}
                            />
                        )}
                    </CardContent>
                </Card>

                <Phase1ScoresList teams={teams} />
            </div>
        </div>
    );
}

function EndPhase1Button({
    ending,
    setEnding,
    disabled,
}: {
    ending: boolean;
    setEnding: (v: boolean) => void;
    disabled: boolean;
}) {
    const [error, setError] = useState<string | null>(null);

    return (
        <div>
            <Button
                variant="destructive"
                disabled={ending || disabled}
                onClick={async () => {
                    if (!confirm("Lock scores and select finalists? This ends Phase 1.")) return;
                    setEnding(true);
                    setError(null);
                    try {
                        await lockPhase1AndSelectFinalists();
                    } catch {
                        setError("Failed to lock Phase 1 — check your connection and try again.");
                        setEnding(false);
                    }
                }}
            >
                {ending ? "Locking…" : "END PHASE 1 → SELECT FINALISTS"}
            </Button>
            {error && <p className="text-carmine-red text-sm mt-2">{error}</p>}
        </div>
    );
}
