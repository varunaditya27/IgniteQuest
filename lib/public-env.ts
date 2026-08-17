// NEXT_PUBLIC_ vars must be referenced as static `process.env.NEXT_PUBLIC_X`
// property accesses — Next.js inlines them into the browser bundle only by
// literal text match, not through a dynamic process.env[name] lookup.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) throw new Error("Missing required env var: NEXT_PUBLIC_SUPABASE_URL");
if (!supabaseAnonKey) throw new Error("Missing required env var: NEXT_PUBLIC_SUPABASE_ANON_KEY");

export const publicEnv = { supabaseUrl, supabaseAnonKey };
