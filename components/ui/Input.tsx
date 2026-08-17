import * as React from "react"
import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-11 w-full rounded-sm border border-white/15 bg-stage-black px-3 py-2 text-sm text-champagne placeholder:text-champagne/35 transition-colors focus-visible:outline-none focus-visible:border-foil-gold focus-visible:ring-2 focus-visible:ring-foil-gold/30 disabled:cursor-not-allowed disabled:opacity-40",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input }
