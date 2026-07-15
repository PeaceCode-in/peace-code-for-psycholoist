// Legal / immutable strings and product constants.
// Content that changes per-user does NOT belong here — it belongs in a store.

export const PRODUCT = {
  name: "PeaceCode",
  tagline: "A calmer practice.",
  guestClinicianName: "Guest Clinician",
  buildYear: 2026,
} as const;

export const LEGAL = {
  privacyUrl: "/legal/privacy",
  termsUrl: "/legal/terms",
  dpdpNoticeUrl: "/legal/dpdp",
  contactEmail: "hello@peacecode.in",
  statusUrl: "https://status.peacecode.in",
  dpoEmail: "dpo@peacecode.in",
  grievanceEmail: "grievance@peacecode.in",
} as const;

// Namespaced ID prefixes. Every store that creates records must use these.
export const ID_PREFIX = {
  patient: "pt_",
  session: "ss_",
  note: "note_",
  document: "doc_",
  invoice: "inv_",
  payment: "pay_",
  message: "msg_",
  thread: "th_",
  assessment: "asm_",
  result: "res_",
  claim: "clm_",
  audit: "aud_",
  consent: "con_",
  webhook: "whk_",
} as const;

export type IdPrefix = (typeof ID_PREFIX)[keyof typeof ID_PREFIX];

// Stable IDs. Never generate at render time — call this in the store.
export function makeId(prefix: IdPrefix): string {
  const rand = Math.random().toString(36).slice(2, 10);
  const time = Date.now().toString(36);
  return `${prefix}${time}${rand}`;
}

// Persistence key convention: peacecode.practice.<domain>.<version>
export function storageKey(domain: string, version = 1): string {
  return `peacecode.practice.${domain}.v${version}`;
}

// Retention windows — mirrored in the DataHandlingSheet copy.
export const RETENTION_YEARS = {
  patientRecords: 7,
  sessionNotes: 7,
  messages: 3,
  billing: 7,
  auditTrail: 10,
} as const;
