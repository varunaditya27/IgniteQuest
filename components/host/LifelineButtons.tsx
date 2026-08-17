"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useFiftyFifty, useAskAudience, useAskExpert, useSwitchQuestion } from "@/lib/actions/host-lifelines";
import type { LifelineType } from "@prisma/client";

const LIFELINES: { type: LifelineType; label: string; action: () => Promise<{ success: boolean; error?: string }> }[] = [
    { type: "FIFTY_FIFTY", label: "50:50", action: useFiftyFifty },
    { type: "ASK_AUDIENCE", label: "Ask Audience", action: useAskAudience },
    { type: "ASK_EXPERT", label: "Ask Expert", action: useAskExpert },
    { type: "SWITCH_QUESTION", label: "Switch Question", action: useSwitchQuestion },
];

export function LifelineButtons({ usedTypes, disabled }: { usedTypes: LifelineType[]; disabled: boolean }) {
    const [pending, setPending] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    return (
        <div>
            <div className="grid grid-cols-2 gap-2">
                {LIFELINES.map((l) => {
                    const used = usedTypes.includes(l.type);
                    return (
                        <Button
                            key={l.type}
                            variant="outline"
                            disabled={disabled || used || pending === l.type}
                            onClick={async () => {
                                setPending(l.type);
                                setError(null);
                                const res = await l.action();
                                if (!res.success) setError(res.error ?? "Failed.");
                                setPending(null);
                            }}
                            className="border-white/20 text-white disabled:opacity-30"
                        >
                            {used ? `${l.label} ✓` : l.label}
                        </Button>
                    );
                })}
            </div>
            {error && <p className="text-carmine-red text-sm mt-2">{error}</p>}
        </div>
    );
}
