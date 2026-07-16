// PeaceCode · Practice — Referrals store.
// Incoming + outgoing patient referrals from external sources: GPs,
// psychiatrists, employers/EAPs, universities, prior therapists, self.
// Tracks source, warm-handoff status, conversion to patient chart.
import { useSyncExternalStore } from "react";

export type ReferralDirection = "incoming" | "outgoing";
export type ReferralStatus = "new" | "contacted" | "scheduled" | "converted" | "declined" | "closed";
export type ReferralSource = "gp" | "psychiatrist" | "eap" | "university" | "self" | "prior_therapist" | "peer" | "directory" | "search" | "word_of_mouth";

export type Referral = {
  id: string;
  direction: ReferralDirection;
  status: ReferralStatus;
  source: ReferralSource;
  sourceName: string; // "Dr. Meera Iyer" or "Bosch India EAP"
  sourceContact?: string; // email or phone (masked in display)
  patientName: string;
  patientInitials: string;
  patientContact?: string;
  presenting: string;
  urgency: "routine" | "priority" | "urgent";
  receivedAt: number;
  firstContactAt?: number;
  scheduledAt?: number;
  convertedAt?: number;
  convertedPatientId?: string;
  notes: string;
  outboundReason?: string; // when direction = outgoing
  history: { at: number; who: string; action: string }[];
};

const KEY = "peacecode.therapist.referrals.v1";
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((f) => f());
const isBrowser = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";
const ME = "Dr. Aditi Rao";

export const SOURCE_LABEL: Record<ReferralSource, string> = {
  gp: "GP",
  psychiatrist: "Psychiatrist",
  eap: "Employer / EAP",
  university: "University counselling",
  self: "Self-referral",
  prior_therapist: "Prior therapist",
  peer: "Peer clinician",
  directory: "Directory listing",
  search: "Google / search",
  word_of_mouth: "Word of mouth",
};

export const STATUS_LABEL: Record<ReferralStatus, string> = {
  new: "New",
  contacted: "Contacted",
  scheduled: "Scheduled",
  converted: "Converted",
  declined: "Declined",
  closed: "Closed",
};

function seed(): Referral[] {
  const now = Date.now();
  const D = 86400000;
  return [
    { id: "r1", direction: "incoming", status: "new", source: "gp", sourceName: "Dr. Priya Menon (Manipal, Old Airport Rd)", sourceContact: "priya.menon@manipal.in", patientName: "Rohan Sharma", patientInitials: "R.S.", patientContact: "+91 98******12", presenting: "Adult male, 34, six-week history of anxiety with somatic component. Ruled out cardiac. Requesting CBT.", urgency: "priority", receivedAt: now - 2 * D, notes: "Priya has referred 4 patients this year; warm handoff.", history: [{ at: now - 2 * D, who: "system", action: "referral received via email" }] },
    { id: "r2", direction: "incoming", status: "scheduled", source: "psychiatrist", sourceName: "Dr. Nikhil Rao", sourceContact: "nrao.psy@gmail.com", patientName: "Ananya Sengupta", patientInitials: "A.S.", patientContact: "+91 90******05", presenting: "35F, on sertraline 100mg × 6mo. Psychiatrist requests concurrent CBT for residual anxiety.", urgency: "routine", receivedAt: now - 6 * D, firstContactAt: now - 5 * D, scheduledAt: now + 3 * D, notes: "Intake booked for Thursday 3pm.", history: [{ at: now - 6 * D, who: "system", action: "received" }, { at: now - 5 * D, who: ME, action: "called back — patient reached" }, { at: now - 5 * D, who: ME, action: "intake scheduled" }] },
    { id: "r3", direction: "incoming", status: "converted", source: "eap", sourceName: "Bosch India EAP (via ComPsych)", sourceContact: "eap-triage@compsych.com", patientName: "Kavya Iyer", patientInitials: "K.I.", presenting: "Burnout screening + 6 authorised sessions via employer EAP.", urgency: "routine", receivedAt: now - 45 * D, firstContactAt: now - 44 * D, scheduledAt: now - 40 * D, convertedAt: now - 40 * D, convertedPatientId: "p_ki", notes: "Session 4 of 6 completed. EAP extension likely.", history: [{ at: now - 45 * D, who: "system", action: "received via EAP portal" }, { at: now - 40 * D, who: ME, action: "converted to active chart p_ki" }] },
    { id: "r4", direction: "incoming", status: "declined", source: "self", sourceName: "Self", patientName: "—", patientInitials: "V.P.", presenting: "Adolescent (16) — school refusal. Outside my scope for adolescent work.", urgency: "routine", receivedAt: now - 12 * D, firstContactAt: now - 11 * D, notes: "Declined and provided 3 adolescent-specialist referrals (Ananya Bose, Ravi Kumar, Fatima Sheikh).", history: [{ at: now - 12 * D, who: "system", action: "received via website form" }, { at: now - 11 * D, who: ME, action: "declined with 3 warm referrals" }] },
    { id: "r5", direction: "incoming", status: "contacted", source: "directory", sourceName: "PeaceCode public listing", patientName: "Meera Nair", patientInitials: "M.N.", patientContact: "meera.n84@gmail.com", presenting: "Perinatal anxiety, 3 months postpartum.", urgency: "priority", receivedAt: now - 3 * D, firstContactAt: now - 1 * D, notes: "Sent intake questionnaire. Awaiting reply.", history: [{ at: now - 3 * D, who: "system", action: "received via /p/aditi-rao" }, { at: now - 1 * D, who: ME, action: "intake questionnaire sent" }] },
    { id: "r6", direction: "outgoing", status: "scheduled", source: "peer", sourceName: "Dr. Fatima Sheikh (Neuropsych)", patientName: "Suresh Menon", patientInitials: "S.M.", presenting: "Existing patient. Sending for full neuropsychological battery — suspected MCI.", urgency: "priority", receivedAt: now - 15 * D, scheduledAt: now - 12 * D, outboundReason: "Concurrent care — report to feed back into my formulation.", notes: "Report expected end of month.", history: [{ at: now - 15 * D, who: ME, action: "outbound referral sent" }, { at: now - 12 * D, who: "Dr. Fatima Sheikh", action: "confirmed intake booked" }] },
    { id: "r7", direction: "outgoing", status: "converted", source: "peer", sourceName: "Dr. Karan Sethi (Couples/EFT)", patientName: "Anonymised couple", patientInitials: "A.N.", presenting: "Individual therapy plateaued; couple work indicated.", urgency: "routine", receivedAt: now - 90 * D, convertedAt: now - 60 * D, outboundReason: "Modality mismatch — I don't do couples work.", notes: "Karan confirmed 12 sessions completed.", history: [{ at: now - 90 * D, who: ME, action: "outbound referral sent" }, { at: now - 60 * D, who: "Dr. Karan Sethi", action: "started EFT protocol" }] },
    { id: "r8", direction: "incoming", status: "new", source: "university", sourceName: "St. Joseph's College Wellness Cell", sourceContact: "wellness@sjc.ac.in", patientName: "Aarav Reddy", patientInitials: "A.R.", presenting: "Undergrad, 20M. Persistent low mood post-exam period. Cell has capped sessions; requesting external continuation.", urgency: "routine", receivedAt: now - 1 * D, notes: "", history: [{ at: now - 1 * D, who: "system", action: "received" }] },
  ];
}

function readAll(): Referral[] {
  if (!isBrowser()) return seed();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Referral[];
    const s = seed();
    window.localStorage.setItem(KEY, JSON.stringify(s));
    return s;
  } catch { return seed(); }
}
function writeAll(list: Referral[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
  emit();
}
function subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }

export function listReferrals(): Referral[] { return readAll().slice().sort((a, b) => b.receivedAt - a.receivedAt); }
export function getReferral(id: string): Referral | undefined { return readAll().find((r) => r.id === id); }

export function updateReferral(id: string, patch: Partial<Referral>, action = "edited") {
  const list = readAll();
  const r = list.find((x) => x.id === id);
  if (!r) return;
  Object.assign(r, patch);
  r.history.push({ at: Date.now(), who: ME, action });
  writeAll(list);
}
export function setStatus(id: string, status: ReferralStatus) {
  const list = readAll();
  const r = list.find((x) => x.id === id);
  if (!r) return;
  r.status = status;
  const now = Date.now();
  if (status === "contacted" && !r.firstContactAt) r.firstContactAt = now;
  if (status === "converted" && !r.convertedAt) r.convertedAt = now;
  r.history.push({ at: now, who: ME, action: `status → ${STATUS_LABEL[status]}` });
  writeAll(list);
}
export function createReferral(input: Omit<Referral, "id" | "history">): Referral {
  const list = readAll();
  const r: Referral = { ...input, id: `r-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`, history: [{ at: Date.now(), who: ME, action: input.direction === "incoming" ? "manual entry" : "outbound sent" }] };
  list.unshift(r);
  writeAll(list);
  return r;
}
export function useReferrals(): Referral[] { return useSyncExternalStore(subscribe, listReferrals, listReferrals); }

// analytics
export function conversionStats(list: Referral[]) {
  const inc = list.filter((r) => r.direction === "incoming");
  const converted = inc.filter((r) => r.status === "converted").length;
  const declined = inc.filter((r) => r.status === "declined").length;
  const pending = inc.filter((r) => r.status === "new" || r.status === "contacted").length;
  const rate = inc.length ? Math.round((converted / inc.length) * 100) : 0;
  const bySource: Record<string, { count: number; converted: number }> = {};
  for (const r of inc) {
    const k = r.source;
    bySource[k] = bySource[k] ?? { count: 0, converted: 0 };
    bySource[k].count += 1;
    if (r.status === "converted") bySource[k].converted += 1;
  }
  return { total: inc.length, converted, declined, pending, rate, bySource };
}
