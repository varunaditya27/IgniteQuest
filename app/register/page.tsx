import { RegisterForm } from "@/components/shared/RegisterForm";

export default function RegisterPage() {
    return (
        <main className="stage-spotlight flex min-h-screen flex-col items-center justify-center p-4">
            <h1 className="text-3xl md:text-4xl font-bodoni font-bold foil-text mb-8 text-center">
                IgniteQuest &mdash; Team Registration
            </h1>
            <RegisterForm />
        </main>
    );
}
