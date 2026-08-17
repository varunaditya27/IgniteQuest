import { env } from "@/lib/env";
import { getGameStateWithRelations, getFinalStandings } from "@/lib/game/queries";
import { FinaleReveal } from "@/components/projector/FinaleReveal";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function FinalePage() {
    const gameState = await getGameStateWithRelations(env.eventId);

    if (gameState.phase !== "FINALE") {
        return (
            <main className="stage-spotlight flex min-h-screen flex-col items-center justify-center text-center p-4">
                <h1 className="text-3xl font-bodoni foil-text mb-4">Results Not Revealed Yet</h1>
                <p className="text-champagne/60 mb-8">The finale will appear here once the host reveals it.</p>
                <Link href="/">
                    <Button variant="ghost">Return to Home</Button>
                </Link>
            </main>
        );
    }

    const standings = await getFinalStandings(env.eventId);
    const winners = standings.slice(0, 3);

    return <FinaleReveal winners={winners} />;
}
