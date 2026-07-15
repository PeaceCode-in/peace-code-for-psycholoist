// PeaceCode · Onboarding store.
// Tracks step progress, sample-data mode, first-run checklist, and product-tour dismissals.
// Emits real signals that hook back into live stores (patients, sessions, docs).
import { useSyncExternalStore } from "react";
import { createPatient, listPatients, type Pronouns } from "./patients-store";

// ─── Types ───────────────────────────────────────────
export type StepId =
  | "identity" | "practice" | "specialties" | "rhythm"
  | "rates" | "instruments" | "first-patient";

export const STEPS: { id: StepId; label: string; eyebrow: string; heading: string; sub: string }[] = [
  { id: "identity",     eyebrow: "01 · Identity",     label: "Your identity",     heading: "Who the room will meet.", sub: "The name and credentials that appear on notes, invoices, and every intake." },
  { id: "practice",     eyebrow: "02 · Practice",     label: "Your practice",     heading: "The shape of the room.",  sub: "Solo or group. One address or many. The languages you actually work in." },
  { id: "specialties",  eyebrow: "03 · Specialties",  label: "Your specialties",  heading: "The work you do best.",   sub: "Concerns, populations, modalities. This becomes your directory listing and referral surface." },
  { id: "rhythm",       eyebrow: "04 · Rhythm",       label: "Your rhythm",       heading: "The week, drawn quietly.", sub: "Days you see clients, session length, the breath between sessions." },
  { id: "rates",        eyebrow: "05 · Rates",        label: "Your rates",        heading: "Money, softly.",           sub: "A base fee, a sliding range if you offer one, and a cancellation policy in your own words." },
  { id: "instruments",  eyebrow: "06 · Instruments",  label: "Your instruments",  heading: "The screeners on your shelf.", sub: "Pick which validated assessments live one click away. Start small — add later." },
  { id: "first-patient",eyebrow: "07 · First patient",label: "Your first patient",heading: "Open a chart.",            sub: "One real patient, a CSV import, or three fictional patients to walk the halls with." },
];

export type OnboardingState = {
  startedAt: number;
  completedAt?: number;
  currentStep: StepId;
  progress: Record<StepId, { status: "pending" | "done" | "skipped"; ms: number; at?: number }>;
  identity: { fullName: string; credentials: string; pronouns: string; photoDataUrl?: string };
  practice: { kind: "solo" | "group"; name: string; city: string; country: string; languages: string[] };
  specialties: { concerns: string[]; populations: string[]; modalities: string[] };
  rhythm: { days: string[]; sessionMinutes: number; bufferMinutes: number; weeklyCap: number };
  rates: { baseINR: number; slidingLow: number; slidingHigh: number; methods: string[]; cancellation: string };
  instruments: string[];
  sampleDataMode: boolean;
  sampleDataPatientIds: string[];
  checklistDismissed: boolean;
  checklistItemsDismissed: string[];
  toursSeen: string[];
  signalLog: { step: StepId; action: "enter" | "complete" | "skip"; at: number; dwellMs?: number }[];
};

const KEY = "peacecode.onboarding.v1";

const seed: OnboardingState = {
  startedAt: Date.now(),
  currentStep: "identity",
  progress: Object.fromEntries(STEPS.map((s) => [s.id, { status: "pending", ms: 0 }])) as OnboardingState["progress"],
  identity: { fullName: "", credentials: "", pronouns: "" },
  practice: { kind: "solo", name: "", city: "", country: "India", languages: ["English"] },
  specialties: { concerns: [], populations: [], modalities: [] },
  rhythm: { days: ["Mon","Tue","Wed","Thu","Fri"], sessionMinutes: 50, bufferMinutes: 10, weeklyCap: 25 },
  rates: { baseINR: 2500, slidingLow: 1500, slidingHigh: 3500, methods: ["UPI","Card","Bank transfer"], cancellation: "24 hours notice, full fee for late cancels within that window." },
  instruments: ["PHQ-9","GAD-7","PCL-5"],
  sampleDataMode: false,
  sampleDataPatientIds: [],
  checklistDismissed: false,
  checklistItemsDismissed: [],
  toursSeen: [],
  signalLog: [],
};

// ─── State plumbing ──────────────────────────────────
const listeners = new Set<() => void>();
function load(): OnboardingState {
  if (typeof window === "undefined") return seed;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seed;
    return { ...seed, ...JSON.parse(raw) };
  } catch { return seed; }
}
let cached: OnboardingState | null = null;
function state(): OnboardingState { if (!cached) cached = load(); return cached; }
function persist() { if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(cached)); listeners.forEach((l) => l()); }
function mutate(fn: (s: OnboardingState) => OnboardingState) { cached = fn(state()); persist(); }

export function getOnboarding(): OnboardingState { return state(); }
export function useOnboarding(): OnboardingState {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => { listeners.delete(cb); }; },
    () => state(),
    () => seed,
  );
}

// ─── Step actions ────────────────────────────────────
export function setStepData<K extends keyof OnboardingState>(key: K, patch: Partial<OnboardingState[K]>) {
  mutate((s) => ({ ...s, [key]: { ...(s[key] as object), ...(patch as object) } as OnboardingState[K] }));
}
export function setListField<K extends "instruments">(key: K, list: string[]) {
  mutate((s) => ({ ...s, [key]: list }));
}
export function markStep(step: StepId, status: "done" | "skipped", dwellMs = 0) {
  mutate((s) => ({
    ...s,
    progress: { ...s.progress, [step]: { status, ms: dwellMs, at: Date.now() } },
    signalLog: [...s.signalLog, { step, action: (status === "done" ? "complete" : "skip") as "complete" | "skip", at: Date.now(), dwellMs }].slice(-200),
  }));
}
export function enterStep(step: StepId) {
  mutate((s) => ({
    ...s,
    currentStep: step,
    signalLog: [...s.signalLog, { step, action: "enter" as const, at: Date.now() }].slice(-200),
  }));
}

export function completeOnboarding() {
  mutate((s) => ({ ...s, completedAt: Date.now() }));
}
export function resetOnboarding() {
  cached = { ...seed, startedAt: Date.now() };
  persist();
}
export function isOnboardingComplete(): boolean {
  return !!state().completedAt;
}

// ─── Sample data ─────────────────────────────────────
const SAMPLE_PATIENTS = [
  { fullName: "Aarav Mehta", preferredName: "Aarav", pronouns: "he/him" as Pronouns, age: 22, email: "aarav.m@example.in", phone: "+91 98111 22345", college: "Delhi University", yearOfStudy: "3rd year", status: "active" as const, risk: "monitor" as const, primaryConcern: "Generalised anxiety, exam avoidance", tags: ["CBT","weekly"], intakeDate: Date.now() - 42 * 86400000, totalSessions: 6, consentSharing: true },
  { fullName: "Meera Iyer",  preferredName: "Meera", pronouns: "she/her" as Pronouns, age: 27, email: "meera.iyer@example.in", phone: "+91 98220 71120", college: "IIT Bombay",       yearOfStudy: "PhD 2", status: "active" as const, risk: "stable" as const,  primaryConcern: "Post-breakup grief; sleep disruption", tags: ["IFS","biweekly"], intakeDate: Date.now() - 30 * 86400000, totalSessions: 4, consentSharing: true },
  { fullName: "Kiran Rao",   preferredName: "Kiran", pronouns: "they/them" as Pronouns, age: 24, email: "kiran.rao@example.in", phone: "+91 90080 55411", college: "NLSIU Bangalore",  yearOfStudy: "5th year", status: "active" as const, risk: "elevated" as const, primaryConcern: "Identity, family conflict, panic episodes", tags: ["EMDR","weekly"], intakeDate: Date.now() - 55 * 86400000, totalSessions: 8, consentSharing: true },
];

export function activateSampleData(): string[] {
  const s = state();
  if (s.sampleDataMode) return s.sampleDataPatientIds;
  const ids: string[] = [];
  for (const p of SAMPLE_PATIENTS) {
    const created = createPatient(p);
    ids.push(created.id);
  }
  mutate((st) => ({ ...st, sampleDataMode: true, sampleDataPatientIds: ids }));
  return ids;
}

export function clearSampleData(): void {
  // Soft-clear: mark them discharged rather than delete.
  const ids = new Set(state().sampleDataPatientIds);
  const remaining = listPatients().filter((p) => ids.has(p.id));
  // We don't have a delete API; just flip flag. Sample ribbon disappears.
  mutate((s) => ({ ...s, sampleDataMode: false, sampleDataPatientIds: [] }));
  void remaining;
}

// ─── Checklist ───────────────────────────────────────
export type ChecklistItem = {
  id: string;
  label: string;
  hint: string;
  done: boolean;
  href: string;
};

export function getChecklist(): ChecklistItem[] {
  const s = state();
  const patients = typeof window !== "undefined" ? listPatients().length : 0;
  const notes = typeof window !== "undefined" ? (JSON.parse(localStorage.getItem("peacecode.patients.v3") || "{}")?.notes?.length ?? 0) : 0;
  const invoices = typeof window !== "undefined" ? (JSON.parse(localStorage.getItem("peacecode.billing.v1") || "{}")?.invoices?.length ?? 0) : 0;
  const docsSent = typeof window !== "undefined" ? (JSON.parse(localStorage.getItem("peacecode.documents.v1") || "{}")?.instances?.length ?? 0) : 0;
  const items: ChecklistItem[] = [
    { id: "add-3", label: "Add three patients", hint: "Real, sample, or imported — the room needs voices.", done: patients >= 3, href: "/patients" },
    { id: "first-soap", label: "Write your first SOAP note", hint: "One note. Any patient. Copilot can draft it.", done: notes >= 1, href: "/notes" },
    { id: "first-intake", label: "Send your first intake form", hint: "The paperwork that opens every door.", done: docsSent >= 1, href: "/documents" },
    { id: "first-invoice", label: "Book your first paid session", hint: "When money comes in, it should be the easy part.", done: invoices >= 1, href: "/billing" },
    { id: "copilot", label: "Meet Copilot", hint: "The quiet supervisor. ⌘K anywhere.", done: s.toursSeen.includes("copilot"), href: "/copilot" },
    { id: "invite", label: s.practice.kind === "group" ? "Invite a colleague" : "Explore the Team surface", hint: "A well-run practice is rarely solo for long.", done: s.toursSeen.includes("team"), href: "/team" },
  ];
  return items.filter((i) => !s.checklistItemsDismissed.includes(i.id));
}

export function useChecklist(): ChecklistItem[] {
  useOnboarding(); // subscribe
  return getChecklist();
}

export function dismissChecklistItem(id: string) {
  mutate((s) => ({ ...s, checklistItemsDismissed: [...s.checklistItemsDismissed, id] }));
}
export function dismissChecklist() {
  mutate((s) => ({ ...s, checklistDismissed: true }));
}
export function reopenChecklist() {
  mutate((s) => ({ ...s, checklistDismissed: false, checklistItemsDismissed: [] }));
}

// ─── Tours ───────────────────────────────────────────
export function markTourSeen(key: string) {
  mutate((s) => (s.toursSeen.includes(key) ? s : { ...s, toursSeen: [...s.toursSeen, key] }));
}
export function hasSeenTour(key: string): boolean {
  return state().toursSeen.includes(key);
}

// ─── Constants (taxonomy) ────────────────────────────
export const CREDENTIALS = ["RCI","MFT","PsyD","PhD","MPhil Clinical","LCSW","MD Psychiatry"];
export const LANGUAGES = ["English","Hindi","Bengali","Tamil","Telugu","Marathi","Kannada","Malayalam","Gujarati","Punjabi","Urdu"];
export const CONCERNS = ["Anxiety","Depression","Trauma / PTSD","Grief","Relationships","Identity","OCD","ADHD","Eating","Sleep","Panic","Burnout","Substance","Self-harm ideation"];
export const POPULATIONS = ["Adults","Adolescents","Young adults","Couples","Families","LGBTQIA+","Neurodivergent","Grad students","Perinatal","Older adults"];
export const MODALITIES = ["CBT","DBT","IFS","EMDR","Psychodynamic","ACT","Somatic","Narrative","Person-centered","Solution-focused","MBCT","Trauma-informed"];
export const INSTRUMENT_LIBRARY = [
  { id: "PHQ-9", name: "PHQ-9", desc: "Depression severity, 9 items", core: true },
  { id: "GAD-7", name: "GAD-7", desc: "Generalised anxiety, 7 items", core: true },
  { id: "PCL-5", name: "PCL-5", desc: "PTSD checklist, DSM-5, 20 items", core: true },
  { id: "AUDIT", name: "AUDIT", desc: "Alcohol use disorders, 10 items" },
  { id: "K10",   name: "K10",   desc: "Kessler distress scale" },
  { id: "PSS-10",name: "PSS-10",desc: "Perceived stress, 10 items" },
  { id: "ORS",   name: "ORS",   desc: "Outcome rating, session-by-session" },
  { id: "SRS",   name: "SRS",   desc: "Session rating, therapeutic alliance" },
  { id: "Y-BOCS",name: "Y-BOCS",desc: "OCD symptom severity" },
  { id: "MDQ",   name: "MDQ",   desc: "Mood disorder questionnaire" },
];
