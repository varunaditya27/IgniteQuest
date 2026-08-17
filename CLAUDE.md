# CLAUDE.md

Rules for anyone (human or AI) working on IgniteQuest. These are not suggestions.

## Product context

Read `gpt-chat-reference.md` first. It is the source of truth for product vision,
game rules, data model, and phase flow. If code and that document disagree, the
document wins unless the user has explicitly changed direction in conversation.

## Hard rules

1. **No AI slop.** No filler comments, no restating what the code already says, no
   "Note: this handles X" docstrings, no defensive try/catch around things that
   cannot fail, no speculative abstractions for hypothetical future needs. If a
   comment doesn't explain a non-obvious *why*, delete it.
2. **No unnecessary bloat.** Don't add a library, a config layer, or an abstraction
   unless the task in front of you needs it right now. Three similar lines beat a
   premature helper. Don't build admin UI, feature flags, or generic systems for
   things that today are one hardcoded config value.
3. **File size limits (soft cap, hard signal to split):**
   - Server actions / lib modules: **250 LOC**.
   - React components: **200 LOC**.
   - Page files: **150 LOC** of actual page logic — extract to components beyond that.
   - If a file needs to exceed these, split by responsibility (e.g. `host/lifelines.ts`
     vs `host/phase-control.ts`), don't just keep growing one file.
4. **Modular by domain, not by type.** Group server actions and game logic under
   `lib/game/`, `lib/actions/`, `lib/realtime/`, `lib/auth/` by what they do, not
   dumped into one `actions.ts`. Each module owns one concern.
5. **No Claude/AI co-authorship anywhere.** Never add `Co-Authored-By: Claude` (or
   any AI) to commits. Never mention AI authorship in code comments, commit
   messages, or docs.
6. **Game rules are enforced server-side, always.** Lifeline-once-per-team,
   answer-once-per-question, phase gating (e.g. no leaderboard exposure during
   Phase 2) must be enforced by the database schema and server actions — never
   trust client state or disabled buttons alone.
7. **Two audiences, two interfaces.** Host console (`/host/**`) and projector
   (`/projector/**`) are always separate routes/components. Never expose host
   controls, correct answers, or admin state on a projector or team-facing route.
8. **Config lives in env vars**, not a database settings table or admin UI, until
   there is a real reason to change that (see `gpt-chat-reference.md` — this was
   an explicit scope decision, not an oversight).
9. **Realtime payloads are curated.** Server broadcasts only sanitized event
   payloads (no `correctOption`, no other team's PIN, etc.) over Supabase Realtime
   broadcast channels. Never expose raw table rows to anon/browser clients.
10. **TypeScript strict, no `any`.** Type Prisma results properly; if a shape is
    reused across files, name it and export it from the module that owns the data.

## Before committing

- Run `npm run lint` and `npm run build` (or at minimum `tsc --noEmit`).
- Do not commit `.env` or real secrets. `.env.example` documents required vars.
- Do not add `Co-Authored-By` trailers of any kind to commit messages.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
