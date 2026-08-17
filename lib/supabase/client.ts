"use client";

import { createClient } from "@supabase/supabase-js";

// Anon-key client used only to subscribe to broadcast channels. It never
// reads/writes tables directly, so no RLS policies are required for it.
export function createSupabaseBrowserClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: false } }
    );
}
