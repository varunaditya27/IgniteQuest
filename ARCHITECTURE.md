# Architecture

Implementation reference. Product rules live in `gpt-chat-reference.md`; this document
covers how the code is actually organized and why.

## Data model

Six Prisma models (`prisma/schema.prisma`), matching `gpt-chat-reference.md` section 18
exactly — no extra entities:

```
Event
 ├── Team           (score, PIN, eliminated flag)
 ├── Question       (belongs to a phase + order, correctOption never sent to clients
 │                    until explicitly revealed)
 └── GameState       (singleton per event — "what's happening right now")

Team ── TeamAnswer ── Question   (one answer per team per question, enforced by
                                   @@unique([teamId, questionId]))
Team ── LifelineUsage ── Question (one usage per team per lifeline type, enforced by
                                    @@unique([teamId, type]))
```

Three fields aren't explicitly named in the reference doc, added to close real
correctness gaps rather than for speculative future needs:

- `GameState.hiddenOptions` — which two options the 50:50 lifeline hid for the
  *current* question, reset whenever `currentQuestionId` changes. Transient
  per-question presentation state, not a new entity.
- `GameState.turnNumber` — the round-robin position, decoupled from
  `currentQuestion.order`. Without this, a Switch Question lifeline (which swaps in a
  question with an unrelated `order`) would corrupt "next question in sequence" logic
  and could desync whose turn it is. See `lib/game/round-robin.ts`.
- `Question.presentedAt` — set the instant a question becomes
  `GameState.currentQuestion`, in either phase. A question is "used up" by being
  *shown*, not by being scored — a Phase 1 question the host advances past without
  recording an answer, or the original question discarded by a Switch, must never be
  eligible to resurface. `lib/game/queries.ts#getUnusedPhase1Questions` filters on this
  single field rather than reconstructing "used" from TeamAnswer + LifelineUsage rows.
  Phase 2 uses the same field to block the host from re-starting an already-shown
  question (`host-phase2.ts`), since Fastest Fingers requires everyone starting
  together.

## Realtime: broadcast, not table subscriptions

Deployment target is Vercel (serverless) + Supabase Postgres. Two options existed for
live sync: Supabase Realtime `postgres_changes` (subscribe directly to table diffs) or
Realtime `broadcast` (server explicitly publishes a payload). We use **broadcast only**:

- `lib/supabase/server.ts` — service-role client, server-only.
- `lib/realtime/broadcast.ts` — `broadcast(eventId, event)` publishes a sanitized
  `GameEvent` (see `lib/realtime/events.ts`) to channel `event:{eventId}`.
- `lib/supabase/client.ts` + `hooks/useGameChannel.ts` — anon-key browser client that
  only ever subscribes to that broadcast channel.

**Why not `postgres_changes`:** it would require RLS policies granting the anon key
SELECT on `Question`, which would leak `correctOption` to any browser inspecting the
websocket frames — including finalists mid-Phase-2. Broadcast payloads are built
server-side from `toPublicQuestion()` / `toGameStateEvent()` (`lib/game/sanitize.ts`),
which never include `correctOption`. The one place the correct answer *is* broadcast
is `ANSWER_REVEALED`, fired only when the host clicks Correct/Wrong on the current
Phase 1 question — by then the answer is meant to be public.

Server Components fetch full initial state directly via Prisma (`lib/game/queries.ts`);
client components layer live updates on top via `useGameChannel`. The host console
takes a different approach from projector/play: on any broadcast, it calls
`router.refresh()` to re-run the Server Component and get the full row (including
`correctOption`, needed for the host's own reference), rather than trying to merge a
sanitized payload into host-only state.

## Auth

No user accounts. Two independent, minimal session mechanisms in `lib/auth/`:

- **Host**: single shared password (`HOST_PASSWORD` env) checked with a constant-time
  compare, session is an HMAC-signed cookie (`lib/auth/session.ts`) — no external
  session store needed for a single-event tool.
- **Team**: PIN generated at registration (`lib/actions/registration.ts`), same
  HMAC-signed cookie mechanism, scoped to one `teamId`.

Route protection: `app/host/(console)/layout.tsx` guards everything under `/host`
except `/host/login`, which is a sibling route outside that layout (via the `(console)`
route group) so it isn't itself guarded.

## Server actions layout

Grouped by domain, not by CRUD verb (`lib/actions/`):

- `registration.ts` — team self-registration, PIN generation.
- `auth.ts` — host login/logout, team PIN login/logout.
- `host-phase1.ts` — start Phase 1, reveal/lock/score/advance, round-robin team
  selection, lock scores → compute finalists.
- `host-lifelines.ts` — the four lifelines, each enforcing one-use-per-team via the DB
  unique constraint (catches `P2002`, doesn't pre-check-then-write).
- `host-phase2.ts` — start/lock a Phase 2 question, host-only standings, reveal finale.
- `gameplay.ts` — team-side Phase 2 answer submission (server computes response time
  from `GameState.questionStartedAt`, never trusts a client-reported duration).
- `guard.ts` — `requireHost()` / `requireTeam()`, called at the top of every mutating
  action.

Round-robin team assignment (`lib/game/round-robin.ts`) and both phases' ranking
(`lib/game/scoring.ts`) are pure functions, unit-testable independent of Prisma:

- Phase 1 finalist cutoff: score first, cumulative response time across all answered
  questions as tiebreaker (faster team qualifies). Response time is measured from
  `GameState.questionStartedAt` (set when the host clicks Reveal) to the moment the
  host clicks Correct/Wrong — an approximation of "how long the team took," since
  Phase 1 answers are host-mediated/verbal rather than digitally submitted. A later
  score *correction* (host fixes a mis-click) doesn't retroactively change the
  recorded time, only the outcome.
- Phase 2 final ranking: correctness first, then total response time (reference doc
  section 11) — response time here is exact, measured server-side from the team's own
  request landing to `GameState.questionStartedAt`.

Both `recordPhase1Answer` and `submitPhase2Answer` are written to be idempotent /
race-safe under a host or team retrying: Phase 1 scoring computes a *delta* against the
previously-recorded `pointsAwarded` rather than blindly incrementing, and Phase 2
submission re-checks the lock/phase state inside the same transaction as the write
(rather than as a separate earlier query) to shrink the race window around the host's
Lock Answers click to a single held connection instead of two pooled round-trips.

## Why Prisma stays even though Supabase is in play

Supabase here is "a Postgres host + a realtime relay," not "the app's data layer."
Keeping Prisma as the only thing that touches tables avoids a second, parallel query
interface and keeps the one-lifeline-per-team / one-answer-per-question invariants
enforced by real DB constraints (`@@unique`) rather than duplicated application checks.
