# Websity — Project & Dashboard Status

Last verified against the actual code and live database on **2026-09-07**. If this file and the code ever disagree, trust the code — but this was cross-checked file-by-file plus a live query against the real Supabase database on the date above.

## What this project is

A Next.js 15 (App Router, Turbopack) + TypeScript + Tailwind v4 marketing site for a web-dev studio ("Websity"), plus a password-protected internal dashboard living inside the same app at `/dashboard`.

## Public site (unchanged structure)

`app/page.tsx` composes: Navbar → Hero → Counter → Projects → ServicesSection → Approach → TapeSection → Faqs → ContactUs.

- Brand colors: aqua accent `#0fd8d7`, teal `#0f9fa5`, gold `#f3b653` (star ratings), dark `neutral-950` background.
- **Hero** — 3D ball-pit background (`app/components/Ballpit.tsx`, custom Three.js), reverted to its original fixed `h-[80vh]` layout per your request (an earlier responsive rewrite was undone).
- **Projects** — homepage is an auto-scrolling carousel (`app/sections/Projects.tsx`) reading from `app/lib/projects.ts` (**still a static hardcoded array**, not yet Supabase-backed — that's the "Content Editing" phase, not started). Clicking a card goes to `/projects/[slug]` (`app/projects/[slug]/page.tsx` + `ProjectDetailView.tsx`), an "editorial case study" layout: sidebar (client/role/year/live-link/stack), contained figure, pull-quote testimonial, prev/next nav.
- All testimonial text and `role`/`year` fields in `app/lib/projects.ts` are **placeholder content** — not real client quotes.

## Dashboard — how auth works (important, changed twice)

**Final design: password-only, no Supabase Auth, no Supabase user account at all.**

- `app/lib/dashboardAuth.ts` — compares a submitted password against `process.env.DASHBOARD_PASSWORD`. On match, sets a cookie (`dashboard_session`) whose value is an HMAC-SHA256 signature (using `DASHBOARD_SESSION_SECRET`) of a fixed string — this stops anyone from forging the cookie by hand.
- `middleware.ts` — on every `/dashboard/*` request except `/dashboard/login`, verifies that cookie; redirects to `/dashboard/login` if missing/invalid.
- `app/dashboard/login/actions.ts` (`signIn`) — checks the password, sets the cookie, redirects to `/dashboard`.
- `app/dashboard/actions.ts` (`signOut`) — deletes the cookie.
- **We tried Supabase Auth first** (email+password via `@supabase/ssr`), then a "hidden fixed email" compromise, then dropped it entirely per your explicit request: *"I don't want Supabase Authentication, I just want a password saved in the code, not in the database."* No trace of the old approach remains (verified by re-reading every auth file).

### Why the dashboard also needs Supabase's **service role key**

Because there's no Supabase Auth session, `auth.uid()` is always `null`. The RLS policies on `clients`/`transactions` require `auth.uid() is not null`, so the normal anon-key client can **never** read/write them. Fix: `app/lib/supabase/admin.ts` creates a client with the **service role key** (bypasses RLS entirely), used only in Server Actions/Components under `/dashboard/**` — which are already gated by the password-cookie check above. This key is never sent to the browser.

Three Supabase client files exist, each with a distinct purpose:
| File | Key used | Purpose |
|---|---|---|
| `app/lib/supabase/admin.ts` | service role (`SUPABASE_SERVICE_ROLE_KEY`) | Dashboard reads/writes (clients, future transactions/content) |
| `app/lib/supabase/server.ts` | anon (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) | Public site reads — **not used anywhere yet**, reserved for when Projects/Services/FAQs/Approach move to Supabase |
| `app/lib/supabase/client.ts` | anon | Browser-side Supabase — **not used anywhere yet**, reserved for future image uploads from the dashboard |

## Required environment variables (`.env.local`, gitignored; template at `.env.example`)

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — public, safe for the browser.
- `SUPABASE_SERVICE_ROLE_KEY` — **secret, server-only**, bypasses RLS. Never prefix with `NEXT_PUBLIC_`.
- `DASHBOARD_PASSWORD` — the actual login password, plain text, chosen by you.
- `DASHBOARD_SESSION_SECRET` — random hex string signing the session cookie (already generated).

A known gotcha already hit and fixed: `@supabase/supabase-js` initializes a Realtime/WebSocket client even when unused, which crashes on Node 20 (no native `WebSocket` global). Fixed by installing the `ws` package and passing `realtime: { transport: WebSocket }` in `admin.ts` and `server.ts`. If a *new* Supabase client file is ever added, it needs this same fix.

## Database (Supabase Postgres)

Canonical schema: `supabase/schema.sql`. Incremental changes already applied to the live database live in `supabase/migrations/` (run in order):
- `001_add_client_status.sql` — adds `clients.status`.
- `002_client_project_details.sql` — adds `clients.start_date`, `end_date`, `website_type`, `cost`, `paid_amount`.

`schema.sql` itself has already been updated to include all of the above, so a **fresh** project only needs `schema.sql` + `seed.sql` — the migration files are only needed to catch up a database that was set up before that column existed.

Six tables, RLS enabled on all:
- **`clients`** — no public read policy (admin-only via service role). Columns: `name, email, phone, company, notes, status (lead/active/completed/archived), start_date, end_date, website_type (portfolio/ecommerce/dashboard/landing_page/maintenance/other), cost, paid_amount`.
- **`transactions`** — no public read policy. Schema exists (`type, amount, category, description, occurred_on, client_id`) but **no UI has been built yet** — this is the "Income & Expenses" phase, not started.
- **`projects`, `services`, `faqs`, `approach_steps`** — public read policy (so the live site can fetch them once converted), admin-only writes. **Not yet connected to any code** — the public site still reads the old hardcoded arrays in `app/sections/*.tsx` and `app/lib/projects.ts`. A `project-images` Storage bucket also exists, reserved for future project-image uploads.

Live-verified as of this writing: `services` (4 rows), `faqs` (5), `approach_steps` (4), `projects` (4) all seeded; `clients` has real data (currently 1 real client, "Hany").

## Dashboard features — what's actually built

- **Login** (`/dashboard/login`) — password only.
- **Shell** (`app/dashboard/(shell)/layout.tsx` + `DashboardSidebar.tsx`) — MUI dark theme (aqua primary, scoped only to `/dashboard/**` via `app/dashboard/ThemeRegistry.tsx`; the public site stays pure Tailwind, untouched). Sidebar: Overview, Clients, Finance ("Soon"), Content ("Soon"), Log out.
- **Overview** (`/dashboard`) — still a placeholder page, no real data yet.
- **Clients** (`/dashboard/clients` + `/dashboard/clients/[id]`) — fully built:
  - Card grid with search bar (name/company/email/phone), status badge, green pulsing dot for "active" clients (`PulseDot.tsx`).
  - "Add client" quick dialog; full edit on the detail page (name, company, email, phone, status, start date, end date — only shown once status is "Completed", website type, cost, paid amount, notes).
  - Detail page shows: contact info, a **Payment** section (Cost / Paid / Remaining, remaining auto-calculated), and a still-reserved dashed "Transaction history" section for when per-client itemized payments (linked to the Finance feature) get built.
  - Delete (with confirm) lives only on the detail page, not on cards.

## Not built yet (see the "Dashboard Roadmap" artifact shared with you for the full pitch on each)

1. **Finance / Income & Expenses** — general studio ledger, separate from per-client payment tracking. Open question before starting: should client payments also count toward these totals, or stay separate?
2. **Content editing** — four independent pieces, can do any subset: Projects (incl. image upload), Services, FAQs, Approach steps. Each requires converting the matching public section from a hardcoded array to a Supabase fetch (server component + client view split, same pattern as the project detail page).
3. Smaller/optional: move the contact form off the third-party SheetBest service into Supabase with a dashboard inbox; build the real Overview page once Finance exists; auto-compute the homepage's "25+ Happy Clients" style stats from real data.

## Verification commands (run these after any change)

```bash
npx tsc --noEmit     # must be silent
npx next lint        # must say "No ESLint warnings or errors"
```

## Environment gotcha specific to this machine

Running more than one `npm run dev` at once against the same `.next` folder causes Windows file-lock crashes (`EPERM ... .next\trace`) that can 500 the *entire* site, not just a test route. Only ever run one dev server for this project at a time.
