// PeaceCode · Practice — Calendar store.
// Availability windows, blackouts, booking link config, calendar settings.
// Reuses the sessions-store for actual bookings.

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  listSessions,
  createSession,
  type Session,
  type SessionService,
  type SessionModality,
} from "./sessions-store";

// ─── Types ───────────────────────────────────────────────────
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type WindowLocation = "in-person" | "telehealth" | "either";

export type AvailabilityWindow = {
  id: string;
  dayOfWeek: DayOfWeek;
  startMin: number;
  endMin: number;
  sessionTypes: SessionService[];
  location: WindowLocation;
  effectiveFrom: string;
  effectiveUntil?: string;
};

export type Blackout = {
  id: string;
  startAt: string;
  endAt: string;
  reason?: string;
};

export type BookingLinkConfig = {
  slug: string;
  isPublic: boolean;
  headline: string;
  intro: string;
  offeredServices: SessionService[];
  minNoticeHours: number;
  maxAdvanceDays: number;
  bufferBeforeMin: number;
  bufferAfterMin: number;
  requireIntakeForm: boolean;
  requirePaymentUpfront: boolean;
  timezone: string;
};

export type ColorScheme = "type" | "status" | "risk";

export type CalendarSettings = {
  timezone: string;
  weekStartsOn: 0 | 1;
  workingHours: { startMin: number; endMin: number };
  defaultBufferMin: number;
  colorScheme: ColorScheme;
  hideWeekends: boolean;
  googleSync: { connected: boolean; calendarId?: string; twoWay: boolean; syncing?: boolean };
  zoomAutoLink: boolean;
};

type StoreShape = {
  windows: AvailabilityWindow[];
  blackouts: Blackout[];
  booking: BookingLinkConfig;
  settings: CalendarSettings;
};

const KEY = "peacecode.therapist.calendar.v1";

// ─── Event bus ───────────────────────────────────────────────
const listeners = new Set<() => void>();
function emit() { listeners.forEach((fn) => fn()); }
function subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }
function isBrowser() { return typeof window !== "undefined" && typeof localStorage !== "undefined"; }

function load(): StoreShape {
  if (!isBrowser()) return seed();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) { const s = seed(); localStorage.setItem(KEY, JSON.stringify(s)); return s; }
    return JSON.parse(raw) as StoreShape;
  } catch { return seed(); }
}
function save(s: StoreShape) {
  if (!isBrowser()) return;
  try { localStorage.setItem(KEY, JSON.stringify(s)); emit(); } catch { /* quota */ }
}
let cache: StoreShape | null = null;
function state(): StoreShape { if (!cache) cache = load(); return cache; }
function mutate(fn: (s: StoreShape) => StoreShape) { cache = fn(state()); save(cache); }

function uid(p = "id") { return `${p}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`; }

// ─── Queries ─────────────────────────────────────────────────
export function listWindows(): AvailabilityWindow[] { return [...state().windows]; }
export function listBlackouts(): Blackout[] { return [...state().blackouts].sort((a, b) => a.startAt.localeCompare(b.startAt)); }
export function getBooking(): BookingLinkConfig { return state().booking; }
export function getSettings(): CalendarSettings { return state().settings; }

export function getWindowsFor(date: Date): AvailabilityWindow[] {
  const iso = date.toISOString().slice(0, 10);
  const dow = date.getDay() as DayOfWeek;
  return listWindows().filter((w) =>
    w.dayOfWeek === dow &&
    iso >= w.effectiveFrom.slice(0, 10) &&
    (!w.effectiveUntil || iso <= w.effectiveUntil.slice(0, 10))
  );
}

export function isBlackedOut(startISO: string, endISO: string): boolean {
  return listBlackouts().some((b) => !(endISO <= b.startAt || startISO >= b.endAt));
}

export function getFreeSlots(date: Date, durationMin: number, service?: SessionService): string[] {
  const cfg = getBooking();
  const bufferBefore = cfg.bufferBeforeMin;
  const bufferAfter = cfg.bufferAfterMin;
  const minNotice = cfg.minNoticeHours * 60 * 60_000;
  const now = Date.now();
  const windows = getWindowsFor(date).filter((w) => !service || w.sessionTypes.includes(service));
  if (!windows.length) return [];

  const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0);
  const busy = listSessions()
    .filter((s) => s.status !== "cancelled")
    .filter((s) => {
      const d = new Date(s.startsAt);
      return d.toDateString() === dayStart.toDateString();
    })
    .map((s) => {
      const start = new Date(s.startsAt).getTime() - bufferBefore * 60_000;
      const end = new Date(s.startsAt).getTime() + (s.durationMin + bufferAfter) * 60_000;
      return [start, end] as const;
    });

  const out: string[] = [];
  for (const w of windows) {
    for (let m = w.startMin; m + durationMin <= w.endMin; m += 15) {
      const t = new Date(dayStart);
      t.setMinutes(m);
      const ts = t.getTime();
      const te = ts + durationMin * 60_000;
      if (ts < now + minNotice) continue;
      if (isBlackedOut(t.toISOString(), new Date(te).toISOString())) continue;
      if (busy.some(([bs, be]) => !(te <= bs || ts >= be))) continue;
      out.push(t.toISOString());
    }
  }
  return out;
}

export function hasConflict(session: { id?: string; startsAt: string; durationMin: number }): boolean {
  const ts = new Date(session.startsAt).getTime();
  const te = ts + session.durationMin * 60_000;
  const clash = listSessions()
    .filter((s) => s.status !== "cancelled" && s.id !== session.id)
    .some((s) => {
      const os = new Date(s.startsAt).getTime();
      const oe = os + s.durationMin * 60_000;
      return !(te <= os || ts >= oe);
    });
  if (clash) return true;
  return isBlackedOut(session.startsAt, new Date(te).toISOString());
}

// ─── Mutations ───────────────────────────────────────────────
export function upsertWindow(w: Omit<AvailabilityWindow, "id"> & { id?: string }): AvailabilityWindow {
  const out: AvailabilityWindow = { ...w, id: w.id ?? uid("aw") } as AvailabilityWindow;
  mutate((s) => ({
    ...s,
    windows: s.windows.find((x) => x.id === out.id)
      ? s.windows.map((x) => (x.id === out.id ? out : x))
      : [...s.windows, out],
  }));
  return out;
}
export function deleteWindow(id: string) {
  mutate((s) => ({ ...s, windows: s.windows.filter((w) => w.id !== id) }));
}
export function replaceAllWindows(list: AvailabilityWindow[]) {
  mutate((s) => ({ ...s, windows: list }));
}
export function addBlackout(b: Omit<Blackout, "id">): Blackout {
  const out: Blackout = { ...b, id: uid("bo") };
  mutate((s) => ({ ...s, blackouts: [...s.blackouts, out] }));
  return out;
}
export function deleteBlackout(id: string) {
  mutate((s) => ({ ...s, blackouts: s.blackouts.filter((b) => b.id !== id) }));
}
export function updateBooking(patch: Partial<BookingLinkConfig>) {
  mutate((s) => ({ ...s, booking: { ...s.booking, ...patch } }));
}
export function updateSettings(patch: Partial<CalendarSettings>) {
  mutate((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
}
export async function connectGoogle(calendarId = "primary"): Promise<void> {
  updateSettings({ googleSync: { ...getSettings().googleSync, syncing: true } });
  await new Promise((r) => setTimeout(r, 1200));
  updateSettings({ googleSync: { connected: true, calendarId, twoWay: true, syncing: false } });
}
export function disconnectGoogle() {
  updateSettings({ googleSync: { connected: false, twoWay: false, syncing: false } });
}

// Book a session (used by public booking flow)
export function bookPublicSession(input: {
  patientName: string;
  email: string;
  phone?: string;
  startsAt: string;
  durationMin: number;
  service: SessionService;
  modality: SessionModality;
  fee: number;
}): Session {
  return createSession({
    patientId: "public_" + uid("p"),
    startsAt: input.startsAt,
    durationMin: input.durationMin,
    modality: input.modality,
    status: "scheduled",
    service: input.service,
    fee: input.fee,
    agenda: [`Booked publicly by ${input.patientName} (${input.email})`],
  });
}

// ─── Hooks ───────────────────────────────────────────────────
export function useLiveWindows(): AvailabilityWindow[] {
  return useSyncExternalStore(subscribe, () => state().windows, () => state().windows);
}
export function useLiveBlackouts(): Blackout[] {
  return useSyncExternalStore(subscribe, () => state().blackouts, () => state().blackouts);
}
export function useBooking(): BookingLinkConfig {
  return useSyncExternalStore(subscribe, () => state().booking, () => state().booking);
}
export function useCalendarSettings(): CalendarSettings {
  return useSyncExternalStore(subscribe, () => state().settings, () => state().settings);
}

// ─── Session-type color tokens ───────────────────────────────
export const SESSION_TYPE_COLOR: Record<SessionService, { name: string; hex: string }> = {
  "Intake":             { name: "sage",     hex: "#5F8A6A" },
  "Individual Therapy": { name: "rose",     hex: "#B0567A" },
  "Couples":            { name: "lavender", hex: "#8B7FB0" },
  "Assessment":         { name: "slate",    hex: "#6C7A8A" },
  "Follow-up":          { name: "amber",    hex: "#B6763A" },
};

// ─── Time helpers ────────────────────────────────────────────
export function fmtMin(min: number): string {
  const h = Math.floor(min / 60).toString().padStart(2, "0");
  const m = (min % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}
export function parseHM(str: string): number {
  const [h, m] = str.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}
export function startOfWeek(d: Date, weekStartsOn: 0 | 1 = 1): Date {
  const x = new Date(d); x.setHours(0, 0, 0, 0);
  const diff = (x.getDay() - weekStartsOn + 7) % 7;
  x.setDate(x.getDate() - diff);
  return x;
}
export function addDays(d: Date, n: number): Date {
  const x = new Date(d); x.setDate(x.getDate() + n); return x;
}
export function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
export function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// ─── Seed ────────────────────────────────────────────────────
function seed(): StoreShape {
  const today = new Date();
  const from = new Date(today); from.setHours(0, 0, 0, 0);
  const fromISO = from.toISOString();
  const services: SessionService[] = ["Individual Therapy", "Intake", "Follow-up", "Assessment", "Couples"];
  const windows: AvailabilityWindow[] = [];
  // Mon–Fri 09:00–13:00 and 14:00–18:00
  for (let d = 1; d <= 5; d++) {
    windows.push({ id: uid("aw"), dayOfWeek: d as DayOfWeek, startMin: 9 * 60, endMin: 13 * 60, sessionTypes: services, location: "either", effectiveFrom: fromISO });
    windows.push({ id: uid("aw"), dayOfWeek: d as DayOfWeek, startMin: 14 * 60, endMin: 18 * 60, sessionTypes: services, location: "either", effectiveFrom: fromISO });
  }
  // Sat 10:00–13:00
  windows.push({ id: uid("aw"), dayOfWeek: 6, startMin: 10 * 60, endMin: 13 * 60, sessionTypes: ["Follow-up", "Individual Therapy"], location: "telehealth", effectiveFrom: fromISO });

  const nextWed = new Date(today); nextWed.setDate(nextWed.getDate() + ((3 - nextWed.getDay() + 7) % 7 || 7));
  nextWed.setHours(13, 0, 0, 0);
  const nextWedEnd = new Date(nextWed); nextWedEnd.setHours(17, 0, 0, 0);

  const blackouts: Blackout[] = [
    { id: uid("bo"), startAt: nextWed.toISOString(), endAt: nextWedEnd.toISOString(), reason: "Case conference" },
  ];

  const booking: BookingLinkConfig = {
    slug: "demo",
    isPublic: true,
    headline: "Book a session with Dr. Kavya Rao",
    intro: "Warm, structured therapy for adults navigating anxiety, burnout, and life transitions. Sessions run 50 minutes.",
    offeredServices: ["Intake", "Individual Therapy", "Follow-up"],
    minNoticeHours: 24,
    maxAdvanceDays: 60,
    bufferBeforeMin: 10,
    bufferAfterMin: 10,
    requireIntakeForm: true,
    requirePaymentUpfront: false,
    timezone: "Asia/Kolkata",
  };

  const settings: CalendarSettings = {
    timezone: "Asia/Kolkata",
    weekStartsOn: 1,
    workingHours: { startMin: 9 * 60, endMin: 18 * 60 },
    defaultBufferMin: 10,
    colorScheme: "type",
    hideWeekends: false,
    googleSync: { connected: false, twoWay: false },
    zoomAutoLink: true,
  };

  return { windows, blackouts, booking, settings };
}
