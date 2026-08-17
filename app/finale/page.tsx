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
            <main className="flex min-h-screen flex-col items-center justify-center bg-royal-black text-center p-4">
                <h1 className="text-3xl font-playfair text-prestige-gold mb-4">Results Not Revealed Yet</h1>
                <p className="text-ivory-white/60 mb-8">The finale will appear here once the host reveals it.</p>
                <Link href="/">
                    <Button variant="outline" className="border-white/20 text-white/50">
                        RETURN TO HOME
                    </Button>
                </Link>
            </main>
        );
    }

    const standings = await getFinalStandings(env.eventId);
    const winners = standings.slice(0, 3);

    return <FinaleReveal winners={winners} />;
}
