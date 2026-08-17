"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

export function OptionsGrid({
  options,
  hiddenOptions,
  lockedOptionIndex,
  correctOption,
  revealed,
  disabled,
  onSelect,
}: {
  options: string[];
  hiddenOptions: number[];
  lockedOptionIndex: number | null;
  correctOption: number;
  revealed: boolean;
  disabled: boolean;
  onSelect: (index: number) => void;
}) {
  const letters = ["A", "B", "C", "D"];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {options.map((option, index) => {
        const hidden = hiddenOptions.includes(index);
        const locked = lockedOptionIndex === index;
        const isCorrect = revealed && index === correctOption;
        const isWrongLocked = revealed && locked && index !== correctOption;

        return (
          <motion.button
            key={index}
            type="button"
            data-testid="option"
            layout
            disabled={disabled || hidden || revealed}
            onClick={() => onSelect(index)}
            animate={hidden ? { opacity: 0.15, scale: 0.97 } : { opacity: 1, scale: 1 }}
            className={cn(
              "flex items-center gap-4 rounded-sm border px-5 py-4 text-left font-[family-name:var(--font-body)] text-lg transition disabled:cursor-not-allowed",
              isCorrect && "border-emerald bg-emerald/15 text-emerald-glow",
              isWrongLocked && "border-crimson bg-crimson/15 text-crimson-glow",
              !revealed && locked && "border-foil-gold bg-foil-gold/10 text-foil-gold",
              !revealed && !locked && !hidden && "border-champagne-dim/25 text-champagne hover:border-foil-gold/60"
            )}
          >
            <span className="font-[family-name:var(--font-impact)] text-sm opacity-60">{letters[index]}</span>
            <span>{option}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
