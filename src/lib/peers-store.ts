// PeaceCode · Practice — Peer Network store.
// Peer directory, connections, discussion threads (anonymised cases),
// journal club, referrals, endorsements. localStorage-backed.
import { useSyncExternalStore } from "react";

export type Peer = {
  id: string;
  name: string;
  handle: string; // for anonymised posts
  city: string;
  focus: string[];
  years: number;
  modalities: string[];
  verified: boolean;
  bio: string;
  avatarInitials: string;
  self?: boolean;
};

export type Connection = {
  peerId: string;
  status: "pending_out" | "pending_in" | "connected";
  since: number;
};

export type DiscussionKind = "case" | "methodology" | "ethics" | "question";

export type Discussion = {
  id: string;
  kind: DiscussionKind;
  title: string;
  body: string;
  authorId: string;
  anonymised: boolean; // authors shown as handle
  tags: string[];
  createdAt: number;
  replies: Reply[];
  bookmarked?: boolean;
  resolved?: boolean;
};

export type Reply = {
  id: string;
  authorId: string;
  body: string;
  createdAt: number;
  helpful: number; // upvotes
  helpfulBy: string[]; // peer ids who marked
};

export type JournalClubItem = {
  id: string;
  paperTitle: string;
  authors: string;
  venue: string;
  year: number;
  doi?: string;
  addedBy: string; // peer id
  addedAt: number;
  discussionAt?: number; // scheduled club date
  notes: string;
  attendees: string[]; // peer ids
};

export type Referral = {
  id: string;
  direction: "sent" | "received";
  counterpartId: string; // peer id
  patientInitials: string; // never full name
  reason: string;
  focus: string;
  status: "open" | "accepted" | "declined" | "closed";
  createdAt: number;
  updatedAt: number;
  notes: string;
};

export type Endorsement = {
  id: string;
  fromId: string;
  toId: string;
  skill: string;
  note: string;
  at: number;
};

const KEY = "peacecode.therapist.peers.v1";
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((f) => f());
const isBrowser = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

type Shape = {
  peers: Peer[];
  connections: Connection[];
  discussions: Discussion[];
  journal: JournalClubItem[];
  referrals: Referral[];
  endorsements: Endorsement[];
};

function seed(): Shape {
  const now = Date.now();
  const D = 24 * 60 * 60 * 1000;
  const peers: Peer[] = [
    { id: "me", name: "Dr. Aditi Rao", handle: "@AR-notes", city: "Bengaluru", focus: ["Trauma", "CBT"], years: 8, modalities: ["CBT", "EMDR", "ACT"], verified: true, bio: "Clinical psychologist. Trauma, anxiety, third-wave CBT.", avatarInitials: "AR", self: true },
    { id: "p2", name: "Dr. Meera Iyer", handle: "@mi-clinic", city: "Mumbai", focus: ["Perinatal", "Grief"], years: 12, modalities: ["Psychodynamic", "IPT"], verified: true, bio: "Perinatal mental health. 12 years private practice.", avatarInitials: "MI" },
    { id: "p3", name: "Rohan Kapoor, MSc", handle: "@rk-cbt", city: "Delhi", focus: ["OCD", "Anxiety"], years: 5, modalities: ["CBT", "ERP"], verified: true, bio: "OCD specialist. ERP-focused. IAP member.", avatarInitials: "RK" },
    { id: "p4", name: "Dr. Fatima Sheikh", handle: "@fs-neuropsy", city: "Hyderabad", focus: ["Neuropsych", "Assessment"], years: 15, modalities: ["Assessment", "Rehabilitation"], verified: true, bio: "Neuropsychologist. Adult assessment, TBI rehab.", avatarInitials: "FS" },
    { id: "p5", name: "Ananya Bose, RCI", handle: "@ab-teens", city: "Kolkata", focus: ["Adolescent", "Family"], years: 6, modalities: ["Family systems", "DBT"], verified: true, bio: "Adolescent + family therapy. School liaison.", avatarInitials: "AB" },
    { id: "p6", name: "Karan Sethi, MPhil", handle: "@ks-couples", city: "Pune", focus: ["Couples", "Sex therapy"], years: 9, modalities: ["EFT", "Gottman"], verified: true, bio: "EFT couples work. Gottman Level 3.", avatarInitials: "KS" },
    { id: "p7", name: "Dr. Sanjana Rao", handle: "@sr-psych", city: "Chennai", focus: ["Psychosis", "SMI"], years: 20, modalities: ["Integrated", "Rehabilitation"], verified: true, bio: "Long-term SMI. Community mental health.", avatarInitials: "SR" },
    { id: "p8", name: "Vivek Menon, MSc", handle: "@vm-mindful", city: "Kochi", focus: ["Mindfulness", "MBCT"], years: 7, modalities: ["MBCT", "ACT"], verified: false, bio: "MBCT teacher trainer. 7 years.", avatarInitials: "VM" },
  ];
  const connections: Connection[] = [
    { peerId: "p2", status: "connected", since: now - 90 * D },
    { peerId: "p3", status: "connected", since: now - 60 * D },
    { peerId: "p5", status: "connected", since: now - 45 * D },
    { peerId: "p6", status: "connected", since: now - 30 * D },
    { peerId: "p4", status: "pending_in", since: now - 2 * D },
    { peerId: "p7", status: "pending_out", since: now - 5 * D },
  ];
  const discussions: Discussion[] = [
    {
      id: "d1", kind: "case", title: "Adolescent with school refusal — where would you go next?",
      body: "16 y/o, 4 months of increasing school avoidance. Family conflict escalating. CBT-based exposure hierarchy stalled at step 3. Considering family systems consult vs stepping up to intensive outpatient. All identifying details removed.",
      authorId: "p5", anonymised: true, tags: ["adolescent", "school refusal", "cbt"], createdAt: now - 3 * D, resolved: false,
      replies: [
        { id: "r1", authorId: "p2", body: "In my experience, when exposure stalls this early it's usually a safety-signal problem in the home. I'd bring parents in for 2 sessions before returning to the hierarchy.", createdAt: now - 2 * D, helpful: 4, helpfulBy: ["me", "p3", "p6", "p8"] },
        { id: "r2", authorId: "p3", body: "Agreed with Meera. Also worth screening for undiagnosed OCD — school refusal is a common presentation.", createdAt: now - 1.5 * D, helpful: 2, helpfulBy: ["me", "p5"] },
      ],
    },
    {
      id: "d2", kind: "methodology", title: "Anyone using single-session therapy models?",
      body: "Curious about SST for waitlist reduction. Any Indian-context data or clinical impressions?",
      authorId: "me", anonymised: false, tags: ["sst", "methodology"], createdAt: now - 5 * D, resolved: false,
      replies: [
        { id: "r3", authorId: "p7", body: "Ran SST clinics for a year at NIMHANS. Works well for adjustment issues; less so for trauma. Happy to share protocol.", createdAt: now - 4 * D, helpful: 6, helpfulBy: ["me", "p2", "p3", "p5", "p6", "p8"] },
      ],
    },
    {
      id: "d3", kind: "ethics", title: "Client requesting session recordings — how do you handle?",
      body: "Client wants audio recording of every session for personal review. Consent form covers it but I have concerns about downstream sharing.",
      authorId: "p6", anonymised: false, tags: ["ethics", "consent", "recording"], createdAt: now - 7 * D, resolved: true,
      replies: [
        { id: "r4", authorId: "p4", body: "Explicit written addendum: personal use only, no sharing, no AI transcription services. Review annually.", createdAt: now - 6 * D, helpful: 5, helpfulBy: ["me", "p2", "p3", "p5", "p7"] },
        { id: "r5", authorId: "me", body: "Adopted this pattern last year. Also: keep a copy of the addendum in their chart with re-consent at every renewal.", createdAt: now - 6 * D, helpful: 3, helpfulBy: ["p2", "p6", "p8"] },
      ],
    },
    {
      id: "d4", kind: "question", title: "Best-fit measure for treatment-resistant depression progress?",
      body: "PHQ-9 ceiling effect after 6 sessions. Considering QIDS or MADRS. Preferences?",
      authorId: "p3", anonymised: false, tags: ["measurement", "depression"], createdAt: now - 12 * D, resolved: false,
      replies: [],
    },
  ];
  const journal: JournalClubItem[] = [
    { id: "j1", paperTitle: "Efficacy of Internet-Delivered CBT in Indian Adult Populations: A Meta-analysis", authors: "Krishnan et al.", venue: "Indian J Psych", year: 2024, doi: "10.4103/ijp.ijp_412_24", addedBy: "p2", addedAt: now - 20 * D, discussionAt: now + 7 * D, notes: "Pre-read pages 4-7. Focus on effect sizes across regions.", attendees: ["me", "p2", "p3", "p5"] },
    { id: "j2", paperTitle: "Transdiagnostic Approaches: The Unified Protocol in Adolescents", authors: "Ehrenreich-May et al.", venue: "Behav Res Ther", year: 2023, doi: "10.1016/j.brat.2023.104112", addedBy: "p5", addedAt: now - 45 * D, notes: "Discussed. Group agreed to trial with 3 adolescent cases each; report back in 6 months.", attendees: ["me", "p2", "p5", "p6"] },
  ];
  const referrals: Referral[] = [
    { id: "ref1", direction: "sent", counterpartId: "p4", patientInitials: "S.M.", reason: "Suspected mild cognitive impairment; needs full neuropsych battery.", focus: "Neuropsychological assessment", status: "accepted", createdAt: now - 15 * D, updatedAt: now - 12 * D, notes: "First appt 20-Jul. Report to come back to me for integrated care." },
    { id: "ref2", direction: "received", counterpartId: "p2", patientInitials: "R.K.", reason: "Postpartum anxiety, needs CBT with trauma focus.", focus: "Perinatal CBT", status: "open", createdAt: now - 4 * D, updatedAt: now - 4 * D, notes: "Meera flagged as urgent — accept within 48h." },
    { id: "ref3", direction: "sent", counterpartId: "p6", patientInitials: "A.N.", reason: "Couples work required; individual therapy plateaued.", focus: "EFT couples", status: "closed", createdAt: now - 90 * D, updatedAt: now - 30 * D, notes: "Completed 12 sessions. Client reported significant improvement." },
  ];
  const endorsements: Endorsement[] = [
    { id: "e1", fromId: "p2", toId: "me", skill: "Trauma-focused CBT", note: "Thoughtful, careful clinician. Have referred 4 patients.", at: now - 60 * D },
    { id: "e2", fromId: "p3", toId: "me", skill: "Case conceptualisation", note: "Consistently sharp formulations in our journal club.", at: now - 45 * D },
    { id: "e3", fromId: "me", toId: "p2", skill: "Perinatal mental health", note: "Gold standard perinatal work in Mumbai.", at: now - 50 * D },
  ];
  return { peers, connections, discussions, journal, referrals, endorsements };
}

function readAll(): Shape {
  if (!isBrowser()) return seed();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Shape;
    const s = seed();
    window.localStorage.setItem(KEY, JSON.stringify(s));
    return s;
  } catch { return seed(); }
}
function writeAll(s: Shape) {
  if (!isBrowser()) return;
  window.localStorage.setItem(KEY, JSON.stringify(s));
  emit();
}
function subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }

export const ME_ID = "me";

// selectors
export function listPeers() { return readAll().peers.slice(); }
export function getPeer(id: string) { return readAll().peers.find((p) => p.id === id); }
export function listConnections() { return readAll().connections.slice(); }
export function connectionOf(id: string) { return readAll().connections.find((c) => c.peerId === id); }
export function listDiscussions() { return readAll().discussions.slice().sort((a, b) => b.createdAt - a.createdAt); }
export function getDiscussion(id: string) { return readAll().discussions.find((d) => d.id === id); }
export function listJournal() { return readAll().journal.slice().sort((a, b) => (b.discussionAt ?? b.addedAt) - (a.discussionAt ?? a.addedAt)); }
export function listReferrals() { return readAll().referrals.slice().sort((a, b) => b.updatedAt - a.updatedAt); }
export function listEndorsements() { return readAll().endorsements.slice(); }
export function endorsementsFor(id: string) { return readAll().endorsements.filter((e) => e.toId === id); }

// mutations
export function acceptConnection(peerId: string) {
  const s = readAll();
  const c = s.connections.find((x) => x.peerId === peerId);
  if (c) { c.status = "connected"; c.since = Date.now(); writeAll(s); }
}
export function requestConnection(peerId: string) {
  const s = readAll();
  if (s.connections.find((x) => x.peerId === peerId)) return;
  s.connections.push({ peerId, status: "pending_out", since: Date.now() });
  writeAll(s);
}
export function removeConnection(peerId: string) {
  const s = readAll();
  s.connections = s.connections.filter((c) => c.peerId !== peerId);
  writeAll(s);
}

export function createDiscussion(input: Omit<Discussion, "id" | "createdAt" | "replies">): Discussion {
  const s = readAll();
  const d: Discussion = { ...input, id: `d-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`, createdAt: Date.now(), replies: [] };
  s.discussions.unshift(d);
  writeAll(s);
  return d;
}
export function replyToDiscussion(tid: string, body: string, authorId = ME_ID): Reply | undefined {
  const s = readAll();
  const d = s.discussions.find((x) => x.id === tid);
  if (!d) return;
  const r: Reply = { id: `r-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`, authorId, body, createdAt: Date.now(), helpful: 0, helpfulBy: [] };
  d.replies.push(r);
  writeAll(s);
  return r;
}
export function markHelpful(tid: string, rid: string, peerId = ME_ID) {
  const s = readAll();
  const d = s.discussions.find((x) => x.id === tid);
  const r = d?.replies.find((x) => x.id === rid);
  if (!r) return;
  if (r.helpfulBy.includes(peerId)) {
    r.helpfulBy = r.helpfulBy.filter((p) => p !== peerId);
    r.helpful = Math.max(0, r.helpful - 1);
  } else {
    r.helpfulBy.push(peerId);
    r.helpful += 1;
  }
  writeAll(s);
}
export function toggleResolved(tid: string) {
  const s = readAll();
  const d = s.discussions.find((x) => x.id === tid);
  if (!d) return;
  d.resolved = !d.resolved;
  writeAll(s);
}
export function toggleBookmark(tid: string) {
  const s = readAll();
  const d = s.discussions.find((x) => x.id === tid);
  if (!d) return;
  d.bookmarked = !d.bookmarked;
  writeAll(s);
}

export function addJournalItem(input: Omit<JournalClubItem, "id" | "addedAt" | "attendees">): JournalClubItem {
  const s = readAll();
  const j: JournalClubItem = { ...input, id: `j-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`, addedAt: Date.now(), attendees: [ME_ID] };
  s.journal.unshift(j);
  writeAll(s);
  return j;
}
export function toggleJournalAttend(jid: string, peerId = ME_ID) {
  const s = readAll();
  const j = s.journal.find((x) => x.id === jid);
  if (!j) return;
  j.attendees = j.attendees.includes(peerId) ? j.attendees.filter((p) => p !== peerId) : [...j.attendees, peerId];
  writeAll(s);
}

export function createReferral(input: Omit<Referral, "id" | "createdAt" | "updatedAt">): Referral {
  const s = readAll();
  const now = Date.now();
  const r: Referral = { ...input, id: `ref-${now}-${Math.random().toString(36).slice(2, 5)}`, createdAt: now, updatedAt: now };
  s.referrals.unshift(r);
  writeAll(s);
  return r;
}
export function updateReferralStatus(id: string, status: Referral["status"]) {
  const s = readAll();
  const r = s.referrals.find((x) => x.id === id);
  if (!r) return;
  r.status = status;
  r.updatedAt = Date.now();
  writeAll(s);
}

// hooks
export function usePeers() { return useSyncExternalStore(subscribe, listPeers, listPeers); }
export function useConnections() { return useSyncExternalStore(subscribe, listConnections, listConnections); }
export function useDiscussions() { return useSyncExternalStore(subscribe, listDiscussions, listDiscussions); }
export function useJournal() { return useSyncExternalStore(subscribe, listJournal, listJournal); }
export function useReferrals() { return useSyncExternalStore(subscribe, listReferrals, listReferrals); }
export function useEndorsements() { return useSyncExternalStore(subscribe, listEndorsements, listEndorsements); }

export const KIND_LABEL: Record<DiscussionKind, string> = {
  case: "Case discussion",
  methodology: "Methodology",
  ethics: "Ethics",
  question: "Question",
};
