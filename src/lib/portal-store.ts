// Client Portal store — separate from clinician data.
// Local-first: seeds two demo clients so the "client only sees own data" rule
// is testable. Never surfaces clinical notes, risk levels, or internal tags.
import { useEffect, useState, useSyncExternalStore } from "react";

// ─── types ─────────────────────────────────────────────────────────────────
export type ClientAccount = {
  id: string;
  email: string;
  password: string; // demo only
  firstName: string;
  lastName: string;
  therapistName: string;
  therapistTitle: string;
  timezone: string;
  emergencyContact: { name: string; phone: string; relation: string };
  phone: string;
  joinedAt: number;
  onboarded: boolean;
  preferences: {
    theme: "light" | "dark" | "system";
    reducedMotion: boolean;
    reminders: boolean;
    language: "en" | "hi";
  };
};

export type PortalSession = {
  id: string;
  clientId: string;
  startsAt: number; // ms epoch
  durationMin: number;
  modality: "telehealth" | "in-person";
  joinUrl?: string;
  location?: string;
  status: "scheduled" | "completed" | "cancelled";
  intention?: string;
  reflection?: string;
};

export type Homework = {
  id: string;
  clientId: string;
  title: string;
  prompt: string;
  kind: "journal" | "worksheet" | "reading" | "practice";
  assignedAt: number;
  dueAt?: number;
  done: boolean;
  submittedAt?: number;
  response?: string;
};

export type PortalAssessment = {
  id: string;
  clientId: string;
  instrument: "PHQ-9" | "GAD-7" | "PSS-10";
  assignedAt: number;
  dueAt?: number;
  status: "pending" | "in-progress" | "completed";
  answers: Record<number, number>;
  cursor: number; // question index
  completedAt?: number;
  score?: number;
  bandLabel?: string;
  bandTone?: "calm" | "attend" | "elevated";
};

export type PortalMessage = {
  id: string;
  threadId: string;
  from: "client" | "therapist";
  body: string;
  sentAt: number;
  readAt?: number;
};

export type PortalThread = {
  id: string;
  clientId: string;
  subject: string;
  messages: PortalMessage[];
};

export type PortalInvoice = {
  id: string;
  clientId: string;
  number: string;
  issuedAt: number;
  amount: number;
  status: "paid" | "due" | "overdue";
  sessionRef?: string;
  receiptUrl?: string;
  superbillUrl?: string;
};

export type PortalDocument = {
  id: string;
  clientId: string;
  title: string;
  kind: "intake" | "consent" | "release" | "shared" | "receipt";
  sharedAt: number;
  requiresSignature: boolean;
  signedAt?: number;
};

export type MoodEntry = { id: string; clientId: string; at: number; value: number; note?: string };

// ─── keys + storage ────────────────────────────────────────────────────────
const K = {
  session: "pc.portal.session.v1",
  accounts: "pc.portal.accounts.v1",
  sessions: "pc.portal.sessions.v1",
  homework: "pc.portal.homework.v1",
  assessments: "pc.portal.assessments.v1",
  threads: "pc.portal.threads.v1",
  invoices: "pc.portal.invoices.v1",
  documents: "pc.portal.documents.v1",
  moods: "pc.portal.moods.v1",
} as const;

const read = <T,>(k: string, fb: T): T => {
  if (typeof window === "undefined") return fb;
  try { const r = localStorage.getItem(k); return r ? JSON.parse(r) as T : fb; } catch { return fb; }
};
const write = (k: string, v: unknown) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(k, JSON.stringify(v));
  window.dispatchEvent(new CustomEvent("pc.portal.change", { detail: { key: k } }));
};

// ─── seed ──────────────────────────────────────────────────────────────────
const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;

function seedIfEmpty() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(K.accounts)) return;

  const accounts: Record<string, ClientAccount> = {
    "priya@demo.in": {
      id: "c_priya",
      email: "priya@demo.in",
      password: "peacecode",
      firstName: "Priya",
      lastName: "Menon",
      therapistName: "Dr. Anya Rao",
      therapistTitle: "Clinical Psychologist",
      timezone: "Asia/Kolkata",
      emergencyContact: { name: "Ravi Menon", phone: "+91 98765 43210", relation: "Brother" },
      phone: "+91 98111 22334",
      joinedAt: Date.now() - 84 * DAY,
      onboarded: true,
      preferences: { theme: "light", reducedMotion: false, reminders: true, language: "en" },
    },
    "arjun@demo.in": {
      id: "c_arjun",
      email: "arjun@demo.in",
      password: "peacecode",
      firstName: "Arjun",
      lastName: "Shah",
      therapistName: "Dr. Anya Rao",
      therapistTitle: "Clinical Psychologist",
      timezone: "Asia/Kolkata",
      emergencyContact: { name: "Neha Shah", phone: "+91 99887 76655", relation: "Partner" },
      phone: "+91 98222 33445",
      joinedAt: Date.now() - 12 * DAY,
      onboarded: false,
      preferences: { theme: "light", reducedMotion: false, reminders: true, language: "en" },
    },
  };

  const now = Date.now();
  const nextThu = (() => { const d = new Date(); d.setDate(d.getDate() + ((4 - d.getDay() + 7) % 7 || 7)); d.setHours(17, 0, 0, 0); return d.getTime(); })();

  const sessions: PortalSession[] = [
    { id: "s1", clientId: "c_priya", startsAt: nextThu, durationMin: 50, modality: "telehealth", joinUrl: "https://meet.peacecode.in/anya-priya", status: "scheduled" },
    { id: "s2", clientId: "c_priya", startsAt: now - 6 * DAY, durationMin: 50, modality: "telehealth", status: "completed", reflection: "Talked about workload and sleep. Felt lighter after." },
    { id: "s3", clientId: "c_priya", startsAt: now - 13 * DAY, durationMin: 50, modality: "telehealth", status: "completed" },
    { id: "s4", clientId: "c_priya", startsAt: now - 20 * DAY, durationMin: 50, modality: "telehealth", status: "completed" },
    { id: "s5", clientId: "c_priya", startsAt: now - 27 * DAY, durationMin: 50, modality: "in-person", location: "Bandra clinic, Mumbai", status: "completed" },
    { id: "s6", clientId: "c_arjun", startsAt: now + 3 * DAY + 4 * HOUR, durationMin: 50, modality: "telehealth", joinUrl: "https://meet.peacecode.in/anya-arjun", status: "scheduled" },
  ];

  const homework: Homework[] = [
    { id: "h1", clientId: "c_priya", title: "Two-line evening journal", prompt: "Each evening this week, write two lines: one thing that felt heavy, one thing that felt light. No pressure to write more.", kind: "journal", assignedAt: now - 3 * DAY, dueAt: now + 4 * DAY, done: false },
    { id: "h2", clientId: "c_priya", title: "Read: On rest", prompt: "A short essay we spoke about — 8 minutes. Notice one line that stays with you.", kind: "reading", assignedAt: now - 5 * DAY, done: true, submittedAt: now - 2 * DAY, response: "The line about rest not being earned — it just is." },
    { id: "h3", clientId: "c_priya", title: "Box breathing, twice a day", prompt: "4 in, 4 hold, 4 out, 4 hold. Two rounds, morning and night. Skip a day if it feels forced.", kind: "practice", assignedAt: now - 10 * DAY, done: true, submittedAt: now - 7 * DAY },
    { id: "h4", clientId: "c_arjun", title: "Values card sort", prompt: "Attached worksheet — pick your top 5 and bring them to our next session.", kind: "worksheet", assignedAt: now - 1 * DAY, dueAt: now + 3 * DAY, done: false },
  ];

  const assessments: PortalAssessment[] = [
    { id: "a1", clientId: "c_priya", instrument: "PHQ-9", assignedAt: now - 2 * DAY, dueAt: now + 5 * DAY, status: "pending", answers: {}, cursor: 0 },
    { id: "a2", clientId: "c_priya", instrument: "GAD-7", assignedAt: now - 30 * DAY, status: "completed", answers: {}, cursor: 7, completedAt: now - 28 * DAY, score: 12, bandLabel: "Moderate", bandTone: "attend" },
    { id: "a3", clientId: "c_priya", instrument: "GAD-7", assignedAt: now - 60 * DAY, status: "completed", answers: {}, cursor: 7, completedAt: now - 58 * DAY, score: 16, bandLabel: "Moderately severe", bandTone: "elevated" },
    { id: "a4", clientId: "c_arjun", instrument: "PHQ-9", assignedAt: now - 1 * DAY, status: "pending", answers: {}, cursor: 0 },
  ];

  const threads: PortalThread[] = [
    {
      id: "t1", clientId: "c_priya", subject: "Between sessions",
      messages: [
        { id: "m1", threadId: "t1", from: "therapist", body: "Hi Priya — checking in. How did the two-line journal feel this week? No need to write much back.", sentAt: now - 1 * DAY, readAt: now - 22 * HOUR },
        { id: "m2", threadId: "t1", from: "client", body: "It felt quieter than I expected. I skipped Tuesday and that was okay.", sentAt: now - 20 * HOUR, readAt: now - 19 * HOUR },
        { id: "m3", threadId: "t1", from: "therapist", body: "That's exactly the point. See you Thursday.", sentAt: now - 4 * HOUR },
      ],
    },
    {
      id: "t2", clientId: "c_arjun", subject: "Welcome",
      messages: [
        { id: "m4", threadId: "t2", from: "therapist", body: "Welcome, Arjun. Take your time with the intake — no rush. I'll see you next week.", sentAt: now - 12 * HOUR },
      ],
    },
  ];

  const invoices: PortalInvoice[] = [
    { id: "i1", clientId: "c_priya", number: "INV-2026-041", issuedAt: now - 6 * DAY, amount: 3500, status: "paid", sessionRef: "s2" },
    { id: "i2", clientId: "c_priya", number: "INV-2026-036", issuedAt: now - 13 * DAY, amount: 3500, status: "paid", sessionRef: "s3" },
    { id: "i3", clientId: "c_priya", number: "INV-2026-047", issuedAt: now - 2 * DAY, amount: 3500, status: "due" },
    { id: "i4", clientId: "c_priya", number: "INV-2026-028", issuedAt: now - 20 * DAY, amount: 3500, status: "paid" },
  ];

  const documents: PortalDocument[] = [
    { id: "d1", clientId: "c_priya", title: "Intake questionnaire", kind: "intake", sharedAt: now - 84 * DAY, requiresSignature: false, signedAt: now - 84 * DAY },
    { id: "d2", clientId: "c_priya", title: "Informed consent for telehealth", kind: "consent", sharedAt: now - 84 * DAY, requiresSignature: true, signedAt: now - 83 * DAY },
    { id: "d3", clientId: "c_priya", title: "Grounding practices — handout", kind: "shared", sharedAt: now - 30 * DAY, requiresSignature: false },
    { id: "d4", clientId: "c_arjun", title: "Intake questionnaire", kind: "intake", sharedAt: now - 12 * DAY, requiresSignature: true },
    { id: "d5", clientId: "c_arjun", title: "Informed consent for telehealth", kind: "consent", sharedAt: now - 12 * DAY, requiresSignature: true },
  ];

  const moods: MoodEntry[] = [];
  for (let i = 60; i >= 0; i -= 2) {
    // gentle upward drift with wobble
    const base = 4 + (60 - i) / 24;
    const v = Math.max(1, Math.min(7, base + (Math.sin(i / 3) * 0.9)));
    moods.push({ id: `m_${i}`, clientId: "c_priya", at: now - i * DAY, value: Math.round(v * 10) / 10 });
  }

  write(K.accounts, accounts);
  write(K.sessions, sessions);
  write(K.homework, homework);
  write(K.assessments, assessments);
  write(K.threads, threads);
  write(K.invoices, invoices);
  write(K.documents, documents);
  write(K.moods, moods);
}

// ─── reactive subscription ─────────────────────────────────────────────────
function subscribe(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener("pc.portal.change", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("pc.portal.change", handler);
    window.removeEventListener("storage", handler);
  };
}

function useSnap<T>(getter: () => T, fb: T): T {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { seedIfEmpty(); setHydrated(true); }, []);
  const value = useSyncExternalStore(subscribe, getter, () => fb);
  return hydrated ? value : fb;
}

// ─── session/auth ──────────────────────────────────────────────────────────
export function portalSignIn(email: string, password: string): { ok: boolean; error?: string } {
  seedIfEmpty();
  const accounts = read<Record<string, ClientAccount>>(K.accounts, {});
  const acct = accounts[email.trim().toLowerCase()];
  if (!acct) return { ok: false, error: "No account found for that email." };
  if (acct.password !== password) return { ok: false, error: "That password doesn't match." };
  write(K.session, { clientId: acct.id, at: Date.now() });
  return { ok: true };
}

export function portalSignOut() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(K.session);
  window.dispatchEvent(new CustomEvent("pc.portal.change", { detail: { key: K.session } }));
}

export function getCurrentClient(): ClientAccount | null {
  const sess = read<{ clientId: string } | null>(K.session, null);
  if (!sess) return null;
  const accounts = read<Record<string, ClientAccount>>(K.accounts, {});
  return Object.values(accounts).find(a => a.id === sess.clientId) ?? null;
}

export function useCurrentClient(): ClientAccount | null {
  return useSnap(getCurrentClient, null);
}

export function updateClient(patch: Partial<ClientAccount>) {
  const c = getCurrentClient();
  if (!c) return;
  const accounts = read<Record<string, ClientAccount>>(K.accounts, {});
  accounts[c.email] = { ...c, ...patch, preferences: { ...c.preferences, ...(patch.preferences ?? {}) } };
  write(K.accounts, accounts);
}

// ─── selectors (always scoped to current client) ───────────────────────────
export function useMySessions(): PortalSession[] {
  return useSnap(() => {
    const c = getCurrentClient(); if (!c) return [];
    return read<PortalSession[]>(K.sessions, []).filter(s => s.clientId === c.id).sort((a, b) => a.startsAt - b.startsAt);
  }, []);
}
export function useNextSession(): PortalSession | null {
  const now = Date.now();
  return useSnap(() => {
    const c = getCurrentClient(); if (!c) return null;
    return read<PortalSession[]>(K.sessions, [])
      .filter(s => s.clientId === c.id && s.status === "scheduled" && s.startsAt > now - 30 * 60 * 1000)
      .sort((a, b) => a.startsAt - b.startsAt)[0] ?? null;
  }, null);
}
export function useMyHomework(): Homework[] {
  return useSnap(() => {
    const c = getCurrentClient(); if (!c) return [];
    return read<Homework[]>(K.homework, []).filter(h => h.clientId === c.id).sort((a, b) => b.assignedAt - a.assignedAt);
  }, []);
}
export function useMyAssessments(): PortalAssessment[] {
  return useSnap(() => {
    const c = getCurrentClient(); if (!c) return [];
    return read<PortalAssessment[]>(K.assessments, []).filter(a => a.clientId === c.id).sort((a, b) => b.assignedAt - a.assignedAt);
  }, []);
}
export function useMyThreads(): PortalThread[] {
  return useSnap(() => {
    const c = getCurrentClient(); if (!c) return [];
    return read<PortalThread[]>(K.threads, []).filter(t => t.clientId === c.id);
  }, []);
}
export function useMyInvoices(): PortalInvoice[] {
  return useSnap(() => {
    const c = getCurrentClient(); if (!c) return [];
    return read<PortalInvoice[]>(K.invoices, []).filter(i => i.clientId === c.id).sort((a, b) => b.issuedAt - a.issuedAt);
  }, []);
}
export function useMyDocuments(): PortalDocument[] {
  return useSnap(() => {
    const c = getCurrentClient(); if (!c) return [];
    return read<PortalDocument[]>(K.documents, []).filter(d => d.clientId === c.id).sort((a, b) => b.sharedAt - a.sharedAt);
  }, []);
}
export function useMyMoods(): MoodEntry[] {
  return useSnap(() => {
    const c = getCurrentClient(); if (!c) return [];
    return read<MoodEntry[]>(K.moods, []).filter(m => m.clientId === c.id).sort((a, b) => a.at - b.at);
  }, []);
}

// ─── waiting-on-you queue ──────────────────────────────────────────────────
export type WaitingItem = {
  id: string;
  kind: "assessment" | "homework" | "document" | "invoice";
  title: string;
  meta: string;
  href: string;
  dueAt?: number;
};

export function useWaitingOnYou(): WaitingItem[] {
  const assessments = useMyAssessments();
  const homework = useMyHomework();
  const documents = useMyDocuments();
  const invoices = useMyInvoices();
  const items: WaitingItem[] = [];

  assessments.filter(a => a.status !== "completed").forEach(a =>
    items.push({ id: a.id, kind: "assessment", title: `${a.instrument} check-in`, meta: a.status === "in-progress" ? "Continue where you left off" : "Takes about 3 minutes", href: `/portal/assessments/${a.id}`, dueAt: a.dueAt })
  );
  homework.filter(h => !h.done).forEach(h =>
    items.push({ id: h.id, kind: "homework", title: h.title, meta: h.kind === "journal" ? "Journal prompt" : h.kind === "reading" ? "Short reading" : h.kind === "worksheet" ? "Worksheet" : "Practice", href: `/portal/homework`, dueAt: h.dueAt })
  );
  documents.filter(d => d.requiresSignature && !d.signedAt).forEach(d =>
    items.push({ id: d.id, kind: "document", title: d.title, meta: "Needs your signature", href: `/portal/documents` })
  );
  invoices.filter(i => i.status !== "paid").forEach(i =>
    items.push({ id: i.id, kind: "invoice", title: i.number, meta: i.status === "overdue" ? "Overdue" : "Payment pending", href: `/portal/billing` })
  );

  return items.sort((a, b) => (a.dueAt ?? Infinity) - (b.dueAt ?? Infinity));
}

// ─── mutations ─────────────────────────────────────────────────────────────
export function toggleHomeworkDone(id: string, response?: string) {
  const list = read<Homework[]>(K.homework, []);
  const next = list.map(h => h.id === id ? { ...h, done: !h.done, submittedAt: !h.done ? Date.now() : undefined, response: response ?? h.response } : h);
  write(K.homework, next);
}

export function saveHomeworkResponse(id: string, response: string) {
  const list = read<Homework[]>(K.homework, []);
  write(K.homework, list.map(h => h.id === id ? { ...h, response } : h));
}

export function saveSessionIntention(id: string, intention: string) {
  const list = read<PortalSession[]>(K.sessions, []);
  write(K.sessions, list.map(s => s.id === id ? { ...s, intention } : s));
}
export function cancelSession(id: string) {
  const list = read<PortalSession[]>(K.sessions, []);
  write(K.sessions, list.map(s => s.id === id ? { ...s, status: "cancelled" as const } : s));
}

export function updateAssessmentAnswer(id: string, q: number, value: number) {
  const list = read<PortalAssessment[]>(K.assessments, []);
  write(K.assessments, list.map(a => a.id === id ? { ...a, answers: { ...a.answers, [q]: value }, cursor: Math.max(a.cursor, q + 1), status: "in-progress" as const } : a));
}

export function completeAssessment(id: string) {
  const list = read<PortalAssessment[]>(K.assessments, []);
  write(K.assessments, list.map(a => {
    if (a.id !== id) return a;
    const total = Object.values(a.answers).reduce((s, v) => s + v, 0);
    const band = bandFor(a.instrument, total);
    return { ...a, status: "completed" as const, completedAt: Date.now(), score: total, bandLabel: band.label, bandTone: band.tone };
  }));
}

export function bandFor(instrument: PortalAssessment["instrument"], score: number): { label: string; tone: "calm" | "attend" | "elevated"; friendly: string } {
  if (instrument === "PHQ-9") {
    if (score <= 4) return { label: "Minimal", tone: "calm", friendly: "Things feel relatively steady right now." };
    if (score <= 9) return { label: "Mild", tone: "calm", friendly: "Some weight — worth mentioning next session." };
    if (score <= 14) return { label: "Moderate", tone: "attend", friendly: "A meaningful amount showing up. Your therapist will discuss this with you." };
    if (score <= 19) return { label: "Moderately elevated", tone: "elevated", friendly: "This is a real load. Your therapist will bring this into your next conversation." };
    return { label: "Elevated", tone: "elevated", friendly: "Your therapist will reach out to talk about how you're doing." };
  }
  if (instrument === "GAD-7") {
    if (score <= 4) return { label: "Minimal", tone: "calm", friendly: "Anxiety feels manageable this week." };
    if (score <= 9) return { label: "Mild", tone: "calm", friendly: "A bit of edge — worth naming out loud." };
    if (score <= 14) return { label: "Moderate", tone: "attend", friendly: "Notable anxiety. Your therapist will discuss this with you." };
    return { label: "Elevated", tone: "elevated", friendly: "This is a lot. Your therapist will bring this into your next session." };
  }
  // PSS-10
  if (score <= 13) return { label: "Low", tone: "calm", friendly: "Stress feels within reach right now." };
  if (score <= 26) return { label: "Moderate", tone: "attend", friendly: "A noticeable pull. Worth naming in session." };
  return { label: "High", tone: "elevated", friendly: "A heavy load — your therapist will discuss this with you." };
}

export const ASSESSMENT_ITEMS: Record<PortalAssessment["instrument"], string[]> = {
  "PHQ-9": [
    "Little interest or pleasure in doing things",
    "Feeling down, depressed, or hopeless",
    "Trouble falling or staying asleep, or sleeping too much",
    "Feeling tired or having little energy",
    "Poor appetite or overeating",
    "Feeling bad about yourself, or a failure",
    "Trouble concentrating on things",
    "Moving or speaking slowly — or being restless",
    "Thoughts that you would be better off not being here",
  ],
  "GAD-7": [
    "Feeling nervous, anxious, or on edge",
    "Not being able to stop or control worrying",
    "Worrying too much about different things",
    "Trouble relaxing",
    "Being so restless it's hard to sit still",
    "Becoming easily annoyed or irritable",
    "Feeling afraid, as if something awful might happen",
  ],
  "PSS-10": [
    "In the last week, how often have you been upset by something unexpected?",
    "Felt unable to control the important things in your life?",
    "Felt nervous and stressed?",
    "Felt confident about handling personal problems? (reverse)",
    "Felt that things were going your way? (reverse)",
    "Found you could not cope with all you had to do?",
    "Been able to control irritations in your life? (reverse)",
    "Felt on top of things? (reverse)",
    "Been angered by things outside your control?",
    "Felt difficulties piling up so high you couldn't overcome them?",
  ],
};

export const ANSWER_OPTIONS = [
  { value: 0, label: "Not at all" },
  { value: 1, label: "Several days" },
  { value: 2, label: "More than half the days" },
  { value: 3, label: "Nearly every day" },
];

export function sendMessage(threadId: string, body: string) {
  const c = getCurrentClient(); if (!c) return;
  const list = read<PortalThread[]>(K.threads, []);
  write(K.threads, list.map(t => t.id === threadId ? {
    ...t,
    messages: [...t.messages, { id: `m_${Date.now()}`, threadId, from: "client" as const, body, sentAt: Date.now(), readAt: Date.now() }],
  } : t));
}

export function markThreadRead(threadId: string) {
  const list = read<PortalThread[]>(K.threads, []);
  const now = Date.now();
  write(K.threads, list.map(t => t.id === threadId ? {
    ...t,
    messages: t.messages.map(m => m.from === "therapist" && !m.readAt ? { ...m, readAt: now } : m),
  } : t));
}

export function logMood(value: number, note?: string) {
  const c = getCurrentClient(); if (!c) return;
  const list = read<MoodEntry[]>(K.moods, []);
  list.push({ id: `m_${Date.now()}`, clientId: c.id, at: Date.now(), value, note });
  write(K.moods, list);
}

export function signDocument(id: string) {
  const list = read<PortalDocument[]>(K.documents, []);
  write(K.documents, list.map(d => d.id === id ? { ...d, signedAt: Date.now() } : d));
}

export function markInvoicePaid(id: string) {
  const list = read<PortalInvoice[]>(K.invoices, []);
  write(K.invoices, list.map(i => i.id === id ? { ...i, status: "paid" as const } : i));
}

export function markOnboarded() {
  const c = getCurrentClient(); if (!c) return;
  updateClient({ onboarded: true });
}

// ─── formatting helpers ────────────────────────────────────────────────────
export function fmtDateWarm(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diff = Math.round((d.getTime() - now.getTime()) / DAY);
  const timeStr = d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }).toLowerCase();
  if (diff === 0) return `Today at ${timeStr}`;
  if (diff === 1) return `Tomorrow at ${timeStr}`;
  if (diff === -1) return `Yesterday`;
  if (diff > 0 && diff < 7) return `${d.toLocaleDateString("en-IN", { weekday: "long" })} at ${timeStr}`;
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }) + ` at ${timeStr}`;
}

export function fmtRelative(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.round(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function fmtMoney(paise: number): string {
  return `₹ ${paise.toLocaleString("en-IN")}`;
}

// convenience: unread count across threads
export function useUnreadFromTherapist(): number {
  const threads = useMyThreads();
  return threads.reduce((n, t) => n + t.messages.filter(m => m.from === "therapist" && !m.readAt).length, 0);
}
