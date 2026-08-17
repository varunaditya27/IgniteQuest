import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

// Service-role client. Server-only: never import this from a client component.
// Used exclusively to publish curated broadcast events (see lib/realtime/broadcast.ts).
export function createSupabaseServiceClient() {
    return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
        auth: { persistSession: false },
    });
}
