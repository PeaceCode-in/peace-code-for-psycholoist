# PeaceCode — Backend Integration Guide

This document is the source of truth for the backend team wiring PeaceCode's
psychologist dashboard to real infrastructure. Today the app is a fully
functional **frontend** with all state persisted in `localStorage` under a
namespaced set of keys. Every store exposes the exact function shape the
backend needs to implement server-side.

Read this end-to-end **before** touching the frontend.

---

## 1. Two dashboards, one backend

The product has two surfaces that share one dataset:

| Surface | Route prefix | Auth | Who uses it |
|---|---|---|---|
| **Student dashboard** | `/portal/*`, `/auth/*` | Student login (email + password) | The student / patient |
| **Psychologist dashboard** | everything else (`/dashboard`, `/patients`, `/sessions`, `/billing`, …) | Psychologist login | The clinician / practice team |

Rule: **a student sees only their own data. A psychologist sees only the
students assigned to them (or their team).** The frontend already
separates the routes; the backend must enforce it in RLS / policies.

### Join key (the important part)

Every student in the psychologist's "patients" list is joined to a real
signed-in student via the field on the `Patient` type:

```ts
linkedStudentEmail?: string;   // lowercased email of the student user
studentId?: string;            // optional external student ID
source: "seed" | "student-signup" | "manual";
```

Rules the backend must implement:

1. When a student **signs up** on `/auth/signup`, the server MUST upsert a
   row into `patients` with `source = "student-signup"` and
   `linked_student_email = <student.email>`.
2. When a student **signs in** on `/auth/login`, if no `patients` row
   exists for that email, upsert one (idempotent — covers pre-existing
   users). This is currently mimicked in `src/lib/auth-store.ts`
   (`syncStudentToPatientRoster`).
3. The psychologist dashboard MUST filter by `source != "seed"` in
   production — seeded rows exist only for demo. Frontend supports
   `listPatients({ source: "real" })` for this.

---

## 2. Data model — tables to create

All tables live in `public`. Every table needs `GRANT` statements
alongside `CREATE TABLE`, plus RLS policies.

### 2.1 Identity

```sql
-- Managed by Supabase Auth. Do not recreate.
-- auth.users(id uuid, email text, ...)

-- User roles table (never store role on users/profiles — see rules).
create type public.app_role as enum ('student', 'therapist', 'admin', 'supervisor');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique(user_id, role)
);
```

### 2.2 Patients (the join)

The frontend `Patient` type is authoritative. See
`src/lib/patients-store.ts` for the full shape. Minimum SQL:

```sql
create table public.patients (
  id uuid primary key default gen_random_uuid(),
  linked_student_email text unique,         -- FK-like join to auth.users.email
  student_user_id uuid references auth.users(id) on delete set null,
  assigned_therapist_id uuid not null references auth.users(id),
  full_name text not null,
  preferred_name text,
  pronouns text,
  age int,
  email text not null,
  phone text,
  college text,
  year_of_study text,
  status text not null default 'waitlist',  -- active|waitlist|paused|discharged
  risk text not null default 'monitor',     -- stable|monitor|elevated|crisis
  primary_concern text,
  tags text[] default '{}',
  intake_date timestamptz,
  last_session_at timestamptz,
  next_session_at timestamptz,
  total_sessions int not null default 0,
  emergency_contact jsonb,
  consent_sharing boolean not null default false,
  source text not null default 'manual',    -- seed|student-signup|manual
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### 2.3 Everything else

Each frontend store maps 1:1 to a table (or small cluster). Read the store
file and mirror its exported types.

| Frontend store | Table(s) to create |
|---|---|
| `src/lib/patients-store.ts` | `patients`, `session_notes`, `timeline_events`, `risk_changes`, `patient_documents` |
| `src/lib/sessions-store.ts` | `sessions`, `session_participants` |
| `src/lib/schedule-store.ts` / `calendar-store.ts` | `calendar_blocks`, `availability_windows` |
| `src/lib/billing-store.ts` | `invoices`, `invoice_lines`, `payments`, `insurance_claims`, `service_rates` |
| `src/lib/messages-store.ts` | `threads`, `messages`, `canned_responses`, `message_audit`, `message_settings` |
| `src/lib/documents-store.ts` | `documents`, `document_templates`, `document_instances`, `signatures` |
| `src/lib/assessments-store.ts` | `instruments`, `assessment_assignments`, `assessment_results` |
| `src/lib/homework-store.ts` | `homework_items`, `homework_library`, `homework_compliance` |
| `src/lib/prescriptions-store.ts` | `medications`, `allergies`, `formulary`, `prescription_letters` |
| `src/lib/notes-store.ts` | `clinical_notes`, `note_templates` |
| `src/lib/groups-store.ts` + `group-attendance-store.ts` | `groups`, `group_members`, `group_attendance` |
| `src/lib/team-store.ts` | `team_members`, `handoffs`, `coverage`, `internal_referrals` |
| `src/lib/waitlist-ops-store.ts` | `waitlist_entries` |
| `src/lib/safety-plans-store.ts` | `safety_plans` |
| `src/lib/alert-prefs-store.ts` + alerts | `alerts`, `alert_preferences` |
| `src/lib/governance-store.ts` | `consent_records`, `audit_log`, `data_export_requests`, `breach_reports`, `dpa_agreements`, `retention_policies` |
| `src/lib/cpd-store.ts` + supervision | `cpd_events`, `cpd_plans`, `cpd_reading`, `supervision_sessions` |
| `src/lib/peers-store.ts` | `peer_connections`, `peer_referrals` |
| `src/lib/profile-store.ts` | `therapist_profiles` |
| `src/lib/reviews-store.ts` | `patient_reviews` |
| `src/lib/research-store.ts` | `research_studies`, `study_enrollments` |
| `src/lib/library-store.ts` | `content_library` |
| `src/lib/conferences-store.ts` | `case_conferences`, `conference_notes` |
| `src/lib/referrals-store.ts` | `external_referrals` |
| `src/lib/integrations-store.ts` | `integrations`, `webhook_endpoints`, `api_tokens`, `automations` |
| `src/lib/notifications-store.ts` | `notifications`, `notification_preferences` |
| `src/lib/practice-settings-store.ts` | `practice_settings`, `payout_methods`, `service_offerings` |
| `src/lib/copilot-store.ts` | `copilot_conversations`, `copilot_messages` |
| `src/lib/portal-store.ts` | Patient-side reads of `assessments`, `homework`, `documents` scoped by `student_user_id` |

**For every one of these tables** you MUST emit:

```sql
grant select, insert, update, delete on public.<table> to authenticated;
grant all on public.<table> to service_role;
-- add: grant select on public.<table> to anon; -- ONLY if a policy allows anon reads
alter table public.<table> enable row level security;
-- then create policies (see next section)
```

---

## 3. RLS policy shape

Two access patterns cover ~95% of tables:

### 3.1 Patient-owned rows (student portal)

```sql
create policy "students see their own"
on public.<table> for select to authenticated
using (student_user_id = auth.uid());

create policy "students update their own"
on public.<table> for update to authenticated
using (student_user_id = auth.uid());
```

### 3.2 Therapist-scoped rows (psychologist dashboard)

```sql
create policy "therapist sees assigned patients"
on public.patients for select to authenticated
using (
  assigned_therapist_id = auth.uid()
  or public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'supervisor')
);
```

Every derived table (sessions, notes, invoices, …) MUST join through
`patients.assigned_therapist_id` OR carry its own `assigned_therapist_id`
column. Never trust a client-sent therapist ID — always `auth.uid()`.

### 3.3 Role helper (required)

Use the exact `has_role` SECURITY DEFINER function from the project
knowledge (`src/lib/user-roles`), stored in a **separate** `user_roles`
table. **Never** store roles on the profile row — privilege-escalation
risk.

---

## 4. Auth flow the backend must expose

The frontend today uses a local mock (`src/lib/auth-store.ts`). Replace
with Supabase Auth. The important sequences:

### Student signup (from `/auth/signup`)
1. `supabase.auth.signUp({ email, password })` — email must be a college
   domain (frontend already validates via `isCollegeEmail`).
2. **Server-side trigger** on `auth.users` INSERT → upsert into
   `public.patients` with:
   ```sql
   linked_student_email = new.email,
   student_user_id = new.id,
   source = 'student-signup',
   status = 'waitlist',
   risk = 'monitor',
   assigned_therapist_id = <round-robin or default therapist>
   ```
3. Also insert into `public.user_roles(user_id, role)` with `role='student'`.

### Student login (from `/auth/login`)
1. `supabase.auth.signInWithPassword(...)`.
2. Backend trigger from step above already guarantees a patient row exists;
   nothing further needed at login.

### Therapist login
1. Separate route (not yet built — coordinate before shipping). Same
   Supabase Auth; role `therapist` in `user_roles`.
2. The `_authenticated` layout gate belongs to the Lovable Cloud
   integration; do not author it.

### The join at read time

The psychologist dashboard's `useLivePatients()` must, in production, run:

```sql
select * from public.patients
where assigned_therapist_id = auth.uid()
  and source <> 'seed'
order by updated_at desc;
```

RLS enforces the therapist scope; the `source <> 'seed'` filter drops
demo data. Frontend already supports this via `listPatients({ source: "real" })`.

---

## 5. Frontend → backend replacement checklist

For each store file the backend replaces:

1. **Keep the exported function signatures.** Components call
   `listPatients()`, `createPatient()`, `useLivePatients()`, etc. Change
   the *bodies* to hit Supabase, keep the *names and shapes*.
2. Replace `localStorage` reads/writes with Supabase queries. The `seed()`
   functions are demo-only and must not run in production.
3. Replace the tiny `emit()/subscribe()` event bus with Supabase Realtime
   channels on the same tables. Existing `useLive*` hooks already assume
   push updates — just wire the subscription.
4. Remove all `pc.*` / `peacecode.*` `localStorage` keys once the store
   is server-backed. See `LOCALSTORAGE_KEYS` table below.
5. Server functions belong under `src/lib/*.functions.ts` (TanStack
   Start pattern). Never colocate `supabaseAdmin` reads with route
   components; see `src/integrations/supabase/client.server.ts` rules.

### LocalStorage keys currently in use

Grep the codebase for `localStorage.setItem` — these are the keys to
migrate:

| Key prefix | Owner | Replace with |
|---|---|---|
| `peacecode.therapist.patients.v1` | patients-store | `patients` + related tables |
| `peacecode.therapist.patients.draft.*` | note draft autosave | server-side draft table OR keep client-only |
| `pc.auth.users.v1` | student auth | Supabase Auth |
| `pc.auth.session.v1` | student session | Supabase session cookie |
| `pc.auth.signup-draft.v1` | signup wizard draft | client-only, keep |
| Every other `pc.*` / `peacecode.*` key | matches its store file | corresponding table |

---

## 6. Routing map

The router is TanStack Start file-based (`src/routes/`). Filename dots
become URL slashes. Full list is auto-generated in
`src/routeTree.gen.ts` — **never edit that file**.

### Public / student

| Route | File | Purpose |
|---|---|---|
| `/` | `index.tsx` | Landing |
| `/auth`, `/auth/login`, `/auth/signup` | `auth.*` | Student auth |
| `/portal`, `/portal/assessments`, `/portal/homework`, `/portal/documents/*` | `portal.*` | Student dashboard (their view) |

### Psychologist (should sit under an `_authenticated` gate once auth is real)

`/dashboard`, `/patients/*`, `/sessions/*`, `/schedule/*`,
`/calendar/*`, `/inbox/*`, `/alerts`, `/notes/*`, `/documents/*`,
`/assessments/*`, `/homework/*`, `/prescriptions/*`, `/messages/*`,
`/billing/*`, `/settings/*`, `/team/*`, `/analytics`, `/reviews`,
`/research`, `/profile-public`, `/library`, `/cpd/*`, `/supervision`,
`/peers`, `/governance/*`, `/integrations/*`, `/case-conferences/*`,
`/groups`, `/waitlist`, `/risk`, `/copilot`.

### Backend/admin API routes to add

Put HTTP endpoints under `src/routes/api/`. Webhooks and cron under
`src/routes/api/public/*` (that prefix bypasses auth on published sites —
verify signatures inside the handler).

Suggested endpoints:
- `POST /api/public/webhooks/stripe` — payment webhooks → `payments` table
- `POST /api/public/webhooks/twilio` — SMS delivery status
- `GET  /api/public/cron/daily-brief` — generates `inbox/daily-brief`
- `POST /api/students/upsert` — internal, called by the auth trigger

---

## 7. Server functions (`createServerFn`) — non-negotiable rules

1. Import `createServerFn` from `@tanstack/react-start` (never
   `@tanstack/start`).
2. Place client-imported server functions in `src/lib/*.functions.ts` —
   **never** under `src/server/`.
3. Read `process.env.*` **inside** `.handler()`, not at module scope
   (Cloudflare Workers inject env per-request).
4. Auth-protected server fns use `.middleware([requireSupabaseAuth])`.
   Never call these from a public route's loader — SSR prerender has no
   session and the build will fail.
5. Prefer the generated `supabase` client and `context.supabase` from
   `requireSupabaseAuth`. Only use `supabaseAdmin` (from
   `client.server.ts`) for verified webhooks and admin maintenance.
   `supabaseAdmin` bypasses RLS — **never** use it for ordinary reads
   and **never** to check whether the caller is an admin.

---

## 8. Security posture (must-haves before launch)

- Every `public.*` table has explicit `GRANT` statements — Supabase does
  not grant defaults. A missing GRANT returns a permission error at
  runtime even when RLS would allow the row.
- Every `public.*` table has RLS **enabled** and at least one policy.
- Roles live in `public.user_roles`, checked via `has_role` (SECURITY
  DEFINER). Never on the profile row.
- The `source = 'seed'` filter is applied on every therapist-facing
  read in production.
- Webhook endpoints under `/api/public/*` verify HMAC signatures with
  `timingSafeEqual` before doing anything.
- PII (age, emergency contacts, session notes) is never returned from
  any `/api/public/*` endpoint.
- Enable HIBP leaked-password protection in Cloud → Auth settings.
- Password reset flow needs a `/reset-password` route (not built yet —
  create with `supabase.auth.updateUser({ password })`).

---

## 9. What the frontend already does for you

- `src/lib/patients-store.ts` exports:
  - `listPatients({ source: "real" })` — filters demo rows out
  - `ensurePatientForStudent({ email, fullName, studentId, college, year, concern })` — idempotent upsert helper. **Backend: mirror this exactly in the auth trigger.**
  - `findPatientByStudentEmail(email)` — the canonical lookup
- `src/lib/auth-store.ts` calls `ensurePatientForStudent` on both signup
  and login — swap the localStorage guts for Supabase Auth and keep this
  call.
- Every `useLive*` hook re-renders when its store emits — Realtime
  subscriptions plug in without touching UI code.

---

## 10. Migration order (recommended)

1. Enable Lovable Cloud / Supabase, create `patients` + `user_roles`
   tables, RLS + GRANTs.
2. Wire Supabase Auth into `/auth/*` — replace `src/lib/auth-store.ts`
   internals.
3. Add the `auth.users` → `patients` trigger.
4. Replace `patients-store` internals with Supabase queries. Keep exported
   function signatures. Ship.
5. Migrate the rest of the stores in this order (highest read pressure
   first): sessions → notes → schedule → messages → billing →
   assessments → homework → everything else.
6. Add Realtime channels on `patients`, `sessions`, `messages`, `alerts`.
7. Set up cron and webhook endpoints under `src/routes/api/public/*`.
8. Delete `seed()` bodies and all `pc.*` / `peacecode.*` localStorage
   keys.

Any questions — grep the store file for the function the UI calls, and
mirror its signature. The frontend never needs to know what backend sits
behind it as long as those signatures hold.
