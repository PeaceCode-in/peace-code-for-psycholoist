// PeaceCode · Practice — Schedule store.
// Extends sessions/calendar with:
//   • Personal blocks (breaks, admin, supervision)
//   • Recurring events (RRULE-lite: weekly Mon/Wed, biweekly, monthly)
//   • View preference (last used view)
// localStorage-backed with the same event-bus pattern as our other stores.

import { useEffect, useState, useSyncExternalStore } from "react";

// ─── Types ───────────────────────────────────────────────────
export type BlockKind = "break" | "admin" | "supervision" | "personal" | "travel";
export type BlockRecurrence =
  | { kind: "once" }
  | { kind: "weekly"; days: number[]; interval?: 1 | 2 } // interval 2 = biweekly
  | { kind: "monthly"; dayOfMonth: number };

export type ScheduleBlock = {
  id: string;
  title: string;
  kind: BlockKind;
  startsAt: string;         // ISO (first occurrence)
  durationMin: number;
  recurrence: BlockRecurrence;
  notes?: string;
  createdAt: string;
};

export type ScheduleView = "day" | "week" | "month" | "agenda";

type StoreShape = {
  blocks: ScheduleBlock[];
  view: ScheduleView;
};

const KEY = "peacecode.therapist.schedule.v1";

// ─── Bus ─────────────────────────────────────────────────────
const listeners = new Set<() => void>();
function emit() { snapCache = {}; listeners.forEach((fn) => fn()); }
function subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }

let snapCache: Record<string, unknown> = {};
function snap<T>(key: string, compute: () => T): T {
  if (!(key in snapCache)) snapCache[key] = compute();
  return snapCache[key] as T;
}

// ─── Storage ─────────────────────────────────────────────────
function isBrowser() { return typeof window !== "undefined" && typeof localStorage !== "undefined"; }
function load(): StoreShape {
  if (!isBrowser()) return seed();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) { const s = seed(); localStorage.setItem(KEY, JSON.stringify(s)); return s; }
    return JSON.parse(raw) as StoreShape;
  } catch { return seed(); }
}
function save(s: StoreShape) { if (!isBrowser()) return; try { localStorage.setItem(KEY, JSON.stringify(s)); emit(); } catch { /* quota */ } }
let cache: StoreShape | null = null;
function state(): StoreShape { if (!cache) cache = load(); return cache; }
function mutate(fn: (s: StoreShape) => StoreShape) { cache = fn(state()); save(cache); }
function uid(p = "id") { return `${p}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`; }

// ─── Queries ─────────────────────────────────────────────────
export function listBlocks(): ScheduleBlock[] {
  return [...state().blocks].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}
export function getBlock(id: string): ScheduleBlock | undefined {
  return state().blocks.find((b) => b.id === id);
}
export function getView(): ScheduleView { return state().view; }
export function setView(v: ScheduleView) { mutate((s) => ({ ...s, view: v })); }

// ─── Recurrence expansion ────────────────────────────────────
// Given a block and a date window, return the concrete ISO starts within.
export function expandBlock(block: ScheduleBlock, fromISO: string, toISO: string): string[] {
  const from = new Date(fromISO).getTime();
  const to = new Date(toISO).getTime();
  const base = new Date(block.startsAt);
  const baseTime = base.getTime();
  const out: string[] = [];

  if (block.recurrence.kind === "once") {
    if (baseTime >= from && baseTime <= to) out.push(block.startsAt);
    return out;
  }

  if (block.recurrence.kind === "weekly") {
    const days = block.recurrence.days.length > 0 ? block.recurrence.days : [base.getDay()];
    const interval = block.recurrence.interval ?? 1;
    // Walk day-by-day from max(base, from-7d) up to `to`
    const start = new Date(Math.max(baseTime, from - 7 * 86400_000));
    start.setHours(base.getHours(), base.getMinutes(), 0, 0);
    for (let d = new Date(start); d.getTime() <= to; d.setDate(d.getDate() + 1)) {
      if (d.getTime() < baseTime) continue;
      if (!days.includes(d.getDay())) continue;
      if (interval === 2) {
        const weeksSince = Math.floor((d.getTime() - baseTime) / (7 * 86400_000));
        if (weeksSince % 2 !== 0) continue;
      }
      if (d.getTime() >= from && d.getTime() <= to) out.push(new Date(d).toISOString());
    }
    return out;
  }

  if (block.recurrence.kind === "monthly") {
    const dom = block.recurrence.dayOfMonth;
    const start = new Date(Math.max(baseTime, from));
    for (let m = new Date(start.getFullYear(), start.getMonth(), 1); m.getTime() <= to; m.setMonth(m.getMonth() + 1)) {
      const occ = new Date(m.getFullYear(), m.getMonth(), dom, base.getHours(), base.getMinutes(), 0, 0);
      if (occ.getTime() >= Math.max(baseTime, from) && occ.getTime() <= to) out.push(occ.toISOString());
    }
    return out;
  }
  return out;
}

// Expand all blocks into (blockId, startsAt) occurrences within the window.
export type BlockOccurrence = { blockId: string; block: ScheduleBlock; startsAt: string };
export function occurrencesInRange(fromISO: string, toISO: string): BlockOccurrence[] {
  const out: BlockOccurrence[] = [];
  listBlocks().forEach((b) => {
    expandBlock(b, fromISO, toISO).forEach((s) => out.push({ blockId: b.id, block: b, startsAt: s }));
  });
  return out.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

// ─── Mutations ───────────────────────────────────────────────
export function createBlock(input: Omit<ScheduleBlock, "id" | "createdAt">): ScheduleBlock {
  const b: ScheduleBlock = { ...input, id: uid("blk"), createdAt: new Date().toISOString() };
  mutate((s) => ({ ...s, blocks: [...s.blocks, b] }));
  return b;
}
export function updateBlock(id: string, patch: Partial<ScheduleBlock>): ScheduleBlock | undefined {
  let next: ScheduleBlock | undefined;
  mutate((s) => ({
    ...s,
    blocks: s.blocks.map((b) => (b.id === id ? (next = { ...b, ...patch }) : b)),
  }));
  return next;
}
export function deleteBlock(id: string) {
  mutate((s) => ({ ...s, blocks: s.blocks.filter((b) => b.id !== id) }));
}

// ─── Hooks ───────────────────────────────────────────────────
export function useLiveBlocks(): ScheduleBlock[] {
  return useSyncExternalStore(subscribe, () => snap("blocks", listBlocks), () => snap("blocks:ssr", listBlocks));
}
export function useLiveView(): ScheduleView {
  return useSyncExternalStore(subscribe, () => state().view, () => "day");
}
export function useLiveOccurrences(fromISO: string, toISO: string): BlockOccurrence[] {
  const key = fromISO + "|" + toISO;
  const [x, setX] = useState<BlockOccurrence[]>(() => occurrencesInRange(fromISO, toISO));
  useEffect(() => {
    setX(occurrencesInRange(fromISO, toISO));
    return subscribe(() => setX(occurrencesInRange(fromISO, toISO)));
  }, [key]);
  return x;
}

// ─── Metadata ────────────────────────────────────────────────
export const BLOCK_META: Record<BlockKind, { label: string; hex: string; soft: string }> = {
  break:       { label: "Break",       hex: "#7B6A70", soft: "#EADFE2" },
  admin:       { label: "Admin",       hex: "#6C7A8A", soft: "#E4EAF0" },
  supervision: { label: "Supervision", hex: "#8B7FB0", soft: "#EFE4F0" },
  personal:    { label: "Personal",    hex: "#B0567A", soft: "#F1C7D6" },
  travel:      { label: "Travel",      hex: "#B6763A", soft: "#F1E1CE" },
};

// ─── iCal export ─────────────────────────────────────────────
export function toICS(events: Array<{ uid: string; title: string; startsAt: string; durationMin: number; description?: string }>): string {
  const dt = (iso: string) => {
    const d = new Date(iso);
    return d.getUTCFullYear().toString() +
      String(d.getUTCMonth() + 1).padStart(2, "0") +
      String(d.getUTCDate()).padStart(2, "0") + "T" +
      String(d.getUTCHours()).padStart(2, "0") +
      String(d.getUTCMinutes()).padStart(2, "0") +
      "00Z";
  };
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//PeaceCode//Practice//EN",
    "CALSCALE:GREGORIAN",
  ];
  events.forEach((e) => {
    const end = new Date(new Date(e.startsAt).getTime() + e.durationMin * 60_000).toISOString();
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.uid}@peacecode`,
      `DTSTAMP:${dt(new Date().toISOString())}`,
      `DTSTART:${dt(e.startsAt)}`,
      `DTEND:${dt(end)}`,
      `SUMMARY:${escapeICS(e.title)}`,
      ...(e.description ? [`DESCRIPTION:${escapeICS(e.description)}`] : []),
      "END:VEVENT",
    );
  });
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
function escapeICS(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

// ─── Seed ────────────────────────────────────────────────────
function seed(): StoreShape {
  const now = new Date();
  const at = (daysFromToday: number, hour: number, min = 0) => {
    const d = new Date(now); d.setHours(hour, min, 0, 0); d.setDate(d.getDate() + daysFromToday);
    return d.toISOString();
  };
  const blocks: ScheduleBlock[] = [
    // Daily lunch break, weekly M-F
    { id: "blk_lunch", title: "Lunch",       kind: "break",       startsAt: at(0, 13, 0),  durationMin: 60,
      recurrence: { kind: "weekly", days: [1, 2, 3, 4, 5] }, createdAt: now.toISOString() },
    // Weekly supervision, Wednesdays 17:00
    { id: "blk_sup",   title: "Peer supervision", kind: "supervision", startsAt: at(((3 - now.getDay() + 7) % 7) || 7, 17, 0), durationMin: 60,
      recurrence: { kind: "weekly", days: [3] }, createdAt: now.toISOString() },
    // Admin block, Fridays 16:00
    { id: "blk_admin", title: "Admin & notes", kind: "admin", startsAt: at(((5 - now.getDay() + 7) % 7) || 7, 16, 0), durationMin: 60,
      recurrence: { kind: "weekly", days: [5] }, createdAt: now.toISOString() },
    // One-off personal
    { id: "blk_dr",    title: "Dentist", kind: "personal", startsAt: at(4, 11, 0), durationMin: 90,
      recurrence: { kind: "once" }, createdAt: now.toISOString() },
  ];
  return { blocks, view: "day" };
}
