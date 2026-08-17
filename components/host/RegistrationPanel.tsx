"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { startPhase1 } from "@/lib/actions/host-phase1";
import { sfx } from "@/lib/sound/sfx";
import type { TeamForHost, HostBundle } from "@/components/host/HostConsole";

export function RegistrationPanel({
    teams,
    hasQuestions,
    onBundle,
}: {
    teams: TeamForHost[];
    hasQuestions: boolean;
    onBundle: (b: HostBundle) => void;
}) {
    const [starting, setStarting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    return (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-4">
            <Panel label={`Registered Teams — ${teams.length}`}>
                {teams.length === 0 ? (
                    <p className="text-champagne/40 text-sm">No teams registered yet.</p>
                ) : (
                    <ul className="space-y-1">
                        {teams.map((t) => (
                            <li key={t.id} className="flex justify-between border-b border-white/5 py-2 font-montserrat text-sm">
                                <span>{t.name}</span>
                                <span className="text-champagne/40">{t.leaderName}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </Panel>

            <Panel label="Start the Arena">
                <Button
                    disabled={starting || teams.length === 0 || !hasQuestions}
                    onClick={async () => {
                        setStarting(true);
                        setError(null);
                        try {
                            onBundle(await startPhase1());
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
            </Panel>
        </div>
    );
}
