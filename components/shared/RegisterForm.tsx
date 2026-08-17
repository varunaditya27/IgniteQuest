"use client";
import { useActionState } from "react";
import { registerTeam, type RegisterTeamResult } from "@/lib/actions/registration";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function RegisterForm() {
  const [state, formAction, pending] = useActionState<RegisterTeamResult | null, FormData>(
    (_prev, formData) => registerTeam(formData),
    null
  );

  if (state?.ok) {
    return (
      <div className="stage-panel w-full max-w-md rounded-sm p-10 text-center">
        <p className="font-[family-name:var(--font-ui)] text-xs uppercase tracking-[0.3em] text-emerald-glow">
          Team registered
        </p>
        <h2 className="foil-text mt-3 font-[family-name:var(--font-display)] text-4xl font-bold italic">
          {state.teamName}
        </h2>
        <p className="mt-6 font-[family-name:var(--font-ui)] text-xs uppercase tracking-[0.3em] text-champagne-dim">
          Your finalist PIN
        </p>
        <p className="font-[family-name:var(--font-impact)] mt-2 text-5xl tracking-[0.2em] text-foil-gold">
          {state.pin}
        </p>
        <p className="mt-6 text-sm text-champagne-dim">
          Team leader: remember this PIN. You&apos;ll need it with your team name to log in if you reach the final
          sprint.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="stage-panel w-full max-w-md rounded-sm p-10">
      <label className="block">
        <span className="font-[family-name:var(--font-ui)] text-xs uppercase tracking-[0.3em] text-champagne-dim">
          Team name
        </span>
        <Input name="teamName" required maxLength={40} className="mt-2" placeholder="Team Phoenix" />
      </label>

      <label className="mt-5 block">
        <span className="font-[family-name:var(--font-ui)] text-xs uppercase tracking-[0.3em] text-champagne-dim">
          Team leader name
        </span>
        <Input name="leaderName" required maxLength={40} className="mt-2" placeholder="Full name" />
      </label>

      {state?.ok === false ? <p className="mt-4 text-sm text-crimson-glow">{state.error}</p> : null}

      <Button type="submit" pending={pending} className="mt-8 w-full" size="lg">
        Register
      </Button>
    </form>
  );
}
