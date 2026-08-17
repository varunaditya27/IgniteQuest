import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { TeamForHost } from "@/components/host/HostConsole";

export function Phase1ScoresList({ teams }: { teams: TeamForHost[] }) {
    const ranked = [...teams]
        .map((t) => ({
            ...t,
            totalMs: t.answers.reduce((sum, a) => sum + (a.responseTimeMs ?? 0), 0),
        }))
        .sort((a, b) => (b.score !== a.score ? b.score - a.score : a.totalMs - b.totalMs));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Scores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
                <p className="text-xs text-champagne/40 mb-2">
                    Ordered as finalists will be: score, then cumulative time as tiebreaker.
                </p>
                {ranked.map((t) => (
                    <div key={t.id} className="flex justify-between items-baseline font-montserrat">
                        <span className={t.eliminated ? "text-champagne/30 line-through" : ""}>{t.name}</span>
                        <span className="flex items-baseline gap-2">
                            <span className="text-champagne/40 text-xs">{(t.totalMs / 1000).toFixed(1)}s</span>
                            <span className="font-anton text-foil-gold-bright">{t.score}</span>
                        </span>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
