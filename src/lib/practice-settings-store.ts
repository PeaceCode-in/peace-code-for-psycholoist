// Therapist-specific settings, stored separately from the base Settings blob.
import { useEffect, useState } from "react";

export type PracticeSettings = {
  profile: {
    fullName: string;
    headline: string;
    bio: string;
    photo?: string;
    pronouns: string;
    languages: string;
  };
  credentials: {
    licenseNumber: string;
    regulator: "RCI" | "APA" | "HCPC" | "Other";
    degree: string;
    yearsExperience: number;
    specializations: string; // comma-separated
    verified: boolean;
  };
  clinic: {
    name: string;
    address: string;
    city: string;
    country: string;
    timezone: string;
    modalities: { video: boolean; inPerson: boolean; phone: boolean };
  };
  availability: {
    sessionMinutes: number;
    bufferMinutes: number;
    weeklyHours: Record<string, [string, string] | null>; // Mon..Sun
    autoAcceptWaitlist: boolean;
  };
  services: Array<{ id: string; name: string; minutes: number; priceINR: number; active: boolean }>;
  payouts: {
    method: "bank" | "upi";
    accountName: string;
    accountNumber: string;
    ifscOrUpi: string;
    gstin: string;
    pan: string;
  };
  integrations: { googleCalendar: boolean; zoom: boolean; googleMeet: boolean; whatsapp: boolean };
  notifications: {
    email: { newBooking: boolean; cancellation: boolean; message: boolean; dailySummary: boolean };
    sms: { newBooking: boolean; cancellation: boolean };
    push: { newBooking: boolean; message: boolean; alerts: boolean };
  };
  privacy: {
    dataRetentionMonths: number;
    patientDataExportOnRequest: boolean;
    anonymousAnalytics: boolean;
  };
  security: { twoFA: boolean; sessionTimeoutMin: number };
};

const KEY = "pc.practice.settings.v1";

export const defaultPracticeSettings: PracticeSettings = {
  profile: { fullName: "Dr. Priya Sharma", headline: "Clinical Psychologist · Anxiety & Trauma", bio: "10 years of CBT and trauma-informed practice. Adults & young adults.", pronouns: "she/her", languages: "English, Hindi" },
  credentials: { licenseNumber: "A54321", regulator: "RCI", degree: "M.Phil Clinical Psychology, NIMHANS", yearsExperience: 10, specializations: "CBT, EMDR, anxiety, trauma", verified: true },
  clinic: { name: "Independent Practice", address: "312 Hauz Khas", city: "New Delhi", country: "India", timezone: "Asia/Kolkata", modalities: { video: true, inPerson: true, phone: false } },
  availability: {
    sessionMinutes: 50, bufferMinutes: 10, autoAcceptWaitlist: false,
    weeklyHours: {
      Mon: ["09:00", "18:00"], Tue: ["09:00", "18:00"], Wed: ["09:00", "18:00"],
      Thu: ["09:00", "18:00"], Fri: ["09:00", "17:00"], Sat: ["10:00", "14:00"], Sun: null,
    },
  },
  services: [
    { id: "sv1", name: "Individual therapy · 50 min", minutes: 50, priceINR: 2400, active: true },
    { id: "sv2", name: "Intake assessment · 75 min", minutes: 75, priceINR: 3200, active: true },
    { id: "sv3", name: "Couples · 60 min", minutes: 60, priceINR: 3800, active: true },
  ],
  payouts: { method: "bank", accountName: "Priya Sharma", accountNumber: "•••• 4421", ifscOrUpi: "HDFC0000123", gstin: "", pan: "ABCDE1234F" },
  integrations: { googleCalendar: true, zoom: true, googleMeet: false, whatsapp: false },
  notifications: {
    email: { newBooking: true, cancellation: true, message: true, dailySummary: true },
    sms: { newBooking: false, cancellation: true },
    push: { newBooking: true, message: true, alerts: true },
  },
  privacy: { dataRetentionMonths: 84, patientDataExportOnRequest: true, anonymousAnalytics: true },
  security: { twoFA: false, sessionTimeoutMin: 60 },
};

function merge<T>(a: T, b: unknown): T {
  if (!b || typeof b !== "object" || Array.isArray(b)) return a;
  const out: Record<string, unknown> = { ...(a as Record<string, unknown>) };
  for (const k of Object.keys(b as object)) {
    const av = (a as Record<string, unknown>)[k]; const bv = (b as Record<string, unknown>)[k];
    if (av && typeof av === "object" && !Array.isArray(av) && bv && typeof bv === "object" && !Array.isArray(bv)) out[k] = merge(av, bv);
    else if (bv !== undefined) out[k] = bv;
  }
  return out as T;
}

export function loadPractice(): PracticeSettings {
  if (typeof window === "undefined") return defaultPracticeSettings;
  try {
    const raw = window.localStorage.getItem(KEY);
    let base = raw ? merge(defaultPracticeSettings, JSON.parse(raw)) : defaultPracticeSettings;
    // Hydrate from signup metadata on first load.
    const signupRaw = window.localStorage.getItem("pc.practice.signup.v1");
    if (signupRaw && !raw) {
      const s = JSON.parse(signupRaw) as { fullName?: string; licenseNumber?: string; credential?: string; clinic?: string; specializations?: string };
      base = {
        ...base,
        profile: { ...base.profile, fullName: s.fullName || base.profile.fullName },
        credentials: { ...base.credentials, licenseNumber: s.licenseNumber || base.credentials.licenseNumber, degree: s.credential || base.credentials.degree, specializations: s.specializations || base.credentials.specializations, verified: false },
        clinic: { ...base.clinic, name: s.clinic || base.clinic.name },
      };
    }
    return base;
  } catch { return defaultPracticeSettings; }
}

export function savePractice(next: PracticeSettings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("pc-practice-settings", { detail: next }));
}

export function usePractice(): [PracticeSettings, (patch: (s: PracticeSettings) => PracticeSettings) => void] {
  const [s, setS] = useState<PracticeSettings>(defaultPracticeSettings);
  useEffect(() => {
    setS(loadPractice());
    const onSync = (e: Event) => setS((e as CustomEvent<PracticeSettings>).detail);
    window.addEventListener("pc-practice-settings", onSync);
    return () => window.removeEventListener("pc-practice-settings", onSync);
  }, []);
  return [s, (patch) => setS((prev) => { const n = patch(prev); savePractice(n); return n; })];
}
