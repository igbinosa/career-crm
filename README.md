# career-crm

A single-user CRM for running a job search: companies to target, people in the network, applications in flight, and every outreach email that was drafted or sent.

Live at [career-crm-taupe.vercel.app](https://career-crm-taupe.vercel.app) (passcode-gated).

## Why this exists

The search used to run out of markdown files in a notes vault: one file per contact, one per project, a running log of drafted emails. That worked for reading and stopped working for everything else. Questions like "who have I not spoken to in 90 days," "which applications are stuck waiting on me," and "how many drafts never actually got sent" all required reading every file by hand, and the answer went stale the moment it was written.

The other forcing function was automation. A separate agent applies to job postings on a schedule, and it needed somewhere to pick up work and record what it did. A folder of prose is not a work queue. Postgres is.

So the markdown stayed as the narrative layer, and this became the state layer: queryable, writable by both a human and an agent, with the stage of every application as a real enum rather than a sentence someone wrote.

## What it does

| Tab | Purpose |
|---|---|
| **Apply** | Paste a posting URL and queue it. Rows land at `stage='queued'` for the agent to pick up. |
| **Applications** | Every application and its current stage, from `queued` through `applied`, `interviewing`, `closed`. |
| **Companies** | Target list, split tier 1 / tier 2, with why each one is on the list. |
| **Network** | Contacts, their company, status, and last touch date. Detail view shows every interaction with that person. |

Behind the tabs, a `reactivation_queue` view selects anyone active or dormant who has gone 90+ days without contact, ordered oldest first. That is the query the markdown could never answer. Today the contact detail route reads `days_quiet` off it per person; exposing the full list as its own view is the obvious next step.

## Architecture

```
Next.js 16 (App Router)  ->  route handlers  ->  Supabase (Postgres)
        |                                              ^
    proxy.ts auth gate                                 |
                                          queue-cli.ts (agent reads/writes)
                                                       ^
                                          apply_queue_drain.sh (launchd, 9am + 6pm)
```

Four tables and one view, defined in [`supabase/schema.sql`](supabase/schema.sql):

- **companies** - the target list. Unique by name, so migrations and the agent can both upsert safely.
- **contacts** - people, with a self-referential `referred_by` so introductions form a graph.
- **applications** - the work queue. `stage` is a checked enum covering the full agent lifecycle including `escalated` (the agent hit something only a human can answer) and `assessment_pending` (a timed test the agent will never take).
- **interactions** - every outreach email. `status` distinguishes `sent_clean` from `sent_edited`, which is the whole point: the gap between what was drafted and what was actually sent is the signal worth learning from.

### Auth

Single user, so there is no user table. A shared passcode is checked against `APP_PIN`, and on success the server issues an HMAC-SHA256 signed token holding an expiry timestamp, set as an httpOnly cookie for 30 days. [`src/proxy.ts`](src/proxy.ts) verifies that signature on every request and redirects to `/login` otherwise. The matcher is deny-by-default: everything is gated except `/login`, `/api/login`, and static assets.

The Supabase service-role key never reaches the browser. All database access goes through route handlers, and [`src/lib/db.ts`](src/lib/db.ts) wraps the client in a Proxy so it is constructed lazily on first use rather than at import time, which keeps the migration scripts and tests from needing credentials just to load a module.

### Agent integration

[`scripts/queue-cli.ts`](scripts/queue-cli.ts) is the agent's entire interface to this app: `list-queued`, `list-escalated`, and `mark <id> <stage>`. Marking a row `applied` also stamps `applied_at` and flips `source` to `agent`, so it stays clear which applications a human submitted and which one an agent did. Notes append rather than overwrite.

[`scripts/apply_queue_drain.sh`](scripts/apply_queue_drain.sh) is the launchd entry point that runs the drain twice a day. It resolves its own repo path from `BASH_SOURCE`, so it carries no machine-specific paths.

### Migration

The one-time import from the markdown vault lives in `scripts/migrate-*.ts`, each backed by a pure parser in `scripts/lib/` with tests. Every migration supports `--dry-run` and takes its source path from an environment variable (`NOTES_DIR`, `COMPANIES_FILE`, `APPLICATIONS_FILE`, `DRAFT_LOG_FILE`), defaulting to `~/claude-workspace/notes/`.

## Tests

```bash
npm test
```

Vitest, covering the four markdown parsers and the date utilities: 14 tests over 5 files. The parsers are where the risk actually was, since they were reading years of hand-written notes with inconsistent formatting, so they are the part that is pure and unit-testable by design. The route handlers are thin passthroughs to Supabase and are not covered.

Test fixtures use entirely synthetic names, companies, emails, and figures. Any resemblance to a real contact would be a bug.

## Running locally

```bash
npm install
npm run dev
```

Create `.env.local` with the following:

| Variable | What it is |
|---|---|
| `SUPABASE_URL` | Project URL from the Supabase dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side key. Never expose this to the browser. |
| `APP_PIN` | The passcode for the login page |
| `APP_SESSION_SECRET` | Random string used to sign session cookies |

Apply [`supabase/schema.sql`](supabase/schema.sql) to a fresh Supabase project to create the tables.

## Known limits

- Row Level Security is not enabled. The app is single-user and every query runs server-side under the service-role key, so RLS adds nothing today, but it would be required before any second user existed.
- The passcode comparison is a plain string equality check, not constant-time.
- There is no dashboard view. `/` redirects to `/apply`.

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind 4, Supabase (Postgres), Vitest. Deployed on Vercel.
