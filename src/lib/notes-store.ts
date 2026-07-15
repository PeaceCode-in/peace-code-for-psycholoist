// PeaceCode · Practice — Notes store.
// Clinical documentation with autosave, sign & lock, amendments,
// version history, and content hashing for tamper detection.
// localStorage-backed with an event bus and snapshot cache.

import { useSyncExternalStore } from "react";
import { listPatients, getPatient } from "@/lib/patients-store";
import { listSessions } from "@/lib/sessions-store";

// ─── Types ───────────────────────────────────────────────────
export type NoteTemplate =
  | "SOAP" | "DAP" | "BIRP" | "Progress"
  | "Intake" | "Termination" | "Case" | "Contact";

export type NoteStatus = "draft" | "signed" | "amended" | "locked";

export type NoteSection = { key: string; label: string; body: string };

export type NoteAmendment = {
  id: string;
  reason: string;
  sections: NoteSection[];
  signedAt: number;
  signedBy: string;
  hash: string;
};

export type NoteVersion = {
  id: string;
  at: number;
  sections: NoteSection[];
};

export type Note = {
  id: string;
  patientId: string;
  sessionId?: string;
  groupId?: string;
  type: NoteTemplate;
  title?: string;
  sections: NoteSection[];
  status: NoteStatus;
  signedAt?: number;
  signedBy?: string;
  amendments: NoteAmendment[];
  versions: NoteVersion[];
  lockedHash?: string;
  createdAt: number;
  updatedAt: number;
};

export type NoteAuditEntry = {
  id: string;
  noteId: string;
  action: "create" | "read" | "update" | "sign" | "amend" | "export";
  at: number;
  by: string;
};

export const TEMPLATE_META: Record<NoteTemplate, { label: string; blurb: string; sections: Array<Pick<NoteSection, "key" | "label">> }> = {
  SOAP: {
    label: "SOAP", blurb: "Subjective · Objective · Assessment · Plan",
    sections: [
      { key: "subjective", label: "Subjective" },
      { key: "objective", label: "Objective" },
      { key: "assessment", label: "Assessment" },
      { key: "plan", label: "Plan" },
    ],
  },
  DAP: {
    label: "DAP", blurb: "Data · Assessment · Plan",
    sections: [
      { key: "data", label: "Data" },
      { key: "assessment", label: "Assessment" },
      { key: "plan", label: "Plan" },
    ],
  },
  BIRP: {
    label: "BIRP", blurb: "Behavior · Intervention · Response · Plan",
    sections: [
      { key: "behavior", label: "Behavior" },
      { key: "intervention", label: "Intervention" },
      { key: "response", label: "Response" },
      { key: "plan", label: "Plan" },
    ],
  },
  Progress: {
    label: "Progress", blurb: "Freeform progress note with structured tags",
    sections: [
      { key: "summary", label: "Summary" },
      { key: "themes", label: "Themes & interventions" },
      { key: "next", label: "Next steps" },
    ],
  },
  Intake: {
    label: "Intake", blurb: "Presenting concern, history, MSE, formulation, plan",
    sections: [
      { key: "presenting", label: "Presenting concern" },
      { key: "history", label: "Relevant history" },
      { key: "mse", label: "Mental status exam" },
      { key: "formulation", label: "Provisional formulation" },
      { key: "plan", label: "Treatment plan" },
    ],
  },
  Termination: {
    label: "Termination", blurb: "Course of treatment, outcomes, referrals, closing",
    sections: [
      { key: "course", label: "Course of treatment" },
      { key: "outcomes", label: "Outcomes & progress" },
      { key: "referrals", label: "Referrals made" },
      { key: "closing", label: "Closing summary" },
    ],
  },
  Case: {
    label: "Case", blurb: "Administrative, non-clinical",
    sections: [
      { key: "note", label: "Case note" },
    ],
  },
  Contact: {
    label: "Contact", blurb: "Brief phone / email touch",
    sections: [
      { key: "channel", label: "Channel & duration" },
      { key: "content", label: "Content of contact" },
    ],
  },
};

const KEY = "peacecode.therapist.notes.v1";
const AUDIT_KEY = "peacecode.therapist.notes-audit.v1";
const CLINICIAN = { name: "Dr. Aditi Rao, PsyD", license: "MP-04421" };

// ─── Bus ─────────────────────────────────────────────────────
const listeners = new Set<() => void>();
let snapCache: Record<string, unknown> = {};
function emit() { snapCache = {}; listeners.forEach((fn) => fn()); }
function subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }

// ─── Storage ─────────────────────────────────────────────────
type NotesShape = { notes: Note[]; audit: NoteAuditEntry[] };

function isBrowser() { return typeof window !== "undefined" && typeof window.localStorage !== "undefined"; }

function readAll(): NotesShape {
  if (!isBrowser()) return { notes: [], audit: [] };
  try {
    const raw = window.localStorage.getItem(KEY);
    const auditRaw = window.localStorage.getItem(AUDIT_KEY);
    let notes: Note[] = raw ? JSON.parse(raw) : [];
    let audit: NoteAuditEntry[] = auditRaw ? JSON.parse(auditRaw) : [];
    if (!raw || notes.length === 0) {
      notes = seed();
      window.localStorage.setItem(KEY, JSON.stringify(notes));
      audit = notes.map((n) => ({
        id: `au-${n.id}-c`, noteId: n.id, action: "create" as const, at: n.createdAt, by: CLINICIAN.name,
      }));
      window.localStorage.setItem(AUDIT_KEY, JSON.stringify(audit));
    }
    return { notes, audit };
  } catch {
    return { notes: [], audit: [] };
  }
}

function writeNotes(notes: Note[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(KEY, JSON.stringify(notes));
  emit();
}
function writeAudit(audit: NoteAuditEntry[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(AUDIT_KEY, JSON.stringify(audit));
}
function addAudit(noteId: string, action: NoteAuditEntry["action"]) {
  if (!isBrowser()) return;
  const auditRaw = window.localStorage.getItem(AUDIT_KEY);
  const audit: NoteAuditEntry[] = auditRaw ? JSON.parse(auditRaw) : [];
  audit.push({ id: `au-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, noteId, action, at: Date.now(), by: CLINICIAN.name });
  writeAudit(audit);
}

// ─── Hash (djb2, deterministic) ──────────────────────────────
export function hashSections(sections: NoteSection[]): string {
  const text = sections.map((s) => `${s.key}::${s.body}`).join("\n---\n");
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
  return `sha-${(h >>> 0).toString(16)}`;
}

// ─── Public API ──────────────────────────────────────────────
export function listNotes(): Note[] {
  return readAll().notes.slice().sort((a, b) => b.updatedAt - a.updatedAt);
}
export function getNote(id: string): Note | undefined {
  const n = readAll().notes.find((x) => x.id === id);
  if (n) addAudit(id, "read");
  return n;
}
export function getNoteSilent(id: string): Note | undefined {
  return readAll().notes.find((x) => x.id === id);
}
export function notesForPatient(patientId: string): Note[] {
  return listNotes().filter((n) => n.patientId === patientId);
}
export function listAudit(noteId?: string): NoteAuditEntry[] {
  const auditRaw = isBrowser() ? window.localStorage.getItem(AUDIT_KEY) : null;
  const audit: NoteAuditEntry[] = auditRaw ? JSON.parse(auditRaw) : [];
  return noteId ? audit.filter((a) => a.noteId === noteId) : audit;
}

export function createNote(input: {
  patientId: string;
  type: NoteTemplate;
  sessionId?: string;
  groupId?: string;
  title?: string;
}): Note {
  const meta = TEMPLATE_META[input.type];
  const sections: NoteSection[] = meta.sections.map((s) => ({ ...s, body: "" }));
  const now = Date.now();
  const note: Note = {
    id: `n-${now}-${Math.random().toString(36).slice(2, 7)}`,
    patientId: input.patientId,
    sessionId: input.sessionId,
    groupId: input.groupId,
    type: input.type,
    title: input.title,
    sections,
    status: "draft",
    amendments: [],
    versions: [],
    createdAt: now,
    updatedAt: now,
  };
  const notes = readAll().notes;
  notes.push(note);
  writeNotes(notes);
  addAudit(note.id, "create");
  return note;
}

export function updateSections(id: string, sections: NoteSection[]): Note | undefined {
  const notes = readAll().notes;
  const n = notes.find((x) => x.id === id);
  if (!n) return undefined;
  if (n.status === "signed" || n.status === "locked" || n.status === "amended") return n;
  // append version snapshot (cap to last 30)
  const prevSnapshot: NoteVersion = { id: `v-${Date.now()}`, at: Date.now(), sections: n.sections.map((s) => ({ ...s })) };
  n.versions = [...n.versions.slice(-29), prevSnapshot];
  n.sections = sections.map((s) => ({ ...s }));
  n.updatedAt = Date.now();
  writeNotes(notes);
  addAudit(id, "update");
  return n;
}

export function signNote(id: string): Note | undefined {
  const notes = readAll().notes;
  const n = notes.find((x) => x.id === id);
  if (!n) return undefined;
  if (n.status !== "draft") return n;
  n.status = "signed";
  n.signedAt = Date.now();
  n.signedBy = CLINICIAN.name;
  n.lockedHash = hashSections(n.sections);
  n.updatedAt = Date.now();
  writeNotes(notes);
  addAudit(id, "sign");
  return n;
}

export function amendNote(id: string, reason: string, sections: NoteSection[]): Note | undefined {
  const notes = readAll().notes;
  const n = notes.find((x) => x.id === id);
  if (!n) return undefined;
  if (n.status !== "signed" && n.status !== "amended") return n;
  const amendment: NoteAmendment = {
    id: `am-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    reason,
    sections: sections.map((s) => ({ ...s })),
    signedAt: Date.now(),
    signedBy: CLINICIAN.name,
    hash: hashSections(sections),
  };
  n.amendments = [...n.amendments, amendment];
  n.status = "amended";
  n.updatedAt = Date.now();
  writeNotes(notes);
  addAudit(id, "amend");
  return n;
}

export function deleteNote(id: string): void {
  const notes = readAll().notes.filter((n) => n.id !== id);
  writeNotes(notes);
}

export function verifyIntegrity(n: Note): { ok: boolean; expected?: string; actual?: string } {
  if (!n.lockedHash) return { ok: true };
  const actual = hashSections(n.sections);
  return { ok: actual === n.lockedHash, expected: n.lockedHash, actual };
}

export function markExported(id: string) { addAudit(id, "export"); }

export function noteExcerpt(n: Note, limit = 160): string {
  const joined = n.sections.map((s) => s.body).join(" ").replace(/\s+/g, " ").trim();
  return joined.length > limit ? joined.slice(0, limit) + "…" : joined;
}

export function clinicianIdentity() { return CLINICIAN; }

// ─── Hooks ───────────────────────────────────────────────────
function cached<T>(key: string, fn: () => T): T {
  if (key in snapCache) return snapCache[key] as T;
  const v = fn();
  snapCache[key] = v;
  return v;
}
export function useLiveNotes(): Note[] {
  return useSyncExternalStore(subscribe, () => cached("all", listNotes), () => []);
}
export function useLiveNote(id: string): Note | undefined {
  return useSyncExternalStore(subscribe, () => cached(`n:${id}`, () => getNoteSilent(id)), () => undefined);
}
export function useLiveNotesForPatient(patientId: string): Note[] {
  return useSyncExternalStore(subscribe, () => cached(`p:${patientId}`, () => notesForPatient(patientId)), () => []);
}

// ─── Seed ────────────────────────────────────────────────────
function seed(): Note[] {
  const patients = listPatients().slice(0, 6);
  if (patients.length === 0) return [];
  const sessions = listSessions();
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  const mk = (
    patientIdx: number, type: NoteTemplate, ageDays: number, status: NoteStatus,
    fills: Record<string, string>, opts: { withAmendment?: { reason: string; delta: Record<string, string> } } = {},
  ): Note => {
    const p = patients[patientIdx % patients.length];
    const meta = TEMPLATE_META[type];
    const sections: NoteSection[] = meta.sections.map((s) => ({ ...s, body: fills[s.key] ?? "" }));
    const createdAt = now - ageDays * day;
    const updatedAt = createdAt + 45 * 60 * 1000;
    const session = sessions.find((s) => s.patientId === p.id);
    const signedAt = status !== "draft" ? updatedAt + 5 * 60 * 1000 : undefined;
    const note: Note = {
      id: `n-seed-${patientIdx}-${type}-${ageDays}`,
      patientId: p.id,
      sessionId: session?.id,
      type,
      sections,
      status: status === "amended" ? "signed" : status,
      signedAt,
      signedBy: signedAt ? CLINICIAN.name : undefined,
      lockedHash: signedAt ? hashSections(sections) : undefined,
      amendments: [],
      versions: [],
      createdAt, updatedAt: signedAt ?? updatedAt,
    };
    if (opts.withAmendment && signedAt) {
      const amendedSections = sections.map((s) => ({ ...s, body: opts.withAmendment!.delta[s.key] ?? s.body }));
      note.amendments.push({
        id: `am-seed-${note.id}`,
        reason: opts.withAmendment.reason,
        sections: amendedSections,
        signedAt: signedAt + day,
        signedBy: CLINICIAN.name,
        hash: hashSections(amendedSections),
      });
      note.status = "amended";
      note.updatedAt = signedAt + day;
    }
    return note;
  };

  return [
    mk(0, "SOAP", 1, "draft", {
      subjective: "Reports sleep improving from 4→6 hours. Continues to feel underlying dread before class presentations.",
      objective: "Bright, engaged. Mild psychomotor agitation. Speech normal rate.",
      assessment: "Generalised anxiety with performance-specific triggers. PHQ-9 down from 14 → 9 over 3 weeks.",
      plan: "Continue weekly CBT. Introduce cognitive restructuring worksheet for presentation catastrophising.",
    }),
    mk(0, "SOAP", 8, "signed", {
      subjective: "Panic attack Tuesday during viva. Recovered within 20 minutes using paced breathing.",
      objective: "Alert, oriented. Affect congruent. No SI/HI.",
      assessment: "Panic disorder with situational triggers. Coping skills stabilising.",
      plan: "Homework: interoceptive exposure ×3 this week. Review at next session.",
    }),
    mk(0, "Progress", 15, "amended", {
      summary: "Third session in the current arc. Working through perfectionism cycle.",
      themes: "Discussed the 'good enough' frame. Client resistant but curious.",
      next: "Assign values card sort before next session.",
    }, { withAmendment: { reason: "Corrected date of prior session referenced.", delta: { summary: "Third session in the current arc. Working through perfectionism cycle. (Amended 2026-07-08.)" } } }),
    mk(1, "DAP", 2, "draft", {
      data: "Client discussed conflict with roommate around study hours. Elevated distress at start (SUDS 7), reduced to 3 by end.",
      assessment: "Interpersonal effectiveness deficit under stress. Skill gap around DEAR MAN.",
      plan: "Introduce DEAR MAN handout. Roleplay in next session.",
    }),
    mk(1, "Intake", 22, "signed", {
      presenting: "Second-year student, presenting with low mood and disrupted sleep for 6 weeks. Denies SI.",
      history: "Onset following academic setback in April. No prior psychiatric care. No substance use.",
      mse: "Groomed, cooperative, mood dysthymic, affect constricted, thoughts linear, no perceptual disturbances, insight fair.",
      formulation: "Adjustment disorder with depressed mood, PHQ-9 = 12. Protective: strong family support, insight.",
      plan: "8-week CBT arc. Weekly sessions. PHQ-9 fortnightly. Refer for sleep hygiene handout.",
    }),
    mk(2, "BIRP", 4, "signed", {
      behavior: "Client presented calm. Engaged in discussion of last week's grief triggers.",
      intervention: "Empty-chair exercise around unspoken words to father. Grounding cues before and after.",
      response: "Tearful but regulated. Reported relief; SUDS 8 → 4.",
      plan: "Introduce ritual-of-remembrance homework. Continue weekly.",
    }),
    mk(2, "Termination", 30, "signed", {
      course: "12 sessions of grief-focused therapy over 4 months.",
      outcomes: "PHQ-9 baseline 16 → discharge 6. Client reports reintegration into daily routine.",
      referrals: "None indicated. Provided pathway to re-open case if needed.",
      closing: "Discharge with plan for booster session at 3 months if desired.",
    }),
    mk(3, "Contact", 0, "draft", {
      channel: "Phone call, 8 minutes, 09:12 IST.",
      content: "Client called to reschedule Thursday session. Booked for Friday 4pm. Denied urgent concerns.",
    }),
    mk(3, "SOAP", 6, "signed", {
      subjective: "Feels 'lighter this week'. Slept 7+ hours 5/7 nights.",
      objective: "Warm affect. Increased spontaneous humour.",
      assessment: "MDD in partial remission. GAD-7 = 5.",
      plan: "Space sessions to fortnightly starting next month.",
    }),
    mk(4, "Case", 3, "signed", {
      note: "Coordinated with college counselling office re: attendance letter. Sent letter for exam accommodation.",
    }),
    mk(4, "DAP", 11, "signed", {
      data: "Session focused on body-image thoughts around campus events.",
      assessment: "Cognitive distortions around comparison. Body checking behaviours reduced.",
      plan: "Continue thought record. Add mirror-exposure exercise, brief.",
    }),
    mk(5, "Progress", 18, "signed", {
      summary: "Weekly session. Working on academic overwhelm and sleep schedule.",
      themes: "Discussed the boundary between rest and avoidance. Client mapped weekly time-blocks.",
      next: "Trial two 25-min pomodoros before dinner. Log energy pre/post.",
    }),
  ];
}
