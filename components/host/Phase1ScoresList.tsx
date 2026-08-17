import { Panel } from "@/components/ui/Panel";
import { cn } from "@/lib/utils";
import type { TeamForHost } from "@/components/host/HostConsole";

export function Phase1ScoresList({ teams }: { teams: TeamForHost[] }) {
    const ranked = [...teams]
        .map((t) => ({
            ...t,
            totalMs: t.answers.reduce((sum, a) => sum + (a.responseTimeMs ?? 0), 0),
        }))
        .sort((a, b) => (b.score !== a.score ? b.score - a.score : a.totalMs - b.totalMs));

    return (
        <Panel label="Scores">
            <ol className="space-y-1">
                {ranked.map((t, i) => (
                    <li key={t.id} className="flex items-baseline gap-3 font-montserrat text-sm">
                        <span className="w-4 text-champagne/30 font-anton">{i + 1}</span>
                        <span className={cn("flex-1 truncate", t.eliminated && "text-champagne/30 line-through")}>{t.name}</span>
                        <span className="text-champagne/35 text-xs">{(t.totalMs / 1000).toFixed(1)}s</span>
                        <span className="font-anton text-foil-gold-bright w-14 text-right">{t.score}</span>
                    </li>
                ))}
            </ol>
        </Panel>
    );
}
