"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { startPhase1 } from "@/lib/actions/host-phase1";
import type { TeamForHost } from "@/components/host/HostConsole";

export function RegistrationPanel({ teams, hasQuestions }: { teams: TeamForHost[]; hasQuestions: boolean }) {
    const [starting, setStarting] = useState(false);

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
                            <span className="text-ivory-white/50">{t.leaderName}</span>
                        </div>
                    ))}
                    {teams.length === 0 && <p className="text-ivory-white/40">No teams registered yet.</p>}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Start the Arena</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-ivory-white/60 mb-4">
                        Once every team has registered and phones are away, start Phase 1.
                    </p>
                    <Button
                        disabled={starting || teams.length === 0 || !hasQuestions}
                        onClick={async () => {
                            setStarting(true);
                            await startPhase1();
                        }}
                        className="w-full bg-prestige-gold text-royal-black hover:bg-electric-yellow font-bold"
                    >
                        {starting ? "Starting…" : "START PHASE 1"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
