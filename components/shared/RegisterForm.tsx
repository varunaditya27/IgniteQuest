"use client";

import { useState } from "react";
import { registerTeam } from "@/lib/actions/registration";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

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
                return;
            }
            setResult({ pin: res.pin, teamName });
        } catch {
            setError("Something went wrong — check your connection and try again.");
        } finally {
            setPending(false);
        }
    }

    if (result) {
        return (
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle>You&apos;re Registered!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="font-montserrat text-ivory-white/80">
                        Team <span className="text-prestige-gold font-bold">{result.teamName}</span> is in.
                    </p>
                    <p className="text-ivory-white/60 text-sm">
                        Save this PIN — you&apos;ll need it to log in for the Final Sprint if your team qualifies.
                        Put your phone away now; the arena is host-controlled.
                    </p>
                    <div className="text-5xl font-bebas tracking-[0.3em] text-prestige-gold py-4 border-2 border-prestige-gold/30 rounded-lg">
                        {result.pin}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Team Registration</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-ivory-white/70 mb-1 font-montserrat">Team Name</label>
                        <Input
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            required
                            maxLength={40}
                            className="bg-royal-black border-white/10 text-ivory-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-ivory-white/70 mb-1 font-montserrat">Team Leader Name</label>
                        <Input
                            value={leaderName}
                            onChange={(e) => setLeaderName(e.target.value)}
                            required
                            maxLength={40}
                            className="bg-royal-black border-white/10 text-ivory-white"
                        />
                    </div>
                    {error && <p className="text-carmine-red text-sm">{error}</p>}
                    <Button
                        type="submit"
                        disabled={pending}
                        className="w-full bg-prestige-gold text-royal-black hover:bg-electric-yellow font-bold"
                    >
                        {pending ? "Registering…" : "REGISTER TEAM"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
