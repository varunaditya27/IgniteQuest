import { redirect } from "next/navigation";
import { isHostAuthenticated } from "@/lib/auth/host";

export default async function HostConsoleLayout({ children }: { children: React.ReactNode }) {
    if (!(await isHostAuthenticated())) {
        redirect("/host/login");
    }
    return <>{children}</>;
}
