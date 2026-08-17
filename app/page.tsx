import Link from "next/link";
import { StageBackdrop } from "@/components/brand/StageBackdrop";

export default function LandingPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      <StageBackdrop />
      <div className="spotlight absolute inset-0 z-0" />

      <div className="relative z-10 flex flex-col items-center text-center">
        <span className="font-[family-name:var(--font-ui)] text-xs tracking-[0.4em] text-champagne-dim">
          RVCE CODING CLUB × RVITM
        </span>
        <h1 className="foil-text mt-4 font-[family-name:var(--font-display)] text-6xl font-black italic tracking-tight sm:text-8xl">
          IgniteQuest
        </h1>
        <p className="mt-3 font-[family-name:var(--font-impact)] text-2xl tracking-[0.3em] text-foil-gold/80 sm:text-3xl">
          PYTHON ARENA
        </p>

        <div className="mt-14 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/register"
            className="rounded-sm bg-gradient-to-b from-foil-gold-bright to-foil-gold-deep px-10 py-4 font-[family-name:var(--font-ui)] font-bold uppercase tracking-wide text-stage-black shadow-[0_8px_20px_-6px_rgba(232,184,75,0.6)] transition hover:brightness-110"
          >
            Register your team
          </Link>
          <Link
            href="/play"
            className="rounded-sm border border-foil-gold/40 px-10 py-4 font-[family-name:var(--font-ui)] font-semibold uppercase tracking-wide text-foil-gold transition hover:border-foil-gold hover:bg-stage-raised"
          >
            Finalist login
          </Link>
        </div>

        <Link
          href="/host/login"
          className="mt-16 font-[family-name:var(--font-ui)] text-xs tracking-[0.3em] text-champagne-dim/60 transition hover:text-champagne-dim"
        >
          HOST CONSOLE
        </Link>
      </div>
    </main>
  );
}
