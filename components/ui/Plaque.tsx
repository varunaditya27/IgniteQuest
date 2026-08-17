import { cn } from "@/lib/utils";

// The single-purpose-form surface (login, PIN entry, registration) — a
// engraved plaque bracketed by gold rules, not a rounded SaaS card floating
// on a blurred backdrop.
export function Plaque({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
    return (
        <div className={cn("w-full max-w-sm", className)}>
            <div className="h-px bg-gradient-to-r from-transparent via-foil-gold to-transparent" />
            <div className="border-x border-white/10 bg-stage-black-raised/70 px-8 py-8">
                <h1 className="font-bodoni text-2xl foil-text mb-6 text-center">{title}</h1>
                {children}
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-foil-gold to-transparent" />
        </div>
    );
}
