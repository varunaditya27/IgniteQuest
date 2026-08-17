"use client";
import { cn } from "@/lib/cn";

const LIFELINES = [
  { type: "FIFTY_FIFTY", label: "50 : 50" },
  { type: "ASK_AUDIENCE", label: "Ask Audience" },
  { type: "ASK_EXPERT", label: "Ask Expert" },
] as const;

export type LifelineType = (typeof LIFELINES)[number]["type"];

export function LifelineButtons({
  usedTypes,
  disabled,
  pendingType,
  onUse,
}: {
  usedTypes: Set<LifelineType>;
  disabled: boolean;
  pendingType: LifelineType | null;
  onUse: (type: LifelineType) => void;
}) {
  return (
    <div className="flex gap-3">
      {LIFELINES.map((lifeline) => {
        const used = usedTypes.has(lifeline.type);
        return (
          <button
            key={lifeline.type}
            type="button"
            disabled={disabled || used || pendingType !== null}
            onClick={() => onUse(lifeline.type)}
            className={cn(
              "flex-1 rounded-sm border px-3 py-3 font-[family-name:var(--font-ui)] text-xs font-semibold uppercase tracking-wide transition",
              used
                ? "border-champagne-dim/20 text-champagne-dim/40 line-through"
                : "border-violet/50 text-violet-glow hover:bg-violet/15",
              pendingType === lifeline.type && "animate-pulse"
            )}
          >
            {lifeline.label}
          </button>
        );
      })}
    </div>
  );
}
