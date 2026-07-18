# PeaceCode Psychologist — Spring Boot Backend Specification

**Status:** Spec only. Backend not yet implemented. Frontend currently uses Supabase auth + `localStorage` mock stores for all clinical data. When your Spring Boot API is live, we swap the data layer over — no dashboard UI needs to change.

**Audience:** The Java/Spring Boot backend engineer building the production API.

---

## 1. High-level architecture

```
┌───────────────────────────────────────────────┐
│  Frontend (this repo)                         │
│  - TanStack Start (React 19 + Vite)           │
│  - Deployed to Netlify: psychologist.         │
│    peacecode.in                               │
└──────────────────┬────────────────────────────┘
                   │  HTTPS + JWT (Bearer)
                   ▼
┌───────────────────────────────────────────────┐
│  Spring Boot 3.x REST API   (YOU BUILD THIS)  │
│  - Java 21, Spring Web, Spring Security,      │
│    Spring Data JPA, Flyway, Validation        │
│  - JWT auth (access + refresh)                │
│  - PostgreSQL 15+                             │
│  - S3-compatible object storage for files     │
└───────────────────────────────────────────────┘
```

- Base URL (prod, suggested): `https://api.psychologist.peacecode.in/api/v1`
- Base URL (dev): `http://localhost:8080/api/v1`
- The frontend expects **one** base URL configured via `VITE_API_BASE_URL`.

## 2. Two audiences, one API

There are **two distinct user types**. Do not merge them into a single `users` table.

| Type | Role | Registers via | Verifies | Uses |
|------|------|---------------|----------|------|
| **Psychologist** (clinician) | `ROLE_PSYCHOLOGIST` | `/auth/psychologist/register` | License number, manual/automated review | Practice dashboard (this repo) |
| **Patient / Client** | `ROLE_PATIENT` | `/auth/patient/register` OR invite link from psychologist | Email verification | Client portal (`/portal/*` routes in this repo) |

**Linking rule (critical):**
A patient becomes visible in a psychologist's dashboard **only when linked** through one of:
1. The psychologist invites them by email → patient signs up via invite token → link created.
2. The psychologist adds them manually (creates a "shell" patient row) → later claim/upgrade if they sign in.
3. Patient searches for the psychologist and requests → psychologist approves.

Never expose a patient's data to a psychologist they aren't linked to.

## 3. Tech stack (recommended)

- **Java 21** + **Spring Boot 3.3+**
- **Spring Security 6** with JWT (access token 15 min, refresh token 30 days, rotate on use)
- **Spring Data JPA** + **Hibernate**
- **PostgreSQL 15+**
- **Flyway** for migrations (never manual DDL in prod)
- **MapStruct** for entity ↔ DTO
- **springdoc-openapi** → auto-generated Swagger UI at `/swagger-ui.html`
- **Testcontainers** for integration tests
- **S3 / MinIO** for files (documents, avatars, session recordings)
- **Redis** (optional) for rate limiting + refresh-token blocklist
- **Resend / SES / SMTP** for transactional email
- **Twilio** (optional) for SMS reminders

## 4. Auth contract (must match frontend expectations)

### 4.1 Endpoints

```
POST /auth/psychologist/register
POST /auth/patient/register
POST /auth/login                     # both roles, response includes role
POST /auth/refresh                   # rotating refresh tokens
POST /auth/logout                    # revokes refresh token
POST /auth/forgot-password
POST /auth/reset-password
GET  /auth/me                        # returns current user + role + profile summary
POST /auth/verify-email
```

### 4.2 Login response shape (frontend consumes exactly this)

```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "expiresIn": 900,
  "user": {
    "id": "uuid",
    "email": "dr.priya@clinic.in",
    "fullName": "Dr. Priya Sharma",
    "role": "PSYCHOLOGIST",
    "avatarUrl": null,
    "onboardingComplete": true
  }
}
```

### 4.3 Auth header

All authenticated calls send `Authorization: Bearer <accessToken>`. On `401` with `code: "TOKEN_EXPIRED"`, the frontend will call `/auth/refresh` once and retry.

### 4.4 Error envelope (use consistently)

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "License number already in use.",
    "field": "licenseNumber",
    "traceId": "abc123"
  }
}
```

HTTP status codes: 400 validation, 401 unauth, 403 forbidden, 404 not found, 409 conflict, 422 business-rule, 429 rate limit, 5xx server.

## 5. Domain modules → REST resources

Each frontend "store" file maps 1:1 to a backend module. Build them incrementally in this priority order.

### Priority tier 1 (MVP — dashboard is unusable without these)

| Frontend store | Resource | Key endpoints |
|---|---|---|
| `auth-store.ts` | `/auth/*` | See §4 |
| `profile-store.ts` | `/psychologists/me`, `/psychologists/{id}/public` | GET/PATCH own profile; GET public marketing profile |
| `patients-store.ts` | `/patients` | CRUD + `POST /patients/invite` + `POST /patients/{id}/link` |
| `schedule-store.ts` + `calendar-store.ts` | `/appointments` | CRUD, `GET ?from=&to=`, recurrence, status transitions |
| `sessions-store.ts` | `/sessions` | Create from appointment, attach notes, mark completed/no-show |
| `notes-store.ts` | `/notes` | SOAP/DAP notes tied to `session_id`. **Encrypt at rest.** Version history required. |
| `billing-store.ts` | `/invoices`, `/payments` | Invoice generation, payment recording, GST-ready |
| `messages-store.ts` | `/threads`, `/messages` | Psychologist ↔ patient DMs, WebSocket for realtime (see §7) |

### Priority tier 2 (feature-complete parity)

| Store | Resource |
|---|---|
| `assessments-store.ts` | `/assessments` (PHQ-9, GAD-7, etc. — scored server-side) |
| `homework-store.ts` | `/homework` (assign, track completion) |
| `safety-plans-store.ts` | `/safety-plans` (Stanley-Brown template, versioned) |
| `prescriptions-store.ts` | `/prescriptions` (only if user has prescribing rights flag) |
| `documents-store.ts` | `/documents` (upload to S3, return signed URLs) |
| `library-store.ts` | `/library` (psychoeducation resources) |
| `homework-store.ts` + `portal-store.ts` | Patient portal reads/writes |
| `referrals-store.ts` | `/referrals` (in and out, with status workflow) |
| `groups-store.ts` + `group-attendance-store.ts` | `/groups`, `/groups/{id}/attendance` |
| `conferences-store.ts` | `/case-conferences` |

### Priority tier 3 (practice ops)

| Store | Resource |
|---|---|
| `team-store.ts` | `/team/members`, `/team/roles` (RBAC) |
| `supervision-store.ts` | `/supervision` |
| `peers-store.ts` | `/peers` (peer consultations) |
| `cpd-store.ts` | `/cpd` (continuing professional dev credits) |
| `research-store.ts` | `/research` (opt-in aggregate anonymised data) |
| `reviews-store.ts` | `/reviews` (public reviews on marketing profile) |
| `waitlist-ops-store.ts` | `/waitlist` |
| `governance-store.ts` | `/governance/audit-log` (immutable, append-only) |
| `integrations-store.ts` | `/integrations/*` (Google Calendar, Zoom, etc. OAuth) |
| `notifications-store.ts` + `alert-prefs-store.ts` | `/notifications`, `/notification-preferences` |
| `practice-settings-store.ts` + `settings-store.ts` | `/practice/settings/*` |
| `copilot-store.ts` | `/copilot/*` (LLM proxy — see §9) |

## 6. Data model — starter DDL

Full schema is large; here are the non-negotiable tables. Use `uuid` PKs (`gen_random_uuid()`), `timestamptz` for all time columns, soft-delete via `deleted_at`.

```sql
-- USERS (single table, roles differentiate)
create table users (
  id uuid primary key default gen_random_uuid(),
  email varchar(255) unique not null,
  password_hash text not null,        -- bcrypt cost 12
  full_name varchar(255) not null,
  phone varchar(32),
  email_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- ROLES (separate table — DO NOT store role on users)
create type app_role as enum ('PSYCHOLOGIST','PATIENT','ADMIN','SUPERVISOR');
create table user_roles (
  user_id uuid references users(id) on delete cascade,
  role app_role not null,
  primary key (user_id, role)
);

-- PSYCHOLOGIST PROFILE
create table psychologist_profiles (
  user_id uuid primary key references users(id) on delete cascade,
  license_number varchar(64) unique not null,
  license_verified_at timestamptz,
  credential varchar(64) not null,
  clinic_name varchar(255),
  specializations text[],
  bio text,
  hourly_rate_inr integer,
  slug varchar(120) unique,          -- for public marketing profile
  accepting_new_patients boolean not null default true
);

-- PATIENT PROFILE
create table patient_profiles (
  user_id uuid primary key references users(id) on delete cascade,
  dob date,
  gender varchar(32),
  emergency_contact_name varchar(255),
  emergency_contact_phone varchar(32),
  timezone varchar(64) not null default 'Asia/Kolkata'
);

-- PSYCHOLOGIST ↔ PATIENT LINK (the critical gate)
create table care_relationships (
  id uuid primary key default gen_random_uuid(),
  psychologist_id uuid not null references users(id),
  patient_id uuid not null references users(id),
  status varchar(24) not null,       -- INVITED, ACTIVE, PAUSED, DISCHARGED
  invited_at timestamptz not null default now(),
  activated_at timestamptz,
  discharged_at timestamptz,
  unique (psychologist_id, patient_id)
);
create index on care_relationships (psychologist_id, status);
create index on care_relationships (patient_id, status);

-- APPOINTMENTS
create table appointments (
  id uuid primary key default gen_random_uuid(),
  psychologist_id uuid not null references users(id),
  patient_id uuid not null references users(id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  location varchar(32) not null,     -- IN_PERSON, TELEHEALTH
  meeting_url text,
  status varchar(24) not null,       -- SCHEDULED, CONFIRMED, COMPLETED, NO_SHOW, CANCELLED
  cancellation_reason text,
  recurrence_rule text,              -- RFC 5545 RRULE
  created_at timestamptz not null default now()
);
create index on appointments (psychologist_id, starts_at);
create index on appointments (patient_id, starts_at);

-- SESSIONS (a completed appointment produces a session record)
create table sessions (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid unique references appointments(id),
  psychologist_id uuid not null references users(id),
  patient_id uuid not null references users(id),
  started_at timestamptz not null,
  ended_at timestamptz,
  modality varchar(32),              -- CBT, DBT, EMDR, PSYCHODYNAMIC, ...
  created_at timestamptz not null default now()
);

-- NOTES (SOAP/DAP) — sensitive, encrypt at rest
create table clinical_notes (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id),
  patient_id uuid not null references users(id),
  author_id uuid not null references users(id),
  format varchar(16) not null,       -- SOAP, DAP, FREEFORM
  content_encrypted bytea not null,  -- AES-256-GCM, per-row DEK wrapped by KMS
  content_iv bytea not null,
  version integer not null default 1,
  locked_at timestamptz,             -- once locked, immutable; edits create new version
  created_at timestamptz not null default now()
);
create table clinical_note_versions ( ...same shape, one row per historical version );

-- INVOICES
create table invoices (
  id uuid primary key default gen_random_uuid(),
  psychologist_id uuid not null references users(id),
  patient_id uuid not null references users(id),
  invoice_number varchar(32) unique not null,
  issued_on date not null,
  due_on date not null,
  subtotal_inr integer not null,
  tax_inr integer not null default 0,
  total_inr integer not null,
  status varchar(24) not null,       -- DRAFT, SENT, PAID, OVERDUE, VOID
  paid_at timestamptz
);

-- AUDIT LOG (append-only, ALL PHI access)
create table audit_log (
  id bigserial primary key,
  actor_id uuid references users(id),
  actor_role app_role,
  action varchar(64) not null,       -- READ_NOTE, UPDATE_APPOINTMENT, ...
  resource_type varchar(64) not null,
  resource_id uuid,
  patient_id uuid,                   -- always populated when PHI is touched
  ip_address inet,
  user_agent text,
  metadata jsonb,
  created_at timestamptz not null default now()
);
create index on audit_log (patient_id, created_at desc);
create index on audit_log (actor_id, created_at desc);
```

Every additional resource (messages, homework, assessments, etc.) follows the same pattern: FK to `psychologist_id` + `patient_id`, guarded by care_relationship.

## 7. Realtime

- **Messages, appointment updates, notifications**: WebSocket at `/ws` with STOMP over SockJS, or plain WS with your own protocol. Frontend can adapt to either.
- Subscribe channels: `/user/queue/messages`, `/user/queue/notifications`, `/topic/appointment.{id}`.
- Authenticate the WS handshake with the same JWT (query param `?token=` or `Sec-WebSocket-Protocol`).

## 8. File storage

- S3 bucket per environment. Never expose bucket URLs directly.
- Upload flow:
  1. `POST /documents/upload-url` → returns presigned PUT URL + `documentId`.
  2. Frontend PUTs the file to S3.
  3. `POST /documents/{id}/finalize` → server verifies size/mime, stores metadata row.
- Download: `GET /documents/{id}/download-url` → returns short-lived (5 min) presigned GET URL, audited.

## 9. AI Copilot proxy

The frontend uses an AI "copilot" for SOAP draft, continuity briefs, etc. Do **not** let the browser call OpenAI/Anthropic directly.

- `POST /copilot/soap-draft` `{ sessionId, transcriptSnippet }` → `{ draft }`
- `POST /copilot/continuity-brief` `{ patientId }` → `{ brief }`
- Proxy to your LLM provider (server holds the API key).
- Redact PII from prompts if provider is not BAA-covered.
- Log every prompt to `audit_log` with `action=COPILOT_CALL`.

## 10. Security & compliance requirements

1. **Password hashing:** bcrypt cost ≥ 12 (or argon2id if you prefer).
2. **JWT signing:** RS256 with rotating keys published at `/.well-known/jwks.json`.
3. **Rate limiting:** 100 req/min per IP on `/auth/*`, 600 req/min per user on other endpoints. Use Bucket4j + Redis.
4. **CORS:** allow only `https://psychologist.peacecode.in` and `http://localhost:5173` in dev.
5. **CSRF:** not needed for pure JWT bearer APIs, but reject non-CORS-preflighted state-changing requests.
6. **PHI encryption at rest:** clinical_notes, assessments answers, messages, documents. Envelope encryption with AWS KMS or Vault Transit.
7. **TLS:** enforce TLS 1.2+ at the load balancer. HSTS on responses.
8. **Audit log:** every PHI read/write. Never DELETE from `audit_log`.
9. **Data retention:** default 7 years for clinical records (Indian medical council norm); patient can request export/erasure — but records under legal hold cannot be erased.
10. **Role checks:** enforce at the service layer, not just the controller. A psychologist can only read a patient's data if an ACTIVE `care_relationship` row exists.
11. **DPDP Act (India) + HIPAA-alignment:** log consent, keep DPA-ready export endpoint (`GET /me/export`), support deletion request workflow.

## 11. Testing baseline

- Unit tests for every service (JUnit 5 + Mockito).
- Integration tests with Testcontainers-Postgres for every controller.
- Contract tests using the OpenAPI spec — CI must fail if the spec drifts from the frontend's expectations.
- Load target: 200 concurrent psychologists, p95 < 300 ms on read endpoints.

## 12. Deployment

- Dockerfile → distroless JRE 21.
- Suggested hosts: AWS ECS Fargate, Fly.io, or Railway.
- Managed Postgres (RDS / Neon / Supabase-postgres-only).
- Environment: `SPRING_PROFILES_ACTIVE=prod`, all secrets via env vars or SSM.
- Health: `/actuator/health` (liveness), `/actuator/health/readiness`.
- Logs: JSON to stdout, aggregated in Datadog/Grafana Cloud.

## 13. What the frontend does today (so nothing surprises you)

- **Auth:** currently uses Supabase auth (email/password) and a `pc.auth.session.v1` localStorage marker. All patient/clinical data is `localStorage` only (see `src/lib/*-store.ts`). No real backend calls yet.
- **Routing:** `/` → marketing site (`/for-psychologists`). Login button → `/auth/login`. After login → `/dashboard` (all routes under `_authenticated/` — see `src/routes/_authenticated/route.tsx`).
- **Patient portal:** `/portal/*` routes exist for the patient side — same backend, different role.
- **When you're ready:** we replace each `src/lib/*-store.ts` file with fetch calls to your API. The dashboard components don't need to change. See the `readXxx()` / `writeXxx()` / `subscribe()` pattern each store exposes — that's the abstraction seam.

## 14. First milestone (2-week MVP for handoff)

Ship these and we can plug the frontend in end-to-end:

1. `/auth/psychologist/register`, `/auth/patient/register`, `/auth/login`, `/auth/refresh`, `/auth/me`
2. `/psychologists/me` GET/PATCH
3. `/patients` list + create + invite
4. `/appointments` full CRUD with date-range list
5. `/notes` create + list per patient (encrypted)
6. OpenAPI spec published at `/v3/api-docs`
7. Deployed to a staging URL with a valid TLS cert

Once these are live, share the base URL + a test psychologist account and I'll flip the frontend `src/lib/*-store.ts` files over to real HTTP calls (behind a single `VITE_API_BASE_URL`), keeping localStorage as a fallback during rollout.

---

**Questions for the backend engineer to confirm before starting:**
- PostgreSQL managed host?
- KMS provider for PHI encryption (AWS KMS vs Vault vs pgcrypto)?
- Email provider (Resend / SES)?
- LLM provider for copilot (OpenAI / Anthropic / self-hosted)?
- Deployment target (ECS / Fly / Railway)?
