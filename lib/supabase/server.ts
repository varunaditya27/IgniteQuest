import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

// Service-role client used only to publish Realtime broadcast events.
// Never used to read/write tables — Prisma owns that (see ARCHITECTURE.md).
export const supabaseServer = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: { persistSession: false },
});
