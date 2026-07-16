// Alert preferences + snoozes. Snoozes have an expiry so alerts return.
import { useSyncExternalStore } from "react";
import type { AlertKind } from "./alert-kinds";

type Prefs = {
  enabled: Record<AlertKind, boolean>;
  sound: boolean;
  snoozes: Record<string, number>; // alertId -> return timestamp
  dismissed: string[];
};

const KEY = "pc.alert-prefs.v1";
const listeners = new Set<() => void>();
function emit() { listeners.forEach((l) => l()); }

const DEFAULTS: Prefs = {
  enabled: { crisis: true, no_show: true, overdue_note: true, long_wait: true },
  sound: false,
  snoozes: {},
  dismissed: [],
};

function read(): Prefs {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const p = JSON.parse(raw) as Partial<Prefs>;
    return {
      enabled: { ...DEFAULTS.enabled, ...(p.enabled ?? {}) },
      sound: !!p.sound,
      snoozes: p.snoozes ?? {},
      dismissed: p.dismissed ?? [],
    };
  } catch { return DEFAULTS; }
}
function write(next: Prefs) {
  try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* noop */ }
  emit();
}

export function usePrefs(): Prefs {
  return useSyncExternalStore(
    (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
    () => read(),
    () => DEFAULTS,
  );
}

export function setKindEnabled(kind: AlertKind, on: boolean) {
  const p = read(); p.enabled[kind] = on; write(p);
}
export function toggleSound() { const p = read(); p.sound = !p.sound; write(p); }
export function snooze(alertId: string, until: number) {
  const p = read(); p.snoozes[alertId] = until; write(p);
}
export function dismiss(alertId: string) {
  const p = read(); if (!p.dismissed.includes(alertId)) p.dismissed.push(alertId); write(p);
}
export function restoreAll() { const p = read(); p.dismissed = []; p.snoozes = {}; write(p); }
export function purgeExpiredSnoozes() {
  const p = read(); const now = Date.now(); let changed = false;
  for (const [k, v] of Object.entries(p.snoozes)) { if (v < now) { delete p.snoozes[k]; changed = true; } }
  if (changed) write(p);
}

// Snooze presets
export function snoozeUntil(preset: "hour" | "tomorrow" | "monday"): number {
  const now = new Date();
  if (preset === "hour") return Date.now() + 60 * 60 * 1000;
  if (preset === "tomorrow") { const d = new Date(now); d.setDate(d.getDate() + 1); d.setHours(9, 0, 0, 0); return d.getTime(); }
  // monday 9am
  const d = new Date(now);
  const day = d.getDay(); // 0 sun .. 6 sat
  const delta = day === 0 ? 1 : (8 - day);
  d.setDate(d.getDate() + delta); d.setHours(9, 0, 0, 0);
  return d.getTime();
}
