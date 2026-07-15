// PeaceCode · Practice — Homework store.
// Assignments, submissions (with field-schema templates), review
// feedback thread, streaks, and audit log. localStorage-backed.

import { useSyncExternalStore } from "react";
import { listPatients } from "@/lib/patients-store";

// ─── Types ───────────────────────────────────────────────────
export type Modality = "CBT" | "DBT" | "ACT" | "Mindfulness" | "Behavioral" | "Reflective";

export type FieldType =
  | "short" | "long" | "scale" | "mood" | "checklist"
  | "image" | "voice" | "timer";

export type TemplateField = {
  key: string;
  label: string;
  type: FieldType;
  hint?: string;
  options?: string[]; // for checklist
  min?: number; max?: number; // for scale
};

export type HomeworkTemplate = {
  id: string;
  name: string;
  modality: Modality;
  description: string;
  defaultInstructions: string;
  fields: TemplateField[];
  isCustom?: boolean;
};

export type Recurrence = "once" | "daily" | "weekly";

export type AssignmentStatus =
  | "assigned" | "in_progress" | "completed" | "missed" | "reviewed";

export type SubmissionValues = Record<string, string | number | boolean | string[]>;

export type Submission = {
  id: string;
  at: number;
  values: SubmissionValues;
  note?: string;
};

export type ThreadMessage = {
  id: string;
  from: "clinician" | "patient";
  at: number;
  body: string;
};

export type Assignment = {
  id: string;
  patientId: string;
  templateId: string;
  templateSnapshot: Pick<HomeworkTemplate, "name" | "modality" | "fields" | "description">;
  instructions: string;
  reflectionPrompt?: string;
  recurrence: Recurrence;
  assignedAt: number;
  dueAt: number;
  status: AssignmentStatus;
  submissions: Submission[];
  thread: ThreadMessage[];
  reviewedAt?: number;
  reviewerNote?: string;
  attachedDocumentId?: string;
};

export type AuditEntry = { id: string; at: number; who: string; action: string; ref: string };

const KEY = "peacecode.therapist.homework.v1";
const AUDIT_KEY = "peacecode.therapist.homework-audit.v1";
const CLINICIAN = "Dr. Aditi Rao";

// ─── Bus ─────────────────────────────────────────────────────
const listeners = new Set<() => void>();
let snapCache: Record<string, unknown> = {};
function emit() { snapCache = {}; listeners.forEach((fn) => fn()); }
function subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }

function isBrowser() { return typeof window !== "undefined" && typeof window.localStorage !== "undefined"; }

type Shape = { assignments: Assignment[]; templates: HomeworkTemplate[] };

function readAll(): Shape {
  if (!isBrowser()) return { assignments: [], templates: SEED_TEMPLATES };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Shape;
      // ensure templates include seed IDs (in case store shipped without customs)
      const missing = SEED_TEMPLATES.filter((t) => !parsed.templates.some((x) => x.id === t.id));
      if (missing.length) parsed.templates = [...missing, ...parsed.templates];
      return parsed;
    }
    const seeded: Shape = { assignments: seedAssignments(SEED_TEMPLATES), templates: SEED_TEMPLATES };
    window.localStorage.setItem(KEY, JSON.stringify(seeded));
    return seeded;
  } catch {
    return { assignments: [], templates: SEED_TEMPLATES };
  }
}

function writeAll(shape: Shape) {
  if (!isBrowser()) return;
  window.localStorage.setItem(KEY, JSON.stringify(shape));
  emit();
}
function audit(action: string, ref: string) {
  if (!isBrowser()) return;
  const raw = window.localStorage.getItem(AUDIT_KEY);
  const list: AuditEntry[] = raw ? JSON.parse(raw) : [];
  list.push({ id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, at: Date.now(), who: CLINICIAN, action, ref });
  window.localStorage.setItem(AUDIT_KEY, JSON.stringify(list));
}

// ─── Public API ──────────────────────────────────────────────
export function listAssignments(): Assignment[] {
  // Auto-mark missed if past due with no submissions
  const now = Date.now();
  const shape = readAll();
  let dirty = false;
  for (const a of shape.assignments) {
    if (a.status === "assigned" && a.dueAt < now && a.submissions.length === 0) {
      a.status = "missed"; dirty = true;
    }
  }
  if (dirty) writeAll(shape);
  return shape.assignments.slice().sort((x, y) => y.assignedAt - x.assignedAt);
}
export function getAssignment(id: string): Assignment | undefined {
  return readAll().assignments.find((a) => a.id === id);
}
export function assignmentsForPatient(pid: string): Assignment[] {
  return listAssignments().filter((a) => a.patientId === pid);
}
export function listTemplates(): HomeworkTemplate[] {
  return readAll().templates.slice();
}
export function getTemplate(id: string): HomeworkTemplate | undefined {
  return readAll().templates.find((t) => t.id === id);
}

export function createAssignment(input: {
  patientIds: string[];
  templateId: string;
  instructions?: string;
  reflectionPrompt?: string;
  dueAt: number;
  recurrence: Recurrence;
  attachedDocumentId?: string;
}): Assignment[] {
  const shape = readAll();
  const tpl = shape.templates.find((t) => t.id === input.templateId);
  if (!tpl) throw new Error("template not found");
  const now = Date.now();
  const created: Assignment[] = input.patientIds.map((pid) => ({
    id: `hw-${now}-${pid.slice(-4)}-${Math.random().toString(36).slice(2, 5)}`,
    patientId: pid,
    templateId: tpl.id,
    templateSnapshot: { name: tpl.name, modality: tpl.modality, fields: tpl.fields, description: tpl.description },
    instructions: input.instructions?.trim() || tpl.defaultInstructions,
    reflectionPrompt: input.reflectionPrompt,
    recurrence: input.recurrence,
    assignedAt: now,
    dueAt: input.dueAt,
    status: "assigned",
    submissions: [],
    thread: [],
    attachedDocumentId: input.attachedDocumentId,
  }));
  shape.assignments = [...created, ...shape.assignments];
  writeAll(shape);
  created.forEach((a) => audit("assign", a.id));
  return created;
}

export function addSubmission(hid: string, values: SubmissionValues, note?: string): Assignment | undefined {
  const shape = readAll();
  const a = shape.assignments.find((x) => x.id === hid);
  if (!a) return undefined;
  a.submissions = [...a.submissions, { id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`, at: Date.now(), values, note }];
  if (a.status === "assigned") a.status = "in_progress";
  if (a.recurrence === "once") a.status = "completed";
  writeAll(shape);
  audit("submit", a.id);
  return a;
}

export function markReviewed(hid: string, reviewerNote?: string): Assignment | undefined {
  const shape = readAll();
  const a = shape.assignments.find((x) => x.id === hid);
  if (!a) return undefined;
  a.status = "reviewed";
  a.reviewedAt = Date.now();
  if (reviewerNote) a.reviewerNote = reviewerNote;
  writeAll(shape);
  audit("review", a.id);
  return a;
}

export function markCompleteOnBehalf(hid: string): Assignment | undefined {
  const shape = readAll();
  const a = shape.assignments.find((x) => x.id === hid);
  if (!a) return undefined;
  a.status = "completed";
  writeAll(shape);
  audit("complete-manual", a.id);
  return a;
}

export function extendDeadline(hid: string, newDueAt: number): Assignment | undefined {
  const shape = readAll();
  const a = shape.assignments.find((x) => x.id === hid);
  if (!a) return undefined;
  a.dueAt = newDueAt;
  if (a.status === "missed") a.status = "assigned";
  writeAll(shape);
  audit("extend", a.id);
  return a;
}

export function retireAssignment(hid: string) {
  const shape = readAll();
  shape.assignments = shape.assignments.filter((a) => a.id !== hid);
  writeAll(shape);
  audit("retire", hid);
}

export function addThreadMessage(hid: string, from: "clinician" | "patient", body: string): Assignment | undefined {
  const shape = readAll();
  const a = shape.assignments.find((x) => x.id === hid);
  if (!a) return undefined;
  a.thread = [...a.thread, { id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`, from, at: Date.now(), body }];
  writeAll(shape);
  audit("thread", a.id);
  return a;
}

export function saveTemplate(t: HomeworkTemplate) {
  const shape = readAll();
  const idx = shape.templates.findIndex((x) => x.id === t.id);
  if (idx >= 0) shape.templates[idx] = t; else shape.templates = [...shape.templates, t];
  writeAll(shape);
  audit("template-save", t.id);
}

export function complianceForPatient(pid: string) {
  const list = assignmentsForPatient(pid);
  if (list.length === 0) return { total: 0, completed: 0, missed: 0, rate: 0, streak: 0, ghost: true };
  const completed = list.filter((a) => a.status === "completed" || a.status === "reviewed").length;
  const missed = list.filter((a) => a.status === "missed").length;
  const rate = Math.round((completed / list.length) * 100);
  // streak = consecutive completed in most-recent order
  let streak = 0;
  for (const a of list) {
    if (a.status === "completed" || a.status === "reviewed") streak++;
    else break;
  }
  const ghost = list.every((a) => a.submissions.length === 0);
  return { total: list.length, completed, missed, rate, streak, ghost };
}

// ─── Hooks ───────────────────────────────────────────────────
function cached<T>(k: string, fn: () => T): T {
  if (k in snapCache) return snapCache[k] as T;
  const v = fn(); snapCache[k] = v; return v;
}
export function useLiveAssignments(): Assignment[] {
  return useSyncExternalStore(subscribe, () => cached("all", listAssignments), () => []);
}
export function useLiveAssignment(id: string): Assignment | undefined {
  return useSyncExternalStore(subscribe, () => cached(`a:${id}`, () => getAssignment(id)), () => undefined);
}
export function useLiveTemplates(): HomeworkTemplate[] {
  return useSyncExternalStore(subscribe, () => cached("tpls", listTemplates), () => []);
}

// ─── Seed templates (23) ─────────────────────────────────────
const F = (key: string, label: string, type: FieldType, extra: Partial<TemplateField> = {}): TemplateField => ({ key, label, type, ...extra });

export const SEED_TEMPLATES: HomeworkTemplate[] = [
  // CBT
  { id: "t-thought-record", name: "Thought record", modality: "CBT", description: "Situation → automatic thought → evidence → balanced thought.",
    defaultInstructions: "When you notice a strong feeling, pause and fill this in. One row per event.",
    fields: [
      F("situation", "Situation", "long", { hint: "Where, when, who." }),
      F("thought", "Automatic thought", "long"),
      F("emotion", "Emotion (0–10)", "scale", { min: 0, max: 10 }),
      F("evidenceFor", "Evidence for the thought", "long"),
      F("evidenceAgainst", "Evidence against", "long"),
      F("balanced", "Balanced thought", "long"),
    ]},
  { id: "t-cognitive-triangle", name: "Cognitive triangle", modality: "CBT", description: "Map thought → feeling → behavior for a recent event.",
    defaultInstructions: "Pick one event this week and complete all three corners.",
    fields: [F("event", "Event", "long"), F("thought", "Thought", "long"), F("feeling", "Feeling", "long"), F("behavior", "Behavior", "long")]},
  { id: "t-behavioral-experiment", name: "Behavioral experiment", modality: "CBT", description: "Test a prediction against reality.",
    defaultInstructions: "Choose one belief to test. Predict, act, observe, review.",
    fields: [F("belief", "Belief being tested", "long"), F("prediction", "What I expect will happen", "long"), F("experiment", "The experiment", "long"), F("result", "What actually happened", "long"), F("learning", "What I learned", "long")]},
  { id: "t-activity-scheduling", name: "Activity scheduling", modality: "CBT", description: "Plan and rate pleasant / mastery activities daily.",
    defaultInstructions: "Add 1–3 activities each day. Rate pleasure and mastery afterwards.",
    fields: [F("activity", "Activity", "short"), F("pleasure", "Pleasure (0–10)", "scale", { min: 0, max: 10 }), F("mastery", "Mastery (0–10)", "scale", { min: 0, max: 10 })]},
  { id: "t-cost-benefit", name: "Cost–benefit analysis", modality: "CBT", description: "Weigh short/long-term costs and benefits of a behavior.",
    defaultInstructions: "Focus on one behavior you want to understand.",
    fields: [F("behavior", "Behavior", "short"), F("shortBenefit", "Short-term benefits", "long"), F("shortCost", "Short-term costs", "long"), F("longBenefit", "Long-term benefits", "long"), F("longCost", "Long-term costs", "long")]},
  // DBT
  { id: "t-diary-card", name: "Diary card", modality: "DBT", description: "Daily emotions, urges, skills used.",
    defaultInstructions: "Fill in at the end of each day. Takes about 3 minutes.",
    fields: [F("emotion", "Peak emotion (0–5)", "scale", { min: 0, max: 5 }), F("urge", "Peak urge (0–5)", "scale", { min: 0, max: 5 }), F("skills", "Skills used", "checklist", { options: ["TIPP", "STOP", "DEAR MAN", "Wise mind", "Opposite action", "Radical acceptance"] }), F("notes", "Notes", "long")]},
  { id: "t-tipp-log", name: "TIPP skills log", modality: "DBT", description: "Track when you use each TIPP skill.",
    defaultInstructions: "Whenever you use temperature, intense exercise, paced breathing, or paired muscle relaxation.",
    fields: [F("skill", "Which TIPP", "checklist", { options: ["Temperature", "Intense exercise", "Paced breathing", "Paired muscle"] }), F("suds_before", "SUDS before", "scale", { min: 0, max: 10 }), F("suds_after", "SUDS after", "scale", { min: 0, max: 10 })]},
  { id: "t-ie-rehearsal", name: "Interpersonal effectiveness rehearsal", modality: "DBT", description: "Practice DEAR MAN in writing before the real conversation.",
    defaultInstructions: "Pick one upcoming interaction. Draft each step.",
    fields: [F("describe", "Describe", "long"), F("express", "Express", "long"), F("assert", "Assert", "long"), F("reinforce", "Reinforce", "long"), F("mindful", "Mindful", "long"), F("appear", "Appear confident", "long"), F("negotiate", "Negotiate", "long")]},
  { id: "t-wise-mind", name: "Wise mind exercise", modality: "DBT", description: "Notice emotion mind, reason mind, and the wise mind in between.",
    defaultInstructions: "When facing a decision, log all three voices before acting.",
    fields: [F("situation", "Situation", "long"), F("emotion", "Emotion mind says", "long"), F("reason", "Reason mind says", "long"), F("wise", "Wise mind says", "long")]},
  // ACT
  { id: "t-values-clarification", name: "Values clarification", modality: "ACT", description: "Name what matters most across life domains.",
    defaultInstructions: "One line per domain. Don't overthink — first honest answer.",
    fields: [F("relationships", "Relationships", "long"), F("work", "Work / study", "long"), F("health", "Health", "long"), F("growth", "Personal growth", "long")]},
  { id: "t-defusion", name: "Defusion practice", modality: "ACT", description: "Notice thoughts as thoughts, not commands.",
    defaultInstructions: "Try 'I'm having the thought that…' with a sticky thought.",
    fields: [F("thought", "The sticky thought", "long"), F("distance", "Distance felt (0–10)", "scale", { min: 0, max: 10 }), F("notes", "What shifted", "long")]},
  { id: "t-willingness", name: "Willingness exercise", modality: "ACT", description: "Rate willingness to hold a difficult feeling in service of a value.",
    defaultInstructions: "Pick one feeling and one value it serves. Rate willingness.",
    fields: [F("feeling", "Feeling", "short"), F("value", "Value served", "short"), F("willingness", "Willingness (0–10)", "scale", { min: 0, max: 10 })]},
  // Mindfulness
  { id: "t-breathing-space", name: "3-minute breathing space", modality: "Mindfulness", description: "Awareness → gathering → expansion.",
    defaultInstructions: "Set a 3-minute timer. Log once daily.",
    fields: [F("timer", "Time (minutes)", "timer"), F("before", "Before (0–10)", "scale", { min: 0, max: 10 }), F("after", "After (0–10)", "scale", { min: 0, max: 10 }), F("notes", "Notes", "long")]},
  { id: "t-body-scan", name: "Body scan log", modality: "Mindfulness", description: "Sweep attention from feet to head. Note what you find.",
    defaultInstructions: "10–20 minutes, ideally same time each day.",
    fields: [F("duration", "Duration", "timer"), F("tension", "Tension found", "long"), F("shift", "Shift observed", "long")]},
  { id: "t-mindful-walk", name: "Mindful walking journal", modality: "Mindfulness", description: "Anchor to steps, breath, senses.",
    defaultInstructions: "Walk without headphones for 10+ minutes. Log after.",
    fields: [F("duration", "Duration", "timer"), F("noticed", "What I noticed", "long")]},
  // Behavioral
  { id: "t-exposure-hierarchy", name: "Exposure hierarchy", modality: "Behavioral", description: "Rank feared situations from mild to severe.",
    defaultInstructions: "10 items ideally. SUDS 0–100 per item.",
    fields: [F("items", "List (one per line)", "long"), F("today", "Today's step", "short"), F("suds_before", "SUDS before", "scale", { min: 0, max: 100 }), F("suds_after", "SUDS after", "scale", { min: 0, max: 100 })]},
  { id: "t-sleep-log", name: "Sleep log", modality: "Behavioral", description: "Bedtime, wake time, quality, notes.",
    defaultInstructions: "Fill in each morning within the first hour.",
    fields: [F("bed", "Bedtime", "short"), F("wake", "Wake time", "short"), F("quality", "Quality (0–10)", "scale", { min: 0, max: 10 }), F("notes", "Notes", "long")]},
  { id: "t-habit-tracker", name: "Habit tracker", modality: "Behavioral", description: "Tick daily habits.",
    defaultInstructions: "Check off habits done today.",
    fields: [F("habits", "Habits", "checklist", { options: ["Water", "Walk", "Meds", "Journal", "Sleep by 11", "Off phone by 10"] })]},
  { id: "t-trigger-diary", name: "Trigger diary", modality: "Behavioral", description: "Log triggers, response, alternative response.",
    defaultInstructions: "When you notice a trigger — pause and log briefly.",
    fields: [F("trigger", "Trigger", "long"), F("response", "What I did", "long"), F("alt", "Alternative I could try", "long")]},
  // Reflective
  { id: "t-gratitude", name: "Gratitude journal", modality: "Reflective", description: "Three things, once a day.",
    defaultInstructions: "Three specific things. 'The chai' beats 'family'.",
    fields: [F("one", "One", "short"), F("two", "Two", "short"), F("three", "Three", "short")]},
  { id: "t-weekly-review", name: "Weekly review", modality: "Reflective", description: "Wins, misses, next week.",
    defaultInstructions: "Sunday evening, 15 minutes.",
    fields: [F("wins", "Wins", "long"), F("misses", "Misses", "long"), F("next", "Next week's focus", "long")]},
  { id: "t-letter-to-self", name: "Letter to self", modality: "Reflective", description: "A letter from future you to present you.",
    defaultInstructions: "Write from six months out. Warmth, not lecture.",
    fields: [F("letter", "The letter", "long")]},
  { id: "t-values-in-action", name: "Values-in-action log", modality: "Reflective", description: "Where did you act in line with your values today?",
    defaultInstructions: "One moment. One value. One small step.",
    fields: [F("moment", "The moment", "long"), F("value", "The value", "short"), F("step", "The step", "long")]},
];

// ─── Seed assignments (15+) ─────────────────────────────────
function seedAssignments(templates: HomeworkTemplate[]): Assignment[] {
  const patients = listPatients().slice(0, 6);
  if (patients.length === 0) return [];
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const T = (id: string) => templates.find((t) => t.id === id)!;

  const mk = (
    pid: string, tid: string, ageDays: number, dueInDays: number, status: AssignmentStatus,
    submissionsCount = 0, recurrence: Recurrence = "once", extraSubs: SubmissionValues[] = [],
  ): Assignment => {
    const tpl = T(tid);
    const assignedAt = now - ageDays * day;
    const dueAt = assignedAt + (dueInDays + ageDays) * day;
    const submissions: Submission[] = [];
    for (let i = 0; i < submissionsCount; i++) {
      submissions.push({
        id: `sub-seed-${tid}-${pid.slice(-4)}-${i}`,
        at: assignedAt + Math.max(1, Math.floor(day * (i + 1) * (dueInDays / Math.max(1, submissionsCount)))),
        values: extraSubs[i] ?? sampleValues(tpl),
      });
    }
    return {
      id: `hw-seed-${tid}-${pid.slice(-4)}`,
      patientId: pid, templateId: tpl.id,
      templateSnapshot: { name: tpl.name, modality: tpl.modality, fields: tpl.fields, description: tpl.description },
      instructions: tpl.defaultInstructions,
      recurrence, assignedAt, dueAt, status,
      submissions, thread: [],
    };
  };

  const [p0, p1, p2, p3, p4, p5] = patients;
  const list: Assignment[] = [
    // p0 — engaged, mostly reviewed, mood log recurring
    mk(p0.id, "t-thought-record", 6, 3, "reviewed", 3),
    mk(p0.id, "t-diary-card", 14, 14, "in_progress", 14, "daily", moodSeries(14, 5)),
    mk(p0.id, "t-values-in-action", 2, 4, "assigned", 0),
    // p1 — awaiting review + one overdue
    mk(p1.id, "t-sleep-log", 8, 7, "completed", 6, "daily"),
    mk(p1.id, "t-behavioral-experiment", 4, 3, "completed", 1),
    mk(p1.id, "t-exposure-hierarchy", 12, -3, "missed", 0),
    // p2 — DBT arc
    mk(p2.id, "t-tipp-log", 10, 7, "completed", 4),
    mk(p2.id, "t-wise-mind", 3, 5, "in_progress", 1),
    mk(p2.id, "t-diary-card", 14, 14, "in_progress", 14, "daily", moodSeries(14, 3)),
    // p3 — ghost patient (assigned but nothing done)
    mk(p3.id, "t-gratitude", 5, 2, "assigned", 0, "daily"),
    mk(p3.id, "t-breathing-space", 9, -1, "missed", 0),
    // p4 — completed, awaiting review
    mk(p4.id, "t-cognitive-triangle", 5, 4, "completed", 1),
    mk(p4.id, "t-weekly-review", 6, 1, "completed", 1),
    // p5 — mix, one overdue
    mk(p5.id, "t-habit-tracker", 7, -2, "missed", 3, "daily"),
    mk(p5.id, "t-defusion", 3, 4, "completed", 2),
    mk(p5.id, "t-mindful-walk", 1, 7, "assigned", 0),
  ];
  return list;
}

function sampleValues(t: HomeworkTemplate): SubmissionValues {
  const v: SubmissionValues = {};
  for (const f of t.fields) {
    if (f.type === "short" || f.type === "long") v[f.key] = "Recorded reflection.";
    else if (f.type === "scale") v[f.key] = Math.floor(((f.max ?? 10) - (f.min ?? 0)) / 2);
    else if (f.type === "mood") v[f.key] = 3;
    else if (f.type === "checklist") v[f.key] = (f.options ?? []).slice(0, 1);
    else if (f.type === "timer") v[f.key] = 3;
    else v[f.key] = "";
  }
  return v;
}
function moodSeries(n: number, base: number): SubmissionValues[] {
  const out: SubmissionValues[] = [];
  for (let i = 0; i < n; i++) {
    const swing = Math.sin(i / 2) * 1.5 + (Math.random() - 0.5);
    out.push({
      emotion: Math.max(0, Math.min(5, Math.round(base + swing))),
      urge: Math.max(0, Math.min(5, Math.round(base - 1 + swing / 2))),
      skills: (i % 3 === 0 ? ["TIPP"] : i % 3 === 1 ? ["Wise mind"] : ["STOP"]),
      notes: "",
    });
  }
  return out;
}
