// PeaceCode · Practice — Groups store (localStorage-backed, live-updating).
import { useSyncExternalStore } from "react";

export type GroupCadence = "weekly" | "biweekly" | "monthly";
export type GroupStatus = "active" | "forming" | "closed";
export type GroupModality = "in-person" | "video" | "hybrid";

export type Group = {
  id: string;
  name: string;
  focus: string;
  modality: GroupModality;
  cadence: GroupCadence;
  status: GroupStatus;
  memberIds: string[];
  capacity: number;
  facilitator: string;
  nextSessionAt?: number;
  startedAt: number;
  notes?: string;
};

const KEY = "pc.groups.v1";
const listeners = new Set<() => void>();

function emit() { listeners.forEach((l) => l()); }
let cache: Group[] | null = null;
function read(): Group[] {
  if (typeof window === "undefined") return [];
  if (cache) return cache;
  try { const raw = window.localStorage.getItem(KEY); if (raw) { cache = JSON.parse(raw) as Group[]; return cache; } } catch { /* noop */ }
  const seed = seedGroups();
  try { window.localStorage.setItem(KEY, JSON.stringify(seed)); } catch { /* noop */ }
  cache = seed;
  return seed;
}
function write(g: Group[]) {
  cache = g.slice();
  try { window.localStorage.setItem(KEY, JSON.stringify(g)); } catch { /* noop */ }
  emit();
}

const DAY = 86_400_000;
function seedGroups(): Group[] {
  const now = Date.now();
  return [
    { id: "grp_dbt", name: "DBT Skills Circle", focus: "Emotion regulation, distress tolerance", modality: "in-person", cadence: "weekly", status: "active", memberIds: ["pat_ananya", "pat_kabir", "pat_rhea"], capacity: 8, facilitator: "Dr. R. Menon", nextSessionAt: now + 2 * DAY, startedAt: now - 45 * DAY, notes: "Cohort halfway through 24-week curriculum." },
    { id: "grp_exam", name: "Exam Anxiety Cohort", focus: "Test anxiety, sleep hygiene, pacing", modality: "video", cadence: "weekly", status: "active", memberIds: ["pat_ishaan", "pat_meera", "pat_sana", "pat_vikram", "pat_aarushi"], capacity: 10, facilitator: "Dr. R. Menon", nextSessionAt: now + 4 * DAY, startedAt: now - 21 * DAY },
    { id: "grp_mindful", name: "Mindfulness Mornings", focus: "MBSR-style short practices", modality: "hybrid", cadence: "weekly", status: "forming", memberIds: ["pat_ananya", "pat_dev"], capacity: 12, facilitator: "Dr. R. Menon", nextSessionAt: now + 9 * DAY, startedAt: now - 3 * DAY, notes: "Recruiting — 6 more spots." },
    { id: "grp_grief", name: "Grief & Loss Support", focus: "Closed-cohort bereavement work", modality: "in-person", cadence: "biweekly", status: "closed", memberIds: ["pat_nisha", "pat_arjun", "pat_tara"], capacity: 6, facilitator: "Dr. R. Menon", startedAt: now - 120 * DAY, notes: "Cohort closed after 8 sessions. Reunion in Q2." },
  ];
}

export function listGroups(): Group[] { return read(); }
export function getGroup(id: string): Group | undefined { return read().find((g) => g.id === id); }

export function createGroup(input: Omit<Group, "id" | "startedAt" | "memberIds"> & { memberIds?: string[] }): Group {
  const g: Group = { id: `grp_${Math.random().toString(36).slice(2, 8)}`, startedAt: Date.now(), memberIds: input.memberIds ?? [], ...input };
  write([g, ...read()]);
  return g;
}
export function updateGroup(id: string, patch: Partial<Group>): Group | undefined {
  const all = read();
  const i = all.findIndex((g) => g.id === id);
  if (i === -1) return undefined;
  all[i] = { ...all[i], ...patch };
  write(all);
  return all[i];
}
export function deleteGroup(id: string): void { write(read().filter((g) => g.id !== id)); }

export function addMember(id: string, patientId: string): void {
  const g = getGroup(id);
  if (!g || g.memberIds.includes(patientId) || g.memberIds.length >= g.capacity) return;
  updateGroup(id, { memberIds: [...g.memberIds, patientId] });
}
export function removeMember(id: string, patientId: string): void {
  const g = getGroup(id);
  if (!g) return;
  updateGroup(id, { memberIds: g.memberIds.filter((p) => p !== patientId) });
}

function subscribe(fn: () => void) { listeners.add(fn); return () => listeners.delete(fn); }
export function useLiveGroups(): Group[] {
  return useSyncExternalStore(subscribe, read, read);
}

export const CADENCE_LABEL: Record<GroupCadence, string> = { weekly: "Weekly", biweekly: "Every 2 weeks", monthly: "Monthly" };
export const STATUS_META: Record<GroupStatus, { label: string; color: string; bg: string }> = {
  active:  { label: "Active",  color: "#2F6A4A", bg: "rgba(47,106,74,0.10)" },
  forming: { label: "Forming", color: "#8a6d1e", bg: "rgba(203,167,66,0.14)" },
  closed:  { label: "Closed",  color: "#7B6A70", bg: "rgba(0,0,0,0.05)" },
};
