"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { teamLogin } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plaque } from "@/components/ui/Plaque";
import { sfx } from "@/lib/sound/sfx";

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
                sfx.error();
                return;
            }
            sfx.pinSuccess();
            router.refresh();
        } catch {
            setError("Something went wrong — check your connection and try again.");
            sfx.error();
        } finally {
            setPending(false);
        }
    }

    return (
        <Plaque title="Final Sprint Login">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    placeholder="Team PIN"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.toUpperCase())}
                    maxLength={6}
                    required
                    autoFocus
                    className="text-center text-2xl tracking-[0.3em] font-anton"
                />
                {error && <p className="text-buzzer-red text-sm">{error}</p>}
                <Button type="submit" disabled={pending} className="w-full">
                    {pending ? "Checking…" : "Enter"}
                </Button>
            </form>
        </Plaque>
    );
}
