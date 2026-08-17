"use client";
import { createClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/public-env";

// Anon-key browser client. Only ever subscribes to the event's broadcast
// channel — never queries tables directly (see ARCHITECTURE.md).
export const supabaseBrowser = createClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
  auth: { persistSession: false },
});
