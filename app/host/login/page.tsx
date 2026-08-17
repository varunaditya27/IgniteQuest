import { redirect } from "next/navigation";
import { isHostAuthenticated } from "@/lib/auth/host";
import { HostLoginForm } from "@/components/host/HostLoginForm";

export default async function HostLoginPage() {
    if (await isHostAuthenticated()) {
        redirect("/host");
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-royal-black p-4">
            <HostLoginForm />
        </main>
    );
}
