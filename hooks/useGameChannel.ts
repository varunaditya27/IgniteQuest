"use client";
import { useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { channelName, type GameEvent } from "@/lib/realtime/events";

export function useGameChannel(eventId: string, onEvent: (event: GameEvent) => void): void {
  useEffect(() => {
    const channel = supabaseBrowser
      .channel(channelName(eventId))
      .on("broadcast", { event: "PHASE2_QUESTION_STARTED" }, ({ payload }) => onEvent(payload as GameEvent))
      .on("broadcast", { event: "PHASE2_QUESTION_LOCKED" }, ({ payload }) => onEvent(payload as GameEvent))
      .on("broadcast", { event: "PHASE2_SUBMISSION_RECEIVED" }, ({ payload }) => onEvent(payload as GameEvent))
      .subscribe();

    return () => {
      supabaseBrowser.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);
}
