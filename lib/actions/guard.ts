import "server-only";
import { isHostAuthenticated } from "@/lib/auth/host";
import { getAuthenticatedTeamId } from "@/lib/auth/team";

export async function requireHost(): Promise<void> {
    if (!(await isHostAuthenticated())) {
        throw new Error("Not authenticated as host.");
    }
}

export async function requireTeam(): Promise<string> {
    const teamId = await getAuthenticatedTeamId();
    if (!teamId) throw new Error("Not authenticated as team.");
    return teamId;
}
