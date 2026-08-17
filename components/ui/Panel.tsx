import { cn } from "@/lib/utils";

// A control-panel section for the host dashboard — deliberately not a
// generic rounded "card": square corners, a thin border, and a small-caps
// eyebrow label instead of a big serif title, so it reads as a console
// instrument, not a product landing page.
export function Panel({
    label,
    action,
    children,
    className,
}: {
    label?: string;
    action?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <section className={cn("relative border border-white/10 bg-stage-black-raised/60 p-5", className)}>
            {(label || action) && (
                <div className="flex items-center justify-between mb-4">
                    {label && (
                        <h2 className="font-montserrat text-[11px] tracking-[0.25em] uppercase text-foil-gold/70">
                            {label}
                        </h2>
                    )}
                    {action}
                </div>
            )}
            {children}
        </section>
    );
}
