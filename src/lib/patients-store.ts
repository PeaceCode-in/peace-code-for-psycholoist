// PeaceCode · Practice — Patients store.
// localStorage-backed with a tiny event bus for live re-renders.
// Seeds 12 realistic Indian college patients on first read.

import { useEffect, useState, useSyncExternalStore } from "react";

// ─── Types ───────────────────────────────────────────────────
export type RiskLevel = "stable" | "monitor" | "elevated" | "crisis";
export type PatientStatus = "active" | "waitlist" | "paused" | "discharged";
export type Pronouns = "she/her" | "he/him" | "they/them" | "other";
export type Modality = "video" | "audio" | "in-person" | "chat";

export type Patient = {
  id: string;
  fullName: string;
  preferredName?: string;
  pronouns: Pronouns;
  age: number;
  email: string;
  phone?: string;
  college: string;
  yearOfStudy: string;
  status: PatientStatus;
  risk: RiskLevel;
  primaryConcern: string;
  tags: string[];
  intakeDate: number;
  lastSessionAt?: number;
  nextSessionAt?: number;
  totalSessions: number;
  assignedTherapistId: string;
  emergencyContact?: { name: string; phone: string; relation: string };
  consentSharing: boolean;
  createdAt: number;
  updatedAt: number;
};

export type SessionNote = {
  id: string;
  patientId: string;
  sessionDate: number;
  duration: number;
  modality: Modality;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  moodBefore?: number;
  moodAfter?: number;
  riskFlagged: boolean;
  privateToTherapist: boolean;
  createdAt: number;
  updatedAt: number;
};

export type TimelineKind =
  | "session" | "note" | "assessment" | "message" | "document" | "risk-change" | "status-change" | "homework";

export type TimelineEvent = {
  id: string;
  patientId: string;
  at: number;
  kind: TimelineKind;
  title: string;
  summary?: string;
  meta?: Record<string, unknown>;
};

export type MoodDataPoint = { at: number; value: number; source: "self-report" | "session" | "assessment" };

export type RiskChange = { id: string; patientId: string; at: number; from: RiskLevel; to: RiskLevel; reason?: string };

export type PatientDocument = {
  id: string;
  patientId: string;
  name: string;
  kind: "intake" | "consent" | "letter" | "report" | "other";
  sizeKB: number;
  uploadedAt: number;
  sharedWith: string[];
};

type StoreShape = {
  patients: Patient[];
  notes: SessionNote[];
  events: TimelineEvent[];
  riskChanges: RiskChange[];
  documents: PatientDocument[];
};

const KEY = "peacecode.therapist.patients.v1";

// ─── Event bus ───────────────────────────────────────────────
const listeners = new Set<() => void>();
function emit() { listeners.forEach((fn) => fn()); }
function subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }

// ─── Storage ─────────────────────────────────────────────────
function isBrowser() { return typeof window !== "undefined" && typeof localStorage !== "undefined"; }

function load(): StoreShape {
  if (!isBrowser()) return seed();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const s = seed();
      localStorage.setItem(KEY, JSON.stringify(s));
      return s;
    }
    return JSON.parse(raw) as StoreShape;
  } catch {
    return seed();
  }
}

function save(s: StoreShape) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
    emit();
  } catch { /* quota */ }
}

let cache: StoreShape | null = null;
function state(): StoreShape {
  if (!cache) cache = load();
  return cache;
}
function mutate(fn: (s: StoreShape) => StoreShape) {
  cache = fn(state());
  save(cache);
}

// ─── ID ──────────────────────────────────────────────────────
function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}

// ─── Helpers ─────────────────────────────────────────────────
const DAY = 86_400_000;

export function listPatients(filter?: { status?: PatientStatus | "all"; risk?: RiskLevel | "all"; search?: string; tag?: string }): Patient[] {
  const s = state();
  let out = [...s.patients];
  if (filter?.status && filter.status !== "all") out = out.filter((p) => p.status === filter.status);
  if (filter?.risk && filter.risk !== "all") out = out.filter((p) => p.risk === filter.risk);
  if (filter?.tag) out = out.filter((p) => p.tags.includes(filter.tag!));
  if (filter?.search) {
    const q = filter.search.toLowerCase().trim();
    if (q) out = out.filter((p) =>
      p.fullName.toLowerCase().includes(q) ||
      (p.preferredName?.toLowerCase().includes(q) ?? false) ||
      p.email.toLowerCase().includes(q) ||
      p.primaryConcern.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
  return out.sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getPatient(id: string): Patient | undefined {
  return state().patients.find((p) => p.id === id);
}

export function createPatient(input: Omit<Patient, "id" | "createdAt" | "updatedAt" | "totalSessions" | "assignedTherapistId"> & { assignedTherapistId?: string }): Patient {
  const now = Date.now();
  const patient: Patient = {
    ...input,
    id: uid("pat"),
    assignedTherapistId: input.assignedTherapistId ?? "me",
    totalSessions: 0,
    createdAt: now,
    updatedAt: now,
  };
  mutate((s) => ({
    ...s,
    patients: [patient, ...s.patients],
    events: [{ id: uid("ev"), patientId: patient.id, at: now, kind: "status-change", title: "Patient added", summary: `Intake on ${new Date(now).toLocaleDateString()}` }, ...s.events],
  }));
  return patient;
}

export function updatePatient(id: string, patch: Partial<Patient>): Patient | undefined {
  let updated: Patient | undefined;
  mutate((s) => {
    const patients = s.patients.map((p) => {
      if (p.id !== id) return p;
      updated = { ...p, ...patch, updatedAt: Date.now() };
      return updated;
    });
    let events = s.events;
    let riskChanges = s.riskChanges;
    if (patch.risk && updated && updated.risk !== s.patients.find((p) => p.id === id)?.risk) {
      const prev = s.patients.find((p) => p.id === id)!.risk;
      const rc: RiskChange = { id: uid("rc"), patientId: id, at: Date.now(), from: prev, to: patch.risk, reason: (patch as { riskReason?: string }).riskReason };
      riskChanges = [rc, ...s.riskChanges];
      events = [{ id: uid("ev"), patientId: id, at: rc.at, kind: "risk-change", title: `Risk ${prev} → ${patch.risk}`, summary: rc.reason }, ...s.events];
    }
    if (patch.status && updated && updated.status !== s.patients.find((p) => p.id === id)?.status) {
      const prev = s.patients.find((p) => p.id === id)!.status;
      events = [{ id: uid("ev"), patientId: id, at: Date.now(), kind: "status-change", title: `Status ${prev} → ${patch.status}` }, ...events];
    }
    return { ...s, patients, events, riskChanges };
  });
  return updated;
}

export function dischargePatient(id: string, reason?: string): void {
  updatePatient(id, { status: "discharged" });
  mutate((s) => ({
    ...s,
    events: [{ id: uid("ev"), patientId: id, at: Date.now(), kind: "status-change", title: "Discharged", summary: reason }, ...s.events],
  }));
}

// Notes
export function listNotes(patientId: string): SessionNote[] {
  return state().notes.filter((n) => n.patientId === patientId).sort((a, b) => b.sessionDate - a.sessionDate);
}
export function getNote(noteId: string): SessionNote | undefined {
  return state().notes.find((n) => n.id === noteId);
}
export function createNote(input: Omit<SessionNote, "id" | "createdAt" | "updatedAt">): SessionNote {
  const now = Date.now();
  const note: SessionNote = { ...input, id: uid("note"), createdAt: now, updatedAt: now };
  mutate((s) => {
    const patients = s.patients.map((p) => p.id === input.patientId
      ? { ...p, lastSessionAt: Math.max(p.lastSessionAt ?? 0, note.sessionDate), totalSessions: p.totalSessions + 1, updatedAt: now }
      : p);
    const events: TimelineEvent[] = [
      { id: uid("ev"), patientId: note.patientId, at: note.sessionDate, kind: "session", title: `${note.modality} session · ${note.duration}m`, summary: note.assessment.slice(0, 140) },
      { id: uid("ev"), patientId: note.patientId, at: now, kind: "note", title: "SOAP note added", summary: note.assessment.slice(0, 140), meta: { noteId: note.id } },
      ...s.events,
    ];
    return { ...s, notes: [note, ...s.notes], patients, events };
  });
  return note;
}
export function updateNote(id: string, patch: Partial<SessionNote>): SessionNote | undefined {
  let updated: SessionNote | undefined;
  mutate((s) => {
    const notes = s.notes.map((n) => n.id === id ? (updated = { ...n, ...patch, updatedAt: Date.now() }) : n);
    return { ...s, notes };
  });
  return updated;
}
export function deleteNote(id: string): void {
  mutate((s) => ({
    ...s,
    notes: s.notes.filter((n) => n.id !== id),
    events: s.events.filter((e) => (e.meta as { noteId?: string } | undefined)?.noteId !== id),
  }));
}

// Timeline
export function listTimeline(patientId: string, limit?: number): TimelineEvent[] {
  const out = state().events.filter((e) => e.patientId === patientId).sort((a, b) => b.at - a.at);
  return limit ? out.slice(0, limit) : out;
}

// Mood
export function getMoodSeries(patientId: string, days = 90): MoodDataPoint[] {
  const cutoff = Date.now() - days * DAY;
  const notes = state().notes.filter((n) => n.patientId === patientId && n.sessionDate >= cutoff);
  const out: MoodDataPoint[] = [];
  notes.forEach((n) => {
    if (typeof n.moodBefore === "number") out.push({ at: n.sessionDate, value: n.moodBefore, source: "session" });
    if (typeof n.moodAfter === "number") out.push({ at: n.sessionDate + 30 * 60_000, value: n.moodAfter, source: "session" });
  });
  return out.sort((a, b) => a.at - b.at);
}

// Documents
export function listDocuments(patientId: string): PatientDocument[] {
  return state().documents.filter((d) => d.patientId === patientId).sort((a, b) => b.uploadedAt - a.uploadedAt);
}
export function addDocument(input: Omit<PatientDocument, "id" | "uploadedAt">): PatientDocument {
  const doc: PatientDocument = { ...input, id: uid("doc"), uploadedAt: Date.now() };
  mutate((s) => ({
    ...s,
    documents: [doc, ...s.documents],
    events: [{ id: uid("ev"), patientId: doc.patientId, at: doc.uploadedAt, kind: "document", title: `Document uploaded · ${doc.name}` }, ...s.events],
  }));
  return doc;
}

// Risk changes
export function listRiskChanges(patientId: string): RiskChange[] {
  return state().riskChanges.filter((r) => r.patientId === patientId).sort((a, b) => b.at - a.at);
}

// Stats
export function patientStats() {
  const s = state();
  const total = s.patients.length;
  const active = s.patients.filter((p) => p.status === "active").length;
  const waitlist = s.patients.filter((p) => p.status === "waitlist").length;
  const elevatedRisk = s.patients.filter((p) => p.risk === "elevated" || p.risk === "crisis").length;
  const totalSessions = s.patients.reduce((sum, p) => sum + p.totalSessions, 0);
  const avgSessionsPerPatient = total > 0 ? Math.round((totalSessions / total) * 10) / 10 : 0;
  const monthAgo = Date.now() - 30 * DAY;
  const newThisMonth = s.patients.filter((p) => p.createdAt >= monthAgo).length;
  return { total, active, waitlist, elevatedRisk, avgSessionsPerPatient, newThisMonth };
}

// ─── Hooks ───────────────────────────────────────────────────
export function useLivePatients(filter?: Parameters<typeof listPatients>[0]): Patient[] {
  const filterKey = JSON.stringify(filter ?? {});
  return useSyncExternalStore(
    subscribe,
    () => {
      // return a stable-ish snapshot for the current filter
      const [snap, key] = snapCache;
      if (key === filterKey && snap) return snap;
      const next = listPatients(filter);
      snapCache = [next, filterKey];
      return next;
    },
    () => listPatients(filter),
  );
}
let snapCache: [Patient[] | null, string] = [null, ""];

export function useLivePatient(id: string): Patient | undefined {
  const [p, setP] = useState<Patient | undefined>(() => getPatient(id));
  useEffect(() => {
    setP(getPatient(id));
    return subscribe(() => setP(getPatient(id)));
  }, [id]);
  return p;
}

export function useLiveNotes(patientId: string): SessionNote[] {
  const [n, setN] = useState<SessionNote[]>(() => listNotes(patientId));
  useEffect(() => {
    setN(listNotes(patientId));
    return subscribe(() => setN(listNotes(patientId)));
  }, [patientId]);
  return n;
}

export function useLiveTimeline(patientId: string): TimelineEvent[] {
  const [t, setT] = useState<TimelineEvent[]>(() => listTimeline(patientId));
  useEffect(() => {
    setT(listTimeline(patientId));
    return subscribe(() => setT(listTimeline(patientId)));
  }, [patientId]);
  return t;
}

export function useLiveDocuments(patientId: string): PatientDocument[] {
  const [d, setD] = useState<PatientDocument[]>(() => listDocuments(patientId));
  useEffect(() => {
    setD(listDocuments(patientId));
    return subscribe(() => setD(listDocuments(patientId)));
  }, [patientId]);
  return d;
}

// Avatar helper — shared with dashboard
export function avatarUrl(seed: string): string {
  return `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=f6f1f2,efe4f0,f1c7d6,fbf7f8&radius=50`;
}

// Risk metadata for consistent chrome
export const RISK_META: Record<RiskLevel, { label: string; token: string; softToken: string }> = {
  stable:   { label: "Stable",   token: "var(--pc-risk-stable)",   softToken: "var(--pc-risk-stable-soft)" },
  monitor:  { label: "Monitor",  token: "var(--pc-risk-monitor)",  softToken: "var(--pc-risk-monitor-soft)" },
  elevated: { label: "Elevated", token: "var(--pc-risk-elevated)", softToken: "var(--pc-risk-elevated-soft)" },
  crisis:   { label: "Crisis",   token: "var(--pc-risk-crisis)",   softToken: "var(--pc-risk-crisis-soft)" },
};

export const STATUS_META: Record<PatientStatus, { label: string; token: string }> = {
  active:     { label: "Active",     token: "var(--pc-status-active)" },
  waitlist:   { label: "Waitlist",   token: "var(--pc-status-waitlist)" },
  paused:     { label: "Paused",     token: "var(--pc-status-paused)" },
  discharged: { label: "Discharged", token: "var(--pc-status-discharged)" },
};

// ─── Seed ────────────────────────────────────────────────────
function seed(): StoreShape {
  const now = Date.now();
  const iso = (offsetDays: number) => now + offsetDays * DAY;

  const patients: Patient[] = [
    { id: "pat_priya", fullName: "Priya Iyer", preferredName: "Pri", pronouns: "she/her", age: 21, email: "priya.iyer@iitb.ac.in", phone: "+91 98200 12345", college: "IIT Bombay", yearOfStudy: "3rd Year B.Tech (Chemical)", status: "active", risk: "elevated", primaryConcern: "Recurrent depressive episodes, academic pressure", tags: ["depression", "exam-stress", "sleep"], intakeDate: iso(-120), lastSessionAt: iso(-3), nextSessionAt: iso(4), totalSessions: 14, assignedTherapistId: "me", emergencyContact: { name: "Lakshmi Iyer", phone: "+91 99400 23456", relation: "mother" }, consentSharing: true, createdAt: iso(-120), updatedAt: iso(-3) },
    { id: "pat_aarav", fullName: "Aarav Mehta", pronouns: "he/him", age: 20, email: "aarav.m@du.ac.in", college: "Delhi University", yearOfStudy: "2nd Year BA Economics", status: "active", risk: "monitor", primaryConcern: "Social anxiety, panic in classroom settings", tags: ["anxiety", "panic", "cbt"], intakeDate: iso(-95), lastSessionAt: iso(-6), nextSessionAt: iso(8), totalSessions: 11, assignedTherapistId: "me", emergencyContact: { name: "Ritu Mehta", phone: "+91 98100 45678", relation: "sister" }, consentSharing: false, createdAt: iso(-95), updatedAt: iso(-6) },
    { id: "pat_ananya", fullName: "Ananya Reddy", pronouns: "she/her", age: 22, email: "ananya.reddy@bits-pilani.ac.in", college: "BITS Pilani", yearOfStudy: "4th Year M.Sc. Biology", status: "active", risk: "stable", primaryConcern: "Career direction anxiety, imposter feelings", tags: ["career", "self-esteem"], intakeDate: iso(-180), lastSessionAt: iso(-10), nextSessionAt: iso(11), totalSessions: 20, assignedTherapistId: "me", consentSharing: true, createdAt: iso(-180), updatedAt: iso(-10) },
    { id: "pat_kabir", fullName: "Kabir Shah", pronouns: "he/him", age: 19, email: "kabir.shah@manipal.edu", college: "Manipal Institute", yearOfStudy: "1st Year B.Tech (CSE)", status: "active", risk: "monitor", primaryConcern: "Homesickness, roommate conflict, low mood", tags: ["adjustment", "family"], intakeDate: iso(-45), lastSessionAt: iso(-2), nextSessionAt: iso(5), totalSessions: 6, assignedTherapistId: "me", emergencyContact: { name: "Nikhil Shah", phone: "+91 98333 11223", relation: "father" }, consentSharing: false, createdAt: iso(-45), updatedAt: iso(-2) },
    { id: "pat_diya", fullName: "Diya Krishnan", pronouns: "she/her", age: 23, email: "diya.k@christuniversity.in", college: "Christ University", yearOfStudy: "MA Psychology, 2nd Year", status: "active", risk: "stable", primaryConcern: "Relationship breakup, ruminative thinking", tags: ["relationship", "grief"], intakeDate: iso(-60), lastSessionAt: iso(-4), nextSessionAt: iso(10), totalSessions: 8, assignedTherapistId: "me", consentSharing: true, createdAt: iso(-60), updatedAt: iso(-4) },
    { id: "pat_rohan", fullName: "Rohan Bhatia", preferredName: "Ro", pronouns: "he/him", age: 24, email: "rohan.b@iitb.ac.in", college: "IIT Bombay", yearOfStudy: "M.Tech 2nd Year (Mechanical)", status: "active", risk: "crisis", primaryConcern: "Recent SI ideation, thesis crisis, family conflict", tags: ["risk", "SI", "priority"], intakeDate: iso(-30), lastSessionAt: iso(-1), nextSessionAt: iso(2), totalSessions: 5, assignedTherapistId: "me", emergencyContact: { name: "Rakesh Bhatia", phone: "+91 98221 55667", relation: "father" }, consentSharing: true, createdAt: iso(-30), updatedAt: iso(-1) },
    { id: "pat_meera", fullName: "Meera Nambiar", pronouns: "she/her", age: 21, email: "meera.n@du.ac.in", college: "Delhi University", yearOfStudy: "3rd Year B.Com (Hons)", status: "active", risk: "stable", primaryConcern: "Perfectionism, procrastination cycle", tags: ["perfectionism", "productivity"], intakeDate: iso(-75), lastSessionAt: iso(-7), nextSessionAt: iso(14), totalSessions: 9, assignedTherapistId: "me", consentSharing: false, createdAt: iso(-75), updatedAt: iso(-7) },
    { id: "pat_sanjay", fullName: "Sanjay Verma", pronouns: "he/him", age: 20, email: "sanjay.v@bits-pilani.ac.in", college: "BITS Pilani", yearOfStudy: "2nd Year B.E. (EEE)", status: "active", risk: "elevated", primaryConcern: "Panic attacks, sleep disruption, exam-related", tags: ["panic", "sleep", "exam-stress"], intakeDate: iso(-50), lastSessionAt: iso(-5), nextSessionAt: iso(3), totalSessions: 7, assignedTherapistId: "me", emergencyContact: { name: "Anita Verma", phone: "+91 99999 78901", relation: "mother" }, consentSharing: true, createdAt: iso(-50), updatedAt: iso(-5) },
    { id: "pat_isha", fullName: "Isha Kapoor", pronouns: "she/her", age: 22, email: "isha.k@manipal.edu", college: "Manipal Institute", yearOfStudy: "3rd Year MBBS", status: "active", risk: "monitor", primaryConcern: "Burnout, compassion fatigue in clinical rotations", tags: ["burnout", "medical"], intakeDate: iso(-90), lastSessionAt: iso(-8), nextSessionAt: iso(6), totalSessions: 10, assignedTherapistId: "me", consentSharing: true, createdAt: iso(-90), updatedAt: iso(-8) },
    { id: "pat_vikram", fullName: "Vikram Singh", pronouns: "he/him", age: 25, email: "vikram.s@christuniversity.in", college: "Christ University", yearOfStudy: "MBA 1st Year", status: "active", risk: "stable", primaryConcern: "OCD — checking behaviours, mild severity", tags: ["OCD", "ERP"], intakeDate: iso(-140), lastSessionAt: iso(-9), nextSessionAt: iso(12), totalSessions: 15, assignedTherapistId: "me", consentSharing: false, createdAt: iso(-140), updatedAt: iso(-9) },
    { id: "pat_zara", fullName: "Zara Faruqi", pronouns: "she/her", age: 19, email: "zara.f@du.ac.in", college: "Delhi University", yearOfStudy: "1st Year B.A. English", status: "waitlist", risk: "monitor", primaryConcern: "New intake — reported low mood + isolation", tags: ["intake"], intakeDate: iso(-4), totalSessions: 0, assignedTherapistId: "me", consentSharing: false, createdAt: iso(-4), updatedAt: iso(-4) },
    { id: "pat_arjun", fullName: "Arjun Menon", pronouns: "he/him", age: 26, email: "arjun.m@iitb.ac.in", college: "IIT Bombay", yearOfStudy: "PhD, 3rd Year", status: "discharged", risk: "stable", primaryConcern: "Completed 6-month CBT protocol", tags: ["completed", "cbt"], intakeDate: iso(-220), lastSessionAt: iso(-14), totalSessions: 18, assignedTherapistId: "me", consentSharing: true, createdAt: iso(-220), updatedAt: iso(-14) },
  ];

  // Generate 3–5 SOAP notes per active patient
  const notes: SessionNote[] = [];
  const events: TimelineEvent[] = [];
  const clinicalTemplates: Array<{ s: string; o: string; a: string; p: string; mb: number; ma: number; risk?: boolean }> = [
    { s: "Client reports sleep improved to 6h/night from 4h. Still describes morning dread but says 'the afternoons are workable'.", o: "Affect brighter than intake. Speech normal rate. Eye contact intermittent. PHQ-9 = 14.", a: "Moderate depressive symptoms, showing partial response to behavioural activation. Continued monitoring of SI required.", p: "Continue BA log daily. Add pleasant-activity scheduling. Screen SI next session. Homework: 3 activities before Friday.", mb: 3, ma: 6 },
    { s: "'I got through the presentation without panicking — I actually think I did well.' Reports first sustained anxiety-free hour in weeks.", o: "Marked shift in posture and tone. Engaged, laughed twice. GAD-7 = 9.", a: "Substantial gains in exposure work. Anxiety response to academic performance normalising.", p: "Introduce interoceptive exposure. Reduce session frequency to bi-weekly on client's request. Continue thought record.", mb: 5, ma: 8 },
    { s: "Reports argument with roommate escalated to shouting on Tuesday. 'I don't know if I can stay here another semester.'", o: "Tearful for 15 min mid-session. Ruminative speech pattern returned. PHQ-9 = 17.", a: "Adjustment disorder with mixed anxiety/depressed mood, worsened by environmental stressor.", p: "Problem-solving therapy focus next session. Signpost campus housing mediation service. Increase to weekly. Safety plan reviewed — negative for SI.", mb: 2, ma: 4 },
    { s: "Session focused on values clarification. Client identified 'creative work' and 'close friendships' as top values.", o: "Engaged throughout. Insight good. Homework from last week completed thoroughly.", a: "ACT work progressing well. Ready to move to committed action phase.", p: "Committed action: 1 creative project per week + 2 friend contacts. Values compass card given.", mb: 6, ma: 8 },
    { s: "'The intrusive thoughts about contamination came back this week — I washed hands 40 times on Tuesday.'", o: "Slight regression noted. Client insightful about trigger (family visit). Y-BOCS = 18.", a: "Mild OCD flare in response to identifiable stressor. Not indicative of overall protocol failure.", p: "ERP hierarchy step 4 re-introduced. Response prevention emphasised. Next session in 5 days rather than 7.", mb: 4, ma: 5 },
  ];

  patients.filter((p) => p.status === "active").forEach((p, idx) => {
    const count = 3 + (idx % 3);
    for (let i = 0; i < count; i++) {
      const daysAgo = 7 + i * 10 + (idx % 5);
      const template = clinicalTemplates[(i + idx) % clinicalTemplates.length];
      const note: SessionNote = {
        id: uid("note"),
        patientId: p.id,
        sessionDate: iso(-daysAgo),
        duration: 50,
        modality: i % 3 === 0 ? "in-person" : "video",
        subjective: template.s,
        objective: template.o,
        assessment: template.a,
        plan: template.p,
        moodBefore: template.mb,
        moodAfter: template.ma,
        riskFlagged: p.risk === "crisis" && i === 0,
        privateToTherapist: false,
        createdAt: iso(-daysAgo),
        updatedAt: iso(-daysAgo),
      };
      notes.push(note);
      events.push({ id: uid("ev"), patientId: p.id, at: note.sessionDate, kind: "session", title: `${note.modality} session · ${note.duration}m`, summary: note.assessment.slice(0, 140) });
      events.push({ id: uid("ev"), patientId: p.id, at: note.sessionDate + 3600_000, kind: "note", title: "SOAP note added", summary: note.assessment.slice(0, 140), meta: { noteId: note.id } });
    }
    events.push({ id: uid("ev"), patientId: p.id, at: p.intakeDate, kind: "status-change", title: "Intake completed", summary: `Referred for ${p.primaryConcern.split(",")[0].toLowerCase()}` });
  });

  const riskChanges: RiskChange[] = [
    { id: uid("rc"), patientId: "pat_priya", at: iso(-14), from: "monitor", to: "elevated", reason: "PHQ-9 rose from 14 → 20" },
    { id: uid("rc"), patientId: "pat_rohan", at: iso(-5), from: "elevated", to: "crisis", reason: "SI ideation surfaced in session" },
    { id: uid("rc"), patientId: "pat_sanjay", at: iso(-8), from: "monitor", to: "elevated", reason: "Panic frequency increased to daily" },
    { id: uid("rc"), patientId: "pat_aarav", at: iso(-40), from: "elevated", to: "monitor", reason: "Sustained response to exposure work" },
    { id: uid("rc"), patientId: "pat_arjun", at: iso(-30), from: "monitor", to: "stable", reason: "Protocol complete, gains maintained" },
  ];

  const documents: PatientDocument[] = patients.flatMap((p) => [
    { id: uid("doc"), patientId: p.id, name: "Intake form.pdf", kind: "intake" as const, sizeKB: 142, uploadedAt: p.intakeDate, sharedWith: [] },
    { id: uid("doc"), patientId: p.id, name: "Informed consent — v2.pdf", kind: "consent" as const, sizeKB: 88, uploadedAt: p.intakeDate + DAY, sharedWith: p.consentSharing ? ["college-counsellor"] : [] },
    ...(p.risk === "crisis" || p.risk === "elevated"
      ? [{ id: uid("doc"), patientId: p.id, name: "Safety plan — current.pdf", kind: "report" as const, sizeKB: 76, uploadedAt: iso(-5), sharedWith: ["emergency-contact"] }]
      : []),
  ]);

  return { patients, notes, events, riskChanges, documents };
}

// Draft note helpers (autosave for the composer)
const DRAFT_PREFIX = "peacecode.therapist.patients.draft.";
export function saveDraft(patientId: string, draft: unknown) {
  if (!isBrowser()) return;
  try { localStorage.setItem(DRAFT_PREFIX + patientId, JSON.stringify(draft)); } catch { /* quota */ }
}
export function loadDraft<T = unknown>(patientId: string): T | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(DRAFT_PREFIX + patientId);
    return raw ? JSON.parse(raw) as T : null;
  } catch { return null; }
}
export function clearDraft(patientId: string) {
  if (!isBrowser()) return;
  try { localStorage.removeItem(DRAFT_PREFIX + patientId); } catch { /* ignore */ }
}
