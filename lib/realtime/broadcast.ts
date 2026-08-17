import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { GAME_CHANNEL_EVENT, gameChannelName, type GameEvent } from "@/lib/realtime/events";

export async function broadcast(eventId: string, event: GameEvent) {
    const supabase = createSupabaseServiceClient();
    const channel = supabase.channel(gameChannelName(eventId));
    await channel.send({
        type: "broadcast",
        event: GAME_CHANNEL_EVENT,
        payload: event,
    });
    await supabase.removeChannel(channel);
}
