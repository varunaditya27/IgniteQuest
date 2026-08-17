"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { hostLogin } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export function HostLoginForm() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setPending(true);
        setError(null);
        const res = await hostLogin(password);
        setPending(false);
        if (!res.success) {
            setError(res.error ?? "Login failed.");
            return;
        }
        router.push("/host");
    }

    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>Host Console</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        type="password"
                        name="password"
                        autoComplete="current-password"
                        placeholder="Host password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoFocus
                        className="bg-royal-black border-white/10 text-ivory-white"
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
