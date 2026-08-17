import { StageBackdrop } from "@/components/brand/StageBackdrop";
import { RegisterForm } from "@/components/shared/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-16">
      <StageBackdrop intensity={0.5} />
      <h1 className="foil-text relative z-10 mb-10 text-center font-[family-name:var(--font-display)] text-4xl font-bold italic">
        Team Registration
      </h1>
      <div className="relative z-10">
        <RegisterForm />
      </div>
    </main>
  );
}
