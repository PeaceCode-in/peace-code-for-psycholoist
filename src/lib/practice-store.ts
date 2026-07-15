// Local mock store for the Practice (therapist) app.
// Seeded fixtures — same pattern as buddies-store. Swap for backend later.

export type SessionModality = "video" | "in-person" | "phone";
export type SessionStatus = "upcoming" | "in-progress" | "completed" | "cancelled" | "no-show";

export type Patient = {
  id: string;
  initials: string;
  name: string; // display, may be pseudonym
  pronouns?: string;
  age: number;
  since: string; // ISO
  lastSession?: string; // ISO
  nextSession?: string; // ISO
  primaryConcern: string;
  riskLevel: "low" | "moderate" | "elevated" | "high";
  tags: string[];
  totalSessions: number;
};

export type Session = {
  id: string;
  patientId: string;
  startsAt: string; // ISO
  minutes: number;
  modality: SessionModality;
  status: SessionStatus;
  fee: number; // INR
  type: string; // e.g. "CBT · Follow-up"
};

export type Alert = {
  id: string;
  patientId: string;
  kind: "risk-flag" | "missed-session" | "intake-pending" | "assessment-due" | "message";
  message: string;
  createdAt: string;
  priority: "low" | "medium" | "high";
};

export type ClinicalNote = {
  id: string;
  patientId: string;
  sessionId?: string;
  createdAt: string;
  summary: string;
  format: "SOAP" | "DAP" | "Free";
};

export type IntakeRequest = {
  id: string;
  name: string;
  initials: string;
  age: number;
  reason: string;
  requestedAt: string;
  preferred: string; // e.g. "Evenings, video"
};

// ─── Fixtures ────────────────────────────────────────────────
const now = Date.now();
const iso = (offsetHrs: number) => new Date(now + offsetHrs * 3600_000).toISOString();

export const PATIENTS: Patient[] = [
  { id: "p1", initials: "AR", name: "A. R.", pronouns: "she/her", age: 21, since: iso(-24 * 90), lastSession: iso(-24 * 3), nextSession: iso(2), primaryConcern: "Exam anxiety", riskLevel: "low", tags: ["CBT", "Weekly"], totalSessions: 11 },
  { id: "p2", initials: "MK", name: "M. K.", pronouns: "he/him", age: 27, since: iso(-24 * 180), lastSession: iso(-24 * 10), primaryConcern: "GAD, sleep", riskLevel: "moderate", tags: ["ACT"], totalSessions: 18 },
  { id: "p3", initials: "SN", name: "S. N.", pronouns: "they/them", age: 19, since: iso(-24 * 45), lastSession: iso(-24 * 1), nextSession: iso(4), primaryConcern: "Low mood, isolation", riskLevel: "elevated", tags: ["DBT-informed"], totalSessions: 6 },
  { id: "p4", initials: "RD", name: "R. D.", age: 33, since: iso(-24 * 300), lastSession: iso(-24 * 21), primaryConcern: "Relationship conflict", riskLevel: "low", tags: ["EFT"], totalSessions: 24 },
  { id: "p5", initials: "TV", name: "T. V.", age: 22, since: iso(-24 * 60), lastSession: iso(-24 * 14), nextSession: iso(6), primaryConcern: "Panic attacks", riskLevel: "moderate", tags: ["CBT"], totalSessions: 8 },
  { id: "p6", initials: "JI", name: "J. I.", age: 29, since: iso(-24 * 20), lastSession: iso(-24 * 30), primaryConcern: "Grief", riskLevel: "low", tags: ["Person-centred"], totalSessions: 2 },
];

export const SESSIONS_TODAY: Session[] = [
  { id: "s1", patientId: "p1", startsAt: iso(1), minutes: 50, modality: "video", status: "upcoming", fee: 2400, type: "CBT · Follow-up" },
  { id: "s2", patientId: "p3", startsAt: iso(2.5), minutes: 50, modality: "video", status: "upcoming", fee: 2400, type: "DBT · Check-in" },
  { id: "s3", patientId: "p5", startsAt: iso(4), minutes: 50, modality: "in-person", status: "upcoming", fee: 3000, type: "CBT · Intake follow-up" },
  { id: "s4", patientId: "p2", startsAt: iso(6), minutes: 50, modality: "video", status: "upcoming", fee: 2400, type: "ACT · Weekly" },
  { id: "s5", patientId: "p4", startsAt: iso(8), minutes: 50, modality: "phone", status: "upcoming", fee: 2000, type: "EFT · Couples" },
  { id: "s6", patientId: "p6", startsAt: iso(9.5), minutes: 50, modality: "video", status: "upcoming", fee: 2400, type: "Person-centred" },
];

export const ALERTS: Alert[] = [
  { id: "a1", patientId: "p3", kind: "risk-flag", message: "PHQ-9 rose to 18 — moderate-severe", createdAt: iso(-2), priority: "high" },
  { id: "a2", patientId: "p2", kind: "missed-session", message: "Missed last Tuesday's session", createdAt: iso(-48), priority: "medium" },
  { id: "a3", patientId: "p6", kind: "intake-pending", message: "Intake form incomplete", createdAt: iso(-6), priority: "medium" },
  { id: "a4", patientId: "p5", kind: "assessment-due", message: "GAD-7 re-test due this week", createdAt: iso(-20), priority: "low" },
];

export const NOTES: ClinicalNote[] = [
  { id: "n1", patientId: "p1", createdAt: iso(-72), summary: "Discussed exam schedule; introduced worry postponement.", format: "SOAP" },
  { id: "n2", patientId: "p3", createdAt: iso(-24), summary: "Reported passive SI without plan; safety plan reviewed.", format: "SOAP" },
  { id: "n3", patientId: "p4", createdAt: iso(-24 * 21), summary: "Couple identified conflict pattern; homework: soft start-ups.", format: "DAP" },
  { id: "n4", patientId: "p2", createdAt: iso(-24 * 10), summary: "Sleep hygiene review; started worry log.", format: "Free" },
];

export const INTAKES: IntakeRequest[] = [
  { id: "i1", name: "Kavya P.", initials: "KP", age: 24, reason: "Work stress, sleep", requestedAt: iso(-3), preferred: "Evenings · video" },
  { id: "i2", name: "Aarav S.", initials: "AS", age: 20, reason: "Social anxiety", requestedAt: iso(-10), preferred: "Weekends · in-person" },
  { id: "i3", name: "Nina R.", initials: "NR", age: 31, reason: "Post-partum low mood", requestedAt: iso(-20), preferred: "Weekday mornings · video" },
];

export const WEEKLY_LOAD = [
  { day: "Mon", booked: 6, capacity: 8 },
  { day: "Tue", booked: 7, capacity: 8 },
  { day: "Wed", booked: 5, capacity: 8 },
  { day: "Thu", booked: 6, capacity: 8 },
  { day: "Fri", booked: 4, capacity: 8 },
  { day: "Sat", booked: 3, capacity: 6 },
  { day: "Sun", booked: 0, capacity: 0 },
];

export const REVENUE_SPARK = [12, 18, 14, 22, 19, 26, 24, 30, 28, 34, 32, 38];
export const REVENUE_MONTH = { booked: 184000, completed: 148000, pending: 36000, target: 220000 };

export function getPatient(id: string): Patient | undefined {
  return PATIENTS.find((p) => p.id === id);
}
