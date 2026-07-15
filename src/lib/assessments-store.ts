// PeaceCode · Practice — Assessments store.
// localStorage-backed with a tiny event bus for live re-renders.
// Ships 5 built-in instruments (PHQ-9, GAD-7, PCL-5, WSAS, C-SSRS)
// with accurate scoring bands. Seeds ~70 historical results across the
// 12 seeded patients and 8–10 pending assignments due this week.

import { useEffect, useState, useSyncExternalStore } from "react";

// ─── Types ───────────────────────────────────────────────────
export type Severity = "minimal" | "mild" | "moderate" | "mod_severe" | "severe";

export type InstrumentId = "phq9" | "gad7" | "pcl5" | "wsas" | "cssrs" | string;

export type ScaleAnchor = { value: number; label: string };
export type InstrumentItem = { id: string; prompt: string; scale: ScaleAnchor[] };

export type ScoringBand = { min: number; max: number; severity: Severity; label: string; clinicalNote?: string };

export type Instrument = {
  id: InstrumentId;
  name: string;             // "PHQ-9"
  fullName: string;         // "Patient Health Questionnaire-9"
  domain: "depression" | "anxiety" | "trauma" | "function" | "risk" | "custom";
  items: InstrumentItem[];
  scoring: {
    method: "sum" | "weighted" | "subscale";
    ranges: ScoringBand[];
    criticalItems?: string[];
    criticalThreshold?: number; // minimum response value that counts as critical
  };
  timeToComplete: number;   // minutes
  frequency: "intake" | "weekly" | "biweekly" | "monthly" | "adhoc";
  builtIn?: boolean;
};

export type AssignmentStatus = "pending" | "in_progress" | "completed" | "expired";
export type AssessmentAssignment = {
  id: string;
  patientId: string;
  instrumentId: InstrumentId;
  assignedAt: string;
  dueAt?: string;
  cadence?: "once" | "weekly" | "biweekly" | "monthly";
  status: AssignmentStatus;
  linkedSessionId?: string;
};

export type AssessmentResult = {
  id: string;
  assignmentId: string;
  patientId: string;
  instrumentId: InstrumentId;
  completedAt: string;
  responses: Record<string, number>;
  totalScore: number;
  subscaleScores?: Record<string, number>;
  severity: Severity;
  criticalFlags: string[];
  deltaFromLast?: number;
  clinicianReviewed: boolean;
};

type StoreShape = {
  instruments: Instrument[];
  assignments: AssessmentAssignment[];
  results: AssessmentResult[];
};

const KEY = "peacecode.therapist.assessments.v1";

// ─── Bus ─────────────────────────────────────────────────────
const listeners = new Set<() => void>();
function emit() { snapCache = {}; listeners.forEach((fn) => fn()); }
function subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }

// Snapshot cache — useSyncExternalStore requires stable references between
// emits. Compute once per key, invalidate on emit().
let snapCache: Record<string, unknown> = {};
function snap<T>(key: string, compute: () => T): T {
  if (!(key in snapCache)) snapCache[key] = compute();
  return snapCache[key] as T;
}


function isBrowser() { return typeof window !== "undefined" && typeof localStorage !== "undefined"; }
function load(): StoreShape {
  if (!isBrowser()) return seed();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) { const s = seed(); localStorage.setItem(KEY, JSON.stringify(s)); return s; }
    return JSON.parse(raw) as StoreShape;
  } catch { return seed(); }
}
function save(s: StoreShape) { if (!isBrowser()) return; try { localStorage.setItem(KEY, JSON.stringify(s)); emit(); } catch { /* quota */ } }
let cache: StoreShape | null = null;
function state(): StoreShape { if (!cache) cache = load(); return cache; }
function mutate(fn: (s: StoreShape) => StoreShape) { cache = fn(state()); save(cache); }
function uid(prefix = "id") { return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`; }

// ─── Severity metadata ───────────────────────────────────────
export const SEVERITY_META: Record<Severity, { label: string; color: string; soft: string }> = {
  minimal:    { label: "Minimal",       color: "#5F8A6A", soft: "#E1EFE3" },
  mild:       { label: "Mild",          color: "#B08444", soft: "#F5E6C6" },
  moderate:   { label: "Moderate",      color: "#D8A34F", soft: "#F6E4C1" },
  mod_severe: { label: "Mod-severe",    color: "#B0567A", soft: "#F1C7D6" },
  severe:     { label: "Severe",        color: "#8A2C3E", soft: "#E9BAC4" },
};

export const DOMAIN_META: Record<Instrument["domain"], string> = {
  depression: "Depression",
  anxiety: "Anxiety",
  trauma: "Trauma",
  function: "Function",
  risk: "Risk",
  custom: "Custom",
};

// ─── Built-in instruments ────────────────────────────────────
const SCALE_PHQ: ScaleAnchor[] = [
  { value: 0, label: "Not at all" },
  { value: 1, label: "Several days" },
  { value: 2, label: "More than half the days" },
  { value: 3, label: "Nearly every day" },
];

const PHQ9: Instrument = {
  id: "phq9",
  name: "PHQ-9",
  fullName: "Patient Health Questionnaire-9",
  domain: "depression",
  timeToComplete: 3,
  frequency: "biweekly",
  builtIn: true,
  items: [
    { id: "phq_1", prompt: "Little interest or pleasure in doing things", scale: SCALE_PHQ },
    { id: "phq_2", prompt: "Feeling down, depressed, or hopeless", scale: SCALE_PHQ },
    { id: "phq_3", prompt: "Trouble falling or staying asleep, or sleeping too much", scale: SCALE_PHQ },
    { id: "phq_4", prompt: "Feeling tired or having little energy", scale: SCALE_PHQ },
    { id: "phq_5", prompt: "Poor appetite or overeating", scale: SCALE_PHQ },
    { id: "phq_6", prompt: "Feeling bad about yourself — or that you are a failure", scale: SCALE_PHQ },
    { id: "phq_7", prompt: "Trouble concentrating on things like reading or watching TV", scale: SCALE_PHQ },
    { id: "phq_8", prompt: "Moving or speaking so slowly others noticed — or being fidgety", scale: SCALE_PHQ },
    { id: "phq_9", prompt: "Thoughts you would be better off dead, or of hurting yourself", scale: SCALE_PHQ },
  ],
  scoring: {
    method: "sum",
    ranges: [
      { min: 0, max: 4, severity: "minimal", label: "Minimal depression" },
      { min: 5, max: 9, severity: "mild", label: "Mild depression" },
      { min: 10, max: 14, severity: "moderate", label: "Moderate depression" },
      { min: 15, max: 19, severity: "mod_severe", label: "Moderately severe depression" },
      { min: 20, max: 27, severity: "severe", label: "Severe depression" },
    ],
    criticalItems: ["phq_9"],
    criticalThreshold: 1,
  },
};

const GAD7: Instrument = {
  id: "gad7",
  name: "GAD-7",
  fullName: "Generalized Anxiety Disorder-7",
  domain: "anxiety",
  timeToComplete: 2,
  frequency: "biweekly",
  builtIn: true,
  items: [
    { id: "gad_1", prompt: "Feeling nervous, anxious, or on edge", scale: SCALE_PHQ },
    { id: "gad_2", prompt: "Not being able to stop or control worrying", scale: SCALE_PHQ },
    { id: "gad_3", prompt: "Worrying too much about different things", scale: SCALE_PHQ },
    { id: "gad_4", prompt: "Trouble relaxing", scale: SCALE_PHQ },
    { id: "gad_5", prompt: "Being so restless that it is hard to sit still", scale: SCALE_PHQ },
    { id: "gad_6", prompt: "Becoming easily annoyed or irritable", scale: SCALE_PHQ },
    { id: "gad_7", prompt: "Feeling afraid, as if something awful might happen", scale: SCALE_PHQ },
  ],
  scoring: {
    method: "sum",
    ranges: [
      { min: 0, max: 4, severity: "minimal", label: "Minimal anxiety" },
      { min: 5, max: 9, severity: "mild", label: "Mild anxiety" },
      { min: 10, max: 14, severity: "moderate", label: "Moderate anxiety" },
      { min: 15, max: 17, severity: "mod_severe", label: "Moderately severe anxiety" },
      { min: 18, max: 21, severity: "severe", label: "Severe anxiety" },
    ],
  },
};

const SCALE_PCL: ScaleAnchor[] = [
  { value: 0, label: "Not at all" },
  { value: 1, label: "A little bit" },
  { value: 2, label: "Moderately" },
  { value: 3, label: "Quite a bit" },
  { value: 4, label: "Extremely" },
];

const PCL5: Instrument = {
  id: "pcl5",
  name: "PCL-5",
  fullName: "PTSD Checklist for DSM-5",
  domain: "trauma",
  timeToComplete: 8,
  frequency: "monthly",
  builtIn: true,
  items: Array.from({ length: 20 }).map((_, i) => ({
    id: `pcl_${i + 1}`,
    prompt: [
      "Repeated, disturbing memories of the stressful experience",
      "Repeated, disturbing dreams of the experience",
      "Suddenly feeling or acting as if the experience were happening again",
      "Feeling very upset when reminded of the experience",
      "Strong physical reactions when reminded (heart pounding, sweating)",
      "Avoiding memories, thoughts, or feelings about the experience",
      "Avoiding external reminders of the experience",
      "Trouble remembering important parts of the experience",
      "Strong negative beliefs about yourself, others, or the world",
      "Blaming yourself or someone else for the experience",
      "Strong negative feelings such as fear, horror, anger, guilt, shame",
      "Loss of interest in activities you used to enjoy",
      "Feeling distant or cut off from other people",
      "Trouble experiencing positive feelings",
      "Irritable behaviour, angry outbursts, or acting aggressively",
      "Taking risks or doing things that could cause you harm",
      "Being 'superalert' or watchful or on guard",
      "Feeling jumpy or easily startled",
      "Difficulty concentrating",
      "Trouble falling or staying asleep",
    ][i],
    scale: SCALE_PCL,
  })),
  scoring: {
    method: "sum",
    ranges: [
      { min: 0, max: 19, severity: "minimal", label: "Below screening threshold" },
      { min: 20, max: 32, severity: "mild", label: "Mild PTSD symptoms" },
      { min: 33, max: 45, severity: "moderate", label: "Probable PTSD — moderate" },
      { min: 46, max: 60, severity: "mod_severe", label: "Probable PTSD — moderately severe" },
      { min: 61, max: 80, severity: "severe", label: "Probable PTSD — severe" },
    ],
  },
};

const SCALE_WSAS: ScaleAnchor[] = [
  { value: 0, label: "Not at all" },
  { value: 2, label: "Slightly" },
  { value: 4, label: "Definitely" },
  { value: 6, label: "Markedly" },
  { value: 8, label: "Very severely" },
];

const WSAS: Instrument = {
  id: "wsas",
  name: "WSAS",
  fullName: "Work and Social Adjustment Scale",
  domain: "function",
  timeToComplete: 2,
  frequency: "monthly",
  builtIn: true,
  items: [
    { id: "wsas_1", prompt: "Because of my problem, my ability to work is impaired", scale: SCALE_WSAS },
    { id: "wsas_2", prompt: "My home management is impaired (cleaning, chores, bills)", scale: SCALE_WSAS },
    { id: "wsas_3", prompt: "My social leisure activities are impaired", scale: SCALE_WSAS },
    { id: "wsas_4", prompt: "My private leisure activities are impaired", scale: SCALE_WSAS },
    { id: "wsas_5", prompt: "My ability to form and maintain close relationships is impaired", scale: SCALE_WSAS },
  ],
  scoring: {
    method: "sum",
    ranges: [
      { min: 0, max: 9, severity: "minimal", label: "Subclinical" },
      { min: 10, max: 19, severity: "mild", label: "Mild impairment" },
      { min: 20, max: 24, severity: "moderate", label: "Moderate impairment" },
      { min: 25, max: 29, severity: "mod_severe", label: "Moderately severe impairment" },
      { min: 30, max: 40, severity: "severe", label: "Severe impairment" },
    ],
  },
};

const SCALE_YN: ScaleAnchor[] = [{ value: 0, label: "No" }, { value: 1, label: "Yes" }];

const CSSRS: Instrument = {
  id: "cssrs",
  name: "C-SSRS",
  fullName: "Columbia Suicide Severity Rating (screener)",
  domain: "risk",
  timeToComplete: 2,
  frequency: "adhoc",
  builtIn: true,
  items: [
    { id: "css_1", prompt: "Have you wished you were dead or wished you could go to sleep and not wake up?", scale: SCALE_YN },
    { id: "css_2", prompt: "Have you had any actual thoughts of killing yourself?", scale: SCALE_YN },
    { id: "css_3", prompt: "Have you thought about how you might do this?", scale: SCALE_YN },
    { id: "css_4", prompt: "Have you had these thoughts and had some intention of acting on them?", scale: SCALE_YN },
    { id: "css_5", prompt: "Have you started to work out — or worked out — the details of how to kill yourself?", scale: SCALE_YN },
    { id: "css_6", prompt: "Have you done anything, started to do anything, or prepared to do anything to end your life?", scale: SCALE_YN },
  ],
  scoring: {
    method: "sum",
    ranges: [
      { min: 0, max: 0, severity: "minimal", label: "No ideation" },
      { min: 1, max: 2, severity: "mild", label: "Passive ideation" },
      { min: 3, max: 3, severity: "moderate", label: "Ideation with method" },
      { min: 4, max: 5, severity: "mod_severe", label: "Intent — clinical review required" },
      { min: 6, max: 6, severity: "severe", label: "Behaviour — immediate action required" },
    ],
    criticalItems: ["css_4", "css_5", "css_6"],
    criticalThreshold: 1,
  },
};

const BUILT_IN: Instrument[] = [PHQ9, GAD7, PCL5, WSAS, CSSRS];

// ─── Scoring ─────────────────────────────────────────────────
export function getInstrument(id: InstrumentId): Instrument | undefined {
  return state().instruments.find((i) => i.id === id);
}
export function listInstruments(): Instrument[] {
  return [...state().instruments];
}

export function computeSeverity(instrumentId: InstrumentId, responses: Record<string, number>): { totalScore: number; severity: Severity; band: ScoringBand; criticalFlags: string[] } {
  const inst = getInstrument(instrumentId);
  if (!inst) throw new Error("Unknown instrument: " + instrumentId);
  const totalScore = Object.values(responses).reduce((a, b) => a + (Number(b) || 0), 0);
  const band = inst.scoring.ranges.find((r) => totalScore >= r.min && totalScore <= r.max) ?? inst.scoring.ranges[inst.scoring.ranges.length - 1];
  const criticalFlags: string[] = [];
  const threshold = inst.scoring.criticalThreshold ?? 1;
  (inst.scoring.criticalItems ?? []).forEach((iid) => {
    if ((responses[iid] ?? 0) >= threshold) criticalFlags.push(iid);
  });
  return { totalScore, severity: band.severity, band, criticalFlags };
}

// ─── Selectors ───────────────────────────────────────────────
export function listResults(): AssessmentResult[] {
  return [...state().results].sort((a, b) => b.completedAt.localeCompare(a.completedAt));
}
export function getResult(id: string): AssessmentResult | undefined {
  return state().results.find((r) => r.id === id);
}
export function getPatientTrajectory(patientId: string, instrumentId?: InstrumentId): AssessmentResult[] {
  return state().results
    .filter((r) => r.patientId === patientId && (!instrumentId || r.instrumentId === instrumentId))
    .sort((a, b) => a.completedAt.localeCompare(b.completedAt));
}
export function getPatientActiveInstruments(patientId: string): InstrumentId[] {
  const set = new Set<InstrumentId>();
  state().results.forEach((r) => { if (r.patientId === patientId) set.add(r.instrumentId); });
  return [...set];
}
export function getLatestResultFor(patientId: string, instrumentId: InstrumentId): AssessmentResult | undefined {
  const t = getPatientTrajectory(patientId, instrumentId);
  return t[t.length - 1];
}
export function getCriticalFlags(): AssessmentResult[] {
  return listResults().filter((r) => r.criticalFlags.length > 0 && !r.clinicianReviewed);
}
export function listAssignments(): AssessmentAssignment[] {
  return [...state().assignments].sort((a, b) => (a.dueAt ?? a.assignedAt).localeCompare(b.dueAt ?? b.assignedAt));
}
export function getDueThisWeek(): AssessmentAssignment[] {
  const now = Date.now();
  const week = now + 7 * 86_400_000;
  return listAssignments().filter((a) => a.status === "pending" && a.dueAt && new Date(a.dueAt).getTime() <= week);
}
export function getAssignment(id: string): AssessmentAssignment | undefined {
  return state().assignments.find((a) => a.id === id);
}

// ─── Practice pulse metrics ──────────────────────────────────
const DAY = 86_400_000;
export function practicePulse() {
  const s = state();
  const now = Date.now();
  const in30 = s.results.filter((r) => now - new Date(r.completedAt).getTime() <= 30 * DAY);
  const in30Assign = s.assignments.filter((a) => now - new Date(a.assignedAt).getTime() <= 30 * DAY);
  const due = s.assignments.filter((a) => a.status === "pending");
  const onTime = in30.filter((r) => {
    const a = s.assignments.find((x) => x.id === r.assignmentId);
    return a?.dueAt ? r.completedAt <= a.dueAt : true;
  }).length;
  const critical = getCriticalFlags().length;

  // Average delta per instrument across recent results
  const deltas: number[] = [];
  in30.forEach((r) => { if (typeof r.deltaFromLast === "number") deltas.push(r.deltaFromLast); });
  const avgDelta = deltas.length ? deltas.reduce((a, b) => a + b, 0) / deltas.length : 0;

  return {
    dueCount: due.length,
    onTimePct: in30.length ? Math.round((onTime / in30.length) * 100) : 100,
    completed30d: in30.length,
    completed30dTrend: bucketByDay(in30, 7),
    critical,
    avgDelta,
    assignedThisWeek: in30Assign.length,
  };
}
function bucketByDay(rs: AssessmentResult[], days: number): number[] {
  const out = new Array(days).fill(0);
  const now = Date.now();
  rs.forEach((r) => {
    const idx = days - 1 - Math.floor((now - new Date(r.completedAt).getTime()) / DAY);
    if (idx >= 0 && idx < days) out[idx]++;
  });
  return out;
}

// ─── Mutations ───────────────────────────────────────────────
export function createAssignment(input: Omit<AssessmentAssignment, "id" | "assignedAt" | "status"> & { status?: AssignmentStatus }): AssessmentAssignment {
  const a: AssessmentAssignment = {
    ...input,
    id: uid("asn"),
    assignedAt: new Date().toISOString(),
    status: input.status ?? "pending",
  };
  mutate((s) => ({ ...s, assignments: [a, ...s.assignments] }));
  return a;
}
export function updateAssignment(id: string, patch: Partial<AssessmentAssignment>): AssessmentAssignment | undefined {
  let out: AssessmentAssignment | undefined;
  mutate((s) => ({ ...s, assignments: s.assignments.map((a) => (a.id === id ? (out = { ...a, ...patch }) : a)) }));
  return out;
}
export function revokeAssignment(id: string): void { updateAssignment(id, { status: "expired" }); }

export function submitResult(assignmentId: string, responses: Record<string, number>): AssessmentResult {
  const a = getAssignment(assignmentId);
  if (!a) throw new Error("Assignment not found: " + assignmentId);
  const scored = computeSeverity(a.instrumentId, responses);
  const previous = getLatestResultFor(a.patientId, a.instrumentId);
  const result: AssessmentResult = {
    id: uid("res"),
    assignmentId,
    patientId: a.patientId,
    instrumentId: a.instrumentId,
    completedAt: new Date().toISOString(),
    responses,
    totalScore: scored.totalScore,
    severity: scored.severity,
    criticalFlags: scored.criticalFlags,
    deltaFromLast: previous ? scored.totalScore - previous.totalScore : undefined,
    clinicianReviewed: false,
  };
  mutate((s) => ({
    ...s,
    results: [result, ...s.results],
    assignments: s.assignments.map((x) => (x.id === assignmentId ? { ...x, status: "completed" as AssignmentStatus } : x)),
  }));
  return result;
}
export function markReviewed(resultId: string): void {
  mutate((s) => ({ ...s, results: s.results.map((r) => (r.id === resultId ? { ...r, clinicianReviewed: true } : r)) }));
}

export function addCustomInstrument(input: Omit<Instrument, "builtIn" | "id"> & { id?: string }): Instrument {
  const inst: Instrument = { ...input, id: input.id ?? uid("inst"), builtIn: false };
  mutate((s) => ({ ...s, instruments: [...s.instruments, inst] }));
  return inst;
}

// ─── Hooks ───────────────────────────────────────────────────
export function useLiveInstruments(): Instrument[] {
  return useSyncExternalStore(subscribe, () => snap("instruments", listInstruments), () => snap("instruments:ssr", listInstruments));
}
export function useLiveResults(): AssessmentResult[] {
  return useSyncExternalStore(subscribe, () => snap("results", listResults), () => snap("results:ssr", listResults));
}
export function useLiveAssignments(): AssessmentAssignment[] {
  return useSyncExternalStore(subscribe, () => snap("assignments", listAssignments), () => snap("assignments:ssr", listAssignments));
}
export function useLiveResult(id: string): AssessmentResult | undefined {
  const [x, setX] = useState<AssessmentResult | undefined>(() => getResult(id));
  useEffect(() => { setX(getResult(id)); return subscribe(() => setX(getResult(id))); }, [id]);
  return x;
}
export function useLiveAssignment(id: string): AssessmentAssignment | undefined {
  const [x, setX] = useState<AssessmentAssignment | undefined>(() => getAssignment(id));
  useEffect(() => { setX(getAssignment(id)); return subscribe(() => setX(getAssignment(id))); }, [id]);
  return x;
}
export function useCriticalFlagCount(): number {
  return useSyncExternalStore(subscribe, () => getCriticalFlags().length, () => 0);
}
export function useLivePatientTrajectory(patientId: string, instrumentId?: InstrumentId): AssessmentResult[] {
  const key = patientId + "|" + (instrumentId ?? "");
  const [x, setX] = useState<AssessmentResult[]>(() => getPatientTrajectory(patientId, instrumentId));
  useEffect(() => { setX(getPatientTrajectory(patientId, instrumentId)); return subscribe(() => setX(getPatientTrajectory(patientId, instrumentId))); }, [key]);
  return x;
}


// ─── Seed ────────────────────────────────────────────────────
function seed(): StoreShape {
  // Deterministic RNG for repeatable seeds
  let seedN = 42;
  function rand() { seedN = (seedN * 9301 + 49297) % 233280; return seedN / 233280; }
  function pick<T>(arr: T[]): T { return arr[Math.floor(rand() * arr.length)]; }

  const now = Date.now();
  const iso = (daysAgo: number, hour = 10) => {
    const d = new Date(now); d.setHours(hour, 0, 0, 0); d.setDate(d.getDate() - daysAgo);
    return d.toISOString();
  };

  const patients = [
    { id: "pat_priya",  trend: "worsening" as const, instrs: ["phq9", "gad7"] },
    { id: "pat_aarav",  trend: "improving" as const, instrs: ["gad7", "phq9"] },
    { id: "pat_ananya", trend: "improving" as const, instrs: ["phq9"] },
    { id: "pat_kabir",  trend: "plateaued" as const, instrs: ["phq9", "wsas"] },
    { id: "pat_diya",   trend: "improving" as const, instrs: ["phq9", "gad7"] },
    { id: "pat_rohan",  trend: "critical" as const,  instrs: ["phq9", "cssrs", "gad7"] },
    { id: "pat_meera",  trend: "plateaued" as const, instrs: ["gad7"] },
    { id: "pat_sanjay", trend: "worsening" as const, instrs: ["gad7", "phq9"] },
    { id: "pat_isha",   trend: "improving" as const, instrs: ["wsas", "phq9"] },
    { id: "pat_vikram", trend: "improving" as const, instrs: ["phq9"] },
    { id: "pat_zara",   trend: "improving" as const, instrs: ["phq9"] },
    { id: "pat_arjun",  trend: "improving" as const, instrs: ["phq9", "gad7"] },
  ];

  const results: AssessmentResult[] = [];
  const assignments: AssessmentAssignment[] = [];

  function synthResponses(inst: Instrument, target: number): Record<string, number> {
    const n = inst.items.length;
    const maxPer = Math.max(...inst.items[0].scale.map((s) => s.value));
    const clamped = Math.max(0, Math.min(n * maxPer, target));
    const responses: Record<string, number> = {};
    let remaining = clamped;
    inst.items.forEach((it, i) => {
      const left = n - i;
      const avg = Math.max(0, Math.min(maxPer, Math.round(remaining / left)));
      const jitter = Math.round((rand() - 0.5) * 2);
      const v = Math.max(0, Math.min(maxPer, avg + jitter));
      responses[it.id] = v;
      remaining -= v;
    });
    return responses;
  }

  patients.forEach((p) => {
    p.instrs.forEach((instId) => {
      const inst = BUILT_IN.find((x) => x.id === instId)!;
      const maxScore = inst.items.length * Math.max(...inst.items[0].scale.map((s) => s.value));

      // 4–6 historical points
      const n = 4 + Math.floor(rand() * 3);
      let start = Math.round(maxScore * (p.trend === "improving" ? 0.7 : p.trend === "critical" ? 0.75 : 0.55));
      const step = p.trend === "improving" ? -Math.max(1, Math.round(maxScore * 0.06))
                 : p.trend === "worsening" ? +Math.max(1, Math.round(maxScore * 0.06))
                 : p.trend === "critical" ? +Math.max(1, Math.round(maxScore * 0.05))
                 : 0;

      let previous: AssessmentResult | undefined;
      for (let i = 0; i < n; i++) {
        const daysAgo = (n - i) * 14 + Math.floor(rand() * 3);
        const target = Math.max(0, Math.min(maxScore, start + step * i + Math.round((rand() - 0.5) * 2)));
        let responses = synthResponses(inst, target);

        // For critical patient's PHQ-9, force Q9 = 1+ on latest and one prior
        if (p.trend === "critical" && instId === "phq9" && i >= n - 2) responses["phq_9"] = 1;
        // C-SSRS critical for latest
        if (p.trend === "critical" && instId === "cssrs" && i === n - 1) { responses["css_1"] = 1; responses["css_2"] = 1; responses["css_3"] = 1; }

        // Inline scoring — cannot call computeSeverity() here because it
        // reads store state, and store state is still being seeded.
        const totalScore = Object.values(responses).reduce((a, b) => a + (Number(b) || 0), 0);
        const band = inst.scoring.ranges.find((r) => totalScore >= r.min && totalScore <= r.max) ?? inst.scoring.ranges[inst.scoring.ranges.length - 1];
        const threshold = inst.scoring.criticalThreshold ?? 1;
        const criticalFlags: string[] = [];
        (inst.scoring.criticalItems ?? []).forEach((iid) => { if ((responses[iid] ?? 0) >= threshold) criticalFlags.push(iid); });
        const scored = { totalScore, severity: band.severity, band, criticalFlags };
        const asn: AssessmentAssignment = {
          id: uid("asn"),
          patientId: p.id,
          instrumentId: instId,
          assignedAt: iso(daysAgo + 3),
          dueAt: iso(daysAgo + 1),
          cadence: "biweekly",
          status: "completed",
        };
        const res: AssessmentResult = {
          id: uid("res"),
          assignmentId: asn.id,
          patientId: p.id,
          instrumentId: instId,
          completedAt: iso(daysAgo),
          responses,
          totalScore: scored.totalScore,
          severity: scored.severity,
          criticalFlags: scored.criticalFlags,
          deltaFromLast: previous ? scored.totalScore - previous.totalScore : undefined,
          clinicianReviewed: i < n - 1 || (p.trend !== "critical" && scored.criticalFlags.length === 0),
        };
        assignments.push(asn);
        results.push(res);
        previous = res;
      }
    });
  });

  // Pending assignments due this week
  const dueSoon: Array<{ p: string; inst: string; days: number }> = [
    { p: "pat_priya",  inst: "phq9", days: 2 },
    { p: "pat_priya",  inst: "gad7", days: 2 },
    { p: "pat_aarav",  inst: "gad7", days: 4 },
    { p: "pat_kabir",  inst: "phq9", days: -1 },  // overdue
    { p: "pat_meera",  inst: "gad7", days: 5 },
    { p: "pat_sanjay", inst: "phq9", days: 1 },
    { p: "pat_isha",   inst: "wsas", days: 6 },
    { p: "pat_diya",   inst: "phq9", days: 3 },
    { p: "pat_rohan",  inst: "cssrs", days: 0 },
  ];
  dueSoon.forEach((d) => {
    assignments.push({
      id: uid("asn"),
      patientId: d.p,
      instrumentId: d.inst,
      assignedAt: iso(3),
      dueAt: iso(-d.days),
      cadence: d.inst === "cssrs" ? "once" : "biweekly",
      status: "pending",
    });
  });

  return { instruments: BUILT_IN, assignments, results };
}

export function resetAssessments() { cache = seed(); save(cache); }
