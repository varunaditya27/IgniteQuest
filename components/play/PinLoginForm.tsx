"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { teamLogin } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export function PinLoginForm() {
    const router = useRouter();
    const [pin, setPin] = useState("");
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setPending(true);
        setError(null);
        try {
            const res = await teamLogin(pin);
            if (!res.success) {
                setError(res.error ?? "Login failed.");
                return;
            }
            router.refresh();
        } catch {
            setError("Something went wrong — check your connection and try again.");
        } finally {
            setPending(false);
        }
    }

    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>Final Sprint Login</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        placeholder="Team PIN"
                        value={pin}
                        onChange={(e) => setPin(e.target.value.toUpperCase())}
                        maxLength={6}
                        required
                        autoFocus
                        className="bg-royal-black border-white/10 text-ivory-white text-center text-2xl tracking-[0.3em]"
                    />
                    {error && <p className="text-carmine-red text-sm">{error}</p>}
                    <Button
                        type="submit"
                        disabled={pending}
                        className="w-full bg-prestige-gold text-royal-black hover:bg-electric-yellow font-bold"
                    >
                        {pending ? "Checking…" : "ENTER"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
