"use client";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { hostLogin, type AuthResult } from "@/lib/actions/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function HostLoginForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<AuthResult | null, FormData>(
    (_prev, formData) => hostLogin(formData),
    null
  );

  useEffect(() => {
    if (state?.ok) router.push("/host");
  }, [state, router]);

  return (
    <form action={formAction} className="stage-panel w-full max-w-sm rounded-sm p-10">
      <label className="block">
        <span className="font-[family-name:var(--font-ui)] text-xs uppercase tracking-[0.3em] text-champagne-dim">
          Host password
        </span>
        <Input name="password" type="password" required autoFocus className="mt-2" />
      </label>

      {state?.ok === false ? <p className="mt-4 text-sm text-crimson-glow">{state.error}</p> : null}

      <Button type="submit" pending={pending} className="mt-8 w-full" size="lg">
        Enter console
      </Button>
    </form>
  );
}
