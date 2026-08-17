"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Timer } from "@/components/shared/Timer";
import { startNextPhase2Question, lockPhase2Question, computeFinalStandings, revealFinale } from "@/lib/actions/host-phase2";
import { gameConfig } from "@/lib/config";
import { sfx } from "@/lib/sound/sfx";
import type { FastestFingersResult } from "@/lib/game/scoring";
import type { GameStateWithRelations, TeamForHost, QuestionRow } from "@/components/host/HostConsole";

type Props = { gameState: GameStateWithRelations; teams: TeamForHost[]; phase2Questions: QuestionRow[] };

export function Phase2Panel({ gameState, teams, phase2Questions }: Props) {
    const [standings, setStandings] = useState<(FastestFingersResult & { name: string })[] | null>(null);
    const [pending, setPending] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);
    const finalists = teams.filter((t) => !t.eliminated);

    async function run(action: () => Promise<unknown>, onSuccess?: () => void) {
        setPending(true);
        setActionError(null);
        try {
            await action();
            onSuccess?.();
        } catch {
            setActionError("Action failed — check your connection and try again.");
            sfx.error();
        } finally {
            setPending(false);
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Final Sprint — Finalists ({finalists.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                    {finalists.map((t) => (
                        <div key={t.id} className="font-montserrat">{t.name} — PIN {t.pin}</div>
                    ))}
                    <p className="text-champagne/40 text-sm mt-2">
                        No live leaderboard is shown during Phase 2 — this list is host-only.
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Questions</CardTitle>
                    {gameState.currentQuestion && gameState.questionStartedAt && !gameState.answerLocked && (
                        <div className="scale-50 origin-right">
                            <Timer
                                startedAt={gameState.questionStartedAt.toISOString()}
                                limitSeconds={gameState.currentQuestion.timeLimitSeconds ?? gameConfig.phase2TimeLimitSeconds}
                            />
                        </div>
                    )}
                </CardHeader>
                <CardContent className="space-y-2">
                    {phase2Questions.map((q) => {
                        const isLive = gameState.currentQuestion?.id === q.id;
                        const alreadyShown = q.presentedAt !== null;
                        return (
                            <div key={q.id} className="flex items-center justify-between border-b border-white/5 py-2">
                                <span className={alreadyShown && !isLive ? "text-champagne/30" : ""}>
                                    Q{q.order}. {q.text.slice(0, 40)}
                                </span>
                                <span className="text-xs text-champagne/50 font-montserrat uppercase">
                                    {isLive ? "Live" : alreadyShown ? "Shown" : "Upcoming"}
                                </span>
                            </div>
                        );
                    })}

                    <div className="flex gap-3 mt-4">
                        {gameState.phase !== "FINALE" && (
                            <Button
                                onClick={() => run(startNextPhase2Question, sfx.reveal)}
                                disabled={pending || (!!gameState.currentQuestion && !gameState.answerLocked)}
                            >
                                Start Next Question
                            </Button>
                        )}
                        {gameState.currentQuestion && (
                            <Button
                                onClick={() => run(lockPhase2Question, sfx.hostLock)}
                                disabled={pending || gameState.answerLocked}
                                variant="outline"
                            >
                                Lock Answers
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Standings (host-only)</CardTitle>
                </CardHeader>
                <CardContent>
                    <Button
                        variant="outline"
                        disabled={pending}
                        className="mb-4"
                        onClick={() => run(async () => setStandings(await computeFinalStandings()))}
                    >
                        Refresh Standings
                    </Button>
                    {standings && (
                        <ol className="space-y-1 mb-4">
                            {standings.map((s, i) => (
                                <li key={s.teamId} className="font-montserrat">
                                    {i + 1}. {s.name} — {s.correctCount} correct, {s.totalResponseTimeMs}ms
                                </li>
                            ))}
                        </ol>
                    )}
                    {gameState.phase !== "FINALE" && (
                        <Button
                            variant="destructive"
                            disabled={pending}
                            onClick={() =>
                                run(async () => {
                                    if (!confirm("Reveal the finale? This locks the final results.")) return;
                                    await revealFinale();
                                }, sfx.drumroll)
                            }
                        >
                            REVEAL FINALE
                        </Button>
                    )}
                    {actionError && <p className="text-buzzer-red text-sm mt-2">{actionError}</p>}
                </CardContent>
            </Card>
        </div>
    );
}
