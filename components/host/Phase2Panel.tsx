"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { startPhase2Question, lockPhase2Question, computeFinalStandings, revealFinale } from "@/lib/actions/host-phase2";
import type { FastestFingersResult } from "@/lib/game/scoring";
import type { GameStateWithRelations, TeamForHost, QuestionRow } from "@/components/host/HostConsole";

type Props = { gameState: GameStateWithRelations; teams: TeamForHost[]; phase2Questions: QuestionRow[] };

export function Phase2Panel({ gameState, teams, phase2Questions }: Props) {
    const [standings, setStandings] = useState<(FastestFingersResult & { name: string })[] | null>(null);
    const [pending, setPending] = useState(false);
    const finalists = teams.filter((t) => !t.eliminated);

    async function run(action: () => Promise<unknown>) {
        setPending(true);
        try {
            await action();
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
                    <p className="text-ivory-white/40 text-sm mt-2">
                        No live leaderboard is shown during Phase 2 — this list is host-only.
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Questions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {phase2Questions.map((q) => {
                        const isLive = gameState.currentQuestion?.id === q.id;
                        const alreadyShown = q.presentedAt !== null;
                        return (
                            <div key={q.id} className="flex items-center justify-between border-b border-white/5 py-2">
                                <span className={alreadyShown && !isLive ? "text-ivory-white/30" : ""}>
                                    Q{q.order}. {q.text.slice(0, 40)}
                                </span>
                                <Button
                                    size="sm"
                                    onClick={() => run(() => startPhase2Question(q.order))}
                                    disabled={pending || alreadyShown}
                                    className="bg-prestige-gold text-royal-black disabled:opacity-40"
                                >
                                    {isLive ? "Live" : alreadyShown ? "Shown" : "Start"}
                                </Button>
                            </div>
                        );
                    })}
                    {gameState.currentQuestion && (
                        <Button
                            onClick={() => run(lockPhase2Question)}
                            disabled={pending || gameState.answerLocked}
                            variant="outline"
                            className="border-white/20 text-white mt-2 disabled:opacity-40"
                        >
                            Lock Answers
                        </Button>
                    )}
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
                        className="border-white/20 text-white mb-4 disabled:opacity-40"
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
                                })
                            }
                        >
                            REVEAL FINALE
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
