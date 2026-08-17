"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useFiftyFifty, useAskAudience, useAskExpert, useSwitchQuestion } from "@/lib/actions/host-lifelines";
import { sfx } from "@/lib/sound/sfx";
import type { LifelineType } from "@prisma/client";

const LIFELINES: { type: LifelineType; label: string; action: () => Promise<{ success: boolean; error?: string }>; sound: () => void }[] = [
    { type: "FIFTY_FIFTY", label: "50:50", action: useFiftyFifty, sound: sfx.fiftyFifty },
    { type: "ASK_AUDIENCE", label: "Ask Audience", action: useAskAudience, sound: sfx.lifelineStinger },
    { type: "ASK_EXPERT", label: "Ask Expert", action: useAskExpert, sound: sfx.lifelineStinger },
    { type: "SWITCH_QUESTION", label: "Switch Question", action: useSwitchQuestion, sound: sfx.cardChange },
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
                                try {
                                    const res = await l.action();
                                    if (!res.success) {
                                        setError(res.error ?? "Failed.");
                                        sfx.error();
                                    } else {
                                        l.sound();
                                    }
                                } catch {
                                    setError("Something went wrong — check your connection and try again.");
                                    sfx.error();
                                } finally {
                                    setPending(null);
                                }
                            }}
                        >
                            {used ? `${l.label} ✓` : l.label}
                        </Button>
                    );
                })}
            </div>
            {error && <p className="text-buzzer-red text-sm mt-2">{error}</p>}
        </div>
    );
}
