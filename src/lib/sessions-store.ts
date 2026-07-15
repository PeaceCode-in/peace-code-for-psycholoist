// PeaceCode · Practice — Sessions & Telehealth store.
// localStorage-backed with a tiny event bus for live re-renders.
// Seeds ~40 sessions across the next 14 days for the 12 seeded patients.

import { useEffect, useState, useSyncExternalStore } from "react";

// ─── Types ───────────────────────────────────────────────────
export type SessionStatus =
  | "scheduled" | "confirmed" | "in_progress" | "completed" | "no_show" | "cancelled";
export type SessionModality = "telehealth" | "in_person" | "phone";
export type SessionService =
  | "Individual Therapy" | "Couples" | "Intake" | "Assessment" | "Follow-up";

export type SessionAttachment = { id: string; name: string; kind: "pdf" | "image" | "form" };

export type Session = {
  id: string;
  patientId: string;
  startsAt: string;            // ISO
  durationMin: number;         // 30 | 45 | 60 | 90
  modality: SessionModality;
  status: SessionStatus;
  service: SessionService;
  fee: number;                 // INR
  roomId?: string;
  agenda?: string[];
  postNoteId?: string;
  attachments?: SessionAttachment[];
  createdAt: string;
};

export type ConnectionQuality = "excellent" | "good" | "fair" | "poor";
export type RoomState = {
  sessionId: string;
  micOn: boolean;
  camOn: boolean;
  screenShare: boolean;
  captionsOn: boolean;
  startedAt?: string;
  endedAt?: string;
  connectionQuality: ConnectionQuality;
};

export type SessionEvent = {
  id: string;
  sessionId: string;
  at: string;
  kind: "join" | "mute" | "unmute" | "cam_on" | "cam_off" | "screen_start" | "screen_end" | "end" | "captions_on" | "captions_off" | "reschedule" | "note_saved";
  note?: string;
};

type StoreShape = {
  sessions: Session[];
  rooms: Record<string, RoomState>;
  events: SessionEvent[];
};

const KEY = "peacecode.therapist.sessions.v1";

// ─── Event bus ───────────────────────────────────────────────
const listeners = new Set<() => void>();
function emit() { listeners.forEach((fn) => fn()); }
function subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }

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
function save(s: StoreShape) {
  if (!isBrowser()) return;
  try { localStorage.setItem(KEY, JSON.stringify(s)); emit(); } catch { /* quota */ }
}
let cache: StoreShape | null = null;
function state(): StoreShape { if (!cache) cache = load(); return cache; }
function mutate(fn: (s: StoreShape) => StoreShape) { cache = fn(state()); save(cache); }

function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}

// ─── Query helpers ───────────────────────────────────────────
export function listSessions(): Session[] {
  return [...state().sessions].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}
export function getSession(id: string): Session | undefined {
  return state().sessions.find((s) => s.id === id);
}
export function sessionsForPatient(patientId: string): Session[] {
  return listSessions().filter((s) => s.patientId === patientId);
}
export function sessionsInRange(startISO: string, endISO: string): Session[] {
  return listSessions().filter((s) => s.startsAt >= startISO && s.startsAt < endISO);
}
export function sessionsForDay(dayISO: string): Session[] {
  const start = new Date(dayISO); start.setHours(0, 0, 0, 0);
  const end = new Date(start); end.setDate(end.getDate() + 1);
  return sessionsInRange(start.toISOString(), end.toISOString());
}

export function todayRemaining(): number {
  const now = new Date();
  const start = new Date(now); start.setHours(0, 0, 0, 0);
  const end = new Date(start); end.setDate(end.getDate() + 1);
  return sessionsInRange(start.toISOString(), end.toISOString()).filter(
    (s) => s.status === "scheduled" || s.status === "confirmed" || s.status === "in_progress",
  ).length;
}

// ─── Mutations ───────────────────────────────────────────────
export function createSession(input: Omit<Session, "id" | "createdAt">): Session {
  const now = new Date().toISOString();
  const s: Session = { ...input, id: uid("ses"), createdAt: now };
  mutate((st) => ({ ...st, sessions: [s, ...st.sessions] }));
  return s;
}
export function updateSession(id: string, patch: Partial<Session>): Session | undefined {
  let updated: Session | undefined;
  mutate((st) => ({
    ...st,
    sessions: st.sessions.map((s) => (s.id === id ? (updated = { ...s, ...patch }) : s)),
  }));
  return updated;
}
export function rescheduleSession(id: string, newStartsAt: string): Session | undefined {
  const prev = getSession(id);
  const out = updateSession(id, { startsAt: newStartsAt });
  if (out && prev) recordEvent(id, "reschedule", `From ${new Date(prev.startsAt).toLocaleString()} → ${new Date(newStartsAt).toLocaleString()}`);
  return out;
}
export function cancelSession(id: string): void { updateSession(id, { status: "cancelled" }); }
export function completeSession(id: string, postNoteId?: string): void {
  updateSession(id, { status: "completed", postNoteId });
  recordEvent(id, "end");
}

// ─── Room state ──────────────────────────────────────────────
export function getRoom(sessionId: string): RoomState {
  const existing = state().rooms[sessionId];
  if (existing) return existing;
  const initial: RoomState = { sessionId, micOn: true, camOn: true, screenShare: false, captionsOn: false, connectionQuality: "excellent" };
  mutate((st) => ({ ...st, rooms: { ...st.rooms, [sessionId]: initial } }));
  return initial;
}
export function updateRoom(sessionId: string, patch: Partial<RoomState>): RoomState {
  const current = getRoom(sessionId);
  const next = { ...current, ...patch };
  mutate((st) => ({ ...st, rooms: { ...st.rooms, [sessionId]: next } }));
  return next;
}
export function startRoom(sessionId: string): RoomState {
  const now = new Date().toISOString();
  updateSession(sessionId, { status: "in_progress" });
  recordEvent(sessionId, "join");
  return updateRoom(sessionId, { startedAt: now });
}
export function endRoom(sessionId: string): RoomState {
  return updateRoom(sessionId, { endedAt: new Date().toISOString() });
}

// ─── Events ──────────────────────────────────────────────────
export function recordEvent(sessionId: string, kind: SessionEvent["kind"], note?: string): void {
  const ev: SessionEvent = { id: uid("se"), sessionId, at: new Date().toISOString(), kind, note };
  mutate((st) => ({ ...st, events: [ev, ...st.events] }));
}
export function listSessionEvents(sessionId: string): SessionEvent[] {
  return state().events.filter((e) => e.sessionId === sessionId).sort((a, b) => b.at.localeCompare(a.at));
}

// ─── Hooks ───────────────────────────────────────────────────
export function useLiveSessions(): Session[] {
  return useSyncExternalStore(subscribe, () => cachedList(), () => listSessions());
}
let _cached: [Session[] | null, number] = [null, 0];
function cachedList(): Session[] {
  const s = state();
  if (_cached[0] && _cached[1] === s.sessions.length + Object.keys(s.rooms).length) return _cached[0];
  const next = listSessions();
  _cached = [next, s.sessions.length + Object.keys(s.rooms).length];
  return next;
}

export function useLiveSession(id: string): Session | undefined {
  const [x, setX] = useState<Session | undefined>(() => getSession(id));
  useEffect(() => { setX(getSession(id)); return subscribe(() => setX(getSession(id))); }, [id]);
  return x;
}

export function useLiveRoom(sessionId: string): RoomState {
  const [x, setX] = useState<RoomState>(() => getRoom(sessionId));
  useEffect(() => { setX(getRoom(sessionId)); return subscribe(() => setX(getRoom(sessionId))); }, [sessionId]);
  return x;
}

export function useTodayRemaining(): number {
  return useSyncExternalStore(subscribe, () => todayRemaining(), () => 0);
}

// ─── Metadata ────────────────────────────────────────────────
export const STATUS_META: Record<SessionStatus, { label: string; token: string; softToken: string }> = {
  scheduled:   { label: "Scheduled",   token: "#4B6CB7", softToken: "#E4EAF6" },
  confirmed:   { label: "Confirmed",   token: "#5F8A6A", softToken: "#E1EFE3" },
  in_progress: { label: "In session",  token: "#B0567A", softToken: "#F1C7D6" },
  completed:   { label: "Completed",   token: "#7B6A70", softToken: "#EADFE2" },
  no_show:     { label: "No-show",     token: "#B0384A", softToken: "#F1C6CE" },
  cancelled:   { label: "Cancelled",   token: "#A6B6CC", softToken: "#EEF1F5" },
};

export const MODALITY_META: Record<SessionModality, { label: string; icon: "video" | "person" | "phone" }> = {
  telehealth: { label: "Telehealth", icon: "video" },
  in_person:  { label: "In person",  icon: "person" },
  phone:      { label: "Phone",      icon: "phone" },
};

// ─── Seed ────────────────────────────────────────────────────
function atHour(daysFromToday: number, hour: number, min = 0): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + daysFromToday);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
}

type SeedRow = {
  patientId: string; day: number; hour: number; min?: number;
  duration: number; modality: SessionModality; service: SessionService; status: SessionStatus; fee: number;
  agenda?: string[];
};

function seed(): StoreShape {
  // Anchor sessions to real patient IDs from patients-store.
  const rows: SeedRow[] = [
    // ── Today (7 slots — 2 completed, 1 in-progress-ish → treat as scheduled for demo, 3 scheduled, 1 no-show)
    { patientId: "pat_priya",  day: 0, hour: 9,  duration: 50, modality: "telehealth", service: "Individual Therapy", status: "completed", fee: 1800, agenda: ["Review PHQ-9 spike", "Safety plan check"] },
    { patientId: "pat_diya",   day: 0, hour: 10, duration: 45, modality: "in_person",  service: "Individual Therapy", status: "completed", fee: 1800 },
    { patientId: "pat_ananya", day: 0, hour: 11, min: 30, duration: 30, modality: "phone", service: "Follow-up", status: "no_show", fee: 800 },
    { patientId: "pat_rohan",  day: 0, hour: 14, duration: 60, modality: "telehealth", service: "Individual Therapy", status: "confirmed", fee: 2200, agenda: ["Re-check SI ideation", "Family conflict follow-up", "Confirm crisis contacts"] },
    { patientId: "pat_kabir",  day: 0, hour: 15, min: 30, duration: 45, modality: "telehealth", service: "Individual Therapy", status: "scheduled", fee: 1800 },
    { patientId: "pat_meera",  day: 0, hour: 17, duration: 45, modality: "in_person",  service: "Individual Therapy", status: "scheduled", fee: 1800 },
    { patientId: "pat_isha",   day: 0, hour: 18, min: 30, duration: 50, modality: "telehealth", service: "Individual Therapy", status: "scheduled", fee: 1800 },

    // Tomorrow
    { patientId: "pat_aarav",  day: 1, hour: 9,  duration: 45, modality: "telehealth", service: "Individual Therapy", status: "scheduled", fee: 1800 },
    { patientId: "pat_zara",   day: 1, hour: 10, min: 30, duration: 90, modality: "in_person", service: "Intake", status: "scheduled", fee: 2500 },
    { patientId: "pat_priya",  day: 1, hour: 13, duration: 50, modality: "telehealth", service: "Individual Therapy", status: "scheduled", fee: 1800 },
    { patientId: "pat_sanjay", day: 1, hour: 15, duration: 60, modality: "telehealth", service: "Individual Therapy", status: "scheduled", fee: 2000 },
    { patientId: "pat_vikram", day: 1, hour: 17, duration: 45, modality: "in_person", service: "Individual Therapy", status: "cancelled", fee: 1800 },

    // Day +2
    { patientId: "pat_rohan",  day: 2, hour: 9,  duration: 60, modality: "telehealth", service: "Individual Therapy", status: "scheduled", fee: 2200 },
    { patientId: "pat_diya",   day: 2, hour: 11, duration: 90, modality: "in_person", service: "Couples", status: "scheduled", fee: 3000 },
    { patientId: "pat_meera",  day: 2, hour: 14, duration: 45, modality: "telehealth", service: "Individual Therapy", status: "scheduled", fee: 1800 },
    { patientId: "pat_kabir",  day: 2, hour: 16, duration: 45, modality: "phone", service: "Follow-up", status: "scheduled", fee: 1200 },

    // Day +3
    { patientId: "pat_isha",   day: 3, hour: 9,  duration: 50, modality: "telehealth", service: "Individual Therapy", status: "scheduled", fee: 1800 },
    { patientId: "pat_ananya", day: 3, hour: 11, duration: 60, modality: "in_person", service: "Assessment", status: "scheduled", fee: 2500 },
    { patientId: "pat_priya",  day: 3, hour: 15, duration: 50, modality: "telehealth", service: "Individual Therapy", status: "scheduled", fee: 1800 },
    { patientId: "pat_sanjay", day: 3, hour: 17, duration: 45, modality: "telehealth", service: "Individual Therapy", status: "scheduled", fee: 1800 },

    // Day +4
    { patientId: "pat_aarav",  day: 4, hour: 10, duration: 45, modality: "telehealth", service: "Individual Therapy", status: "scheduled", fee: 1800 },
    { patientId: "pat_rohan",  day: 4, hour: 14, duration: 60, modality: "telehealth", service: "Individual Therapy", status: "scheduled", fee: 2200 },
    { patientId: "pat_meera",  day: 4, hour: 16, duration: 45, modality: "in_person", service: "Individual Therapy", status: "cancelled", fee: 1800 },

    // Day +5
    { patientId: "pat_diya",   day: 5, hour: 10, duration: 45, modality: "telehealth", service: "Individual Therapy", status: "scheduled", fee: 1800 },
    { patientId: "pat_vikram", day: 5, hour: 12, duration: 60, modality: "in_person", service: "Individual Therapy", status: "scheduled", fee: 2000 },
    { patientId: "pat_kabir",  day: 5, hour: 15, duration: 45, modality: "telehealth", service: "Individual Therapy", status: "scheduled", fee: 1800 },

    // Day +6
    { patientId: "pat_priya",  day: 6, hour: 9,  duration: 50, modality: "telehealth", service: "Individual Therapy", status: "scheduled", fee: 1800 },
    { patientId: "pat_ananya", day: 6, hour: 11, duration: 45, modality: "in_person", service: "Individual Therapy", status: "scheduled", fee: 1800 },

    // Days 7–13 (thinner)
    { patientId: "pat_sanjay", day: 7, hour: 10, duration: 45, modality: "telehealth", service: "Individual Therapy", status: "scheduled", fee: 1800 },
    { patientId: "pat_isha",   day: 7, hour: 14, duration: 50, modality: "telehealth", service: "Individual Therapy", status: "scheduled", fee: 1800 },
    { patientId: "pat_aarav",  day: 8, hour: 11, duration: 45, modality: "in_person", service: "Individual Therapy", status: "scheduled", fee: 1800 },
    { patientId: "pat_rohan",  day: 8, hour: 15, duration: 60, modality: "telehealth", service: "Individual Therapy", status: "scheduled", fee: 2200 },
    { patientId: "pat_zara",   day: 9, hour: 10, duration: 60, modality: "in_person", service: "Assessment", status: "scheduled", fee: 2500 },
    { patientId: "pat_priya",  day: 9, hour: 15, duration: 50, modality: "telehealth", service: "Individual Therapy", status: "scheduled", fee: 1800 },
    { patientId: "pat_meera",  day: 10, hour: 11, duration: 45, modality: "telehealth", service: "Individual Therapy", status: "scheduled", fee: 1800 },
    { patientId: "pat_kabir",  day: 10, hour: 15, duration: 45, modality: "telehealth", service: "Individual Therapy", status: "scheduled", fee: 1800 },
    { patientId: "pat_diya",   day: 11, hour: 12, duration: 45, modality: "in_person", service: "Individual Therapy", status: "scheduled", fee: 1800 },
    { patientId: "pat_ananya", day: 12, hour: 14, duration: 60, modality: "telehealth", service: "Individual Therapy", status: "scheduled", fee: 1800 },
    { patientId: "pat_vikram", day: 13, hour: 11, duration: 45, modality: "in_person", service: "Individual Therapy", status: "scheduled", fee: 1800 },
    { patientId: "pat_rohan",  day: 13, hour: 15, duration: 60, modality: "telehealth", service: "Individual Therapy", status: "scheduled", fee: 2200 },

    // A few completed sessions in the past 7 days without post-notes (backlog)
    { patientId: "pat_arjun",  day: -1, hour: 14, duration: 45, modality: "telehealth", service: "Follow-up", status: "completed", fee: 1500 },
    { patientId: "pat_kabir",  day: -2, hour: 10, duration: 45, modality: "telehealth", service: "Individual Therapy", status: "completed", fee: 1800 },
  ];

  const now = new Date().toISOString();
  const sessions: Session[] = rows.map((r, i) => ({
    id: `ses_${String(i + 1).padStart(3, "0")}`,
    patientId: r.patientId,
    startsAt: atHour(r.day, r.hour, r.min ?? 0),
    durationMin: r.duration,
    modality: r.modality,
    status: r.status,
    service: r.service,
    fee: r.fee,
    roomId: r.modality === "telehealth" ? `pc-${(r.patientId + i).slice(-6)}` : undefined,
    agenda: r.agenda,
    attachments: [],
    createdAt: now,
  }));

  return { sessions, rooms: {}, events: [] };
}

// Reset (dev / QA)
export function resetSessions(): void {
  cache = seed();
  save(cache);
}
