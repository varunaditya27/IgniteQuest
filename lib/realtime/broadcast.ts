import "server-only";
import { supabaseServer } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import { channelName, type GameEvent } from "@/lib/realtime/events";

// Broadcast is a live-sync nicety (Phase 2 phones, the host's submission
// tally) — never the source of truth for game state, which every caller
// gets straight back from its own DB write. A stalled or unreachable
// Realtime connection on venue wifi must not hang or fail the host action
// that triggered it, so this always resolves and never throws.
export async function broadcast(event: GameEvent): Promise<void> {
  const channel = supabaseServer.channel(channelName(env.eventId));

  try {
    await Promise.race([
      new Promise<void>((resolve, reject) => {
        channel.subscribe((status) => {
          if (status === "SUBSCRIBED") resolve();
          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
            reject(new Error(status));
          }
        });
      }),
      new Promise<void>((_, reject) => setTimeout(() => reject(new Error("SUBSCRIBE_TIMEOUT")), 5000)),
    ]);

    await channel.send({ type: "broadcast", event: event.type, payload: event });
  } catch (error) {
    console.error("broadcast failed, continuing without live sync:", error);
  } finally {
    await supabaseServer.removeChannel(channel);
  }
}
