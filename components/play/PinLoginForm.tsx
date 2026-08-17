"use client";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { teamLogin, type AuthResult } from "@/lib/actions/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function PinLoginForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<AuthResult | null, FormData>(
    (_prev, formData) => teamLogin(formData),
    null
  );

  useEffect(() => {
    if (state?.ok) router.refresh();
  }, [state, router]);

  return (
    <form action={formAction} className="stage-panel w-full max-w-sm rounded-sm p-10">
      <label className="block">
        <span className="font-[family-name:var(--font-ui)] text-xs uppercase tracking-[0.3em] text-champagne-dim">
          Team name
        </span>
        <Input name="teamName" required className="mt-2" />
      </label>
      <label className="mt-5 block">
        <span className="font-[family-name:var(--font-ui)] text-xs uppercase tracking-[0.3em] text-champagne-dim">
          PIN
        </span>
        <Input name="pin" required inputMode="numeric" maxLength={4} className="mt-2" />
      </label>

      {state?.ok === false ? <p className="mt-4 text-sm text-crimson-glow">{state.error}</p> : null}

      <Button type="submit" pending={pending} className="mt-8 w-full" size="lg">
        Enter Final Sprint
      </Button>
    </form>
  );
}
