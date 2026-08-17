import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-sm font-montserrat font-bold uppercase tracking-wide transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foil-gold focus-visible:ring-offset-2 focus-visible:ring-offset-stage-black disabled:pointer-events-none disabled:opacity-40 active:translate-y-px",
    {
        variants: {
            variant: {
                default:
                    "bg-gradient-to-b from-foil-gold-bright via-foil-gold to-foil-gold-deep text-stage-black shadow-[0_1px_0_rgba(255,255,255,0.4)_inset,0_4px_14px_rgba(212,169,74,0.25)] hover:brightness-110 hover:shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_6px_20px_rgba(212,169,74,0.4)]",
                success:
                    "bg-gradient-to-b from-correct-emerald to-emerald-800 text-champagne shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_4px_14px_rgba(47,191,113,0.3)] hover:brightness-110",
                destructive:
                    "bg-gradient-to-b from-buzzer-red to-crimson-deep text-champagne shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_4px_14px_rgba(230,57,70,0.3)] hover:brightness-110",
                outline:
                    "border border-foil-gold/50 bg-transparent text-foil-gold hover:bg-foil-gold/10 hover:border-foil-gold",
                secondary:
                    "bg-stage-black-raised text-champagne border border-white/10 hover:border-white/25",
                ghost:
                    "bg-transparent text-champagne/70 hover:text-champagne hover:bg-white/5",
                link: "text-foil-gold underline-offset-4 hover:underline",
            },
            size: {
                default: "h-11 px-5 text-sm",
                sm: "h-9 rounded-sm px-3 text-xs",
                lg: "h-14 rounded-sm px-9 text-base",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
