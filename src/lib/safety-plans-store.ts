// Stanley-Brown safety plan — per patient, localStorage-backed with live sub.
import { useSyncExternalStore } from "react";

export type SafetyPlan = {
  patientId: string;
  warningSigns: string[];
  copingStrategies: string[];
  distractions: string[];             // people & places
  supports: { name: string; phone: string }[];
  professionals: { name: string; phone: string; role: string }[];
  meansRestriction: string;
  reasonsToLive: string;
  updatedAt: number;
};

const KEY = "pc.safety-plans.v1";
const listeners = new Set<() => void>();
function emit() { listeners.forEach((l) => l()); }
function read(): Record<string, SafetyPlan> {
  if (typeof window === "undefined") return {};
  try { const raw = window.localStorage.getItem(KEY); return raw ? JSON.parse(raw) : {}; } catch { return {}; }
}
function write(next: Record<string, SafetyPlan>) {
  try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* noop */ }
  emit();
}

export function getSafetyPlan(patientId: string): SafetyPlan | undefined { return read()[patientId]; }
export function saveSafetyPlan(plan: Omit<SafetyPlan, "updatedAt">): SafetyPlan {
  const all = read();
  const full: SafetyPlan = { ...plan, updatedAt: Date.now() };
  all[plan.patientId] = full;
  write(all);
  return full;
}
export function useSafetyPlan(patientId: string): SafetyPlan | undefined {
  return useSyncExternalStore(
    (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
    () => read()[patientId],
    () => undefined,
  );
}
export function emptyPlan(patientId: string): SafetyPlan {
  return {
    patientId,
    warningSigns: [""],
    copingStrategies: [""],
    distractions: [""],
    supports: [{ name: "", phone: "" }],
    professionals: [{ name: "Crisis helpline (iCall)", phone: "+91 91529 87821", role: "24/7 helpline" }],
    meansRestriction: "",
    reasonsToLive: "",
    updatedAt: Date.now(),
  };
}
