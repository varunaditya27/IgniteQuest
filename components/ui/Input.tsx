import { cn } from "@/lib/cn";
import type { InputHTMLAttributes } from "react";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-sm border border-foil-gold/30 bg-stage-inset px-4 py-3 font-[family-name:var(--font-body)] text-champagne placeholder:text-champagne-dim/50",
        "focus:border-foil-gold focus:outline-none focus:ring-1 focus:ring-foil-gold/40",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    />
  );
}
