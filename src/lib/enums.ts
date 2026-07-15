// One source of truth for every status enum across the practice.
// Import from here — never redeclare in a component or a store.

export const SessionStatus = {
  Scheduled: "scheduled",
  Confirmed: "confirmed",
  InProgress: "in_progress",
  Completed: "completed",
  NoShow: "no_show",
  Cancelled: "cancelled",
} as const;
export type SessionStatus = (typeof SessionStatus)[keyof typeof SessionStatus];

export const DocumentStatus = {
  Draft: "draft",
  Sent: "sent",
  Viewed: "viewed",
  Signed: "signed",
  Countersigned: "countersigned",
  Archived: "archived",
  Expired: "expired",
} as const;
export type DocumentStatus = (typeof DocumentStatus)[keyof typeof DocumentStatus];

export const InvoiceStatus = {
  Draft: "draft",
  Sent: "sent",
  Viewed: "viewed",
  PartiallyPaid: "partially_paid",
  Paid: "paid",
  Overdue: "overdue",
  Void: "void",
} as const;
export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus];

export const PatientStatus = {
  Active: "active",
  Waitlist: "waitlist",
  Paused: "paused",
  Discharged: "discharged",
} as const;
export type PatientStatus = (typeof PatientStatus)[keyof typeof PatientStatus];

export const RiskLevel = {
  Stable: "stable",
  Monitor: "monitor",
  Elevated: "elevated",
  Crisis: "crisis",
} as const;
export type RiskLevel = (typeof RiskLevel)[keyof typeof RiskLevel];

export const NoteStatus = {
  Draft: "draft",
  AiDraft: "ai_draft",
  Ratified: "ratified",
  Amended: "amended",
  Locked: "locked",
} as const;
export type NoteStatus = (typeof NoteStatus)[keyof typeof NoteStatus];

export const ConsentStatus = {
  Pending: "pending",
  Granted: "granted",
  Revoked: "revoked",
  Expired: "expired",
} as const;
export type ConsentStatus = (typeof ConsentStatus)[keyof typeof ConsentStatus];

export const IntegrationStatus = {
  NotConnected: "not_connected",
  Connected: "connected",
  Reconnect: "reconnect",
  Error: "error",
  Preview: "preview",
} as const;
export type IntegrationStatus = (typeof IntegrationStatus)[keyof typeof IntegrationStatus];

// Human labels for every status — one place, one voice.
export const STATUS_LABEL: Record<string, string> = {
  scheduled: "Scheduled", confirmed: "Confirmed", in_progress: "In session",
  completed: "Completed", no_show: "No show", cancelled: "Cancelled",
  draft: "Draft", sent: "Sent", viewed: "Viewed", signed: "Signed",
  countersigned: "Countersigned", archived: "Archived", expired: "Expired",
  partially_paid: "Part paid", paid: "Paid", overdue: "Overdue", void: "Void",
  active: "Active", waitlist: "Waitlist", paused: "Paused", discharged: "Discharged",
  stable: "Stable", monitor: "Monitor", elevated: "Elevated", crisis: "Crisis",
  ai_draft: "AI draft", ratified: "Ratified", amended: "Amended", locked: "Locked",
  pending: "Pending", granted: "Granted", revoked: "Revoked",
  not_connected: "Not connected", connected: "Connected", reconnect: "Reconnect", error: "Error",
  preview: "Preview",
};

export function labelOf(status: string): string {
  return STATUS_LABEL[status] ?? status;
}
