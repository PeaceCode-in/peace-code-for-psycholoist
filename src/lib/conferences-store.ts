// PeaceCode · Practice — Case Conferences store.
// Multi-clinician case discussions: structured, documented, sign-off gated.
// localStorage-backed with a tiny event bus for live re-renders.

import { useMemo, useSyncExternalStore } from "react";
import { listPatients } from "@/lib/patients-store";
import { listMembers } from "@/lib/team-store";

// ─── Types ───────────────────────────────────────────────────
export type ConferenceReason =
  | "diagnostic-clarity" | "treatment-stuck" | "risk-consult"
  | "transition-of-care" | "ethics" | "peer-review";

export type ConferenceUrgency = "routine" | "elevated" | "urgent";
export type ConferenceFormat = "in-person" | "video" | "async-only";
export type ConferenceStatus = "upcoming" | "draft" | "in-progress" | "closed";
export type ParticipantRole = "lead" | "consulting" | "observer";

export const REASON_META: Record<ConferenceReason, { label: string; blurb: string; tone: string }> = {
  "diagnostic-clarity":  { label: "Diagnostic clarity",  blurb: "Second opinion on formulation.",       tone: "#5A7BA0" },
  "treatment-stuck":     { label: "Treatment stuck",     blurb: "Plateau or regression, need input.",   tone: "#B08444" },
  "risk-consult":        { label: "Risk consult",        blurb: "Safety planning with senior support.", tone: "#B0567A" },
  "transition-of-care":  { label: "Transition of care",  blurb: "Handoff, discharge, or referral.",     tone: "#5F8A6A" },
  "ethics":              { label: "Ethics",              blurb: "Dual relationship, boundary, consent.", tone: "#8B5A9C" },
  "peer-review":         { label: "Peer review",         blurb: "De-identified CPD case discussion.",   tone: "#7B6A70" },
};

export type Participant = {
  memberId: string;
  role: ParticipantRole;
  invitedAt: number;
  respondedAt?: number;
  attended?: boolean;
};

export type DiscussionPost = {
  id: string;
  authorId: string;
  at: number;
  phase: "pre" | "during" | "post";
  body: string;
};

export type Recommendations = {
  diagnostic: string;
  treatmentChanges: string;
  medications: string;
  riskPlan: string;
  referrals: string;
  followUpAt?: number;
};

export type SignOff = {
  memberId: string;
  at: number;
  hash: string;
};

export type Amendment = {
  id: string;
  reason: string;
  authorId: string;
  at: number;
  patch: string;
  hash: string;
};

export type Conference = {
  id: string;
  patientId?: string;         // omitted for peer-review
  anonymized: boolean;
  peerReview: boolean;
  presenting: string;
  reason: ConferenceReason;
  urgency: ConferenceUrgency;
  facilitatorId: string;
  participants: Participant[];
  scheduledAt: number;
  durationMin: number;
  format: ConferenceFormat;
  videoLink?: string;
  status: ConferenceStatus;
  caseSummary: string;
  summaryReviewedBy?: string;
  discussion: DiscussionPost[];
  recommendations: Recommendations;
  signOffs: SignOff[];
  lockedAt?: number;
  lockedBy?: string;
  amendments: Amendment[];
  followUpConferenceId?: string;
  createdAt: number;
  updatedAt: number;
};

export type ConfAudit = {
  id: string;
  conferenceId: string;
  action: "create" | "read" | "update" | "post" | "sign" | "lock" | "amend" | "invite";
  by: string;
  at: number;
  note?: string;
};

// ─── Storage / event bus ─────────────────────────────────────
const KEY = "pcp.conferences.v1";
const AUDIT_KEY = "pcp.conferences.audit.v1";
type Root = { conferences: Conference[]; audit: ConfAudit[] };

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };

function ssr(): boolean { return typeof window === "undefined"; }
function read(): Root {
  if (ssr()) return seed();
  try {
    const raw = localStorage.getItem(KEY);
    const auditRaw = localStorage.getItem(AUDIT_KEY);
    if (!raw) {
      const s = seed();
      localStorage.setItem(KEY, JSON.stringify({ conferences: s.conferences }));
      localStorage.setItem(AUDIT_KEY, JSON.stringify(s.audit));
      return s;
    }
    const parsed = JSON.parse(raw) as { conferences: Conference[] };
    const audit = auditRaw ? (JSON.parse(auditRaw) as ConfAudit[]) : [];
    return { conferences: parsed.conferences, audit };
  } catch {
    return { conferences: [], audit: [] };
  }
}
function write(root: Root) {
  if (ssr()) return;
  localStorage.setItem(KEY, JSON.stringify({ conferences: root.conferences }));
  localStorage.setItem(AUDIT_KEY, JSON.stringify(root.audit.slice(-500)));
  emit();
}

// djb2 hash for tamper indicator
function hash(s: string): string {
  let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return "h_" + h.toString(16);
}
function uid(p: string) { return p + "_" + Math.random().toString(36).slice(2, 9); }

// ─── Public API ──────────────────────────────────────────────
export function listConferences(): Conference[] {
  return read().conferences.slice().sort((a, b) => b.scheduledAt - a.scheduledAt);
}
export function getConference(id: string): Conference | undefined {
  const c = read().conferences.find((x) => x.id === id);
  if (c && !ssr()) pushAudit(c.id, "read", "me");
  return c;
}
export function getConferenceSilent(id: string): Conference | undefined {
  return read().conferences.find((x) => x.id === id);
}
export function listAudit(cid?: string): ConfAudit[] {
  const a = read().audit;
  return cid ? a.filter((x) => x.conferenceId === cid) : a;
}

function pushAudit(cid: string, action: ConfAudit["action"], by: string, note?: string) {
  const r = read();
  r.audit.push({ id: uid("a"), conferenceId: cid, action, by, at: Date.now(), note });
  write(r);
}

export function createConference(input: {
  patientId?: string; anonymized?: boolean; peerReview?: boolean;
  presenting: string; reason: ConferenceReason; urgency?: ConferenceUrgency;
  facilitatorId: string; participantIds: string[]; scheduledAt: number;
  durationMin?: number; format?: ConferenceFormat;
}): Conference {
  const r = read();
  const now = Date.now();
  const c: Conference = {
    id: uid("cf"),
    patientId: input.peerReview ? undefined : input.patientId,
    anonymized: input.peerReview || !!input.anonymized,
    peerReview: !!input.peerReview,
    presenting: input.presenting,
    reason: input.reason,
    urgency: input.urgency ?? "routine",
    facilitatorId: input.facilitatorId,
    participants: input.participantIds.map((mid, i) => ({
      memberId: mid,
      role: i === 0 ? "lead" : "consulting",
      invitedAt: now,
    })),
    scheduledAt: input.scheduledAt,
    durationMin: input.durationMin ?? 45,
    format: input.format ?? "video",
    videoLink: (input.format ?? "video") === "video" ? `https://meet.peacecode.in/${uid("v").slice(2)}` : undefined,
    status: input.scheduledAt > now ? "upcoming" : "in-progress",
    caseSummary: "",
    discussion: [],
    recommendations: { diagnostic: "", treatmentChanges: "", medications: "", riskPlan: "", referrals: "" },
    signOffs: [],
    amendments: [],
    createdAt: now,
    updatedAt: now,
  };
  r.conferences.push(c);
  r.audit.push({ id: uid("a"), conferenceId: c.id, action: "create", by: input.facilitatorId, at: now });
  write(r);
  return c;
}

export function updateConference(id: string, patch: Partial<Conference>, by = "me") {
  const r = read();
  const c = r.conferences.find((x) => x.id === id);
  if (!c || c.status === "closed") return;
  Object.assign(c, patch, { updatedAt: Date.now() });
  r.audit.push({ id: uid("a"), conferenceId: id, action: "update", by, at: Date.now() });
  write(r);
}

export function addDiscussionPost(cid: string, authorId: string, body: string, phase: DiscussionPost["phase"] = "pre") {
  const r = read();
  const c = r.conferences.find((x) => x.id === cid);
  if (!c || c.status === "closed") return;
  c.discussion.push({ id: uid("p"), authorId, at: Date.now(), phase, body });
  c.updatedAt = Date.now();
  if (c.status === "upcoming" && phase === "during") c.status = "in-progress";
  r.audit.push({ id: uid("a"), conferenceId: cid, action: "post", by: authorId, at: Date.now() });
  write(r);
}

export function setRecommendations(cid: string, rec: Recommendations, by = "me") {
  const r = read();
  const c = r.conferences.find((x) => x.id === cid);
  if (!c || c.status === "closed") return;
  c.recommendations = rec;
  c.updatedAt = Date.now();
  r.audit.push({ id: uid("a"), conferenceId: cid, action: "update", by, at: Date.now(), note: "recommendations" });
  write(r);
}

export function signOff(cid: string, memberId: string) {
  const r = read();
  const c = r.conferences.find((x) => x.id === cid);
  if (!c) return;
  if (c.signOffs.some((s) => s.memberId === memberId)) return;
  const h = hash(JSON.stringify(c.recommendations) + memberId + Date.now());
  c.signOffs.push({ memberId, at: Date.now(), hash: h });
  c.updatedAt = Date.now();
  r.audit.push({ id: uid("a"), conferenceId: cid, action: "sign", by: memberId, at: Date.now() });
  write(r);
}

export function lockConference(cid: string, by: string) {
  const r = read();
  const c = r.conferences.find((x) => x.id === cid);
  if (!c || c.status === "closed") return;
  const lead = c.participants.find((p) => p.role === "lead");
  if (lead && lead.memberId !== by) return; // lead only
  c.status = "closed";
  c.lockedAt = Date.now();
  c.lockedBy = by;
  c.updatedAt = Date.now();

  // Schedule follow-up 5 weeks out
  if (c.recommendations.followUpAt) {
    const followUp = createConference({
      patientId: c.patientId,
      peerReview: c.peerReview,
      anonymized: c.anonymized,
      presenting: `Follow-up · ${c.presenting}`,
      reason: c.reason,
      urgency: "routine",
      facilitatorId: c.facilitatorId,
      participantIds: c.participants.map((p) => p.memberId),
      scheduledAt: c.recommendations.followUpAt,
      durationMin: 30,
      format: c.format,
    });
    c.followUpConferenceId = followUp.id;
  }
  r.audit.push({ id: uid("a"), conferenceId: cid, action: "lock", by, at: Date.now() });
  write(r);
}

export function amendConference(cid: string, authorId: string, reason: string, patch: string) {
  const r = read();
  const c = r.conferences.find((x) => x.id === cid);
  if (!c || c.status !== "closed") return;
  const h = hash(patch + authorId + Date.now());
  c.amendments.push({ id: uid("am"), reason, authorId, at: Date.now(), patch, hash: h });
  c.updatedAt = Date.now();
  r.audit.push({ id: uid("a"), conferenceId: cid, action: "amend", by: authorId, at: Date.now(), note: reason });
  write(r);
}

// Draft summary generator (mimics Co-Pilot output from patient's notes + assessments)
export function draftCaseSummary(patientId: string | undefined, anonymized: boolean): string {
  if (!patientId) {
    return `Peer-review case · anonymized.\n\nPresenting: recurrent panic with agoraphobic avoidance in a young adult.\nHistory: 6 months of graded exposure, initial gains plateaued at week 10.\nActive interventions: interoceptive exposure, breathing retraining, values-based scheduling.\nMost recent assessments: PDSS moderate, GAD-7 elevated but improving.\nOpen questions: is the plateau a signal to introduce ACT, or push exposure further?`;
  }
  const patients = listPatients();
  const p = patients.find((x) => x.id === patientId);
  if (!p) return "Patient record unavailable.";
  const label = anonymized ? `${p.fullName.split(" ").map((n) => n[0]).join("")} · ${p.age}${p.pronouns.startsWith("she") ? "F" : p.pronouns.startsWith("he") ? "M" : "NB"}` : p.fullName;
  return [
    `${label} — ${p.primaryConcern}.`,
    ``,
    `Presenting concern: ${p.primaryConcern}. Current risk tier: ${p.risk}. In treatment ${Math.round((Date.now() - p.intakeDate) / (86400_000 * 30))} months, ${p.totalSessions} sessions logged.`,
    ``,
    `Last 5 sessions: mixed engagement. Homework compliance moderate. Sleep improving on weekends; weekday sleep remains fragmented. Cognitive work landing intermittently.`,
    ``,
    `Latest assessments: symptom scores trending flat over past 4 weeks after early gains.`,
    ``,
    `Active plan: weekly individual sessions, between-session behavioral experiments, monthly assessment cadence.`,
    ``,
    `Reason for consult: ${p.risk === "elevated" || p.risk === "crisis" ? "risk formulation review and stepped care decision" : "diagnostic clarity and plan refinement"}.`,
  ].join("\n");
}

// ─── Hooks ───────────────────────────────────────────────────
function useSync<T>(select: () => T, ssrDefault: T): T {
  return useSyncExternalStore(subscribe, select, () => ssrDefault);
}
export function useLiveConferences(): Conference[] {
  return useSync(listConferences, [] as Conference[]);
}
export function useLiveConference(id: string): Conference | undefined {
  return useSync(() => getConferenceSilent(id), undefined);
}
export function useLiveAudit(cid?: string): ConfAudit[] {
  return useSync(() => listAudit(cid), [] as ConfAudit[]);
}

// ─── Seed ────────────────────────────────────────────────────
function seed(): Root {
  const now = Date.now();
  const day = 86400_000;
  // Members exist in team-store seed
  const patientsList = ssr() ? [] : listPatients();
  const membersList = ssr() ? [] : listMembers();
  const pick = (i: number) => patientsList[i]?.id ?? "p_seed_" + i;
  const mid = (id: string) => (membersList.find((m) => m.id === id)?.id ?? id);

  const c1: Conference = {
    id: "cf_1",
    patientId: pick(2),
    anonymized: false,
    peerReview: false,
    presenting: "Escalating self-harm ideation, needs risk consult before next session.",
    reason: "risk-consult",
    urgency: "urgent",
    facilitatorId: mid("me"),
    participants: [
      { memberId: mid("me"), role: "lead", invitedAt: now - 2 * day, respondedAt: now - 2 * day },
      { memberId: mid("sup_rohan"), role: "consulting", invitedAt: now - 2 * day, respondedAt: now - day },
      { memberId: mid("clin_maya"), role: "observer", invitedAt: now - 2 * day, respondedAt: now - day },
    ],
    scheduledAt: now + 2 * day,
    durationMin: 45,
    format: "video",
    videoLink: "https://meet.peacecode.in/rc-x82p",
    status: "upcoming",
    caseSummary: "Patient in month 4 of care. Recent bereavement has surfaced dormant SI. Current safety plan needs pressure-test with a supervisor before the Friday session. Not currently intending; means restricted.",
    discussion: [
      { id: "p1", authorId: mid("sup_rohan"), at: now - day, phase: "pre", body: "Reviewed the intake. Would want to see the latest CAMS worksheet before we meet. Bringing three specific questions to Friday." },
    ],
    recommendations: { diagnostic: "", treatmentChanges: "", medications: "", riskPlan: "", referrals: "" },
    signOffs: [],
    amendments: [],
    createdAt: now - 3 * day,
    updatedAt: now - day,
  };

  const c2: Conference = {
    id: "cf_2",
    patientId: pick(4),
    anonymized: false,
    peerReview: false,
    presenting: "Six months in, symptom scores flat. Diagnostic reformulation warranted.",
    reason: "diagnostic-clarity",
    urgency: "routine",
    facilitatorId: mid("clin_maya"),
    participants: [
      { memberId: mid("clin_maya"), role: "lead", invitedAt: now - 5 * day, respondedAt: now - 5 * day },
      { memberId: mid("sup_rohan"), role: "consulting", invitedAt: now - 5 * day, respondedAt: now - 4 * day },
    ],
    scheduledAt: now - 1 * day,
    durationMin: 45,
    format: "video",
    videoLink: "https://meet.peacecode.in/dc-4kl9",
    status: "in-progress",
    caseSummary: draftCaseSummary(pick(4), false),
    summaryReviewedBy: mid("clin_maya"),
    discussion: [
      { id: "p2a", authorId: mid("clin_maya"), at: now - 3 * day, phase: "pre", body: "The flatness is on GAD-7 specifically. PHQ-9 is actually trending down. I'm wondering if we're treating the wrong construct." },
      { id: "p2b", authorId: mid("sup_rohan"), at: now - 2 * day, phase: "pre", body: "Agree that's worth exploring. Also, what did the ACE-Q surface at intake? If there's a trauma layer, GAD interventions can plateau until it's addressed." },
      { id: "p2c", authorId: mid("clin_maya"), at: now - day, phase: "during", body: "ACE-Q was 4, but she wasn't ready to discuss it in month one. Might be time to reopen." },
    ],
    recommendations: { diagnostic: "", treatmentChanges: "", medications: "", riskPlan: "", referrals: "" },
    signOffs: [],
    amendments: [],
    createdAt: now - 6 * day,
    updatedAt: now - day,
  };

  const rec3: Recommendations = {
    diagnostic: "Formulation updated: primary anxiety with comorbid ADHD-inattentive presentation, previously undiagnosed. Cognitive load from unmanaged executive dysfunction is likely maintaining the anxious rumination.",
    treatmentChanges: "Pivot from anxiety-only CBT to CBT-plus-ADHD skills coaching. Introduce daily executive scaffolding (task chunking, external timers). Reduce cognitive homework volume; increase behavioral experiments.",
    medications: "Consider psychiatric referral for stimulant trial. Current situation: not on medication.",
    riskPlan: "Existing safety plan is adequate. Add: patient will contact clinician within 24 hours if executive dysfunction leads to missed self-care streak > 3 days.",
    referrals: "Dr. Kavita Menon (psychiatrist, ADHD-informed) for stimulant assessment. Occupational therapy consult if stimulant trial unsuccessful.",
    followUpAt: now + 35 * day,
  };

  const c3: Conference = {
    id: "cf_3",
    patientId: pick(7),
    anonymized: false,
    peerReview: false,
    presenting: "Treatment stuck at 4 months. Requesting formulation second opinion.",
    reason: "treatment-stuck",
    urgency: "elevated",
    facilitatorId: mid("assoc_aditi"),
    participants: [
      { memberId: mid("assoc_aditi"), role: "lead", invitedAt: now - 21 * day, respondedAt: now - 21 * day, attended: true },
      { memberId: mid("sup_rohan"), role: "consulting", invitedAt: now - 21 * day, respondedAt: now - 20 * day, attended: true },
      { memberId: mid("me"), role: "consulting", invitedAt: now - 21 * day, respondedAt: now - 20 * day, attended: true },
    ],
    scheduledAt: now - 14 * day,
    durationMin: 60,
    format: "in-person",
    status: "closed",
    caseSummary: draftCaseSummary(pick(7), false),
    summaryReviewedBy: mid("assoc_aditi"),
    discussion: [
      { id: "p3a", authorId: mid("assoc_aditi"), at: now - 18 * day, phase: "pre", body: "Ran a symptom-timeline exercise before this. What I'm noticing is that ruminative episodes cluster on days with high task-switching demand at college." },
      { id: "p3b", authorId: mid("sup_rohan"), at: now - 17 * day, phase: "pre", body: "That's a strong pattern. Worth screening for executive dysfunction before we assume this is purely anxiety." },
      { id: "p3c", authorId: mid("me"), at: now - 14 * day, phase: "during", body: "ACE-Q was 4 but the profile is not classically traumatic. The task-switching correlation is telling. Recommend ADHD screening as a next step." },
      { id: "p3d", authorId: mid("assoc_aditi"), at: now - 13 * day, phase: "post", body: "Ran ASRS-v1.1 in session. Positive on 5/6 Part A items. Referral drafted." },
    ],
    recommendations: rec3,
    signOffs: [
      { memberId: mid("assoc_aditi"), at: now - 12 * day, hash: hash("cf_3 aditi") },
      { memberId: mid("sup_rohan"), at: now - 12 * day, hash: hash("cf_3 rohan") },
      { memberId: mid("me"), at: now - 11 * day, hash: hash("cf_3 me") },
    ],
    lockedAt: now - 11 * day,
    lockedBy: mid("assoc_aditi"),
    amendments: [
      { id: "am_1", reason: "Correct medication section — patient disclosed OTC melatonin nightly, not previously recorded.", authorId: mid("assoc_aditi"), at: now - 8 * day, patch: "Medications: Add — Melatonin 3mg nightly (OTC, patient-initiated). No known interactions but flagged for psychiatrist review.", hash: hash("am1 aditi") },
    ],
    createdAt: now - 25 * day,
    updatedAt: now - 8 * day,
  };

  const c4: Conference = {
    id: "cf_4",
    patientId: undefined,
    anonymized: true,
    peerReview: true,
    presenting: "Boundary question — client requested I attend her wedding. De-identified peer review for CPD.",
    reason: "peer-review",
    urgency: "routine",
    facilitatorId: mid("clin_maya"),
    participants: [
      { memberId: mid("clin_maya"), role: "lead", invitedAt: now - 10 * day, respondedAt: now - 10 * day, attended: true },
      { memberId: mid("me"), role: "consulting", invitedAt: now - 10 * day, respondedAt: now - 9 * day, attended: true },
      { memberId: mid("sup_rohan"), role: "consulting", invitedAt: now - 10 * day, respondedAt: now - 9 * day, attended: true },
    ],
    scheduledAt: now - 5 * day,
    durationMin: 30,
    format: "video",
    status: "closed",
    caseSummary: draftCaseSummary(undefined, true),
    summaryReviewedBy: mid("clin_maya"),
    discussion: [
      { id: "p4a", authorId: mid("clin_maya"), at: now - 8 * day, phase: "pre", body: "What I did: declined warmly, offered to write a card. What I'd change: I might have handled the disappointment in-session rather than by email. What I'd like feedback on: whether the decline was too abrupt for the rupture-repair moment we were in." },
      { id: "p4b", authorId: mid("sup_rohan"), at: now - 6 * day, phase: "during", body: "The decision was correct. The medium (email) was the issue. In-session, you could have named the poignancy of the ask itself as clinically meaningful." },
    ],
    recommendations: {
      diagnostic: "N/A — peer review case.",
      treatmentChanges: "N/A.",
      medications: "N/A.",
      riskPlan: "N/A.",
      referrals: "N/A.",
      followUpAt: undefined,
    },
    signOffs: [
      { memberId: mid("clin_maya"), at: now - 5 * day, hash: hash("cf_4 maya") },
      { memberId: mid("me"), at: now - 5 * day, hash: hash("cf_4 me") },
      { memberId: mid("sup_rohan"), at: now - 5 * day, hash: hash("cf_4 rohan") },
    ],
    lockedAt: now - 5 * day,
    lockedBy: mid("clin_maya"),
    amendments: [],
    createdAt: now - 12 * day,
    updatedAt: now - 5 * day,
  };

  return {
    conferences: [c1, c2, c3, c4],
    audit: [
      { id: "as_1", conferenceId: "cf_3", action: "create", by: mid("assoc_aditi"), at: now - 25 * day },
      { id: "as_2", conferenceId: "cf_3", action: "lock",   by: mid("assoc_aditi"), at: now - 11 * day },
      { id: "as_3", conferenceId: "cf_3", action: "amend",  by: mid("assoc_aditi"), at: now - 8 * day,  note: "melatonin" },
      { id: "as_4", conferenceId: "cf_4", action: "lock",   by: mid("clin_maya"),   at: now - 5 * day },
    ],
  };
}
