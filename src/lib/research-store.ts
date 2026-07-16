// PeaceCode · Practice — Research participation store.
import { useSyncExternalStore } from "react";

export type StudyStatus = "recruiting" | "active" | "closed";
export type ParticipationStatus = "not_joined" | "screening" | "enrolled" | "collecting" | "submitted" | "ineligible";
export type Discipline = "CBT" | "Trauma" | "Adolescent" | "Digital Health" | "Neuropsych" | "Group Therapy";

export type Study = {
  id: string;
  title: string;
  pi: string; // principal investigator
  institution: string;
  discipline: Discipline;
  status: StudyStatus;
  irb: string;
  compensation: number; // INR per submitted case (0 = unpaid)
  cases: { needed: number; enrolled: number };
  windowClosesAt: number;
  summary: string;
  eligibility: string[];
  timeCommitmentHrs: number;
  participation: ParticipationStatus;
  submittedCases?: { id: string; label: string; at: number; status: "draft" | "submitted" | "accepted" }[];
};

const KEY = "peacecode.therapist.research.v1";
const bus = new EventTarget();
let cache: Study[] | null = null;

function seed(): Study[] {
  const day = 86_400_000;
  const now = Date.now();
  return [
    {
      id: "st_cbt_gad",
      title: "Brief CBT for Generalized Anxiety in Young Adults (18–28)",
      pi: "Dr. Ramya Iyer",
      institution: "NIMHANS, Bengaluru",
      discipline: "CBT",
      status: "recruiting",
      irb: "IRB-24-1129",
      compensation: 1200,
      cases: { needed: 40, enrolled: 27 },
      windowClosesAt: now + 42 * day,
      summary: "8-session structured CBT protocol with weekly GAD-7 and a 12-week follow-up. De-identified session summaries + outcome scales.",
      eligibility: ["Adults 18–28", "GAD-7 ≥ 10 at intake", "No active substance dependence", "Consent to research use of de-identified data"],
      timeCommitmentHrs: 4,
      participation: "enrolled",
      submittedCases: [
        { id: "c1", label: "Case #A03 · Priya M.", at: now - 12 * day, status: "accepted" },
        { id: "c2", label: "Case #A07 · Rohan T.", at: now - 3 * day, status: "submitted" },
      ],
    },
    {
      id: "st_trauma_emdr",
      title: "EMDR vs. Prolonged Exposure — Real-world outcomes",
      pi: "Dr. Fatima Sheikh",
      institution: "AIIMS Delhi",
      discipline: "Trauma",
      status: "recruiting",
      irb: "IRB-25-0044",
      compensation: 2000,
      cases: { needed: 60, enrolled: 18 },
      windowClosesAt: now + 96 * day,
      summary: "Pragmatic effectiveness trial. Requires PCL-5 at baseline, mid, and 6-week follow-up. Assignment is clinician preference (not randomised).",
      eligibility: ["Adult PTSD (DSM-5)", "Trained in either EMDR or PE", "≥ 6 planned sessions", "Written participant consent"],
      timeCommitmentHrs: 6,
      participation: "screening",
    },
    {
      id: "st_teen_dbt",
      title: "Skills-only DBT groups for adolescents in school settings",
      pi: "Dr. Aditi Rao",
      institution: "Ashoka University, Sonipat",
      discipline: "Adolescent",
      status: "active",
      irb: "IRB-24-0782",
      compensation: 0,
      cases: { needed: 12, enrolled: 12 },
      windowClosesAt: now + 20 * day,
      summary: "Ongoing arm — closed to new sites but accepting individual clinician observations. Monthly facilitator notes.",
      eligibility: ["Runs DBT-A skills group", "≥ 6 adolescent participants", "Monthly reflection uploads"],
      timeCommitmentHrs: 2,
      participation: "not_joined",
    },
    {
      id: "st_digital_pep",
      title: "SMS-based between-session prompts — engagement & mood",
      pi: "Dr. Kabir Nanda",
      institution: "IIT Bombay · CogSci",
      discipline: "Digital Health",
      status: "recruiting",
      irb: "IRB-25-0203",
      compensation: 800,
      cases: { needed: 30, enrolled: 4 },
      windowClosesAt: now + 60 * day,
      summary: "Opt-in SMS reminders + micro-check-ins for 8 weeks. You review weekly aggregated engagement dashboards.",
      eligibility: ["Any modality", "Client owns a phone with SMS", "Weekly 15-min review"],
      timeCommitmentHrs: 3,
      participation: "not_joined",
    },
    {
      id: "st_neuro_screen",
      title: "Digital cognitive screener validation vs. MoCA (adults 50+)",
      pi: "Dr. Meera Iyengar",
      institution: "Manipal Hospitals",
      discipline: "Neuropsych",
      status: "recruiting",
      irb: "IRB-25-0330",
      compensation: 1500,
      cases: { needed: 50, enrolled: 22 },
      windowClosesAt: now + 75 * day,
      summary: "Administer both screeners in a single session; upload de-identified paired results. Requires ~40 min per participant.",
      eligibility: ["Neuropsych scope", "Adults 50+", "Trained in MoCA"],
      timeCommitmentHrs: 5,
      participation: "not_joined",
    },
    {
      id: "st_group_efficacy",
      title: "Closed-cohort process-experiential groups — 12-week outcomes",
      pi: "Dr. Sanjay Menon",
      institution: "TISS Mumbai",
      discipline: "Group Therapy",
      status: "closed",
      irb: "IRB-23-0918",
      compensation: 0,
      cases: { needed: 20, enrolled: 20 },
      windowClosesAt: now - 12 * day,
      summary: "Recruitment closed. Results paper in prep — sign the CoI form to be listed as a contributing site.",
      eligibility: ["Ran a full 12-week cohort", "Submitted attendance sheets"],
      timeCommitmentHrs: 1,
      participation: "submitted",
    },
  ];
}

function read(): Study[] {
  if (cache) return cache;
  if (typeof window === "undefined") { cache = seed(); return cache; }
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) { cache = JSON.parse(raw) as Study[]; return cache; }
  } catch {}
  cache = seed();
  write(cache);
  return cache;
}
function write(next: Study[]) {
  cache = next;
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  bus.dispatchEvent(new Event("change"));
}
function subscribe(cb: () => void) {
  const on = () => cb();
  bus.addEventListener("change", on);
  return () => bus.removeEventListener("change", on);
}

export function useStudies(): Study[] {
  return useSyncExternalStore(subscribe, read, read);
}
export function getStudy(id: string): Study | undefined { return read().find((s) => s.id === id); }
export function joinStudy(id: string) {
  write(read().map((s) => (s.id === id ? { ...s, participation: "screening" } : s)));
}
export function withdrawStudy(id: string) {
  write(read().map((s) => (s.id === id ? { ...s, participation: "not_joined", submittedCases: undefined } : s)));
}
export function advanceEnrollment(id: string) {
  write(read().map((s) => (s.id === id ? { ...s, participation: "enrolled", cases: { ...s.cases, enrolled: Math.min(s.cases.needed, s.cases.enrolled + 1) } } : s)));
}
export function addCase(id: string, label: string) {
  const at = Date.now();
  write(read().map((s) =>
    s.id === id
      ? { ...s, participation: "collecting", submittedCases: [...(s.submittedCases ?? []), { id: `c_${at.toString(36)}`, label, at, status: "draft" }] }
      : s));
}
export function submitCase(studyId: string, caseId: string) {
  write(read().map((s) =>
    s.id === studyId
      ? { ...s, submittedCases: (s.submittedCases ?? []).map((c) => (c.id === caseId ? { ...c, status: "submitted" } : c)) }
      : s));
}
