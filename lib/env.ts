import "server-only";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export const env = {
  eventId: required("EVENT_ID"),
  hostPassword: required("HOST_PASSWORD"),
  sessionSecret: required("SESSION_SECRET"),
  supabaseUrl: required("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseServiceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY"),
  finalistCount: Number(required("FINALIST_COUNT")),
  phase1TimeLimitSeconds: Number(required("PHASE1_TIME_LIMIT_SECONDS")),
  phase2TimeLimitSeconds: Number(required("PHASE2_TIME_LIMIT_SECONDS")),
  wrongAnswerPoints: Number(required("WRONG_ANSWER_POINTS")),
};
