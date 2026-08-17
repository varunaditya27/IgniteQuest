"use client";

import { useEffect, useRef } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { GAME_CHANNEL_EVENT, gameChannelName, type GameEvent } from "@/lib/realtime/events";

// `onResync` fires every time the channel reaches SUBSCRIBED — including the initial
// connect and any reconnect after a drop. Broadcast is fire-and-forget with no replay,
// so this is the callers' hook to fetch a fresh snapshot and self-heal from whatever
// was missed while disconnected, rather than being permanently stuck on stale state.
export function useGameChannel(eventId: string, onEvent: (event: GameEvent) => void, onResync?: () => void) {
    const onEventRef = useRef(onEvent);
    const onResyncRef = useRef(onResync);

    useEffect(() => {
        onEventRef.current = onEvent;
        onResyncRef.current = onResync;
    });

    useEffect(() => {
        const supabase = createSupabaseBrowserClient();
        const channel = supabase
            .channel(gameChannelName(eventId))
            .on("broadcast", { event: GAME_CHANNEL_EVENT }, ({ payload }) => {
                onEventRef.current(payload as GameEvent);
            })
            .subscribe((status) => {
                if (status === "SUBSCRIBED") onResyncRef.current?.();
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [eventId]);
}
