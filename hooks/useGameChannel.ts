"use client";

import { useEffect, useRef } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { GAME_CHANNEL_EVENT, gameChannelName, type GameEvent } from "@/lib/realtime/events";

export function useGameChannel(eventId: string, onEvent: (event: GameEvent) => void) {
    const onEventRef = useRef(onEvent);

    useEffect(() => {
        onEventRef.current = onEvent;
    }, [onEvent]);

    useEffect(() => {
        const supabase = createSupabaseBrowserClient();
        const channel = supabase
            .channel(gameChannelName(eventId))
            .on("broadcast", { event: GAME_CHANNEL_EVENT }, ({ payload }) => {
                onEventRef.current(payload as GameEvent);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [eventId]);
}
