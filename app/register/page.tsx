import { RegisterForm } from "@/components/shared/RegisterForm";

export default function RegisterPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-royal-black p-4">
            <h1 className="text-3xl md:text-4xl font-playfair font-bold text-prestige-gold mb-8 text-center">
                IgniteQuest — Team Registration
            </h1>
            <RegisterForm />
        </main>
    );
}
