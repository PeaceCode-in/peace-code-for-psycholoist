# PeaceCode · Practice — Shell, Home, Settings (Pass 1)

Rebuild this remixed project into the therapist-facing app. Keep design tokens (Sakura + Rose, Fraunces + DM Sans, glass, grain) but shift to a dense, clinical Linear × Notion × Airbnb-Host tone. Student surfaces get removed; every new sidebar link routes to a working stub so nav is clean end-to-end.

## Scope for this pass

1. Rebrand shell + auth (add license number to signup).
2. Build `AppShell` for therapists (sidebar + top bar).
3. Home dashboard `/dashboard` (compact briefing header + dense data cards).
4. Full `/settings/*` tree.
5. Stub routes for every sidebar link so nothing 404s.
6. Delete student routes.

## Route map (all new therapist routes live at these paths)

Auth (kept, rebranded):
- `/auth`, `/auth/login`, `/auth/signup` — copy: "Sign in to your practice", signup adds `licenseNumber`, `credentials` (e.g. M.Phil Clinical Psych, RCI reg #), `specializations[]`.

Main app (all under `AppShell`):
- `/dashboard` — Home (built out this pass)
- `/schedule` — stub "Today & upcoming sessions"
- `/patients` — stub list
- `/patients/$id` — stub profile
- `/sessions` — stub session log
- `/notes` — stub clinical notes
- `/messages` — stub inbox
- `/billing` — stub invoices + payouts
- `/resources` — stub library to share with patients
- `/insights` — stub analytics
- `/settings` — layout with `<Outlet />`
  - `/settings` (index) → profile
  - `/settings/profile` — name, photo, headline, bio
  - `/settings/credentials` — license #, RCI/APA reg, degrees, verification status
  - `/settings/practice` — clinic name, address, timezone, languages, modalities
  - `/settings/availability` — weekly hours, buffer, session length
  - `/settings/services` — session types & pricing
  - `/settings/payouts` — bank / UPI, tax info
  - `/settings/appearance` — theme (Sakura default), accent (Rose default), density
  - `/settings/notifications` — email/SMS/push
  - `/settings/privacy` — data retention, patient data export
  - `/settings/security` — password, 2FA, active sessions
  - `/settings/team` — placeholder for future multi-therapist practice
  - `/settings/integrations` — Google Calendar, Zoom, Meet
  - `/settings/danger` — deactivate / delete
  - `/settings/about` — version, legal

## AppShell design

Left sidebar (`w-60`, collapsible to `w-14`):
- Brand: "PeaceCode · Practice" in Fraunces
- Sections: **Today** (Dashboard, Schedule, Messages), **Clinical** (Patients, Sessions, Notes), **Business** (Billing, Insights, Resources), **Account** (Settings)
- Active state uses rose accent underline, not filled pill
- Bottom: therapist avatar + name + license verified badge

Top bar (`h-14`):
- Left: `SidebarTrigger` + breadcrumb
- Center: command search (`⌘K` visual only, non-functional this pass)
- Right: "Available/Away" status toggle · notifications bell · quick-add menu

Uses `SidebarProvider` from shadcn per house rules.

## Home `/dashboard` layout

Compact briefing header (no orb, no giant hero):
- Row: greeting ("Good morning, Dr. Sharma") + today's date + weather-of-practice line ("6 sessions · 2 new intakes · ₹18,400 booked")
- No breathing animation.

Below, a 12-col grid, above-the-fold dense:
1. **Today's schedule** (col-span-8) — timeline strip of next 6 sessions with patient initials, time, modality (video/in-person), status chip, join button.
2. **Alerts** (col-span-4) — flagged risk assessments, missed sessions, pending intake forms. Rose-tinted priority chips.
3. **Patients needing follow-up** (col-span-5) — 5 most-overdue, last-session date, quick "Message" / "Reschedule".
4. **Revenue this month** (col-span-4) — sparkline + booked vs completed vs pending payout.
5. **Recent notes** (col-span-3) — last 4 clinical notes with patient initials + date.
6. **Weekly load** (col-span-6) — small bar chart Mon–Sun, filled vs open slots.
7. **New intake requests** (col-span-6) — 3 pending requests with "Accept / Decline".

All data is **local mock** via new `src/lib/practice-store.ts` (seeded fixtures — same pattern as `buddies-store`). No backend this pass.

## Settings tree

- `/settings` uses `AppShell` with a **secondary left rail** inside the content area listing all sub-pages (like Linear's settings). Each sub-page is a dense form using the same primitives from `src/components/settings/primitives.tsx` (kept & reused).
- Every sub-page renders real controls with local state persisted to `settings-store` (extended with therapist keys: `practice`, `credentials`, `availability`, `services`, `payouts`, `integrations`).
- Appearance defaults stay Sakura + Rose.

## Deletions (whole files under `src/routes/`)

`emergency.*`, `breathe.*`, `gratitude.*`, `journal.*`, `mindgym.*`, `peacebot.*`, `buddies.*`, `community.*`, `resources.*`, `screening.*`, `hub.*`, `focus.*`, `search.*`, `notifications.*`, `profile.*`, `counselling.*`, old `settings.*`, old `index.tsx`. Also delete their `src/lib/*-store.ts` and `src/components/**` counterparts they own. Keep: `settings-store`, `auth-store`, `notifications-store` (repurpose), `profile-store` (repurpose), shared `AppShell` (rewrite for therapist), `settings/primitives`, `GlassFX`, `AuthShell`, error/hydration/monitoring helpers.

New `src/routes/index.tsx` → redirects: if session → `/dashboard`, else → `/auth`.

## Technical notes

- Router: TanStack file-based routes, dot-separated. `settings.tsx` layout with `<Outlet />` + `settings.index.tsx` + `settings.profile.tsx` etc.
- New `src/components/practice/AppShell.tsx` (separate from student `AppShell.tsx` we're deleting — cleaner than in-place edit given scope).
- New `src/components/practice/SettingsRail.tsx` for the settings sub-nav.
- New `src/lib/practice-store.ts` with seeded fixtures: patients, sessions, notes, intakes, revenue.
- Extend `settings-store.ts` with therapist keys; keep `sakura` + `rose` as defaults.
- Update `__root.tsx` head: title "PeaceCode · Practice — Clinical dashboard for psychologists", description shifts to clinician tone.
- No new npm packages needed.
- No backend / Lovable Cloud in this pass — everything is local mock. When you're ready to wire the Spring Boot backend, we swap `practice-store` calls for fetch.

## Out of scope (later prompts)

- Actual patient CRUD, session player, notes editor, billing engine, calendar sync, video calling, role-gated `/auth` redirect between student & therapist subdomains, backend wiring.

## Deliverable

After this pass: you can sign up as a therapist, land on `/dashboard` with a dense briefing, click every sidebar item and see a stub page, and open every settings sub-page with working local persistence. Zero 404s, zero console errors.

---

Confirm and I'll build it. This is a large single-pass rebuild (~40 file writes + ~30 deletions) — if you want it split into two prompts (Pass 1a = delete + shell + stubs, Pass 1b = home + settings), say so and I'll shrink accordingly.
