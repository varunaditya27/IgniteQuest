import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { GAME_CHANNEL_EVENT, gameChannelName, type GameEvent } from "@/lib/realtime/events";

export async function broadcast(eventId: string, event: GameEvent) {
    const supabase = createSupabaseServiceClient();
    const channel = supabase.channel(gameChannelName(eventId));
    try {
        // httpSend guarantees REST delivery (no implicit websocket-vs-REST fallback,
        // which supabase-js is deprecating) and, critically, returns a result instead
        // of throwing. The DB write this broadcast follows has already committed by
        // the time we get here — a dropped broadcast is recoverable (clients resync on
        // reconnect, see hooks/useGameChannel.ts), so it must never surface as a false
        // "action failed" error to the host on top of an already-successful mutation.
        const result = await channel.httpSend(GAME_CHANNEL_EVENT, event);
        if (!result.success) {
            console.error(`Realtime broadcast failed for ${gameChannelName(eventId)}:`, result.error);
        }
    } finally {
        await supabase.removeChannel(channel);
    }
}
