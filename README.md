# IgniteQuest — Python Arena

A host-controlled, KBC-inspired live quiz platform for the RVCE Coding Club × RVITM Python bootcamp.

Full product vision, game rules, and data model rationale live in
[`gpt-chat-reference.md`](./gpt-chat-reference.md) — read that first. Contributor rules
(file size limits, no AI slop, modularity) live in [`CLAUDE.md`](./CLAUDE.md).

## What this is

A two-phase game show:

- **Phase 1 — Main Arena**: all registered teams compete round-robin, host-controlled,
  with four lifelines (50:50, Ask the Audience, Ask the Expert, Switch Question) and a
  live public leaderboard on the projector.
- **Phase 2 — Fastest Fingers**: the top finalists answer the same questions
  simultaneously from their phones. No live leaderboard — results stay hidden until the
  host reveals the finale.

Three separate surfaces:

- `/host` — host console (password-protected). Controls everything.
- `/projector` — public display screen. No admin controls, no correct answers exposed
  before reveal.
- `/register` and `/play` — team leader's phone. Registration before Phase 1, PIN login
  and answering during Phase 2.
- `/finale` — championship reveal, gated until the host explicitly reveals it.

## Tech stack

- Next.js (App Router) + React + TypeScript
- Prisma ORM against Postgres (Supabase-hosted in production, local Docker Postgres for dev)
- Supabase Realtime (broadcast channels only — see "Realtime" below) for pushing live
  updates to host/projector/team screens
- Framer Motion for presentation animations
- Tailwind CSS v4

## Local setup

1. Copy `.env.example` to `.env` and fill in real values (see below for where to get them).
2. Install dependencies: `npm install`
3. Generate the Prisma client: `npm run db:generate`
4. Apply migrations: `npm run db:migrate`
5. Seed the event, teams-less start state, and the question bank:
   `npm run db:seed`
6. Run the dev server: `npm run dev`

### Getting Supabase credentials

This project uses Supabase purely as (a) a hosted Postgres database via Prisma, and
(b) a Realtime broadcast relay — it does **not** use Supabase Auth, Storage, or direct
table access from the browser.

1. Create a project at supabase.com.
2. `DATABASE_URL` / `DIRECT_URL`: from Project Settings → Database → Connection string
   (pooled for `DATABASE_URL`, direct for `DIRECT_URL`, used by migrations).
3. `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Project Settings → API.
   The anon key is safe to expose — it's only ever used client-side to subscribe to a
   broadcast channel, never to query tables.
4. `SUPABASE_SERVICE_ROLE_KEY`: Project Settings → API. **Server-only, never expose to
   the client.** Used exclusively to publish sanitized game events (see
   `lib/realtime/broadcast.ts`).

Row Level Security is **enabled with zero policies** on all six tables (already applied
to the live project via a migration). This isn't for row-level access control — the app
never queries tables through Supabase's client library at all, so no policies are
needed — it's to deny Supabase's auto-generated REST/GraphQL API entirely. Without RLS,
anyone holding the anon key (which is intentionally public, since it's shipped to every
browser for Realtime) could hit `https://<project>.supabase.co/rest/v1/Question`
directly and read `correctOption`, or read team PINs from `Team`, bypassing the app
entirely. Enabling RLS with no policies makes PostgREST/GraphQL return zero rows to
`anon`/`authenticated` by default. Prisma is unaffected — it connects directly via
`DATABASE_URL` as the Postgres owner role, not through PostgREST, so RLS doesn't apply
to it.

### Local Postgres instead of Supabase (dev only)

`docker-compose.yml` spins up a local Postgres for development. You'll still need a
real Supabase project for Realtime broadcast, since that's a hosted service.

```sh
docker compose up -d
```

## Running the event

1. Host opens `/host/login`, enters `HOST_PASSWORD`.
2. Teams register at `/register` on the shared WiFi (Vercel deployment reachable from
   phones). Each team gets a 6-character PIN — the leader keeps it for Phase 2.
3. Phones go away. Projector goes up on `/projector`.
4. Host clicks **Start Phase 1** and runs the round-robin arena from `/host`.
5. Host clicks **End Phase 1 → Select Finalists** once scoring is done — this locks
   scores and marks non-finalist teams eliminated.
6. Finalists' phones come back out; leaders log in at `/play` with their PIN.
7. Host starts each Phase 2 question from `/host` — all finalists answer
   simultaneously, no leaderboard shown anywhere.
8. Host clicks **Reveal Finale** — `/projector` and `/finale` show the champions.

## Config

All game tuning is env-based (see `.env.example`): finalist count, per-phase time
limits, and point values. This is a deliberate scope decision — see
`gpt-chat-reference.md` and `CLAUDE.md` — not an oversight; there is no settings UI.

## Question bank

`data/questions/phase1.json` and `data/questions/phase2.json` are the source of truth,
loaded by `prisma/seed.ts`. Edit these files and re-run `npm run db:seed` to change
questions — no code changes needed. Each question needs `order` (unique within its
phase), `type`, `text`, optional `codeSnippet`, four `options`, `correctOption` index,
and `points`.

## Project status

Functionality-first build. UI is intentionally plain right now — the KBC/Family Feud
visual treatment (the black/gold/cinematic direction already partially present in
`app/globals.css`) is a deliberately separate follow-up pass once the game logic is
verified end-to-end live.
