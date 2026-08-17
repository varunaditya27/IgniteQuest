function required(name: string): string {
    const value = process.env[name];
    if (!value) throw new Error(`Missing required env var: ${name}`);
    return value;
}

export const env = {
    get databaseUrl() {
        return required("DATABASE_URL");
    },
    get supabaseUrl() {
        return required("NEXT_PUBLIC_SUPABASE_URL");
    },
    get supabaseAnonKey() {
        return required("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    },
    get supabaseServiceRoleKey() {
        return required("SUPABASE_SERVICE_ROLE_KEY");
    },
    get hostPassword() {
        return required("HOST_PASSWORD");
    },
    get sessionSecret() {
        return required("SESSION_SECRET");
    },
    get eventId() {
        return required("EVENT_ID");
    },
};
