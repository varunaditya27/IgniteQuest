import { HostLoginForm } from "@/components/host/HostLoginForm";

export default function HostLoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-stage-black px-6">
      <h1 className="foil-text mb-10 font-[family-name:var(--font-display)] text-3xl font-bold italic">
        Host Console
      </h1>
      <HostLoginForm />
    </main>
  );
}
