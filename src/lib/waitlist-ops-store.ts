// Waitlist operations: priority boosts, offered slots, source tracking.
import { useSyncExternalStore } from "react";

export type WaitlistSource = "self" | "referral" | "campus" | "hotline" | "internal";
export type OfferStatus = "pending" | "accepted" | "declined" | "expired";

export type WaitlistMeta = {
  patientId: string;
  priorityBoost: 0 | 1 | 2 | 3;         // manual boost added to auto score
  source: WaitlistSource;
  therapistId?: string;
  note?: string;
  offer?: { slotAt: number; template: "warm" | "brief" | "urgent"; sentAt: number; status: OfferStatus };
  addedAt: number;
};

const KEY = "pc.waitlist-ops.v1";
const listeners = new Set<() => void>();
function emit() { listeners.forEach((l) => l()); }
function read(): Record<string, WaitlistMeta> {
  if (typeof window === "undefined") return {};
  try { const raw = window.localStorage.getItem(KEY); return raw ? JSON.parse(raw) : {}; } catch { return {}; }
}
function write(next: Record<string, WaitlistMeta>) {
  try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* noop */ }
  emit();
}

export function getMeta(patientId: string): WaitlistMeta | undefined { return read()[patientId]; }
export function setMeta(patientId: string, patch: Partial<WaitlistMeta>): WaitlistMeta {
  const all = read();
  const existing = all[patientId] ?? { patientId, priorityBoost: 0 as const, source: "self" as const, addedAt: Date.now() };
  const next: WaitlistMeta = { ...existing, ...patch };
  all[patientId] = next;
  write(all);
  return next;
}
export function clearMeta(patientId: string): void {
  const all = read();
  delete all[patientId];
  write(all);
}

export function useAllMeta(): Record<string, WaitlistMeta> {
  return useSyncExternalStore(
    (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
    () => read(),
    () => ({}),
  );
}

export const SOURCE_LABEL: Record<WaitlistSource, string> = {
  self: "Self-referred",
  referral: "External referral",
  campus: "Campus counsellor",
  hotline: "Helpline handoff",
  internal: "Internal transfer",
};

export const OFFER_TEMPLATES: Record<"warm" | "brief" | "urgent", { label: string; body: (name: string, when: string) => string }> = {
  warm: {
    label: "Warm intro",
    body: (name, when) => `Hi ${name},\n\nI'd love to have you in for a first session on ${when}. It'll be about 50 minutes — a chance for us to meet, understand what's been going on, and figure out what would help.\n\nReply to confirm and I'll send the link.\n\nWarmly,\nDr. R. Menon`,
  },
  brief: {
    label: "Brief confirm",
    body: (name, when) => `Hi ${name},\n\nA slot has opened for ${when}. Reply YES to confirm.\n\n— Dr. R. Menon`,
  },
  urgent: {
    label: "Priority slot",
    body: (name, when) => `Hi ${name},\n\nBased on your intake I want to bring you in sooner. I'm holding ${when} for you — please confirm within 24h so I can adjust the schedule.\n\nIf things feel unsafe before then, please call iCall (+91 9152987821) — they answer 24/7.\n\nDr. R. Menon`,
  },
};
