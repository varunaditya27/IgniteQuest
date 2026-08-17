import { redirect } from "next/navigation";
import { isHostAuthenticated } from "@/lib/auth/host";
import { HostLoginForm } from "@/components/host/HostLoginForm";

export default async function HostLoginPage() {
    if (await isHostAuthenticated()) {
        redirect("/host");
    }

    return (
        <main className="stage-spotlight flex min-h-screen flex-col items-center justify-center p-4">
            <HostLoginForm />
        </main>
    );
}
