"use client";

import { useState } from "react";
import { registerTeam } from "@/lib/actions/registration";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plaque } from "@/components/ui/Plaque";
import { sfx } from "@/lib/sound/sfx";

export function RegisterForm() {
    const [teamName, setTeamName] = useState("");
    const [leaderName, setLeaderName] = useState("");
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<{ pin: string; teamName: string } | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setPending(true);
        setError(null);

        try {
            const res = await registerTeam(teamName, leaderName);
            if (!res.success) {
                setError(res.error);
                sfx.error();
                return;
            }
            sfx.pinSuccess();
            setResult({ pin: res.pin, teamName });
        } catch {
            setError("Something went wrong — check your connection and try again.");
            sfx.error();
        } finally {
            setPending(false);
        }
    }

    if (result) {
        return (
            <Plaque title="You're In">
                <div className="text-center space-y-4">
                    <p className="font-montserrat text-champagne/80 text-sm">
                        Team <span className="text-foil-gold-bright font-bold">{result.teamName}</span> — phones away now.
                    </p>
                    <p className="text-champagne/50 text-xs">Save this PIN for the Final Sprint.</p>
                    <div className="text-5xl font-anton tracking-[0.3em] text-foil-gold-bright py-4 border border-foil-gold/30 bg-stage-black-deep">
                        {result.pin}
                    </div>
                </div>
            </Plaque>
        );
    }

    return (
        <Plaque title="Team Registration">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input value={teamName} onChange={(e) => setTeamName(e.target.value)} required maxLength={40} placeholder="Team name" />
                <Input value={leaderName} onChange={(e) => setLeaderName(e.target.value)} required maxLength={40} placeholder="Team leader name" />
                {error && <p className="text-buzzer-red text-sm">{error}</p>}
                <Button type="submit" disabled={pending} className="w-full">
                    {pending ? "Registering…" : "Register Team"}
                </Button>
            </form>
        </Plaque>
    );
}
