// PeaceCode · Practice — Supervision Log store.
// Supervisors, contracts, sessions, case discussions with a strict
// PRIVATE PARTITION (supervisor cannot query supervisee's private notes
// even through the store internals — enforced at store layer), competency
// framework, and CPD push-through. localStorage-backed.
import { useMemo, useSyncExternalStore } from "react";
import { recordFromSupervision } from "@/lib/cpd-store";

export type Role = "supervisee" | "supervisor";

export type Supervisor = {
  id: string;
  name: string;
  credentials: string;
  city: string;
  focus: string[];
  yearsSupervising: number;
  rateInr: number;
  bio: string;
  accreditations: string[];
  avatarInitials: string;
};

export type Contract = {
  id: string;
  supervisorId: string;
  superviseeName: string; // for demo: self
  startedAt: number;
  endsAt: number;
  cadence: "weekly" | "fortnightly" | "monthly";
  hoursPerMonth: number;
  focus: string;
  fee: string;
  cancellation: string;
  confidentiality: string;
  signedBySupervisee?: { at: number; ipHash: string };
  signedBySupervisor?: { at: number; ipHash: string };
  status: "draft" | "active" | "ended";
  auditTrail: { at: number; who: string; action: string }[];
};

export type CaseTag = {
  patientInitials: string;
  patientId?: string; // link into /patients/$id if present
  focus: string;
};

export type SupervisionSession = {
  id: string;
  contractId: string;
  role: Role; // supervisee = I'm receiving; supervisor = I'm providing
  scheduledAt: number;
  durationMin: number;
  status: "upcoming" | "attended" | "cancelled" | "no_show";
  agenda: string;
  cases: CaseTag[];
  // Shared reflection notes — both parties can see
  sharedNotes: string;
  // PRIVATE partition — only the author can read via getSession(id, requestor)
  privateNotesBySupervisee?: string;
  privateNotesBySupervisor?: string;
  supervisorId: string;
  supervisorName: string;
  hoursForCpd: number; // pushed to cpd on attend
  cpdEntryId?: string;
  createdAt: number;
  updatedAt: number;
};

export type Competency = {
  id: string;
  domain: string; // e.g. "Assessment", "Case formulation"
  descriptor: string;
  level: 0 | 1 | 2 | 3 | 4; // 0 novice → 4 expert
  targetLevel: 1 | 2 | 3 | 4;
  lastReviewedAt: number;
  evidenceRefs: string[]; // session ids
};

const KEY = "peacecode.therapist.supervision.v1";
const AUDIT_KEY = "peacecode.therapist.supervision-audit.v1";
const CLINICIAN = "Dr. Aditi Rao";

const listeners = new Set<() => void>();
let cachedShape: Shape | null = null;
const serverShape = seed();
const emit = () => listeners.forEach((f) => f());
const isBrowser = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

type Shape = {
  supervisors: Supervisor[];
  contracts: Contract[];
  sessions: SupervisionSession[];
  competencies: Competency[];
};

function fakeIpHash() { return "ip-" + Math.random().toString(36).slice(2, 10); }

function seed(): Shape {
  const now = Date.now();
  const D = 24 * 60 * 60 * 1000;
  const supervisors: Supervisor[] = [
    { id: "sv1", name: "Dr. Ramesh Nair", credentials: "PhD, RCI Cat A", city: "Bengaluru", focus: ["Trauma", "CBT", "Third-wave"], yearsSupervising: 18, rateInr: 4500, bio: "18 years of supervisory practice. Trauma-focused CBT and ACT. IAP fellow.", accreditations: ["RCI Cat A", "IAP Fellow", "BABCP Accredited Supervisor"], avatarInitials: "RN" },
    { id: "sv2", name: "Dr. Kavita Malhotra", credentials: "PsyD, IAP Fellow", city: "Delhi", focus: ["Adolescent", "Family systems"], yearsSupervising: 22, rateInr: 5000, bio: "Systemic family therapy supervisor. AAMFT-approved.", accreditations: ["IAP Fellow", "AAMFT Approved Supervisor"], avatarInitials: "KM" },
    { id: "sv3", name: "Dr. Suresh Balan", credentials: "PhD, MRCPsych", city: "Chennai", focus: ["Psychodynamic", "Long-term"], yearsSupervising: 25, rateInr: 5500, bio: "Psychoanalytic + psychodynamic supervision. Training analyst.", accreditations: ["IPA Member", "IAP Life Member"], avatarInitials: "SB" },
  ];
  const c1: Contract = {
    id: "c1", supervisorId: "sv1", superviseeName: CLINICIAN,
    startedAt: now - 180 * D, endsAt: now + 185 * D, cadence: "fortnightly", hoursPerMonth: 4,
    focus: "Trauma cases, ethical dilemmas, ongoing CBT refinement.",
    fee: "₹4,500 per 60 min session, invoiced monthly.",
    cancellation: "48 hours notice required. Late cancellations charged in full.",
    confidentiality: "All shared content confidential. Supervisor may keep private supervisory notes not accessible to supervisee. Supervisee may keep private reflection notes not accessible to supervisor.",
    signedBySupervisee: { at: now - 180 * D, ipHash: fakeIpHash() },
    signedBySupervisor: { at: now - 179 * D, ipHash: fakeIpHash() },
    status: "active",
    auditTrail: [
      { at: now - 181 * D, who: CLINICIAN, action: "contract drafted" },
      { at: now - 180 * D, who: CLINICIAN, action: "supervisee signature captured" },
      { at: now - 179 * D, who: "Dr. Ramesh Nair", action: "supervisor countersigned" },
      { at: now - 179 * D, who: "system", action: "contract activated" },
    ],
  };
  const sessions: SupervisionSession[] = [
    {
      id: "s1", contractId: "c1", role: "supervisee", scheduledAt: now + 5 * D, durationMin: 60, status: "upcoming",
      agenda: "Discuss stalled trauma protocol with patient S.M. Bring supervisor question about EMDR readiness criteria.",
      cases: [{ patientInitials: "S.M.", focus: "Complex trauma — EMDR readiness" }],
      sharedNotes: "",
      supervisorId: "sv1", supervisorName: "Dr. Ramesh Nair", hoursForCpd: 1, createdAt: now - 3 * D, updatedAt: now - 3 * D,
    },
    {
      id: "s2", contractId: "c1", role: "supervisee", scheduledAt: now - 10 * D, durationMin: 60, status: "attended",
      agenda: "Case formulation review — 3 anxiety patients.",
      cases: [{ patientInitials: "R.K.", focus: "GAD case conceptualisation" }, { patientInitials: "P.J.", focus: "Panic disorder — safety behaviours" }],
      sharedNotes: "Reviewed 3 formulations. Ramesh flagged that P.J.'s panic map missed cardiac catastrophic misinterpretation loop. Agreed to revise and share back next session. R.K. tracking well.",
      privateNotesBySupervisee: "I felt defensive during the P.J. discussion. Notice a pattern of feeling exposed when case conceptualisations are challenged. Bring to personal therapy.",
      privateNotesBySupervisor: "[Supervisor's private notes — not visible]",
      supervisorId: "sv1", supervisorName: "Dr. Ramesh Nair", hoursForCpd: 1, cpdEntryId: undefined, createdAt: now - 15 * D, updatedAt: now - 10 * D,
    },
    {
      id: "s3", contractId: "c1", role: "supervisee", scheduledAt: now - 24 * D, durationMin: 60, status: "attended",
      agenda: "Ethics: client requesting session recording.",
      cases: [{ patientInitials: "M.T.", focus: "Consent + recordings" }],
      sharedNotes: "Discussed addendum-based approach. Ramesh shared his template. Agreed I'd adapt and post to peer network for wider feedback.",
      supervisorId: "sv1", supervisorName: "Dr. Ramesh Nair", hoursForCpd: 1, createdAt: now - 28 * D, updatedAt: now - 24 * D,
    },
    {
      id: "s4", contractId: "c1", role: "supervisee", scheduledAt: now - 40 * D, durationMin: 60, status: "attended",
      agenda: "Practice review — caseload composition + burnout risk.",
      cases: [],
      sharedNotes: "Discussed caseload of 32 active patients. Ramesh recommended cap at 28 given trauma load. Agreed to phase down 4 over next 3 months and add supervision hours from monthly to fortnightly.",
      privateNotesBySupervisee: "Feel relieved. Have been holding this for months.",
      supervisorId: "sv1", supervisorName: "Dr. Ramesh Nair", hoursForCpd: 1, createdAt: now - 45 * D, updatedAt: now - 40 * D,
    },
    {
      id: "s5", contractId: "c1", role: "supervisee", scheduledAt: now - 55 * D, durationMin: 60, status: "attended",
      agenda: "Group therapy setup — 8-week anxiety cohort.",
      cases: [],
      sharedNotes: "Reviewed protocol. Ramesh suggested pre-group individual screening to reduce dropout. Adopted.",
      supervisorId: "sv1", supervisorName: "Dr. Ramesh Nair", hoursForCpd: 1, createdAt: now - 60 * D, updatedAt: now - 55 * D,
    },
  ];
  const competencies: Competency[] = [
    { id: "cp1", domain: "Assessment", descriptor: "Structured clinical interview, differential diagnosis, risk assessment", level: 3, targetLevel: 4, lastReviewedAt: now - 40 * D, evidenceRefs: ["s2"] },
    { id: "cp2", domain: "Case formulation", descriptor: "Integrative CBT-based conceptualisation across presenting complaints", level: 3, targetLevel: 4, lastReviewedAt: now - 10 * D, evidenceRefs: ["s2", "s3"] },
    { id: "cp3", domain: "Intervention", descriptor: "Evidence-based intervention delivery — CBT, EMDR, ACT", level: 3, targetLevel: 4, lastReviewedAt: now - 10 * D, evidenceRefs: ["s1"] },
    { id: "cp4", domain: "Ethics & professional practice", descriptor: "Ethical decision-making, boundary maintenance, informed consent", level: 4, targetLevel: 4, lastReviewedAt: now - 24 * D, evidenceRefs: ["s3"] },
    { id: "cp5", domain: "Reflective practice", descriptor: "Use of supervision, self-awareness, personal therapy", level: 3, targetLevel: 4, lastReviewedAt: now - 40 * D, evidenceRefs: ["s4"] },
    { id: "cp6", domain: "Cultural humility", descriptor: "Awareness of cultural, social and identity factors in therapy", level: 2, targetLevel: 3, lastReviewedAt: now - 60 * D, evidenceRefs: [] },
    { id: "cp7", domain: "Research literacy", descriptor: "Critical appraisal of clinical research literature", level: 3, targetLevel: 3, lastReviewedAt: now - 55 * D, evidenceRefs: [] },
  ];
  return { supervisors, contracts: [c1], sessions, competencies };
}

function readAll(): Shape {
  if (!isBrowser()) return serverShape;
  if (cachedShape) return cachedShape;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      cachedShape = JSON.parse(raw) as Shape;
      return cachedShape;
    }
    const s = seed();
    window.localStorage.setItem(KEY, JSON.stringify(s));
    cachedShape = s;
    return s;
  } catch {
    cachedShape = seed();
    return cachedShape;
  }
}
function writeAll(s: Shape) {
  cachedShape = s;
  if (!isBrowser()) return;
  window.localStorage.setItem(KEY, JSON.stringify(s));
  emit();
}
function subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }
function audit(action: string, ref: string, who = CLINICIAN) {
  if (!isBrowser()) return;
  try {
    const raw = window.localStorage.getItem(AUDIT_KEY);
    const list: { id: string; at: number; who: string; action: string; ref: string }[] = raw ? JSON.parse(raw) : [];
    list.push({ id: `sva-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`, at: Date.now(), who, action, ref });
    window.localStorage.setItem(AUDIT_KEY, JSON.stringify(list.slice(-5000)));
  } catch { /* ignore */ }
}

// ── Public API
export function listSupervisors() { return readAll().supervisors.slice(); }
export function getSupervisor(id: string) { return readAll().supervisors.find((s) => s.id === id); }

export function listContracts() { return readAll().contracts.slice().sort((a, b) => b.startedAt - a.startedAt); }
export function getContract(id: string) { return readAll().contracts.find((c) => c.id === id); }

export function listSessions() { return readAll().sessions.slice().sort((a, b) => b.scheduledAt - a.scheduledAt); }

/**
 * Session accessor with PRIVATE PARTITION enforcement.
 * Requestor may be "supervisee" (self) or "supervisor". Whichever the
 * requestor is, the OTHER party's private notes are stripped before
 * returning — even a supervisor cannot query the supervisee's private
 * notes through this API. Enforced at the store layer, not the UI.
 */
export function getSession(id: string, requestor: Role = "supervisee"): SupervisionSession | undefined {
  const raw = readAll().sessions.find((s) => s.id === id);
  if (!raw) return undefined;
  const copy: SupervisionSession = { ...raw };
  if (requestor === "supervisor") {
    delete copy.privateNotesBySupervisee;
  } else {
    delete copy.privateNotesBySupervisor;
  }
  return copy;
}

export function listCompetencies() { return readAll().competencies.slice().sort((a, b) => a.domain.localeCompare(b.domain)); }

// ── Mutations
export function createContract(input: Omit<Contract, "id" | "auditTrail" | "signedBySupervisee" | "signedBySupervisor">): Contract {
  const s = readAll();
  const c: Contract = { ...input, id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`, auditTrail: [{ at: Date.now(), who: CLINICIAN, action: "contract drafted" }] };
  s.contracts.unshift(c);
  writeAll(s);
  audit("contract.create", c.id);
  return c;
}
export function signContract(id: string, as: Role) {
  const s = readAll();
  const c = s.contracts.find((x) => x.id === id);
  if (!c) return;
  const sig = { at: Date.now(), ipHash: fakeIpHash() };
  if (as === "supervisee") {
    c.signedBySupervisee = sig;
    c.auditTrail.push({ at: Date.now(), who: CLINICIAN, action: "supervisee signature captured" });
  } else {
    c.signedBySupervisor = sig;
    c.auditTrail.push({ at: Date.now(), who: "supervisor", action: "supervisor countersigned" });
  }
  if (c.signedBySupervisee && c.signedBySupervisor && c.status === "draft") {
    c.status = "active";
    c.auditTrail.push({ at: Date.now(), who: "system", action: "contract activated" });
  }
  writeAll(s);
  audit("contract.sign", id, as);
}
export function endContract(id: string) {
  const s = readAll();
  const c = s.contracts.find((x) => x.id === id);
  if (!c) return;
  c.status = "ended";
  c.auditTrail.push({ at: Date.now(), who: CLINICIAN, action: "contract ended" });
  writeAll(s);
  audit("contract.end", id);
}

export function createSession(input: Omit<SupervisionSession, "id" | "createdAt" | "updatedAt">): SupervisionSession {
  const s = readAll();
  const now = Date.now();
  const sess: SupervisionSession = { ...input, id: `s-${now}-${Math.random().toString(36).slice(2, 5)}`, createdAt: now, updatedAt: now };
  s.sessions.unshift(sess);
  writeAll(s);
  audit("session.create", sess.id);
  return sess;
}
export function updateSession(id: string, patch: Partial<SupervisionSession>) {
  const s = readAll();
  const sess = s.sessions.find((x) => x.id === id);
  if (!sess) return;
  Object.assign(sess, patch);
  sess.updatedAt = Date.now();
  writeAll(s);
  audit("session.update", id);
}

/**
 * Mark a session attended AND push it into CPD as a verified entry.
 */
export function markAttended(id: string) {
  const s = readAll();
  const sess = s.sessions.find((x) => x.id === id);
  if (!sess) return;
  sess.status = "attended";
  sess.updatedAt = Date.now();
  if (!sess.cpdEntryId && sess.hoursForCpd > 0) {
    const cpd = recordFromSupervision({
      title: `Supervision — ${sess.supervisorName}`,
      provider: sess.supervisorName,
      hours: sess.hoursForCpd,
      endAt: sess.scheduledAt + sess.durationMin * 60 * 1000,
      category: "supervision",
      sourceRef: sess.id,
    });
    if (cpd) sess.cpdEntryId = cpd.id;
  }
  writeAll(s);
  audit("session.attended", id);
}

export function updateCompetency(id: string, patch: Partial<Competency>) {
  const s = readAll();
  const c = s.competencies.find((x) => x.id === id);
  if (!c) return;
  Object.assign(c, patch);
  c.lastReviewedAt = Date.now();
  writeAll(s);
  audit("competency.update", id);
}

// ── Hooks
function useShapeSlice<T>(select: (s: Shape) => T): T {
  const shape = useSyncExternalStore(subscribe, readAll, () => serverShape);
  return useMemo(() => select(shape), [shape, select]);
}
export function useSupervisors() { return useShapeSlice((s) => s.supervisors.slice()); }
export function useContracts() { return useShapeSlice((s) => s.contracts.slice().sort((a, b) => b.startedAt - a.startedAt)); }
export function useSessions() { return useShapeSlice((s) => s.sessions.slice().sort((a, b) => b.scheduledAt - a.scheduledAt)); }
export function useCompetencies() { return useShapeSlice((s) => s.competencies.slice().sort((a, b) => a.domain.localeCompare(b.domain))); }

// ── Derived
export function totalHoursThisYear(): number {
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1).getTime();
  return readAll().sessions
    .filter((s) => s.status === "attended" && s.scheduledAt >= yearStart)
    .reduce((sum, s) => sum + s.hoursForCpd, 0);
}

export function nextSession(): SupervisionSession | undefined {
  const now = Date.now();
  return readAll().sessions
    .filter((s) => s.status === "upcoming" && s.scheduledAt >= now)
    .sort((a, b) => a.scheduledAt - b.scheduledAt)[0];
}
