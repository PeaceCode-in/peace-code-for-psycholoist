// PeaceCode · Practice — Team store.
// Multi-clinician practice: members, roles, permissions, supervision,
// case sharing, internal referrals, coverage/OOO, and audit trail.
// localStorage-backed with a tiny event bus for live re-renders.

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

// ─── Types ───────────────────────────────────────────────────
export type RoleKey = "owner" | "clinician" | "supervisor" | "associate" | "frontdesk" | "billing" | "readonly";

export const ROLE_META: Record<RoleKey, { label: string; blurb: string; tone: string }> = {
  owner:      { label: "Owner",           blurb: "Full control. Only role that can change other owners.", tone: "#B0567A" },
  supervisor: { label: "Supervisor",      blurb: "Clinical oversight, co-signs, supervision hours.",      tone: "#8B5A9C" },
  clinician:  { label: "Clinician",       blurb: "Own caseload, own notes, no admin access.",             tone: "#5A7BA0" },
  associate:  { label: "Associate",       blurb: "Supervisee. Notes require co-sign before finalization.", tone: "#7A8B5A" },
  frontdesk:  { label: "Front-desk",      blurb: "Scheduling, intakes, contact fields. No clinical notes.", tone: "#B08444" },
  billing:    { label: "Billing",         blurb: "Invoices, claims, payments only. No clinical content.", tone: "#5F8A6A" },
  readonly:   { label: "Read-only",       blurb: "Observer. Aggregate metrics only. No PHI.",             tone: "#7B6A70" },
};

// Permission surface area. Each is a granular capability we can gate on.
export type PermKey =
  | "patients.view" | "patients.pii" | "patients.edit" | "patients.delete"
  | "notes.view" | "notes.write" | "notes.cosign" | "notes.finalize"
  | "assessments.view" | "assessments.assign"
  | "billing.view" | "billing.write"
  | "schedule.view" | "schedule.edit"
  | "team.manage" | "team.roles" | "team.invite"
  | "audit.view" | "exports.run" | "handoff.initiate" | "referrals.route";

export const PERM_META: Record<PermKey, { label: string; group: string }> = {
  "patients.view":      { label: "View patient list",                group: "Patients" },
  "patients.pii":       { label: "See PII (email, phone, address)",  group: "Patients" },
  "patients.edit":      { label: "Edit patient details",              group: "Patients" },
  "patients.delete":    { label: "Discharge or delete patients",      group: "Patients" },
  "notes.view":         { label: "Read clinical notes",               group: "Notes" },
  "notes.write":        { label: "Write clinical notes",              group: "Notes" },
  "notes.cosign":       { label: "Co-sign associate notes",           group: "Notes" },
  "notes.finalize":     { label: "Finalize / lock notes",             group: "Notes" },
  "assessments.view":   { label: "View assessment results",           group: "Assessments" },
  "assessments.assign": { label: "Assign assessments",                group: "Assessments" },
  "billing.view":       { label: "View invoices and payments",        group: "Billing" },
  "billing.write":      { label: "Create invoices and record payments", group: "Billing" },
  "schedule.view":      { label: "View calendar",                     group: "Schedule" },
  "schedule.edit":      { label: "Book, reschedule, cancel",          group: "Schedule" },
  "team.manage":        { label: "Add or remove members",             group: "Team" },
  "team.roles":         { label: "Change roles and permissions",      group: "Team" },
  "team.invite":        { label: "Send invitations",                  group: "Team" },
  "audit.view":         { label: "Read the audit trail",              group: "Compliance" },
  "exports.run":        { label: "Run data exports",                  group: "Compliance" },
  "handoff.initiate":   { label: "Transfer or share a case",          group: "Cases" },
  "referrals.route":    { label: "Route internal referrals",          group: "Cases" },
};

export const ROLE_PERMS: Record<RoleKey, Set<PermKey>> = {
  owner: new Set(Object.keys(PERM_META) as PermKey[]),
  supervisor: new Set<PermKey>([
    "patients.view","patients.pii","patients.edit",
    "notes.view","notes.write","notes.cosign","notes.finalize",
    "assessments.view","assessments.assign",
    "billing.view","schedule.view","schedule.edit",
    "audit.view","handoff.initiate","referrals.route",
  ]),
  clinician: new Set<PermKey>([
    "patients.view","patients.pii","patients.edit",
    "notes.view","notes.write","notes.finalize",
    "assessments.view","assessments.assign",
    "billing.view","schedule.view","schedule.edit",
    "handoff.initiate","referrals.route",
  ]),
  associate: new Set<PermKey>([
    "patients.view","patients.pii",
    "notes.view","notes.write",
    "assessments.view","assessments.assign",
    "schedule.view","schedule.edit",
    "referrals.route",
  ]),
  frontdesk: new Set<PermKey>([
    "patients.view","patients.pii","patients.edit",
    "schedule.view","schedule.edit",
    "billing.view",
  ]),
  billing: new Set<PermKey>([
    "patients.view",
    "billing.view","billing.write",
  ]),
  readonly: new Set<PermKey>([
    "patients.view","schedule.view","billing.view",
  ]),
};

export type MemberStatus = "active" | "on-leave" | "limited" | "invited";

export type TeamMember = {
  id: string;
  fullName: string;
  preferredName?: string;
  role: RoleKey;
  credentials: string;        // e.g. "MPhil Clinical Psych · RCI"
  email: string;
  phone?: string;
  avatarInitials: string;
  tone: string;               // rose-family tint used for the avatar chip
  status: MemberStatus;
  supervisorId?: string;      // if this member is a supervisee
  joinedAt: number;
  languages: string[];
  specialties: string[];
  weeklyCapacity: number;     // sessions/week they aim to hold
  utilization: number;        // 0..1, this-month
  activeCaseload: number;     // patient count on their roster
  noShowRate: number;         // 0..1, last 30d
  outcomeIndex: number;       // 0..100, aggregated improvement %
  revenueMonth: number;       // INR — visible only to owner in UI
  nextAvailable: number;      // ms epoch of next open slot
  // per-member permission overrides (added/removed beyond role defaults)
  extraPerms: PermKey[];
  deniedPerms: PermKey[];
};

export type Supervision = {
  id: string;
  supervisorId: string;
  superviseeId: string;
  frequency: "weekly" | "biweekly" | "monthly";
  hoursLoggedMonth: number;
  hoursRequiredMonth: number;
  nextSessionAt: number;
  lastSessionAt: number;
  pendingCosigns: number;
  flaggedCases: number;
};

export type SupervisionSession = {
  id: string;
  supervisionId: string;
  at: number;
  durationMin: number;
  privateNote: string;    // NEVER surfaced on the patient chart
  casesDiscussed: string[]; // patient ids
};

export type Handoff = {
  id: string;
  patientId: string;
  patientName: string;
  fromId: string;
  toId: string;
  kind: "temporary-share" | "permanent-transfer";
  scope: {
    notes: boolean;
    assessments: boolean;
    billing: boolean;
    schedule: boolean;
  };
  startsAt: number;
  endsAt?: number;
  reason: string;
  note: string;
  status: "pending" | "accepted" | "declined" | "completed" | "cancelled";
  createdAt: number;
};

export type Referral = {
  id: string;
  patientName: string;      // for internal referrals a preferred label is enough
  patientId?: string;
  fromId: string;
  toId: string;
  reason: string;
  concern: string;
  urgency: "routine" | "soon" | "urgent";
  status: "pending" | "accepted" | "declined";
  createdAt: number;
  respondedAt?: number;
  note?: string;
};

export type Leave = {
  id: string;
  memberId: string;
  from: number;
  to: number;
  kind: "vacation" | "sick" | "conference" | "personal";
  coveringId?: string;
  note?: string;
};

export type AuditEvent = {
  id: string;
  at: number;
  actorId: string;
  actorLabel: string;
  action: string;           // e.g. "chart.view", "perms.change", "handoff.accept"
  target?: string;          // resource id
  targetLabel?: string;
  meta?: Record<string, unknown>;
};

export type Invitation = {
  id: string;
  email: string;
  role: RoleKey;
  invitedById: string;
  sentAt: number;
  status: "sent" | "opened" | "accepted" | "expired";
  message?: string;
};

// ─── Storage ─────────────────────────────────────────────────
const KEY = "peacecode.therapist.team.v1";
const bus = new EventTarget();

type Snapshot = {
  members: TeamMember[];
  supervisions: Supervision[];
  supervisionSessions: SupervisionSession[];
  handoffs: Handoff[];
  referrals: Referral[];
  leaves: Leave[];
  audit: AuditEvent[];
  invites: Invitation[];
};

const day = 86_400_000;
const now = () => Date.now();

function seed(): Snapshot {
  const t = now();
  const members: TeamMember[] = [
    { id: "me",          fullName: "Divya Sharma",     preferredName: "Divya",  role: "owner",      credentials: "MPhil Clinical Psych · RCI A-3401",   email: "divya@peacecode.in",    phone: "+91 98••••••••", avatarInitials: "DS", tone: "#B0567A", status: "active",   joinedAt: t - 720 * day, languages: ["English", "Hindi", "Gujarati"], specialties: ["Adolescents", "Trauma", "Anxiety"], weeklyCapacity: 22, utilization: 0.82, activeCaseload: 34, noShowRate: 0.06, outcomeIndex: 74, revenueMonth: 342_000, nextAvailable: t + 4 * 3600_000, extraPerms: [], deniedPerms: [] },
    { id: "sup_rohan",   fullName: "Rohan Iyer",       preferredName: "Rohan",  role: "supervisor", credentials: "PhD Counselling · RCI A-2119",         email: "rohan@peacecode.in",    phone: "+91 98••••••••", avatarInitials: "RI", tone: "#8B5A9C", status: "active",   joinedAt: t - 540 * day, languages: ["English", "Tamil"], specialties: ["Supervision", "OCD", "CBT"], weeklyCapacity: 12, utilization: 0.71, activeCaseload: 14, noShowRate: 0.04, outcomeIndex: 78, revenueMonth: 218_000, nextAvailable: t + 26 * 3600_000, extraPerms: ["team.invite"], deniedPerms: [] },
    { id: "clin_maya",   fullName: "Maya Nair",        preferredName: "Maya",   role: "clinician",  credentials: "MA Clinical Psych · RCI A-4188",       email: "maya@peacecode.in",     phone: "+91 98••••••••", avatarInitials: "MN", tone: "#5A7BA0", status: "active",   joinedAt: t - 380 * day, languages: ["English", "Malayalam", "Hindi"], specialties: ["Adults", "Grief", "Couples"], weeklyCapacity: 20, utilization: 0.88, activeCaseload: 28, noShowRate: 0.09, outcomeIndex: 69, revenueMonth: 261_000, nextAvailable: t + 2 * day, extraPerms: [], deniedPerms: [] },
    { id: "assoc_aditi", fullName: "Aditi Bose",       preferredName: "Aditi",  role: "associate",  credentials: "MSc Psych (Trainee) · under RI",       email: "aditi@peacecode.in",    phone: "+91 98••••••••", avatarInitials: "AB", tone: "#7A8B5A", status: "active",   supervisorId: "sup_rohan", joinedAt: t - 210 * day, languages: ["English", "Bengali"], specialties: ["Adolescents", "Anxiety"], weeklyCapacity: 14, utilization: 0.76, activeCaseload: 16, noShowRate: 0.11, outcomeIndex: 61, revenueMonth: 118_000, nextAvailable: t + 6 * 3600_000, extraPerms: [], deniedPerms: [] },
    { id: "assoc_karan", fullName: "Karan Deshpande",  preferredName: "Karan",  role: "associate",  credentials: "MA Clinical (Trainee) · under DS",     email: "karan@peacecode.in",    phone: "+91 98••••••••", avatarInitials: "KD", tone: "#5F8A6A", status: "limited",  supervisorId: "me", joinedAt: t - 140 * day, languages: ["English", "Marathi", "Hindi"], specialties: ["Substance use", "Groups"], weeklyCapacity: 10, utilization: 0.62, activeCaseload: 9, noShowRate: 0.14, outcomeIndex: 58, revenueMonth: 64_000, nextAvailable: t + 3 * day, extraPerms: [], deniedPerms: [] },
    { id: "fd_sneha",    fullName: "Sneha Rao",                                 role: "frontdesk",  credentials: "Practice Coordinator",                  email: "sneha@peacecode.in",    phone: "+91 98••••••••", avatarInitials: "SR", tone: "#B08444", status: "active",   joinedAt: t - 300 * day, languages: ["English", "Kannada", "Hindi"], specialties: ["Front desk", "Intakes"], weeklyCapacity: 0, utilization: 0, activeCaseload: 0, noShowRate: 0, outcomeIndex: 0, revenueMonth: 0, nextAvailable: t + 1 * 3600_000, extraPerms: ["patients.edit"], deniedPerms: [] },
    { id: "bil_ravi",    fullName: "Ravi Menon",                                role: "billing",    credentials: "CA · Billing lead",                     email: "ravi@peacecode.in",     phone: "+91 98••••••••", avatarInitials: "RM", tone: "#5F8A6A", status: "on-leave", joinedAt: t - 260 * day, languages: ["English", "Malayalam"], specialties: ["Insurance claims"], weeklyCapacity: 0, utilization: 0, activeCaseload: 0, noShowRate: 0, outcomeIndex: 0, revenueMonth: 0, nextAvailable: t + 10 * day, extraPerms: [], deniedPerms: [] },
  ];

  const supervisions: Supervision[] = [
    { id: "sv_1", supervisorId: "sup_rohan", superviseeId: "assoc_aditi", frequency: "weekly",   hoursLoggedMonth: 3.5, hoursRequiredMonth: 4, nextSessionAt: t + 2 * day, lastSessionAt: t - 5 * day, pendingCosigns: 4, flaggedCases: 1 },
    { id: "sv_2", supervisorId: "me",        superviseeId: "assoc_karan", frequency: "biweekly", hoursLoggedMonth: 1.5, hoursRequiredMonth: 2, nextSessionAt: t + 6 * day, lastSessionAt: t - 9 * day, pendingCosigns: 2, flaggedCases: 2 },
  ];

  const supervisionSessions: SupervisionSession[] = [
    { id: "svs_1", supervisionId: "sv_1", at: t - 5 * day,  durationMin: 60, privateNote: "Aditi is developing a good working alliance with the Iyer case. Formulation is sound; next step is a case conceptualization write-up.", casesDiscussed: ["pat_priya", "pat_aarav"] },
    { id: "svs_2", supervisionId: "sv_1", at: t - 12 * day, durationMin: 55, privateNote: "Discussed self-disclosure boundaries. Aditi to reread Yalom ch. 6 before next session.", casesDiscussed: ["pat_priya"] },
    { id: "svs_3", supervisionId: "sv_2", at: t - 9 * day,  durationMin: 45, privateNote: "Karan flagged a substance-use relapse; we agreed on immediate safety planning. Karan is fine but needs to sit with the discomfort of not fixing it.", casesDiscussed: ["pat_karan_client"] },
  ];

  const handoffs: Handoff[] = [
    { id: "ho_1", patientId: "pat_priya",  patientName: "Priya Iyer",   fromId: "me",         toId: "clin_maya",   kind: "temporary-share", scope: { notes: true, assessments: true, billing: false, schedule: true }, startsAt: t + 3 * day, endsAt: t + 10 * day, reason: "OOO — conference in Bengaluru", note: "Priya is in an active depressive episode. Continue weekly video, don't shift modality. She's used to a slower pace.", status: "pending",   createdAt: t - 1 * day },
    { id: "ho_2", patientId: "pat_aarav",  patientName: "Aarav Mehta",  fromId: "assoc_aditi", toId: "sup_rohan",  kind: "permanent-transfer", scope: { notes: true, assessments: true, billing: true, schedule: true }, startsAt: t - 4 * day, reason: "Complexity beyond associate scope", note: "Handoff includes latest safety plan and last 3 SOAP notes. Rohan agreed on Monday.", status: "accepted",  createdAt: t - 6 * day },
    { id: "ho_3", patientId: "pat_ishan",  patientName: "Ishan Rao",    fromId: "clin_maya",  toId: "assoc_aditi", kind: "temporary-share", scope: { notes: true, assessments: false, billing: false, schedule: true }, startsAt: t - 14 * day, endsAt: t - 2 * day, reason: "Cover for maternity leave prep",     note: "Complete.", status: "completed", createdAt: t - 20 * day },
  ];

  const referrals: Referral[] = [
    { id: "rf_1", patientName: "New — Aanya P.",  fromId: "fd_sneha",    toId: "clin_maya",  reason: "Intake screen indicates couples work; Divya's caseload full.", concern: "Relationship distress, communication", urgency: "soon",    status: "pending",  createdAt: t - 2 * day },
    { id: "rf_2", patientName: "Rehan S.",         patientId: "pat_rehan", fromId: "me",       toId: "sup_rohan",  reason: "OCD specialist match",                                        concern: "Contamination OCD, ERP indicated",     urgency: "routine", status: "accepted", createdAt: t - 7 * day, respondedAt: t - 6 * day, note: "Happy to take. Starting ERP protocol next week." },
    { id: "rf_3", patientName: "New — J. Kumar",   fromId: "fd_sneha",    toId: "assoc_karan", reason: "Substance use screening positive",                            concern: "Alcohol use, functional impairment",   urgency: "urgent",  status: "pending",  createdAt: t - 6 * 3600_000 },
    { id: "rf_4", patientName: "Aditya M.",        patientId: "pat_adit",  fromId: "clin_maya", toId: "me",         reason: "Trauma history surfaced; specialist match",                    concern: "Complex trauma, EMDR consult",         urgency: "soon",    status: "declined", createdAt: t - 3 * day, respondedAt: t - 2 * day, note: "Caseload closed — recommended Rohan instead." },
  ];

  const leaves: Leave[] = [
    { id: "lv_1", memberId: "me",        from: t + 3 * day,  to: t + 10 * day, kind: "conference", coveringId: "clin_maya", note: "IACP Bengaluru" },
    { id: "lv_2", memberId: "bil_ravi",  from: t - 4 * day,  to: t + 10 * day, kind: "personal",   coveringId: "fd_sneha",  note: "Family leave" },
    { id: "lv_3", memberId: "assoc_karan", from: t + 14 * day, to: t + 21 * day, kind: "vacation",  note: "Approved" },
  ];

  const audit: AuditEvent[] = [
    { id: "au_1", at: t - 3 * 3600_000,    actorId: "me",         actorLabel: "Divya Sharma", action: "perms.change",  target: "assoc_karan",  targetLabel: "Karan Deshpande", meta: { added: [], removed: ["notes.finalize"] } },
    { id: "au_2", at: t - 5 * 3600_000,    actorId: "sup_rohan",  actorLabel: "Rohan Iyer",   action: "chart.view",    target: "pat_aarav",    targetLabel: "Aarav Mehta" },
    { id: "au_3", at: t - 8 * 3600_000,    actorId: "clin_maya",  actorLabel: "Maya Nair",    action: "note.cosign",   target: "note_aarav_12", targetLabel: "SOAP · Aarav Mehta" },
    { id: "au_4", at: t - 26 * 3600_000,   actorId: "me",         actorLabel: "Divya Sharma", action: "handoff.create", target: "ho_1",        targetLabel: "Priya Iyer → Maya Nair" },
    { id: "au_5", at: t - 2 * day,         actorId: "fd_sneha",   actorLabel: "Sneha Rao",    action: "referral.route", target: "rf_1",        targetLabel: "Aanya P. → Maya Nair" },
    { id: "au_6", at: t - 4 * day,         actorId: "sup_rohan",  actorLabel: "Rohan Iyer",   action: "handoff.accept", target: "ho_2",        targetLabel: "Aarav Mehta accepted" },
    { id: "au_7", at: t - 5 * day,         actorId: "bil_ravi",   actorLabel: "Ravi Menon",   action: "export.run",    target: "billing.csv", targetLabel: "Nov billing export" },
    { id: "au_8", at: t - 7 * day,         actorId: "me",         actorLabel: "Divya Sharma", action: "invite.send",   target: "inv_1",       targetLabel: "priyanka@example.com · Associate" },
    { id: "au_9", at: t - 9 * day,         actorId: "assoc_aditi", actorLabel: "Aditi Bose",  action: "note.write",    target: "note_priya_43", targetLabel: "SOAP · Priya Iyer" },
    { id: "au_10", at: t - 10 * day,       actorId: "me",         actorLabel: "Divya Sharma", action: "role.change",   target: "assoc_aditi", targetLabel: "Aditi Bose · Associate" },
    { id: "au_11", at: t - 14 * day,       actorId: "clin_maya",  actorLabel: "Maya Nair",    action: "chart.view",    target: "pat_ishan",   targetLabel: "Ishan Rao" },
    { id: "au_12", at: t - 20 * day,       actorId: "clin_maya",  actorLabel: "Maya Nair",    action: "handoff.create", target: "ho_3",        targetLabel: "Ishan Rao → Aditi Bose" },
  ];

  const invites: Invitation[] = [
    { id: "inv_1", email: "priyanka@example.com", role: "associate",  invitedById: "me", sentAt: t - 7 * day, status: "opened",   message: "Excited to have you join us." },
    { id: "inv_2", email: "amit@example.com",     role: "clinician",  invitedById: "me", sentAt: t - 3 * day, status: "sent" },
  ];

  return { members, supervisions, supervisionSessions, handoffs, referrals, leaves, audit, invites };
}

let cache: Snapshot | null = null;

function read(): Snapshot {
  if (cache) return cache;
  if (typeof window === "undefined") { cache = seed(); return cache; }
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) { cache = JSON.parse(raw) as Snapshot; return cache; }
  } catch {}
  cache = seed();
  write(cache);
  return cache;
}
function write(s: Snapshot) {
  cache = s;
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
  bus.dispatchEvent(new Event("change"));
}
function subscribe(cb: () => void) {
  const on = () => cb();
  bus.addEventListener("change", on);
  return () => bus.removeEventListener("change", on);
}
function getSnap(): Snapshot { return read(); }
export function useTeamSnapshot(): Snapshot {
  return useSyncExternalStore(subscribe, getSnap, getSnap);
}
export function useTeamStore<T>(select: (s: Snapshot) => T): T {
  const snap = useTeamSnapshot();
  return useMemo(() => select(snap), [snap, select]);
}

// ─── Selectors ───────────────────────────────────────────────
export const listMembers = () => read().members;
export const getMember = (id: string) => read().members.find((m) => m.id === id);
export const listSupervisions = () => read().supervisions;
export const listSupervisionSessions = () => read().supervisionSessions;
export const listHandoffs = () => read().handoffs;
export const listReferrals = () => read().referrals;
export const listLeaves = () => read().leaves;
export const listAudit = () => read().audit;
export const listInvites = () => read().invites;

// Effective permissions for a member = role defaults + extras − denied.
export function effectivePermissions(m: TeamMember): Set<PermKey> {
  const base = new Set<PermKey>(ROLE_PERMS[m.role]);
  for (const p of m.extraPerms) base.add(p);
  for (const p of m.deniedPerms) base.delete(p);
  return base;
}
export function memberHasPerm(m: TeamMember, p: PermKey): boolean {
  return effectivePermissions(m).has(p);
}

// ─── Mutations ───────────────────────────────────────────────
function pushAudit(ev: Omit<AuditEvent, "id" | "at">) {
  const s = read();
  const rec: AuditEvent = { id: `au_${Date.now()}`, at: Date.now(), ...ev };
  write({ ...s, audit: [rec, ...s.audit].slice(0, 400) });
}

export function updateMemberRole(id: string, role: RoleKey, actor: TeamMember) {
  const s = read();
  const m = s.members.find((x) => x.id === id);
  if (!m) return;
  const before = m.role;
  const next: TeamMember = { ...m, role, extraPerms: [], deniedPerms: [] };
  write({ ...s, members: s.members.map((x) => x.id === id ? next : x) });
  pushAudit({ actorId: actor.id, actorLabel: actor.fullName, action: "role.change", target: id, targetLabel: `${m.fullName} · ${ROLE_META[before].label} → ${ROLE_META[role].label}` });
}

export function togglePerm(id: string, perm: PermKey, actor: TeamMember) {
  const s = read();
  const m = s.members.find((x) => x.id === id);
  if (!m) return;
  const has = effectivePermissions(m).has(perm);
  const roleHas = ROLE_PERMS[m.role].has(perm);
  let extra = new Set(m.extraPerms), denied = new Set(m.deniedPerms);
  if (has) {
    if (roleHas) { denied.add(perm); } else { extra.delete(perm); }
  } else {
    if (roleHas) { denied.delete(perm); } else { extra.add(perm); }
  }
  const next: TeamMember = { ...m, extraPerms: [...extra], deniedPerms: [...denied] };
  write({ ...s, members: s.members.map((x) => x.id === id ? next : x) });
  pushAudit({ actorId: actor.id, actorLabel: actor.fullName, action: "perms.change", target: id, targetLabel: m.fullName, meta: { perm, granted: !has } });
}

export function setMemberStatus(id: string, status: MemberStatus, actor: TeamMember) {
  const s = read();
  const m = s.members.find((x) => x.id === id);
  if (!m) return;
  const next: TeamMember = { ...m, status };
  write({ ...s, members: s.members.map((x) => x.id === id ? next : x) });
  pushAudit({ actorId: actor.id, actorLabel: actor.fullName, action: "status.change", target: id, targetLabel: `${m.fullName} · ${status}` });
}

export function createHandoff(input: Omit<Handoff, "id" | "status" | "createdAt">, actor: TeamMember): Handoff {
  const s = read();
  const rec: Handoff = { ...input, id: `ho_${Date.now()}`, status: "pending", createdAt: Date.now() };
  write({ ...s, handoffs: [rec, ...s.handoffs] });
  pushAudit({ actorId: actor.id, actorLabel: actor.fullName, action: "handoff.create", target: rec.id, targetLabel: `${rec.patientName} → ${getMember(rec.toId)?.fullName ?? rec.toId}` });
  return rec;
}
export function respondHandoff(id: string, status: "accepted" | "declined", actor: TeamMember) {
  const s = read();
  const h = s.handoffs.find((x) => x.id === id);
  if (!h) return;
  const next: Handoff = { ...h, status };
  write({ ...s, handoffs: s.handoffs.map((x) => x.id === id ? next : x) });
  pushAudit({ actorId: actor.id, actorLabel: actor.fullName, action: `handoff.${status}`, target: id, targetLabel: `${h.patientName} ${status}` });
}

export function createReferral(input: Omit<Referral, "id" | "status" | "createdAt">, actor: TeamMember): Referral {
  const s = read();
  const rec: Referral = { ...input, id: `rf_${Date.now()}`, status: "pending", createdAt: Date.now() };
  write({ ...s, referrals: [rec, ...s.referrals] });
  pushAudit({ actorId: actor.id, actorLabel: actor.fullName, action: "referral.route", target: rec.id, targetLabel: `${rec.patientName} → ${getMember(rec.toId)?.fullName ?? rec.toId}` });
  return rec;
}
export function respondReferral(id: string, status: "accepted" | "declined", note: string, actor: TeamMember) {
  const s = read();
  const r = s.referrals.find((x) => x.id === id);
  if (!r) return;
  const next: Referral = { ...r, status, note, respondedAt: Date.now() };
  write({ ...s, referrals: s.referrals.map((x) => x.id === id ? next : x) });
  pushAudit({ actorId: actor.id, actorLabel: actor.fullName, action: `referral.${status}`, target: id, targetLabel: `${r.patientName} ${status}` });
}

export function logSupervisionSession(input: Omit<SupervisionSession, "id">, actor: TeamMember) {
  const s = read();
  const rec: SupervisionSession = { ...input, id: `svs_${Date.now()}` };
  const sv = s.supervisions.find((x) => x.id === input.supervisionId);
  const next = sv ? s.supervisions.map((x) => x.id === sv.id ? { ...x, lastSessionAt: input.at, hoursLoggedMonth: x.hoursLoggedMonth + input.durationMin / 60 } : x) : s.supervisions;
  write({ ...s, supervisionSessions: [rec, ...s.supervisionSessions], supervisions: next });
  pushAudit({ actorId: actor.id, actorLabel: actor.fullName, action: "supervision.log", target: rec.id, targetLabel: `${sv ? getMember(sv.superviseeId)?.fullName : ""} · ${input.durationMin}m` });
}

export function sendInvite(email: string, role: RoleKey, message: string, actor: TeamMember): Invitation {
  const s = read();
  const rec: Invitation = { id: `inv_${Date.now()}`, email, role, invitedById: actor.id, sentAt: Date.now(), status: "sent", message };
  write({ ...s, invites: [rec, ...s.invites] });
  pushAudit({ actorId: actor.id, actorLabel: actor.fullName, action: "invite.send", target: rec.id, targetLabel: `${email} · ${ROLE_META[role].label}` });
  return rec;
}
export function revokeInvite(id: string, actor: TeamMember) {
  const s = read();
  const inv = s.invites.find((x) => x.id === id);
  if (!inv) return;
  write({ ...s, invites: s.invites.filter((x) => x.id !== id) });
  pushAudit({ actorId: actor.id, actorLabel: actor.fullName, action: "invite.revoke", target: id, targetLabel: inv.email });
}

// ─── Small hook helpers ──────────────────────────────────────
export function useMembers() { return useTeamStore((s) => s.members); }
export function useSupervisions() { return useTeamStore((s) => s.supervisions); }
export function useHandoffs() { return useTeamStore((s) => s.handoffs); }
export function useReferrals() { return useTeamStore((s) => s.referrals); }
export function useLeaves() { return useTeamStore((s) => s.leaves); }
export function useAudit() { return useTeamStore((s) => s.audit); }
export function useInvites() { return useTeamStore((s) => s.invites); }

// Current signed-in user (matches AppShell's Divya).
export function useMe(): TeamMember {
  const members = useMembers();
  return members.find((m) => m.id === "me") ?? members[0];
}

export function usePendingCounts() {
  return useTeamStore((s) => ({
    referrals: s.referrals.filter((r) => r.status === "pending").length,
    handoffs: s.handoffs.filter((h) => h.status === "pending").length,
    cosigns: s.supervisions.reduce((a, sv) => a + sv.pendingCosigns, 0),
  }));
}

// One-liner formatter used across all Team pages for consistency.
export function fmtRelDay(ts: number): string {
  const d = Math.round((ts - Date.now()) / day);
  if (d === 0) return "today";
  if (d === 1) return "tomorrow";
  if (d === -1) return "yesterday";
  if (d > 0 && d < 7) return `in ${d}d`;
  if (d < 0 && d > -30) return `${-d}d ago`;
  const dt = new Date(ts);
  return dt.toLocaleDateString([], { day: "numeric", month: "short" });
}
export function useHydratedTeam(): boolean {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}
