"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { startPhase1 } from "@/lib/actions/host-phase1";
import { sfx } from "@/lib/sound/sfx";
import type { TeamForHost } from "@/components/host/HostConsole";

export function RegistrationPanel({ teams, hasQuestions }: { teams: TeamForHost[]; hasQuestions: boolean }) {
    const [starting, setStarting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Registered Teams ({teams.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                    {teams.map((t) => (
                        <div key={t.id} className="flex justify-between border-b border-white/5 py-2 font-montserrat">
                            <span>{t.name}</span>
                            <span className="text-champagne/50">{t.leaderName}</span>
                        </div>
                    ))}
                    {teams.length === 0 && <p className="text-champagne/40">No teams registered yet.</p>}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Start the Arena</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-champagne/60 mb-4">
                        Once every team has registered and phones are away, start Phase 1.
                    </p>
                    <Button
                        disabled={starting || teams.length === 0 || !hasQuestions}
                        onClick={async () => {
                            setStarting(true);
                            setError(null);
                            try {
                                await startPhase1();
                                sfx.reveal();
                            } catch {
                                setError("Failed to start Phase 1 — check your connection and try again.");
                                sfx.error();
                                setStarting(false);
                            }
                        }}
                        className="w-full"
                    >
                        {starting ? "Starting…" : "Start Phase 1"}
                    </Button>
                    {error && <p className="text-buzzer-red text-sm mt-2">{error}</p>}
                </CardContent>
            </Card>
        </div>
    );
}
