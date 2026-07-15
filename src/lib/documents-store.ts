// PeaceCode · Practice — Documents store.
// Templates, dispatched instances, worksheets, and signature certificates.
// Local persistence + tiny event bus for live re-renders. Seeded on first read.

import { useSyncExternalStore } from "react";

// ─── Types ─────────────────────────────────────────────────
export type DocCategory =
  | "intake" | "consent" | "compliance" | "treatment" | "release" | "discharge" | "worksheet" | "financial";

export type SignerRole = "patient" | "therapist" | "guardian" | "witness";

export type BlockType =
  | "heading" | "text" | "info"
  | "short" | "long" | "choice" | "checkboxes" | "dropdown" | "scale"
  | "date" | "time" | "signature" | "initials" | "upload";

export type Block = {
  id: string;
  type: BlockType;
  label?: string;
  help?: string;
  required?: boolean;
  options?: string[];
  min?: number;
  max?: number;
  signerRole?: SignerRole;
  value?: string;                 // author-provided content for heading/text/info
  answer?: string | string[] | number; // patient-side answer
  signatureImage?: string;        // dataURL
  signatureTypedAs?: string;
  signedAt?: number;
};

export type Template = {
  id: string;
  name: string;
  category: DocCategory;
  audience: "patient" | "guardian" | "both";
  description: string;
  blocks: Block[];
  expirationDays: number;
  retentionDays: number;
  requiredSigners: SignerRole[];
  autoAttachToSession: boolean;
  createdAt: number;
  updatedAt: number;
};

export type InstanceStatus = "draft" | "sent" | "viewed" | "signed" | "expired" | "voided" | "archived";
export type DeliveryChannel = "portal" | "email" | "sms";

export type AuditEvent = {
  id: string;
  at: number;
  actor: string;
  action:
    | "created" | "sent" | "delivered" | "viewed"
    | "signed" | "countersigned" | "downloaded"
    | "voided" | "amended" | "expired" | "archived";
  detail?: string;
  meta?: { ip?: string; userAgent?: string };
};

export type DocumentInstance = {
  id: string;
  token: string;                     // for /portal/documents/$token
  templateId: string;
  templateName: string;
  category: DocCategory;
  patientId: string;
  patientName: string;
  sessionId?: string;
  status: InstanceStatus;
  channel: DeliveryChannel;
  coveringNote?: string;
  blocks: Block[];                   // frozen copy at send time
  createdAt: number;
  sentAt?: number;
  viewedAt?: number;
  signedAt?: number;
  countersignedAt?: number;
  voidedAt?: number;
  voidReason?: string;
  expiresAt: number;
  version: number;
  supersedesId?: string;
  supersededById?: string;
  audit: AuditEvent[];
  certificate?: SignatureCertificate;
};

export type SignatureCertificate = {
  id: string;
  documentId: string;
  documentHash: string;
  signerName: string;
  signerEmail: string;
  ip: string;
  userAgent: string;
  signedAt: number;
  jurisdiction: "IN-IT-2000" | "US-ESIGN";
  consentText: string;
};

export type Worksheet = {
  id: string;
  slug: string;
  name: string;
  intent: string;              // what it's for, one line
  duration: string;            // "10 min"
  category: "CBT" | "DBT" | "Mindfulness" | "Behavioral" | "ACT" | "Log";
  blocks: Block[];
};

export type WorksheetAssignment = {
  id: string;
  worksheetSlug: string;
  patientId: string;
  patientName: string;
  assignedAt: number;
  dueAt?: number;
  completedAt?: number;
  answers?: Record<string, Block["answer"]>;
};

// ─── Store ─────────────────────────────────────────────────
type Store = {
  templates: Template[];
  instances: DocumentInstance[];
  assignments: WorksheetAssignment[];
};

const KEY = "pc.documents.v1";
const now = () => Date.now();
const DAY = 86_400_000;
const uid = (prefix = "id") => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

function b(type: BlockType, patch: Partial<Block> = {}): Block {
  return { id: uid("b"), type, ...patch };
}

// ─── Template seeds — real clinical language ────────────────
function seedTemplates(): Template[] {
  const t = now();
  const std = { createdAt: t, updatedAt: t };
  return [
    {
      id: "tpl_intake_adult",
      name: "Adult Intake Questionnaire",
      category: "intake",
      audience: "patient",
      description: "First-session background: presenting concerns, history, safety.",
      expirationDays: 14, retentionDays: 2555, requiredSigners: ["patient"], autoAttachToSession: true, ...std,
      blocks: [
        b("heading", { value: "About you" }),
        b("short",   { label: "Full legal name",           required: true }),
        b("short",   { label: "Preferred name" }),
        b("date",    { label: "Date of birth",             required: true }),
        b("short",   { label: "Preferred pronouns" }),
        b("short",   { label: "Occupation or field of study" }),

        b("heading", { value: "Why you are here" }),
        b("long",    { label: "In your own words, what brings you to therapy at this time?", required: true }),
        b("scale",   { label: "How much is this affecting your daily life?", min: 0, max: 10 }),
        b("choice",  { label: "How long have you been feeling this way?", options: ["Less than a month", "1–3 months", "3–12 months", "Over a year"] }),

        b("heading", { value: "History" }),
        b("choice",  { label: "Have you been in therapy before?", options: ["Yes, currently", "Yes, in the past", "No"] }),
        b("long",    { label: "If yes, what helped and what did not?" }),
        b("checkboxes", { label: "Any current medication (select all that apply)", options: ["Antidepressant", "Anti-anxiety", "Sleep aid", "Mood stabilizer", "None", "Prefer not to say"] }),

        b("heading", { value: "Safety" }),
        b("choice",  { label: "In the past two weeks, have you had thoughts of self-harm?", options: ["Not at all", "A few times", "More than half the time", "Nearly every day"] }),
        b("info",    { value: "If you are in immediate distress, please call iCall at +91 91529 87821 or Vandrevala at 1860 2662 345." }),

        b("signature", { label: "Signature", required: true, signerRole: "patient" }),
      ],
    },
    {
      id: "tpl_consent_therapy",
      name: "Informed Consent for Psychotherapy",
      category: "consent",
      audience: "patient",
      description: "Nature of therapy, confidentiality limits, risks, and benefits.",
      expirationDays: 21, retentionDays: 2555, requiredSigners: ["patient", "therapist"], autoAttachToSession: true, ...std,
      blocks: [
        b("heading", { value: "What therapy is" }),
        b("text",    { value: "Psychotherapy is a collaborative process. You bring what is troubling you; together we build understanding and, where useful, practical skills. Progress is rarely linear. Sessions typically last 50 minutes." }),
        b("initials", { label: "Please initial to acknowledge you have read the above.", required: true, signerRole: "patient" }),

        b("heading", { value: "Confidentiality" }),
        b("text",    { value: "Everything you share is confidential. There are four exceptions: (a) imminent risk to yourself, (b) imminent risk to another identifiable person, (c) reported abuse of a child or vulnerable adult, or (d) a valid court order. In those situations I will act to keep you and others safe, and where possible I will tell you first." }),
        b("initials", { label: "I understand the limits of confidentiality.", required: true, signerRole: "patient" }),

        b("heading", { value: "Risks and benefits" }),
        b("text",    { value: "Therapy can bring up difficult feelings before it eases them. Benefits often include a fuller understanding of yourself, better relationships, and clearer choices. Neither is guaranteed." }),

        b("heading", { value: "Fees and cancellation" }),
        b("text",    { value: "Sessions are ₹2,400 unless a sliding scale has been agreed. Cancellations with less than 24 hours notice are charged in full, except in emergencies." }),
        b("initials", { label: "I have read and agree to the fee and cancellation policy.", required: true, signerRole: "patient" }),

        b("signature", { label: "Patient signature", required: true, signerRole: "patient" }),
        b("signature", { label: "Therapist signature", required: true, signerRole: "therapist" }),
      ],
    },
    {
      id: "tpl_consent_tele",
      name: "Telehealth Consent",
      category: "consent",
      audience: "patient",
      description: "Consent to therapy delivered by video or audio.",
      expirationDays: 21, retentionDays: 2555, requiredSigners: ["patient"], autoAttachToSession: false, ...std,
      blocks: [
        b("heading", { value: "About telehealth" }),
        b("text",    { value: "Telehealth means we meet by secure video or audio rather than in person. Most people find it comparable to in-person work. Some conversations are better in the room; if that becomes true, we will discuss it." }),
        b("heading", { value: "What could go wrong" }),
        b("text",    { value: "Technology can fail. Video may drop, audio may distort, or the connection may be lost. If we are disconnected, I will call you on the phone number you provide below. In an emergency you should call the crisis lines listed on your intake form." }),
        b("short",   { label: "Phone number to reach you if the call drops", required: true }),
        b("heading", { value: "Where you will attend from" }),
        b("text",    { value: "Please attend sessions from a private space. Using shared or public networks is discouraged for privacy reasons." }),
        b("initials", { label: "I understand the risks and my responsibilities.", required: true, signerRole: "patient" }),
        b("signature", { label: "Patient signature", required: true, signerRole: "patient" }),
      ],
    },
    {
      id: "tpl_dpdp",
      name: "DPDP Act Acknowledgment (India)",
      category: "compliance",
      audience: "patient",
      description: "Digital Personal Data Protection Act, 2023 disclosure and consent.",
      expirationDays: 30, retentionDays: 2555, requiredSigners: ["patient"], autoAttachToSession: false, ...std,
      blocks: [
        b("heading", { value: "Your data, in plain language" }),
        b("text",    { value: "Under the Digital Personal Data Protection Act, 2023 you have rights over the personal information I hold about you. This document explains what I collect, why, and how you can review or withdraw consent." }),
        b("heading", { value: "What I collect" }),
        b("text",    { value: "Contact details, clinical notes, assessment scores, session recordings (only with your explicit consent, session-by-session), and payment records." }),
        b("heading", { value: "Why I collect it" }),
        b("text",    { value: "To provide safe, continuous care. Some anonymized information may be used for quality review under supervision." }),
        b("heading", { value: "Your rights" }),
        b("text",    { value: "You may access, correct, or ask for deletion of your personal data at any time by writing to the address in your welcome pack. Some records must be retained for the minimum period required by clinical guidelines." }),
        b("initials", { label: "I have read and understood this notice.", required: true, signerRole: "patient" }),
        b("signature", { label: "Patient signature", required: true, signerRole: "patient" }),
      ],
    },
    {
      id: "tpl_hipaa",
      name: "HIPAA Notice of Privacy Practices",
      category: "compliance",
      audience: "patient",
      description: "For patients in the United States or covered under US arrangements.",
      expirationDays: 30, retentionDays: 2555, requiredSigners: ["patient"], autoAttachToSession: false, ...std,
      blocks: [
        b("heading", { value: "How we may use your health information" }),
        b("text",    { value: "For treatment, payment, and healthcare operations, in line with 45 CFR §164.520. Any other use requires your written authorization." }),
        b("heading", { value: "Your rights" }),
        b("text",    { value: "You have the right to inspect and copy your record, request amendments, and receive an accounting of disclosures. To exercise these rights, contact the practice in writing." }),
        b("initials", { label: "I acknowledge receipt of the Notice of Privacy Practices.", required: true, signerRole: "patient" }),
        b("signature", { label: "Patient signature", required: true, signerRole: "patient" }),
      ],
    },
    {
      id: "tpl_treatment_plan",
      name: "Treatment Plan Agreement",
      category: "treatment",
      audience: "patient",
      description: "Shared understanding of goals, approach, and review cadence.",
      expirationDays: 30, retentionDays: 2555, requiredSigners: ["patient", "therapist"], autoAttachToSession: true, ...std,
      blocks: [
        b("heading", { value: "What we are working on" }),
        b("long",    { label: "Primary goals for this phase of therapy", required: true }),
        b("long",    { label: "How we will know we are making progress" }),
        b("heading", { value: "How we will work" }),
        b("choice",  { label: "Primary approach", options: ["CBT", "DBT", "ACT", "Psychodynamic", "Integrative"] }),
        b("choice",  { label: "Session frequency", options: ["Weekly", "Fortnightly", "As needed"] }),
        b("date",    { label: "Next review date" }),
        b("signature", { label: "Patient signature", required: true, signerRole: "patient" }),
        b("signature", { label: "Therapist signature", required: true, signerRole: "therapist" }),
      ],
    },
    {
      id: "tpl_roi",
      name: "Release of Information (ROI)",
      category: "release",
      audience: "patient",
      description: "Authorise sharing of specific information with a named party.",
      expirationDays: 30, retentionDays: 2555, requiredSigners: ["patient"], autoAttachToSession: false, ...std,
      blocks: [
        b("heading", { value: "Who I authorise" }),
        b("short",   { label: "Name of person or organisation", required: true }),
        b("short",   { label: "Relationship (e.g. GP, psychiatrist, parent)" }),
        b("heading", { value: "What may be shared" }),
        b("checkboxes", { label: "Select all that apply", options: ["Diagnostic summary", "Treatment plan", "Attendance dates", "Correspondence letters", "Full clinical record"] }),
        b("heading", { value: "For how long" }),
        b("date",    { label: "This authorisation expires on", required: true }),
        b("text",    { value: "You may revoke this release in writing at any time, except where information has already been shared in good faith." }),
        b("signature", { label: "Patient signature", required: true, signerRole: "patient" }),
      ],
    },
    {
      id: "tpl_coord",
      name: "Coordination of Care Form",
      category: "release",
      audience: "patient",
      description: "For ongoing collaboration with a psychiatrist or GP.",
      expirationDays: 90, retentionDays: 2555, requiredSigners: ["patient"], autoAttachToSession: false, ...std,
      blocks: [
        b("short",   { label: "Provider name", required: true }),
        b("short",   { label: "Provider clinic" }),
        b("short",   { label: "Provider email" }),
        b("checkboxes", { label: "Purpose of coordination", options: ["Medication management", "Diagnostic clarification", "Discharge planning", "Crisis coordination"] }),
        b("signature", { label: "Patient signature", required: true, signerRole: "patient" }),
      ],
    },
    {
      id: "tpl_discharge",
      name: "Discharge Summary",
      category: "discharge",
      audience: "patient",
      description: "A closing letter marking the end of active therapy.",
      expirationDays: 60, retentionDays: 3650, requiredSigners: ["therapist"], autoAttachToSession: false, ...std,
      blocks: [
        b("heading", { value: "Summary of care" }),
        b("long",    { label: "Reason for referral and presenting picture at intake", required: true }),
        b("long",    { label: "Course of therapy — key themes and interventions", required: true }),
        b("long",    { label: "Progress and remaining work" }),
        b("heading", { value: "Recommendations" }),
        b("long",    { label: "Recommended next steps" }),
        b("info",    { value: "You are welcome to return at any time. The door remains open." }),
        b("signature", { label: "Therapist signature", required: true, signerRole: "therapist" }),
      ],
    },
    {
      id: "tpl_superbill",
      name: "Superbill",
      category: "financial",
      audience: "patient",
      description: "For insurance reimbursement — includes CPT and diagnosis codes.",
      expirationDays: 60, retentionDays: 2555, requiredSigners: ["therapist"], autoAttachToSession: false, ...std,
      blocks: [
        b("short",   { label: "Patient name", required: true }),
        b("short",   { label: "Insurance member ID" }),
        b("date",    { label: "Date of service", required: true }),
        b("choice",  { label: "CPT code", options: ["90791 · Diagnostic evaluation", "90834 · Psychotherapy 45 min", "90837 · Psychotherapy 60 min"] }),
        b("choice",  { label: "Diagnosis (ICD-10)", options: ["F32.1 Moderate depressive episode", "F41.1 Generalized anxiety disorder", "F43.10 PTSD, unspecified"] }),
        b("short",   { label: "Fee amount (₹)" }),
        b("signature", { label: "Provider signature", required: true, signerRole: "therapist" }),
      ],
    },
    {
      id: "tpl_sliding",
      name: "Sliding Scale Application",
      category: "financial",
      audience: "patient",
      description: "Simple, dignified request for reduced-fee therapy.",
      expirationDays: 14, retentionDays: 1095, requiredSigners: ["patient"], autoAttachToSession: false, ...std,
      blocks: [
        b("text",    { value: "Therapy should not be out of reach. This form helps me set a fee that works for your situation. It is short and asked in good faith." }),
        b("choice",  { label: "Current employment", options: ["Student", "Part-time work", "Full-time work", "Between roles", "Prefer not to say"] }),
        b("scale",   { label: "How much does the current fee strain your budget?", min: 0, max: 10 }),
        b("short",   { label: "Fee you feel you could sustain (₹ per session)" }),
        b("long",    { label: "Anything else I should know?" }),
        b("signature", { label: "Patient signature", required: true, signerRole: "patient" }),
      ],
    },
  ];
}

// ─── Worksheet seeds ────────────────────────────────────────
function seedWorksheets(): Worksheet[] {
  const w = (name: string, slug: string, intent: string, duration: string, category: Worksheet["category"], blocks: Block[]): Worksheet =>
    ({ id: uid("ws"), slug, name, intent, duration, category, blocks });
  return [
    w("CBT Thought Record", "cbt-thought", "Notice a difficult moment and re-examine it.", "10 min", "CBT", [
      b("date",  { label: "When did this happen?" }),
      b("long",  { label: "Situation — where were you, who was there, what happened?" }),
      b("long",  { label: "Automatic thought — what went through your mind?" }),
      b("scale", { label: "How much did you believe it (0–10)?" , min: 0, max: 10 }),
      b("long",  { label: "Evidence for the thought" }),
      b("long",  { label: "Evidence against the thought" }),
      b("long",  { label: "A more balanced way to see it" }),
      b("scale", { label: "How much do you believe the new thought now?", min: 0, max: 10 }),
    ]),
    w("Sleep Log", "sleep-log", "Track sleep so patterns become visible.", "3 min · daily", "Log", [
      b("date",  { label: "Date" }),
      b("time",  { label: "Time to bed" }),
      b("time",  { label: "Time to actual sleep" }),
      b("time",  { label: "Wake time" }),
      b("scale", { label: "Quality (0–10)", min: 0, max: 10 }),
      b("short", { label: "Caffeine after 2pm?" }),
      b("long",  { label: "Notes" }),
    ]),
    w("Mood Diary", "mood-diary", "A short daily check-in on mood and energy.", "2 min · daily", "Log", [
      b("date",  { label: "Date" }),
      b("scale", { label: "Mood (0–10)", min: 0, max: 10 }),
      b("scale", { label: "Energy (0–10)", min: 0, max: 10 }),
      b("scale", { label: "Anxiety (0–10)", min: 0, max: 10 }),
      b("long",  { label: "One line about the day" }),
    ]),
    w("Exposure Hierarchy", "exposure", "Rank feared situations from easier to harder.", "20 min · once", "CBT", [
      b("text", { value: "List situations that provoke fear. Rate each 0–100 for how distressing it feels. Start with the easiest that still matters." }),
      b("long", { label: "Situations, one per line" }),
      b("long", { label: "Which one will you approach first?" }),
    ]),
    w("Gratitude Journal", "gratitude", "Three things, ordinary or otherwise.", "3 min · daily", "Mindfulness", [
      b("date", { label: "Date" }),
      b("short", { label: "One" }),
      b("short", { label: "Two" }),
      b("short", { label: "Three" }),
      b("long",  { label: "One of these, in a little more detail" }),
    ]),
    w("Values Inventory", "values", "A quiet look at what actually matters to you.", "25 min · once", "ACT", [
      b("text",  { value: "Rate each domain twice — how important is it to you, and how well are you living it right now." }),
      b("scale", { label: "Family — importance (0–10)", min: 0, max: 10 }),
      b("scale", { label: "Family — how well are you living it (0–10)", min: 0, max: 10 }),
      b("scale", { label: "Work / study — importance", min: 0, max: 10 }),
      b("scale", { label: "Work / study — living it", min: 0, max: 10 }),
      b("scale", { label: "Friendship — importance", min: 0, max: 10 }),
      b("scale", { label: "Friendship — living it", min: 0, max: 10 }),
      b("scale", { label: "Health — importance", min: 0, max: 10 }),
      b("scale", { label: "Health — living it", min: 0, max: 10 }),
      b("long",  { label: "Where is the largest gap? What would a small step toward it look like this week?" }),
    ]),
    w("DBT Diary Card", "dbt-diary", "A daily snapshot of urges, emotions, and skills used.", "5 min · daily", "DBT", [
      b("date",  { label: "Date" }),
      b("scale", { label: "Urge to self-harm (0–5)", min: 0, max: 5 }),
      b("scale", { label: "Sadness (0–5)", min: 0, max: 5 }),
      b("scale", { label: "Anger (0–5)", min: 0, max: 5 }),
      b("scale", { label: "Shame (0–5)", min: 0, max: 5 }),
      b("checkboxes", { label: "Skills used today", options: ["TIPP", "Opposite action", "Radical acceptance", "PLEASE", "Mindfulness"] }),
      b("long",  { label: "Something worth remembering from today" }),
    ]),
  ];
}

// ─── Instance seeds ────────────────────────────────────────
function seedInstances(templates: Template[]): DocumentInstance[] {
  const t = now();
  const mk = (patch: Partial<DocumentInstance> & Pick<DocumentInstance, "templateId" | "patientId" | "patientName" | "status" | "createdAt">) => {
    const tpl = templates.find((tp) => tp.id === patch.templateId)!;
    const inst: DocumentInstance = {
      id: uid("inst"),
      token: Math.random().toString(36).slice(2, 12),
      templateName: tpl.name,
      category: tpl.category,
      blocks: JSON.parse(JSON.stringify(tpl.blocks)),
      channel: "portal",
      expiresAt: patch.createdAt + tpl.expirationDays * DAY,
      version: 1,
      audit: [{ id: uid("ev"), at: patch.createdAt, actor: "Dr. Sharma", action: "created" }],
      ...patch,
    } as DocumentInstance;
    return inst;
  };
  const items: DocumentInstance[] = [
    mk({ templateId: "tpl_intake_adult", patientId: "pat_priya", patientName: "Priya Iyer",
         status: "signed", createdAt: t - 118 * DAY }),
    mk({ templateId: "tpl_consent_therapy", patientId: "pat_priya", patientName: "Priya Iyer",
         status: "signed", createdAt: t - 118 * DAY }),
    mk({ templateId: "tpl_dpdp", patientId: "pat_aarav", patientName: "Aarav Mehta",
         status: "signed", createdAt: t - 90 * DAY }),
    mk({ templateId: "tpl_treatment_plan", patientId: "pat_aarav", patientName: "Aarav Mehta",
         status: "viewed", createdAt: t - 3 * DAY }),
    mk({ templateId: "tpl_consent_tele", patientId: "pat_kabir", patientName: "Kabir Shah",
         status: "sent", createdAt: t - 2 * DAY }),
    mk({ templateId: "tpl_intake_adult", patientId: "pat_rohan", patientName: "Rohan Bhatia",
         status: "signed", createdAt: t - 29 * DAY }),
    mk({ templateId: "tpl_roi", patientId: "pat_rohan", patientName: "Rohan Bhatia",
         status: "sent", createdAt: t - 1 * DAY }),
    mk({ templateId: "tpl_sliding", patientId: "pat_sanjay", patientName: "Sanjay Verma",
         status: "draft", createdAt: t - 1 * DAY }),
    mk({ templateId: "tpl_superbill", patientId: "pat_priya", patientName: "Priya Iyer",
         status: "signed", createdAt: t - 32 * DAY }),
    mk({ templateId: "tpl_consent_therapy", patientId: "pat_kabir", patientName: "Kabir Shah",
         status: "expired", createdAt: t - 40 * DAY }),
  ];
  // Fill richer state
  for (const i of items) {
    if (i.status === "sent" || i.status === "viewed" || i.status === "signed" || i.status === "expired") {
      i.sentAt = i.createdAt + 60_000;
      i.audit.push({ id: uid("ev"), at: i.sentAt, actor: "Dr. Sharma", action: "sent", detail: `via ${i.channel}` });
    }
    if (i.status === "viewed" || i.status === "signed") {
      i.viewedAt = i.createdAt + 2 * 3600_000;
      i.audit.push({ id: uid("ev"), at: i.viewedAt, actor: i.patientName, action: "viewed", meta: { ip: "203.0.113.42", userAgent: "Mobile Safari" } });
    }
    if (i.status === "signed") {
      i.signedAt = i.createdAt + 6 * 3600_000;
      i.audit.push({ id: uid("ev"), at: i.signedAt, actor: i.patientName, action: "signed", meta: { ip: "203.0.113.42", userAgent: "Mobile Safari" } });
      // Countersign if template requires therapist
      const tpl = templates.find((tp) => tp.id === i.templateId)!;
      if (tpl.requiredSigners.includes("therapist")) {
        i.countersignedAt = i.signedAt + 3600_000;
        i.audit.push({ id: uid("ev"), at: i.countersignedAt, actor: "Dr. Sharma", action: "countersigned" });
      }
      i.certificate = {
        id: uid("cert"),
        documentId: i.id,
        documentHash: hashLike(i.id + i.signedAt),
        signerName: i.patientName,
        signerEmail: `${i.patientName.split(" ")[0].toLowerCase()}@example.in`,
        ip: "203.0.113.42",
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) Mobile/15E148 Safari",
        signedAt: i.signedAt,
        jurisdiction: "IN-IT-2000",
        consentText: "I intend for my electronic signature to have the same legal effect as a wet-ink signature.",
      };
    }
    if (i.status === "expired") {
      i.audit.push({ id: uid("ev"), at: i.expiresAt, actor: "System", action: "expired" });
    }
  }
  return items;
}

function seedAssignments(): WorksheetAssignment[] {
  const t = now();
  return [
    { id: uid("ass"), worksheetSlug: "cbt-thought", patientId: "pat_aarav", patientName: "Aarav Mehta",
      assignedAt: t - 3 * DAY, dueAt: t + 2 * DAY },
    { id: uid("ass"), worksheetSlug: "sleep-log", patientId: "pat_sanjay", patientName: "Sanjay Verma",
      assignedAt: t - 6 * DAY, completedAt: t - 1 * DAY },
    { id: uid("ass"), worksheetSlug: "mood-diary", patientId: "pat_priya", patientName: "Priya Iyer",
      assignedAt: t - 10 * DAY, completedAt: t - 1 * DAY },
  ];
}

// simple SHA-256-ish preview for the certificate UI (real crypto is backend)
function hashLike(input: string): string {
  let h1 = 0x811c9dc5, h2 = 0xdeadbeef;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 2654435761);
    h2 = Math.imul(h2 ^ c, 1597334677);
  }
  const s = (h1 >>> 0).toString(16).padStart(8, "0") + (h2 >>> 0).toString(16).padStart(8, "0");
  return (s + s + s + s).slice(0, 64);
}

function seed(): Store {
  const templates = seedTemplates();
  return { templates, instances: seedInstances(templates), assignments: seedAssignments() };
}

function load(): Store {
  if (typeof window === "undefined") return { templates: [], instances: [], assignments: [] };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) { const s = seed(); localStorage.setItem(KEY, JSON.stringify(s)); return s; }
    return JSON.parse(raw) as Store;
  } catch { return seed(); }
}

let state: Store = typeof window === "undefined"
  ? { templates: [], instances: [], assignments: [] }
  : load();
const listeners = new Set<() => void>();
function save() { if (typeof window !== "undefined") { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} } }
function emit() { save(); listeners.forEach((l) => l()); }
function subscribe(l: () => void) { listeners.add(l); return () => { listeners.delete(l); }; }
function getSnapshot() { return state; }

export function useDocsStore() { return useSyncExternalStore(subscribe, getSnapshot, getSnapshot); }

// ─── Selectors ────────────────────────────────────────────
export function useTemplates() { return useDocsStore().templates; }
export function useInstances() { return useDocsStore().instances; }
export function useWorksheets(): Worksheet[] { return seedWorksheets(); }
export function useAssignments() { return useDocsStore().assignments; }

export function useTemplate(id?: string) {
  const t = useTemplates();
  return t.find((x) => x.id === id) ?? null;
}
export function useInstance(id?: string) {
  const t = useInstances();
  return t.find((x) => x.id === id) ?? null;
}
export function useInstanceByToken(token?: string) {
  const t = useInstances();
  return t.find((x) => x.token === token) ?? null;
}
export function useInstancesForPatient(pid: string) {
  return useInstances().filter((i) => i.patientId === pid);
}

// ─── Mutations ────────────────────────────────────────────
export function upsertTemplate(next: Template) {
  const exists = state.templates.some((t) => t.id === next.id);
  state = {
    ...state,
    templates: exists
      ? state.templates.map((t) => t.id === next.id ? { ...next, updatedAt: now() } : t)
      : [{ ...next, createdAt: now(), updatedAt: now() }, ...state.templates],
  };
  emit();
}

export function duplicateTemplate(id: string): Template | null {
  const src = state.templates.find((t) => t.id === id);
  if (!src) return null;
  const copy: Template = {
    ...src,
    id: uid("tpl"),
    name: `${src.name} — copy`,
    createdAt: now(),
    updatedAt: now(),
    blocks: src.blocks.map((b) => ({ ...b, id: uid("b") })),
  };
  state = { ...state, templates: [copy, ...state.templates] };
  emit();
  return copy;
}

export function deleteTemplate(id: string) {
  state = { ...state, templates: state.templates.filter((t) => t.id !== id) };
  emit();
}

export function createInstance(args: {
  templateId: string;
  patientId: string;
  patientName: string;
  channel: DeliveryChannel;
  coveringNote?: string;
  scheduleAt?: number;
}): DocumentInstance {
  const tpl = state.templates.find((t) => t.id === args.templateId)!;
  const created = args.scheduleAt ?? now();
  const inst: DocumentInstance = {
    id: uid("inst"),
    token: Math.random().toString(36).slice(2, 12),
    templateId: tpl.id,
    templateName: tpl.name,
    category: tpl.category,
    patientId: args.patientId,
    patientName: args.patientName,
    status: "draft",
    channel: args.channel,
    coveringNote: args.coveringNote,
    blocks: JSON.parse(JSON.stringify(tpl.blocks)),
    createdAt: created,
    expiresAt: created + tpl.expirationDays * DAY,
    version: 1,
    audit: [{ id: uid("ev"), at: created, actor: "Dr. Sharma", action: "created" }],
  };
  state = { ...state, instances: [inst, ...state.instances] };
  emit();
  return inst;
}

export function sendInstance(id: string) {
  state = { ...state, instances: state.instances.map((i) =>
    i.id === id ? { ...i, status: "sent", sentAt: now(),
      audit: [...i.audit, { id: uid("ev"), at: now(), actor: "Dr. Sharma", action: "sent", detail: `via ${i.channel}` }] } : i) };
  emit();
}

export function markViewed(id: string, meta?: AuditEvent["meta"]) {
  state = { ...state, instances: state.instances.map((i) => {
    if (i.id !== id) return i;
    if (i.viewedAt) return i;
    return { ...i, status: i.status === "sent" ? "viewed" : i.status, viewedAt: now(),
      audit: [...i.audit, { id: uid("ev"), at: now(), actor: i.patientName, action: "viewed", meta }] };
  }) };
  emit();
}

export function signInstance(id: string, blocks: Block[], meta?: AuditEvent["meta"]) {
  const inst = state.instances.find((i) => i.id === id);
  if (!inst) return;
  const at = now();
  const cert: SignatureCertificate = {
    id: uid("cert"),
    documentId: id,
    documentHash: hashLike(id + at + JSON.stringify(blocks).length),
    signerName: inst.patientName,
    signerEmail: `${inst.patientName.split(" ")[0].toLowerCase()}@example.in`,
    ip: meta?.ip ?? "0.0.0.0",
    userAgent: meta?.userAgent ?? "unknown",
    signedAt: at,
    jurisdiction: "IN-IT-2000",
    consentText: "I intend for my electronic signature to have the same legal effect as a wet-ink signature.",
  };
  state = { ...state, instances: state.instances.map((i) => i.id === id ? {
    ...i, status: "signed", signedAt: at, blocks, certificate: cert,
    audit: [...i.audit, { id: uid("ev"), at, actor: i.patientName, action: "signed", meta }],
  } : i) };
  emit();
}

export function countersignInstance(id: string) {
  state = { ...state, instances: state.instances.map((i) =>
    i.id === id ? { ...i, countersignedAt: now(),
      audit: [...i.audit, { id: uid("ev"), at: now(), actor: "Dr. Sharma", action: "countersigned" }] } : i) };
  emit();
}

export function voidInstance(id: string, reason: string) {
  state = { ...state, instances: state.instances.map((i) =>
    i.id === id ? { ...i, status: "voided", voidedAt: now(), voidReason: reason,
      audit: [...i.audit, { id: uid("ev"), at: now(), actor: "Dr. Sharma", action: "voided", detail: reason }] } : i) };
  emit();
}

export function amendInstance(id: string): DocumentInstance | null {
  const src = state.instances.find((i) => i.id === id);
  if (!src) return null;
  const copy: DocumentInstance = {
    ...src,
    id: uid("inst"),
    token: Math.random().toString(36).slice(2, 12),
    version: src.version + 1,
    supersedesId: src.id,
    status: "draft",
    createdAt: now(),
    sentAt: undefined, viewedAt: undefined, signedAt: undefined, countersignedAt: undefined,
    voidedAt: undefined, voidReason: undefined, certificate: undefined,
    audit: [{ id: uid("ev"), at: now(), actor: "Dr. Sharma", action: "amended", detail: `from v${src.version}` }],
  };
  state = { ...state, instances: [copy, ...state.instances.map((i) => i.id === src.id ? { ...i, supersededById: copy.id } : i)] };
  emit();
  return copy;
}

export function archiveInstance(id: string) {
  state = { ...state, instances: state.instances.map((i) =>
    i.id === id ? { ...i, status: "archived",
      audit: [...i.audit, { id: uid("ev"), at: now(), actor: "Dr. Sharma", action: "archived" }] } : i) };
  emit();
}

export function logDownload(id: string) {
  state = { ...state, instances: state.instances.map((i) =>
    i.id === id ? { ...i, audit: [...i.audit, { id: uid("ev"), at: now(), actor: "Dr. Sharma", action: "downloaded" }] } : i) };
  emit();
}

// Worksheet assignments
export function assignWorksheet(worksheetSlug: string, patientId: string, patientName: string, dueAt?: number) {
  const a: WorksheetAssignment = { id: uid("ass"), worksheetSlug, patientId, patientName, assignedAt: now(), dueAt };
  state = { ...state, assignments: [a, ...state.assignments] };
  emit();
}

// ─── Formatting helpers ────────────────────────────────────
export const STATUS_META: Record<InstanceStatus, { label: string; token: string; soft: string }> = {
  draft:    { label: "Draft",    token: "#7B6A70", soft: "#F0EAEC" },
  sent:     { label: "Sent",     token: "#8C6C3C", soft: "#F5E9D5" },
  viewed:   { label: "Viewed",   token: "#8C6C3C", soft: "#F5E9D5" },
  signed:   { label: "Signed",   token: "#3F7A56", soft: "#DDEEE2" },
  expired:  { label: "Expired",  token: "#7B6A70", soft: "#EEE7E9" },
  voided:   { label: "Voided",   token: "#B0567A", soft: "#F1D6E0" },
  archived: { label: "Archived", token: "#7B6A70", soft: "#EEE7E9" },
};

export const CATEGORY_META: Record<DocCategory, { label: string; blurb: string }> = {
  intake:     { label: "Intake",     blurb: "First-session background." },
  consent:    { label: "Consent",    blurb: "Informed agreement." },
  compliance: { label: "Compliance", blurb: "DPDP / HIPAA notices." },
  treatment:  { label: "Treatment",  blurb: "Plans and agreements." },
  release:    { label: "Release",    blurb: "Share information with others." },
  discharge:  { label: "Discharge",  blurb: "Closing letters." },
  worksheet:  { label: "Worksheet",  blurb: "Between-session work." },
  financial:  { label: "Financial",  blurb: "Superbills, sliding scale." },
};

export function relTime(ts: number, ref = now()): string {
  const d = ref - ts;
  if (d < 60_000) return "just now";
  if (d < 3600_000) return `${Math.floor(d / 60_000)}m ago`;
  if (d < 86_400_000) return `${Math.floor(d / 3600_000)}h ago`;
  const days = Math.floor(d / 86_400_000);
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
export function absTime(ts: number): string {
  return new Date(ts).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}
export function retentionRemaining(instCreatedAt: number, retentionDays: number): string {
  const remaining = instCreatedAt + retentionDays * DAY - now();
  if (remaining <= 0) return "expired";
  const days = Math.floor(remaining / DAY);
  if (days > 365) return `${Math.floor(days / 365)}y ${Math.floor((days % 365) / 30)}mo`;
  if (days > 30) return `${Math.floor(days / 30)}mo`;
  return `${days}d`;
}
