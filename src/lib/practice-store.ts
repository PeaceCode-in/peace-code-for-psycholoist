// Local mock store for the Practice (therapist) app.
// Seeded fixtures — 12 patients with PHQ-9/GAD-7 history, sessions,
// SOAP notes, homework. Swap for backend later.

export type SessionModality = "video" | "in-person" | "phone";
export type SessionStatus = "upcoming" | "in-progress" | "completed" | "cancelled" | "no-show";
export type Diagnosis =
  | "GAD" | "MDD" | "Adjustment" | "ADHD" | "OCD" | "PTSD" | "Bipolar-II"
  | "Panic" | "Grief" | "Relational";

export type Patient = {
  id: string;
  initials: string;
  name: string;
  pronouns?: string;
  age: number;
  since: string;
  lastSession?: string;
  nextSession?: string;
  primaryConcern: string;
  diagnosis: Diagnosis;
  riskLevel: "low" | "moderate" | "elevated" | "high";
  riskFlag?: string; // e.g. "PHQ-9 spike 18 → 22"
  tags: string[];
  totalSessions: number;
  phq9: number[]; // 6 data points, oldest → newest
  gad7: number[]; // 6 data points
  homework: { title: string; status: "assigned" | "in-progress" | "complete" | "overdue"; due?: string };
  noShowRisk?: "low" | "medium" | "high";
  avatar: string; // dicebear URL
};

export type Session = {
  id: string;
  patientId: string;
  startsAt: string;
  minutes: number;
  modality: SessionModality;
  status: SessionStatus;
  fee: number;
  type: string;
};

export type Alert = {
  id: string;
  patientId: string;
  kind: "risk-flag" | "missed-session" | "intake-pending" | "assessment-due" | "message" | "safety-plan";
  message: string;
  createdAt: string;
  priority: "low" | "medium" | "high";
  action?: "call" | "message" | "open-note";
};

export type ClinicalNote = {
  id: string;
  patientId: string;
  sessionId?: string;
  createdAt: string;
  summary: string;
  format: "SOAP" | "DAP" | "BIRP" | "Free";
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
};

export type IntakeRequest = {
  id: string;
  name: string;
  initials: string;
  age: number;
  reason: string;
  requestedAt: string;
  preferred: string;
};

export type InboxMessage = { id: string; patientId: string; snippet: string; at: string; unread: boolean };
export type PeerUpdate = { id: string; who: string; what: string; at: string };

const now = Date.now();
const iso = (offsetHrs: number) => new Date(now + offsetHrs * 3600_000).toISOString();
const dicebear = (seed: string) =>
  `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=f6f1f2,efe4f0,f1c7d6,fbf7f8&radius=50`;

// ─── 12 patients (Indian names, mixed 17–45, varied dx) ──────
export const PATIENTS: Patient[] = [
  {
    id: "p1", initials: "PS", name: "Priya S.", pronouns: "she/her", age: 23,
    since: iso(-24 * 120), lastSession: iso(-24 * 2), nextSession: iso(2),
    primaryConcern: "Recurrent depressive episode, work stress",
    diagnosis: "MDD", riskLevel: "high", riskFlag: "PHQ-9 spike 18 → 22",
    tags: ["CBT", "Weekly", "High priority"], totalSessions: 14,
    phq9: [14, 16, 15, 17, 18, 22], gad7: [12, 13, 13, 14, 15, 16],
    homework: { title: "Behavioural activation log — daily", status: "overdue", due: iso(-24) },
    noShowRisk: "medium", avatar: dicebear("Priya Sharma"),
  },
  {
    id: "p2", initials: "AR", name: "Aarav R.", pronouns: "he/him", age: 21,
    since: iso(-24 * 90), lastSession: iso(-24 * 3), nextSession: iso(4),
    primaryConcern: "Exam anxiety, sleep onset",
    diagnosis: "GAD", riskLevel: "low",
    tags: ["CBT", "Weekly"], totalSessions: 11,
    phq9: [8, 7, 7, 6, 6, 5], gad7: [14, 13, 12, 11, 10, 9],
    homework: { title: "Worry postponement — 20 min window", status: "in-progress", due: iso(48) },
    noShowRisk: "low", avatar: dicebear("Aarav Rao"),
  },
  {
    id: "p3", initials: "MK", name: "Meera K.", pronouns: "she/her", age: 27,
    since: iso(-24 * 180), lastSession: iso(-24 * 10),
    primaryConcern: "Generalised anxiety, panic attacks",
    diagnosis: "Panic", riskLevel: "moderate",
    tags: ["ACT", "Bi-weekly"], totalSessions: 18,
    phq9: [10, 9, 9, 8, 8, 7], gad7: [15, 14, 14, 13, 12, 12],
    homework: { title: "Interoceptive exposure — 3 sessions/wk", status: "assigned", due: iso(72) },
    noShowRisk: "medium", avatar: dicebear("Meera Krishnan"),
  },
  {
    id: "p4", initials: "SN", name: "Sameer N.", pronouns: "they/them", age: 19,
    since: iso(-24 * 45), lastSession: iso(-24 * 1), nextSession: iso(30),
    primaryConcern: "Low mood, isolation post-transition",
    diagnosis: "Adjustment", riskLevel: "elevated",
    tags: ["DBT-informed"], totalSessions: 6,
    phq9: [13, 14, 15, 16, 17, 17], gad7: [10, 11, 12, 12, 13, 13],
    homework: { title: "Daily mood + one social contact", status: "in-progress" },
    noShowRisk: "low", avatar: dicebear("Sameer Nair"),
  },
  {
    id: "p5", initials: "RD", name: "Rhea D.", age: 33,
    since: iso(-24 * 300), lastSession: iso(-24 * 21),
    primaryConcern: "Relationship conflict, couples work",
    diagnosis: "Relational", riskLevel: "low",
    tags: ["EFT", "Couples"], totalSessions: 24,
    phq9: [9, 8, 8, 7, 7, 6], gad7: [8, 8, 7, 7, 6, 6],
    homework: { title: "Soft start-up practice", status: "overdue", due: iso(-72) },
    noShowRisk: "high", avatar: dicebear("Rhea Desai"),
  },
  {
    id: "p6", initials: "TV", name: "Tanvi V.", age: 22,
    since: iso(-24 * 60), lastSession: iso(-24 * 14), nextSession: iso(6),
    primaryConcern: "Panic disorder without agoraphobia",
    diagnosis: "Panic", riskLevel: "moderate",
    tags: ["CBT"], totalSessions: 8,
    phq9: [11, 10, 11, 12, 11, 10], gad7: [17, 16, 15, 14, 13, 12],
    homework: { title: "Panic diary + breath retraining", status: "complete" },
    noShowRisk: "medium", avatar: dicebear("Tanvi Varma"),
  },
  {
    id: "p7", initials: "JI", name: "Jaya I.", age: 29,
    since: iso(-24 * 20), lastSession: iso(-24 * 30),
    primaryConcern: "Bereavement — mother",
    diagnosis: "Grief", riskLevel: "low",
    tags: ["Person-centred"], totalSessions: 2,
    phq9: [15, 14, 14, 13, 12, 11], gad7: [10, 10, 9, 9, 8, 8],
    homework: { title: "Letter to mother — read aloud", status: "assigned", due: iso(24 * 5) },
    noShowRisk: "high", avatar: dicebear("Jaya Iyer"),
  },
  {
    id: "p8", initials: "HN", name: "Harsh N.", age: 24,
    since: iso(-24 * 100), lastSession: iso(-24 * 5), nextSession: iso(30),
    primaryConcern: "OCD — contamination subtype",
    diagnosis: "OCD", riskLevel: "moderate",
    tags: ["ERP", "Weekly"], totalSessions: 14,
    phq9: [10, 9, 9, 8, 8, 7], gad7: [13, 12, 12, 11, 11, 10],
    homework: { title: "ERP hierarchy — step 4 (public door handles)", status: "overdue", due: iso(-24) },
    noShowRisk: "low", avatar: dicebear("Harsh Nayak"),
  },
  {
    id: "p9", initials: "PB", name: "Pooja B.", age: 26,
    since: iso(-24 * 15),
    primaryConcern: "Career burnout, chronic fatigue",
    diagnosis: "Adjustment", riskLevel: "low",
    tags: ["ACT"], totalSessions: 1,
    phq9: [12, 12, 11, 11, 10, 10], gad7: [11, 11, 10, 10, 9, 9],
    homework: { title: "Values card sort", status: "assigned" },
    noShowRisk: "low", avatar: dicebear("Pooja Bhatt"),
  },
  {
    id: "p10", initials: "KR", name: "Karan R.", age: 17,
    since: iso(-24 * 30), lastSession: iso(-24 * 6), nextSession: iso(24 * 3),
    primaryConcern: "ADHD, exam prep support",
    diagnosis: "ADHD", riskLevel: "low",
    tags: ["Coaching", "School-liaison"], totalSessions: 4,
    phq9: [6, 6, 5, 5, 5, 4], gad7: [9, 9, 8, 8, 7, 7],
    homework: { title: "Pomodoro log — 3 days", status: "in-progress" },
    noShowRisk: "medium", avatar: dicebear("Karan Reddy"),
  },
  {
    id: "p11", initials: "AK", name: "Ananya K.", age: 34,
    since: iso(-24 * 400), lastSession: iso(-24 * 4), nextSession: iso(8),
    primaryConcern: "PTSD — road accident",
    diagnosis: "PTSD", riskLevel: "elevated",
    tags: ["EMDR"], totalSessions: 22,
    phq9: [13, 12, 11, 10, 10, 9], gad7: [15, 14, 13, 12, 11, 10],
    homework: { title: "Grounding — 5-4-3-2-1 morning", status: "complete" },
    noShowRisk: "low", avatar: dicebear("Ananya Kapoor"),
  },
  {
    id: "p12", initials: "DM", name: "Devansh M.", age: 41,
    since: iso(-24 * 500), lastSession: iso(-24 * 8), nextSession: iso(48),
    primaryConcern: "Bipolar-II, mood stabilisation",
    diagnosis: "Bipolar-II", riskLevel: "moderate",
    tags: ["IPSRT", "Med co-manage"], totalSessions: 31,
    phq9: [9, 10, 9, 8, 7, 7], gad7: [8, 8, 8, 7, 7, 7],
    homework: { title: "Social-rhythm chart", status: "in-progress" },
    noShowRisk: "low", avatar: dicebear("Devansh Mehta"),
  },
];

export const SESSIONS_TODAY: Session[] = [
  { id: "s1", patientId: "p1", startsAt: iso(1), minutes: 50, modality: "video", status: "upcoming", fee: 2400, type: "CBT · Follow-up" },
  { id: "s2", patientId: "p4", startsAt: iso(2.5), minutes: 50, modality: "video", status: "upcoming", fee: 2400, type: "DBT · Check-in" },
  { id: "s3", patientId: "p6", startsAt: iso(4), minutes: 50, modality: "in-person", status: "upcoming", fee: 3000, type: "CBT · Intake follow-up" },
  { id: "s4", patientId: "p3", startsAt: iso(6), minutes: 50, modality: "video", status: "upcoming", fee: 2400, type: "ACT · Weekly" },
  { id: "s5", patientId: "p5", startsAt: iso(8), minutes: 80, modality: "phone", status: "upcoming", fee: 3800, type: "EFT · Couples" },
  { id: "s6", patientId: "p7", startsAt: iso(9.5), minutes: 50, modality: "video", status: "upcoming", fee: 2400, type: "Person-centred" },
];

export const PAST_SESSIONS: Session[] = [
  { id: "ps1", patientId: "p1", startsAt: iso(-24 * 2), minutes: 50, modality: "video", status: "completed", fee: 2400, type: "CBT · Follow-up" },
  { id: "ps2", patientId: "p2", startsAt: iso(-24 * 3), minutes: 50, modality: "video", status: "completed", fee: 2400, type: "CBT · Weekly" },
];

export const ALERTS: Alert[] = [
  { id: "a1", patientId: "p1", kind: "risk-flag", message: "PHQ-9 rose sharply — 18 to 22 in one week", createdAt: iso(-2), priority: "high", action: "call" },
  { id: "a2", patientId: "p4", kind: "risk-flag", message: "Passive SI reported in shared journal entry", createdAt: iso(-6), priority: "high", action: "open-note" },
  { id: "a3", patientId: "p3", kind: "missed-session", message: "Missed last Tuesday's session", createdAt: iso(-48), priority: "medium", action: "message" },
  { id: "a4", patientId: "p7", kind: "safety-plan", message: "Safety plan due for review", createdAt: iso(-30), priority: "medium", action: "open-note" },
  { id: "a5", patientId: "p6", kind: "assessment-due", message: "GAD-7 re-test due this week", createdAt: iso(-20), priority: "low", action: "message" },
];

export const NOTES: ClinicalNote[] = [
  {
    id: "n1", patientId: "p1", sessionId: "ps1", createdAt: iso(-24 * 2),
    format: "SOAP",
    summary: "SI screened negative; PHQ-9 rose to 22. Safety plan reviewed. Escalation discussed.",
    subjective: "Reports 'nothing feels like it lifts anymore.' Sleep 4–5h. Denies active SI, admits passive thoughts of 'not waking up.'",
    objective: "PHQ-9 = 22 (severe). GAD-7 = 16. Affect flat, psychomotor slowed. Appearance well-kept.",
    assessment: "MDD, recurrent, severe without psychotic features. Risk moderate — passive SI, no plan, protective factors intact (sister, therapy).",
    plan: "1) Weekly → twice-weekly for 3 weeks. 2) Referred for psychiatric consult (Dr. Menon). 3) Safety plan updated — sister as primary contact. 4) BA log daily.",
  },
  {
    id: "n2", patientId: "p2", sessionId: "ps2", createdAt: iso(-24 * 3),
    format: "SOAP",
    summary: "Discussed exam schedule; introduced worry postponement.",
    subjective: "'The 20-min window is helping — mornings are easier.'",
    objective: "GAD-7 = 9 (mild). Cooperative, insightful.",
    assessment: "GAD, mild. Good treatment response to CBT.",
    plan: "Continue worry postponement. Add sleep hygiene handout. Next session 1 week.",
  },
  {
    id: "n3", patientId: "p5", createdAt: iso(-24 * 21), format: "DAP",
    summary: "Couple identified conflict pattern; homework: soft start-ups.",
  },
  {
    id: "n4", patientId: "p3", createdAt: iso(-24 * 10), format: "Free",
    summary: "Sleep hygiene review; started worry log.",
  },
  {
    id: "n5", patientId: "p11", createdAt: iso(-24 * 4), format: "SOAP",
    summary: "EMDR set 6 — reduced SUDs from 7 to 3 on target memory.",
    subjective: "'It feels further away now.'",
    objective: "Tolerated bilateral stimulation well. No dissociation.",
    assessment: "PTSD symptoms responding to EMDR.",
    plan: "Set 7 next session — bridge to positive cognition.",
  },
];

export const INTAKES: IntakeRequest[] = [
  { id: "i1", name: "Kavya P.", initials: "KP", age: 24, reason: "Work stress, sleep", requestedAt: iso(-3), preferred: "Evenings · video" },
  { id: "i2", name: "Vihaan S.", initials: "VS", age: 20, reason: "Social anxiety", requestedAt: iso(-10), preferred: "Weekends · in-person" },
  { id: "i3", name: "Nina R.", initials: "NR", age: 31, reason: "Post-partum low mood", requestedAt: iso(-20), preferred: "Weekday mornings · video" },
];

export const INBOX: InboxMessage[] = [
  { id: "m1", patientId: "p1", snippet: "I don't think I can do this week alone, can we…", at: iso(-1.5), unread: true },
  { id: "m2", patientId: "p2", snippet: "Sent through the worry log you asked for.", at: iso(-5), unread: true },
  { id: "m3", patientId: "p6", snippet: "Can we reschedule Thursday to Friday?", at: iso(-9), unread: false },
  { id: "m4", patientId: "p8", snippet: "ERP homework — attaching video.", at: iso(-22), unread: false },
];

export const PEER_UPDATES: PeerUpdate[] = [
  { id: "pu1", who: "Dr. Rao", what: "published a case study — “Adolescent PTSD & family systems”", at: iso(-30) },
  { id: "pu2", who: "Supervision group", what: "meets Thursday 7pm — 2 slots open", at: iso(-40) },
  { id: "pu3", who: "Dr. Menon", what: "started a research thread on brief interventions for exam stress", at: iso(-70) },
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
export const WEEK_METRICS = { sessionsCompleted: 24, sessionsCancelled: 3, newPatients: 4, revenue: 58400, avgRating: 4.9 };
export const COMPLIANCE = {
  cpdHoursQuarter: 8, cpdRequired: 15,
  nextSupervision: iso(24 * 4),
  licenseExpiresAt: iso(24 * 210),
  dpdpConsent: "current" as "current" | "review-due",
};

export const INBOX_UNREAD = INBOX.filter((m) => m.unread).length;
export const ALERTS_HIGH = ALERTS.filter((a) => a.priority === "high").length;

export function getPatient(id: string): Patient | undefined {
  return PATIENTS.find((p) => p.id === id);
}
