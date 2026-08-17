"use client";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes } from "react";

const button = cva(
  "inline-flex items-center justify-center gap-2 rounded-sm font-[family-name:var(--font-ui)] font-semibold tracking-wide uppercase transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foil-gold",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-b from-foil-gold-bright to-foil-gold-deep text-stage-black shadow-[0_1px_0_0_rgba(255,255,255,0.3)_inset,0_8px_20px_-6px_rgba(232,184,75,0.6)] hover:brightness-110 active:brightness-95",
        secondary:
          "border border-foil-gold/50 text-foil-gold bg-stage-raised/60 hover:bg-stage-raised hover:border-foil-gold",
        ghost: "text-champagne-dim hover:text-champagne",
        correct:
          "bg-gradient-to-b from-emerald-glow to-emerald text-stage-black shadow-[0_8px_20px_-6px_rgba(31,174,110,0.7)] hover:brightness-110",
        danger:
          "border border-crimson/60 text-crimson-glow bg-crimson/10 hover:bg-crimson/20",
      },
      size: {
        sm: "text-xs px-3 py-1.5",
        md: "text-sm px-5 py-2.5",
        lg: "text-base px-8 py-4",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof button> & { pending?: boolean };

export function Button({ className, variant, size, pending, children, disabled, ...props }: ButtonProps) {
  return (
    <button className={cn(button({ variant, size }), className)} disabled={disabled || pending} {...props}>
      {pending ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" /> : null}
      {children}
    </button>
  );
}
