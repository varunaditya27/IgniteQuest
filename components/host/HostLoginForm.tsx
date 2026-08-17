"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { hostLogin } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export function HostLoginForm() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setPending(true);
        setError(null);
        try {
            const res = await hostLogin(password);
            if (!res.success) {
                setError(res.error ?? "Login failed.");
                return;
            }
            router.push("/host");
        } catch {
            setError("Something went wrong — check your connection and try again.");
        } finally {
            setPending(false);
        }
    }

    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>Host Console</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <Input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            autoComplete="current-password"
                            placeholder="Host password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoFocus
                            className="bg-royal-black border-white/10 text-ivory-white pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            className="absolute inset-y-0 right-0 flex items-center px-3 text-ivory-white/50 hover:text-ivory-white"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
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
