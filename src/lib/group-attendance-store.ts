// Group attendance ledger — per-session per-member presence.
import { useMemo, useSyncExternalStore } from "react";

export type Attendance = "present" | "late" | "absent" | "excused";

export type GroupSession = {
  id: string;
  groupId: string;
  at: number;
  facilitatorNote?: string;
  attendance: Record<string, Attendance>; // patientId -> mark
};

const KEY = "pc.group-sessions.v1";
const listeners = new Set<() => void>();
function emit() { listeners.forEach((l) => l()); }
function read(): GroupSession[] {
  if (typeof window === "undefined") return [];
  try { const raw = window.localStorage.getItem(KEY); return raw ? JSON.parse(raw) : []; } catch { return []; }
}
function write(next: GroupSession[]) {
  try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* noop */ }
  emit();
}

export function listSessions(groupId: string): GroupSession[] {
  return read().filter((s) => s.groupId === groupId).sort((a, b) => b.at - a.at);
}
export function logSession(input: Omit<GroupSession, "id">): GroupSession {
  const s: GroupSession = { id: `gs_${Math.random().toString(36).slice(2, 9)}`, ...input };
  write([s, ...read()]);
  return s;
}
export function deleteSession(id: string): void { write(read().filter((s) => s.id !== id)); }

export function useGroupSessions(groupId: string): GroupSession[] {
  return useSyncExternalStore(
    (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
    () => listSessions(groupId),
    () => [],
  );
}

export function attendanceRate(sessions: GroupSession[], patientId: string): { attended: number; total: number; pct: number } {
  const relevant = sessions.filter((s) => patientId in s.attendance);
  const attended = relevant.filter((s) => s.attendance[patientId] === "present" || s.attendance[patientId] === "late").length;
  const total = relevant.length;
  return { attended, total, pct: total ? Math.round((attended / total) * 100) : 0 };
}

export const ATTENDANCE_META: Record<Attendance, { label: string; color: string; bg: string }> = {
  present: { label: "Present", color: "#2F6A4A", bg: "rgba(47,106,74,0.12)" },
  late:    { label: "Late",    color: "#8a6d1e", bg: "rgba(203,167,66,0.16)" },
  absent:  { label: "Absent",  color: "#B0384A", bg: "rgba(176,56,74,0.10)" },
  excused: { label: "Excused", color: "#7B6A70", bg: "rgba(0,0,0,0.06)" },
};
