// PeaceCode · Governance store.
// Consents, audit log, retention, patient rights, breach, RBAC, DPAs, DPO.
// Seeds 60 days of audit history + realistic fixtures.
import { useSyncExternalStore } from "react";

// ─── Types ───────────────────────────────────────────
export type ConsentCategory =
  | "treatment" | "telehealth" | "guardian" | "research"
  | "quality-improvement" | "referral" | "insurance" | "family-involvement";
export type ConsentStatus = "active" | "withdrawn" | "expired";
export type ConsentMethod = "in-person" | "e-sign" | "verbal-witnessed";

export type Consent = {
  id: string;
  patientId: string;
  patientName: string;
  category: ConsentCategory;
  clause: string;       // verbatim consent language
  status: ConsentStatus;
  method: ConsentMethod;
  ip?: string;
  givenAt: number;
  withdrawnAt?: number;
  withdrawReason?: string;
  expiresAt?: number;
};

export type AuditVerb =
  | "read" | "create" | "update" | "delete" | "export" | "print"
  | "download" | "share" | "login" | "logout" | "consent-give"
  | "consent-withdraw" | "policy-change" | "breach-drill" | "hold-apply"
  | "hold-release" | "rights-request" | "rights-fulfill";

export type AuditEvent = {
  id: string;                // aud_YYYYMMDD_...
  at: number;                // ms precision
  actor: string;             // "Dr. Priya Sharma"
  actorRole: RoleKey;
  verb: AuditVerb;
  targetType: "patient" | "session" | "note" | "assessment" | "document" | "invoice" | "message" | "policy" | "system";
  targetId?: string;
  targetLabel: string;
  ip?: string;
  device?: string;
  requestId?: string;        // groups related events
  anomalyScore: number;      // 0..1
  before?: unknown;
  after?: unknown;
};

export type DataClass =
  | "clinical-notes" | "assessments" | "session-recordings"
  | "billing-records" | "consent-forms" | "messages" | "marketing";

export type RetentionPolicy = {
  dataClass: DataClass;
  label: string;
  windowDays: number;
  legalBasis: string;
  agingCount: number;        // records within 60d of edge
  reviewQueue: number;       // records past edge, awaiting ratify
  editedAt: number;
  editedBy?: string;
};

export type LegalHold = {
  id: string;
  patientId: string;
  patientName: string;
  reason: string;
  appliedAt: number;
  appliedBy: string;
  releasedAt?: number;
};

export type RightKind = "access" | "correction" | "portability" | "erasure";
export type RightStatus = "intake" | "reviewing" | "fulfilled" | "refused" | "expired";

export type RightsRequest = {
  id: string;                // GRC-2026-0007
  patientId: string;
  patientName: string;
  kind: RightKind;
  status: RightStatus;
  openedAt: number;
  slaDueAt: number;          // 30 days per DPDP
  step: 1 | 2 | 3;
  reason?: string;
  refusalReason?: string;
  scopeNote?: string;
};

export type BreachStep = "contain" | "assess" | "notify" | "document" | "learn";
export type Breach = {
  id: string;
  openedAt: number;
  closedAt?: number;
  drill: boolean;
  severity: "low" | "moderate" | "elevated";
  title: string;
  scopeRecords: number;
  dataClasses: DataClass[];
  step: BreachStep;
  timeline: { at: number; actor: string; note: string; step: BreachStep }[];
};

export type RoleKey = "owner" | "clinician" | "supervisor" | "front-desk" | "billing" | "auditor" | "read-only" | "system" | "patient";
export type AccessLevel = "full" | "read" | "with-reason" | "none";

export type AccessMatrix = {
  roles: RoleKey[];
  classes: { key: DataClass | "audit-log" | "documents"; label: string }[];
  cells: Record<string, AccessLevel>; // `${role}::${class}`
  mfaRequired: Record<RoleKey, boolean>;
  sessionMinutes: Record<RoleKey, number>;
};

export type DpaStatus = "signed" | "pending" | "expired" | "not-required";
export type DpaVendor = {
  id: string;
  vendor: string;
  category: string;
  dataClasses: DataClass[];
  subprocessors: string[];
  country: string;
  status: DpaStatus;
  effectiveAt?: number;
  expiresAt?: number;
};

export type DpoDecision = {
  id: string;
  at: number;
  officer: string;
  subject: string;
  decision: "approved" | "refused" | "escalated";
  note: string;
};

export type GovernanceState = {
  consents: Consent[];
  auditLog: AuditEvent[];
  retention: RetentionPolicy[];
  legalHolds: LegalHold[];
  rights: RightsRequest[];
  breaches: Breach[];
  access: AccessMatrix;
  dpas: DpaVendor[];
  dpo: {
    name: string;
    contact: string;
    credential: string;
    selfDesignated: boolean;
    decisions: DpoDecision[];
  };
  journal: { id: string; at: number; kind: "policy" | "dpo" | "retention" | "breach" | "dpa" | "hold"; text: string; actor?: string }[];
};

// ─── Seed ────────────────────────────────────────────
const DAY = 86_400_000;
const now = Date.now();
const RID = (n: number) => "req_" + Math.random().toString(36).slice(2, 4) + n.toString(36);

const SEED_PATIENTS = [
  { id: "pat_aarav", name: "Aarav Mehta" },
  { id: "pat_meera", name: "Meera Iyer" },
  { id: "pat_kiran", name: "Kiran Rao" },
  { id: "pat_isha",  name: "Isha Kapoor" },
  { id: "pat_rahul", name: "Rahul Verma" },
];

function seedConsents(): Consent[] {
  const out: Consent[] = [];
  const clauses: Record<ConsentCategory, string> = {
    treatment: "I consent to receive psychotherapy services from Dr. Priya Sharma at PeaceCode Practice, including assessment, treatment planning, and clinical documentation.",
    telehealth: "I understand that telehealth sessions occur over encrypted video, that connection quality may vary, and that in-person alternatives remain available.",
    guardian: "As the parent/legal guardian of the above minor, I consent to their participation in psychotherapy.",
    research: "I consent to my de-identified clinical outcomes being included in aggregate practice-improvement research.",
    "quality-improvement": "I consent to my session data being used for internal quality review and supervision.",
    referral: "I authorize communication with the referring physician regarding my treatment.",
    insurance: "I authorize release of the minimum necessary information to my insurance provider for claims processing.",
    "family-involvement": "I consent to family members being involved in defined portions of my care.",
  };
  const cats: ConsentCategory[] = ["treatment", "telehealth", "research", "quality-improvement", "referral", "insurance"];
  SEED_PATIENTS.forEach((p, i) => {
    cats.forEach((c, j) => {
      const status: ConsentStatus = j === 4 && i === 2 ? "withdrawn" : "active";
      out.push({
        id: `con_${p.id}_${c}`,
        patientId: p.id, patientName: p.name,
        category: c, clause: clauses[c], status,
        method: j % 3 === 0 ? "in-person" : j % 3 === 1 ? "e-sign" : "verbal-witnessed",
        ip: `10.${(i * 7) % 250}.${(j * 11) % 250}.${(i + j) * 3 % 250}`,
        givenAt: now - (60 - i * 8 - j * 3) * DAY,
        withdrawnAt: status === "withdrawn" ? now - 4 * DAY : undefined,
        withdrawReason: status === "withdrawn" ? "Patient prefers no third-party communication at this time." : undefined,
      });
    });
  });
  return out;
}

function seedAuditLog(): AuditEvent[] {
  const out: AuditEvent[] = [];
  const actors: { name: string; role: RoleKey }[] = [
    { name: "Dr. Priya Sharma", role: "owner" },
    { name: "Meera Nair", role: "clinician" },
    { name: "Dr. Ravi Menon", role: "supervisor" },
    { name: "Sunita (Front desk)", role: "front-desk" },
    { name: "system", role: "system" },
  ];
  const verbs: AuditVerb[] = ["read","read","read","read","read","update","create","export","download","print","share","login","logout"];
  const targets = [
    { t: "patient" as const, id: "pat_aarav", l: "Aarav Mehta — chart" },
    { t: "note" as const,    id: "note_87",   l: "SOAP · 2026-06-14 · Aarav Mehta" },
    { t: "assessment" as const, id: "as_331", l: "PHQ-9 · Meera Iyer" },
    { t: "document" as const, id: "doc_112",  l: "Consent · Kiran Rao" },
    { t: "session" as const, id: "ses_998",   l: "Video session · Isha Kapoor" },
    { t: "invoice" as const, id: "inv_2024",  l: "Invoice #2026-0042" },
    { t: "message" as const, id: "msg_5501",  l: "Secure thread · Rahul Verma" },
  ];
  for (let d = 60; d >= 0; d--) {
    const dayEvents = 4 + Math.floor(Math.random() * 10);
    for (let k = 0; k < dayEvents; k++) {
      const a = actors[Math.floor(Math.random() * actors.length)];
      const v = verbs[Math.floor(Math.random() * verbs.length)];
      const t = targets[Math.floor(Math.random() * targets.length)];
      const anomaly = Math.random() < 0.05 ? 0.55 + Math.random() * 0.4 : Math.random() * 0.15;
      const at = now - d * DAY - Math.floor(Math.random() * DAY);
      out.push({
        id: `aud_${at}_${Math.random().toString(36).slice(2, 6)}`,
        at, actor: a.name, actorRole: a.role, verb: v,
        targetType: t.t, targetId: t.id, targetLabel: t.l,
        ip: `10.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`,
        device: Math.random() > 0.5 ? "MacBook Pro · Chrome 128" : "iPhone 15 · Safari 17",
        requestId: RID(k),
        anomalyScore: Number(anomaly.toFixed(2)),
      });
    }
  }
  // insert a breach drill and near-miss
  out.push({
    id: `aud_drill_${now - 21 * DAY}`, at: now - 21 * DAY, actor: "Dr. Priya Sharma", actorRole: "owner",
    verb: "breach-drill", targetType: "system", targetLabel: "Quarterly breach simulation",
    device: "MacBook Pro · Chrome 128", ip: "10.0.0.4", anomalyScore: 0.05,
  });
  out.push({
    id: `aud_near_${now - 9 * DAY}`, at: now - 9 * DAY, actor: "Meera Nair", actorRole: "clinician",
    verb: "read", targetType: "patient", targetId: "pat_isha", targetLabel: "Isha Kapoor — chart",
    ip: "203.192.14.88", device: "Unknown · Firefox 120", anomalyScore: 0.82, requestId: RID(999),
  });
  return out.sort((a, b) => b.at - a.at);
}

const DEFAULT_RETENTION: RetentionPolicy[] = [
  { dataClass: "clinical-notes",     label: "Clinical notes",     windowDays: 10 * 365, legalBasis: "MCI/NMC medical records standard", agingCount: 12, reviewQueue: 0, editedAt: now - 45 * DAY },
  { dataClass: "assessments",        label: "Assessments",        windowDays: 10 * 365, legalBasis: "MCI/NMC medical records standard", agingCount: 8,  reviewQueue: 0, editedAt: now - 45 * DAY },
  { dataClass: "session-recordings", label: "Session recordings", windowDays: 365,       legalBasis: "Practice policy · flagged extended", agingCount: 4, reviewQueue: 2, editedAt: now - 30 * DAY },
  { dataClass: "billing-records",    label: "Billing records",    windowDays: 8 * 365,   legalBasis: "Income Tax Act 1961 · GST", agingCount: 22, reviewQueue: 0, editedAt: now - 90 * DAY },
  { dataClass: "consent-forms",      label: "Consent forms",      windowDays: 10 * 365,  legalBasis: "DPDP Act 2023 · consent evidence", agingCount: 6, reviewQueue: 0, editedAt: now - 45 * DAY },
  { dataClass: "messages",           label: "Secure messages",    windowDays: 2 * 365,   legalBasis: "Practice policy", agingCount: 18, reviewQueue: 5, editedAt: now - 10 * DAY },
  { dataClass: "marketing",          label: "Marketing / analytics", windowDays: 180,    legalBasis: "DPDP Act · purpose limitation", agingCount: 41, reviewQueue: 12, editedAt: now - 3 * DAY },
];

const SEED_RIGHTS: RightsRequest[] = [
  { id: "GRC-2026-0007", patientId: "pat_meera", patientName: "Meera Iyer",  kind: "access",      status: "reviewing", openedAt: now - 4 * DAY,  slaDueAt: now + 26 * DAY, step: 2, scopeNote: "All chart data since intake." },
  { id: "GRC-2026-0006", patientId: "pat_kiran", patientName: "Kiran Rao",   kind: "erasure",     status: "reviewing", openedAt: now - 2 * DAY,  slaDueAt: now + 28 * DAY, step: 2, scopeNote: "Full erasure post-discharge." },
  { id: "GRC-2026-0005", patientId: "pat_isha",  patientName: "Isha Kapoor", kind: "correction",  status: "fulfilled", openedAt: now - 15 * DAY, slaDueAt: now + 15 * DAY, step: 3 },
  { id: "GRC-2026-0004", patientId: "pat_rahul", patientName: "Rahul Verma", kind: "portability", status: "fulfilled", openedAt: now - 22 * DAY, slaDueAt: now + 8 * DAY,  step: 3 },
  { id: "GRC-2026-0003", patientId: "pat_aarav", patientName: "Aarav Mehta", kind: "access",      status: "fulfilled", openedAt: now - 40 * DAY, slaDueAt: now - 10 * DAY, step: 3 },
];

const SEED_BREACHES: Breach[] = [
  {
    id: "INC-2026-Q2-DRILL", openedAt: now - 21 * DAY, closedAt: now - 20 * DAY,
    drill: true, severity: "low", title: "Quarterly breach drill (synthetic)",
    scopeRecords: 3, dataClasses: ["clinical-notes"], step: "learn",
    timeline: [
      { at: now - 21 * DAY,                actor: "Dr. Priya Sharma", note: "Drill initiated. Synthetic patient set loaded.", step: "contain" },
      { at: now - 21 * DAY + 6 * 3600_000, actor: "Dr. Priya Sharma", note: "Scope assessed. 3 synthetic records affected.",  step: "assess"  },
      { at: now - 20 * DAY + 1 * 3600_000, actor: "Dr. Priya Sharma", note: "Notification templates rehearsed. DPB draft filed for review.", step: "notify" },
      { at: now - 20 * DAY + 3 * 3600_000, actor: "Dr. Priya Sharma", note: "Timeline archived. No lessons requiring policy change.", step: "learn" },
    ],
  },
];

const SEED_ACCESS: AccessMatrix = {
  roles: ["owner","clinician","supervisor","front-desk","billing","auditor","read-only"],
  classes: [
    { key: "clinical-notes", label: "Clinical notes" },
    { key: "assessments",    label: "Assessments" },
    { key: "billing-records",label: "Billing" },
    { key: "messages",       label: "Messaging" },
    { key: "documents",      label: "Documents" },
    { key: "audit-log",      label: "Audit log" },
  ],
  cells: {
    "owner::clinical-notes":"full","owner::assessments":"full","owner::billing-records":"full","owner::messages":"full","owner::documents":"full","owner::audit-log":"read",
    "clinician::clinical-notes":"full","clinician::assessments":"full","clinician::billing-records":"read","clinician::messages":"full","clinician::documents":"full","clinician::audit-log":"none",
    "supervisor::clinical-notes":"read","supervisor::assessments":"read","supervisor::billing-records":"none","supervisor::messages":"with-reason","supervisor::documents":"read","supervisor::audit-log":"read",
    "front-desk::clinical-notes":"none","front-desk::assessments":"none","front-desk::billing-records":"read","front-desk::messages":"none","front-desk::documents":"read","front-desk::audit-log":"none",
    "billing::clinical-notes":"none","billing::assessments":"none","billing::billing-records":"full","billing::messages":"none","billing::documents":"read","billing::audit-log":"none",
    "auditor::clinical-notes":"read","auditor::assessments":"read","auditor::billing-records":"read","auditor::messages":"read","auditor::documents":"read","auditor::audit-log":"full",
    "read-only::clinical-notes":"read","read-only::assessments":"read","read-only::billing-records":"none","read-only::messages":"none","read-only::documents":"read","read-only::audit-log":"none",
  },
  mfaRequired: { owner:true, clinician:true, supervisor:true, "front-desk":true, billing:true, auditor:true, "read-only":false, system:false, patient:true },
  sessionMinutes: { owner:60, clinician:60, supervisor:45, "front-desk":30, billing:45, auditor:30, "read-only":30, system:0, patient:20 },
};

const SEED_DPAS: DpaVendor[] = [
  { id: "dpa_razorpay",  vendor: "Razorpay",        category: "Payments",   dataClasses: ["billing-records"], subprocessors: ["AWS Mumbai"],   country: "India",   status: "signed",  effectiveAt: now - 400 * DAY, expiresAt: now + 330 * DAY },
  { id: "dpa_zoom",      vendor: "Zoom (Healthcare)", category: "Video",    dataClasses: ["session-recordings"], subprocessors: ["Oracle Cloud"], country: "USA",   status: "signed",  effectiveAt: now - 250 * DAY, expiresAt: now + 480 * DAY },
  { id: "dpa_google",    vendor: "Google Calendar", category: "Calendar",   dataClasses: ["messages"], subprocessors: ["Google Ireland"], country: "USA / Ireland", status: "signed",  effectiveAt: now - 600 * DAY, expiresAt: now + 130 * DAY },
  { id: "dpa_abdm",      vendor: "ABDM / ABHA",     category: "Health ID",  dataClasses: ["clinical-notes","assessments"], subprocessors: ["NHA India"], country: "India", status: "signed", effectiveAt: now - 80 * DAY, expiresAt: now + 650 * DAY },
  { id: "dpa_sendgrid",  vendor: "SendGrid",        category: "Email",      dataClasses: ["messages"], subprocessors: ["Twilio Inc."], country: "USA",  status: "pending", effectiveAt: undefined, expiresAt: undefined },
  { id: "dpa_datadog",   vendor: "Datadog",         category: "Observability", dataClasses: ["marketing"], subprocessors: ["AWS us-east"], country: "USA", status: "expired", effectiveAt: now - 900 * DAY, expiresAt: now - 20 * DAY },
];

const seed: GovernanceState = {
  consents: seedConsents(),
  auditLog: seedAuditLog(),
  retention: DEFAULT_RETENTION,
  legalHolds: [
    { id: "hold_1", patientId: "pat_kiran", patientName: "Kiran Rao", reason: "Ongoing family court matter — records subpoenaed 2026-04.", appliedAt: now - 55 * DAY, appliedBy: "Dr. Priya Sharma" },
  ],
  rights: SEED_RIGHTS,
  breaches: SEED_BREACHES,
  access: SEED_ACCESS,
  dpas: SEED_DPAS,
  dpo: {
    name: "Dr. Priya Sharma", contact: "dpo@peacecode.in", credential: "RCI · 15 yr clinical",
    selfDesignated: true,
    decisions: [
      { id: "dpo_1", at: now - 21 * DAY, officer: "Dr. Priya Sharma", subject: "Q2 breach drill closed", decision: "approved", note: "No corrective action required." },
      { id: "dpo_2", at: now - 12 * DAY, officer: "Dr. Priya Sharma", subject: "Retention · messages window shortened to 24 months", decision: "approved", note: "Aligns with DPDP purpose limitation." },
      { id: "dpo_3", at: now - 5 * DAY,  officer: "Dr. Priya Sharma", subject: "GRC-2026-0006 · erasure request", decision: "escalated", note: "Legal-hold conflict; awaiting counsel review." },
    ],
  },
  journal: [
    { id: "j1", at: now - 60 * DAY, kind: "policy",    text: "Governance module activated. Baseline policies applied.", actor: "Dr. Priya Sharma" },
    { id: "j2", at: now - 55 * DAY, kind: "hold",      text: "Legal hold applied to Kiran Rao (family court).",        actor: "Dr. Priya Sharma" },
    { id: "j3", at: now - 45 * DAY, kind: "retention", text: "Clinical-notes retention set to 10 years.",              actor: "Dr. Priya Sharma" },
    { id: "j4", at: now - 30 * DAY, kind: "dpa",       text: "Zoom (Healthcare) DPA renewed for 24 months." },
    { id: "j5", at: now - 21 * DAY, kind: "breach",    text: "Quarterly breach drill closed. No findings." },
    { id: "j6", at: now - 12 * DAY, kind: "retention", text: "Message retention shortened to 24 months (DPO approved)." },
    { id: "j7", at: now - 5 * DAY,  kind: "dpo",       text: "GRC-2026-0006 escalated to legal review." },
  ],
};

// ─── Store plumbing ──────────────────────────────────
const KEY = "peacecode.governance.v1";
const listeners = new Set<() => void>();
let cached: GovernanceState | null = null;

function load(): GovernanceState {
  if (typeof window === "undefined") return seed;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seed;
    return { ...seed, ...JSON.parse(raw) };
  } catch { return seed; }
}
function state(): GovernanceState { if (!cached) cached = load(); return cached; }
function persist() { if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(cached)); listeners.forEach((l) => l()); }
function mutate(fn: (s: GovernanceState) => GovernanceState) { cached = fn(state()); persist(); }

export function useGovernance(): GovernanceState {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => { listeners.delete(cb); }; },
    () => state(),
    () => seed,
  );
}
export function getGovernance(): GovernanceState { return state(); }

// ─── Audit middleware ────────────────────────────────
// Any store can `audit(...)` and the entry appears in the log.
export function audit(input: Omit<AuditEvent, "id" | "at" | "anomalyScore"> & Partial<Pick<AuditEvent, "anomalyScore" | "at">>): AuditEvent {
  const at = input.at ?? Date.now();
  const ev: AuditEvent = {
    ...input,
    id: `aud_${at}_${Math.random().toString(36).slice(2, 6)}`,
    at,
    anomalyScore: input.anomalyScore ?? 0,
  };
  mutate((s) => ({ ...s, auditLog: [ev, ...s.auditLog].slice(0, 5000) }));
  return ev;
}

// ─── Consent actions ─────────────────────────────────
export function withdrawConsent(id: string, reason: string, effective: number) {
  mutate((s) => ({
    ...s,
    consents: s.consents.map((c) => c.id === id ? { ...c, status: "withdrawn" as ConsentStatus, withdrawnAt: effective, withdrawReason: reason } : c),
  }));
  const c = state().consents.find((x) => x.id === id);
  if (c) audit({ actor: "Dr. Priya Sharma", actorRole: "owner", verb: "consent-withdraw", targetType: "patient", targetId: c.patientId, targetLabel: `${c.patientName} · ${c.category}`, before: { status: "active" }, after: { status: "withdrawn", reason } });
}

// ─── Retention actions ───────────────────────────────
export function updateRetention(dataClass: DataClass, patch: Partial<RetentionPolicy>) {
  mutate((s) => ({
    ...s,
    retention: s.retention.map((p) => p.dataClass === dataClass ? { ...p, ...patch, editedAt: Date.now(), editedBy: "Dr. Priya Sharma" } : p),
    journal: [{ id: `j_${Date.now()}`, at: Date.now(), kind: "retention", text: `Retention for ${dataClass} updated.`, actor: "Dr. Priya Sharma" }, ...s.journal],
  }));
  audit({ actor: "Dr. Priya Sharma", actorRole: "owner", verb: "policy-change", targetType: "policy", targetLabel: `Retention · ${dataClass}`, before: null, after: patch });
}

// ─── Legal hold ──────────────────────────────────────
export function applyLegalHold(patientId: string, patientName: string, reason: string) {
  const h: LegalHold = { id: `hold_${Date.now()}`, patientId, patientName, reason, appliedAt: Date.now(), appliedBy: "Dr. Priya Sharma" };
  mutate((s) => ({ ...s, legalHolds: [h, ...s.legalHolds] }));
  audit({ actor: "Dr. Priya Sharma", actorRole: "owner", verb: "hold-apply", targetType: "patient", targetId: patientId, targetLabel: `${patientName} · legal hold`, after: { reason } });
}
export function releaseLegalHold(id: string) {
  mutate((s) => ({ ...s, legalHolds: s.legalHolds.map((h) => h.id === id ? { ...h, releasedAt: Date.now() } : h) }));
}

// ─── Rights requests ─────────────────────────────────
export function advanceRight(id: string, patch: Partial<RightsRequest>) {
  mutate((s) => ({ ...s, rights: s.rights.map((r) => r.id === id ? { ...r, ...patch } : r) }));
  const r = state().rights.find((x) => x.id === id);
  if (r) audit({ actor: "Dr. Priya Sharma", actorRole: "owner", verb: patch.status === "fulfilled" ? "rights-fulfill" : "rights-request", targetType: "patient", targetId: r.patientId, targetLabel: `${r.patientName} · ${r.kind} · ${r.id}`, after: patch });
}
export function createRight(kind: RightKind, patientId: string, patientName: string, scopeNote?: string): RightsRequest {
  const n = state().rights.length + 8;
  const r: RightsRequest = {
    id: `GRC-2026-${String(n).padStart(4, "0")}`,
    patientId, patientName, kind, status: "intake",
    openedAt: Date.now(), slaDueAt: Date.now() + 30 * DAY, step: 1, scopeNote,
  };
  mutate((s) => ({ ...s, rights: [r, ...s.rights] }));
  audit({ actor: "Dr. Priya Sharma", actorRole: "owner", verb: "rights-request", targetType: "patient", targetId: patientId, targetLabel: `${patientName} · ${kind} · ${r.id}`, after: { scopeNote } });
  return r;
}

// ─── Breach actions ──────────────────────────────────
export function startBreachDrill() {
  const b: Breach = {
    id: `INC-DRILL-${new Date().toISOString().slice(0, 10)}`,
    openedAt: Date.now(), drill: true, severity: "low",
    title: "Manual breach drill (synthetic)", scopeRecords: 3,
    dataClasses: ["clinical-notes"], step: "contain",
    timeline: [{ at: Date.now(), actor: "Dr. Priya Sharma", note: "Drill initiated.", step: "contain" }],
  };
  mutate((s) => ({ ...s, breaches: [b, ...s.breaches] }));
  audit({ actor: "Dr. Priya Sharma", actorRole: "owner", verb: "breach-drill", targetType: "system", targetLabel: b.title });
  return b;
}

// ─── Access matrix ───────────────────────────────────
export function setAccessCell(role: RoleKey, cls: string, level: AccessLevel) {
  mutate((s) => ({ ...s, access: { ...s.access, cells: { ...s.access.cells, [`${role}::${cls}`]: level } } }));
  audit({ actor: "Dr. Priya Sharma", actorRole: "owner", verb: "policy-change", targetType: "policy", targetLabel: `Access · ${role} × ${cls}`, after: { level } });
}
export function toggleMfa(role: RoleKey) {
  mutate((s) => ({ ...s, access: { ...s.access, mfaRequired: { ...s.access.mfaRequired, [role]: !s.access.mfaRequired[role] } } }));
}

// ─── Constants ───────────────────────────────────────
export const CONSENT_CATEGORY_LABEL: Record<ConsentCategory, string> = {
  treatment: "Treatment", telehealth: "Telehealth", guardian: "Guardian consent",
  research: "Research", "quality-improvement": "Quality improvement", referral: "Referral",
  insurance: "Insurance disclosure", "family-involvement": "Family involvement",
};

export function daysUntil(ms: number): number { return Math.round((ms - Date.now()) / DAY); }
