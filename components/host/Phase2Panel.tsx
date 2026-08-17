"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { Timer } from "@/components/shared/Timer";
import { startNextPhase2Question, lockPhase2Question, computeFinalStandings, revealFinale } from "@/lib/actions/host-phase2";
import { gameConfig } from "@/lib/config";
import { sfx } from "@/lib/sound/sfx";
import type { FastestFingersResult } from "@/lib/game/scoring";
import type { GameStateWithRelations, TeamForHost, QuestionRow, HostBundle } from "@/components/host/HostConsole";

type Props = {
    gameState: GameStateWithRelations;
    teams: TeamForHost[];
    phase2Questions: QuestionRow[];
    onBundle: (b: HostBundle) => void;
};

export function Phase2Panel({ gameState, teams, phase2Questions, onBundle }: Props) {
    const [standings, setStandings] = useState<(FastestFingersResult & { name: string })[] | null>(null);
    const [pending, setPending] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);
    const finalists = teams.filter((t) => !t.eliminated);

    async function run<T extends HostBundle>(action: () => Promise<T>, onSuccess?: () => void) {
        setPending(true);
        setActionError(null);
        try {
            onBundle(await action());
            onSuccess?.();
        } catch {
            setActionError("Action failed — check your connection and try again.");
            sfx.error();
        } finally {
            setPending(false);
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Panel label={`Finalists — ${finalists.length}`}>
                <ul className="space-y-1">
                    {finalists.map((t) => (
                        <li key={t.id} className="font-montserrat text-sm flex justify-between">
                            <span>{t.name}</span>
                            <span className="text-champagne/40 font-anton tracking-widest">{t.pin}</span>
                        </li>
                    ))}
                </ul>
                <p className="text-champagne/40 text-xs mt-3">No live leaderboard during Phase 2 — this list is host-only.</p>
            </Panel>

            <Panel
                label="Questions"
                action={
                    gameState.currentQuestion && gameState.questionStartedAt && !gameState.answerLocked ? (
                        <div className="scale-[0.4] origin-right -my-4">
                            <Timer startedAt={gameState.questionStartedAt.toISOString()} limitSeconds={gameState.currentQuestion.timeLimitSeconds ?? gameConfig.phase2TimeLimitSeconds} />
                        </div>
                    ) : undefined
                }
            >
                <ul className="space-y-1 mb-4">
                    {phase2Questions.map((q) => {
                        const isLive = gameState.currentQuestion?.id === q.id;
                        const alreadyShown = q.presentedAt !== null;
                        return (
                            <li key={q.id} className="flex items-center justify-between border-b border-white/5 py-1.5 text-sm">
                                <span className={alreadyShown && !isLive ? "text-champagne/30" : ""}>
                                    Q{q.order}. {q.text.slice(0, 40)}
                                </span>
                                <span className="text-[10px] text-champagne/50 font-montserrat uppercase tracking-widest">
                                    {isLive ? "Live" : alreadyShown ? "Shown" : "Upcoming"}
                                </span>
                            </li>
                        );
                    })}
                </ul>

                <div className="flex gap-3">
                    {gameState.phase !== "FINALE" && (
                        <Button
                            onClick={() => run(startNextPhase2Question, sfx.reveal)}
                            disabled={pending || (!!gameState.currentQuestion && !gameState.answerLocked)}
                        >
                            Start Next Question
                        </Button>
                    )}
                    {gameState.currentQuestion && (
                        <Button onClick={() => run(lockPhase2Question, sfx.hostLock)} disabled={pending || gameState.answerLocked} variant="outline">
                            Lock Answers
                        </Button>
                    )}
                </div>
            </Panel>

            <Panel label="Standings (host-only)" className="lg:col-span-2">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={pending}
                    className="mb-4"
                    onClick={async () => {
                        setPending(true);
                        try {
                            setStandings(await computeFinalStandings());
                        } catch {
                            setActionError("Failed to load standings.");
                            sfx.error();
                        } finally {
                            setPending(false);
                        }
                    }}
                >
                    Refresh Standings
                </Button>
                {standings && (
                    <ol className="space-y-1 mb-4">
                        {standings.map((s, i) => (
                            <li key={s.teamId} className="font-montserrat text-sm">
                                {i + 1}. {s.name} — {s.correctCount} correct, {s.totalResponseTimeMs}ms
                            </li>
                        ))}
                    </ol>
                )}
                {gameState.phase !== "FINALE" && (
                    <Button
                        variant="destructive"
                        disabled={pending}
                        onClick={() => {
                            if (!confirm("Reveal the finale? This locks the final results.")) return;
                            run(revealFinale, sfx.drumroll);
                        }}
                    >
                        Reveal Finale
                    </Button>
                )}
                {actionError && <p className="text-buzzer-red text-sm mt-2">{actionError}</p>}
            </Panel>
        </div>
    );
}
