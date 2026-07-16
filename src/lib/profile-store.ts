// PeaceCode · Practice — Public marketing profile store.
// One clinician profile that renders as /p/$slug, with SEO metadata,
// availability snippet, credentials, specialties, testimonials, FAQ,
// and a "temporarily private" toggle that flips robots.
import { useSyncExternalStore } from "react";

export type Testimonial = {
  id: string;
  quote: string;
  attribution: string; // "S., adult client, Bengaluru"
  approved: boolean;
  addedAt: number;
};

export type FaqItem = { id: string; q: string; a: string };

export type Credential = { id: string; label: string; year?: number; verified: boolean };

export type Profile = {
  slug: string;
  displayName: string;
  pronouns: string;
  headline: string; // 60-100 chars
  bio: string; // long-form
  city: string;
  languages: string[];
  specialties: string[];
  modalities: string[];
  ageGroups: string[];
  sessionFormats: ("in_person" | "video" | "phone")[];
  feeRangeInr: [number, number];
  slidingScale: boolean;
  slidingScaleNote?: string;
  credentials: Credential[];
  photoInitials: string;
  photoBg: string; // hex
  testimonials: Testimonial[];
  faqs: FaqItem[];
  // SEO
  seoTitle: string; // <60
  seoDescription: string; // <160
  ogImageUrl?: string;
  jsonLdEnabled: boolean;
  // Discovery
  acceptingNew: boolean;
  waitlistLength: number;
  nextAvailability?: string; // "Mid-August"
  // Privacy
  temporarilyPrivate: boolean;
  temporarilyPrivateReason?: string;
  // Publishing state
  publishedAt?: number;
  lastEditedAt: number;
};

const KEY = "peacecode.therapist.profile.v1";
const listeners = new Set<() => void>();
let cachedProfile: Profile | null = null;
const serverProfile = seed();
const emit = () => listeners.forEach((f) => f());
const isBrowser = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

function seed(): Profile {
  const now = Date.now();
  return {
    slug: "aditi-rao",
    displayName: "Dr. Aditi Rao",
    pronouns: "she/her",
    headline: "Trauma-focused CBT for adults in Bengaluru & online across India",
    bio: `I'm a clinical psychologist with eight years of practice, working primarily with adults navigating trauma, anxiety, and the long tail of complicated grief.

My approach is integrative — cognitive-behavioural at the core, with EMDR for consolidated trauma work and ACT when values-based recommitment is what the moment asks for. I've completed advanced training with the EMDR Institute (Level 2) and hold IAP membership.

Sessions are 50 minutes, in-person at my Indiranagar clinic on Tuesdays and Thursdays, and over secure video the rest of the week. I take on new clients when I have room to do the work well — usually five to eight new intakes a quarter.`,
    city: "Bengaluru, KA",
    languages: ["English", "Hindi", "Kannada"],
    specialties: ["Trauma & PTSD", "Anxiety disorders", "Complicated grief", "Adjustment"],
    modalities: ["CBT", "EMDR", "ACT", "Compassion-focused"],
    ageGroups: ["Adults (25-40)", "Adults (40-60)"],
    sessionFormats: ["in_person", "video"],
    feeRangeInr: [2500, 3500],
    slidingScale: true,
    slidingScaleNote: "Two sliding-scale slots reserved per week for students and early-career clients.",
    credentials: [
      { id: "c1", label: "PhD Clinical Psychology, NIMHANS", year: 2018, verified: true },
      { id: "c2", label: "RCI Registered — CRR A-52341", year: 2018, verified: true },
      { id: "c3", label: "EMDR Institute Level 2", year: 2021, verified: true },
      { id: "c4", label: "IAP Member", year: 2019, verified: true },
    ],
    photoInitials: "AR",
    photoBg: "#2a3a2f",
    testimonials: [
      { id: "t1", quote: "Aditi held space with such steadiness. Six months in, I recognise myself again.", attribution: "R., adult client, Bengaluru", approved: true, addedAt: now - 60 * 86400000 },
      { id: "t2", quote: "Careful, evidence-based, never rushed. I felt seen as a whole person, not a case.", attribution: "S., adult client, remote", approved: true, addedAt: now - 40 * 86400000 },
      { id: "t3", quote: "The EMDR work changed something that talk therapy alone hadn't reached.", attribution: "M., adult client, Bengaluru", approved: true, addedAt: now - 20 * 86400000 },
    ],
    faqs: [
      { id: "f1", q: "How do sessions usually work?", a: "Standard sessions are 50 minutes. We meet weekly for the first two months, then move to fortnightly or as-needed once we've built momentum." },
      { id: "f2", q: "Do you take insurance?", a: "I don't work directly with insurance panels, but I provide detailed receipts and diagnostic codes that most Indian insurers will reimburse against outpatient mental-health coverage." },
      { id: "f3", q: "What if I need something urgent between sessions?", a: "Between-session contact for scheduling or brief clarifications is included. For clinical crises, I'll always name a specific escalation path — usually iCall, Vandrevala, or your nearest emergency department." },
      { id: "f4", q: "How do we know if we're a fit?", a: "The first session is diagnostic and orientational. If either of us thinks another clinician would fit better, I'll say so and offer three referrals from my peer network." },
    ],
    seoTitle: "Dr. Aditi Rao — Clinical Psychologist, Bengaluru",
    seoDescription: "Trauma-focused CBT, EMDR & ACT for adults. In-person in Indiranagar, online across India. RCI-registered. Book a first session.",
    ogImageUrl: undefined,
    jsonLdEnabled: true,
    acceptingNew: true,
    waitlistLength: 2,
    nextAvailability: "Mid-August",
    temporarilyPrivate: false,
    publishedAt: now - 120 * 86400000,
    lastEditedAt: now - 5 * 86400000,
  };
}

function readAll(): Profile {
  if (!isBrowser()) return serverProfile;
  if (cachedProfile) return cachedProfile;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      cachedProfile = JSON.parse(raw) as Profile;
      return cachedProfile;
    }
    const s = seed();
    window.localStorage.setItem(KEY, JSON.stringify(s));
    cachedProfile = s;
    return s;
  } catch {
    cachedProfile = seed();
    return cachedProfile;
  }
}
function writeAll(p: Profile) {
  cachedProfile = p;
  if (!isBrowser()) return;
  p.lastEditedAt = Date.now();
  window.localStorage.setItem(KEY, JSON.stringify(p));
  emit();
}
function subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }

export function getProfile(): Profile { return readAll(); }
export function getProfileBySlug(slug: string): Profile | undefined {
  const p = readAll();
  return p.slug === slug ? p : undefined;
}
export function updateProfile(patch: Partial<Profile>) {
  const p = readAll();
  Object.assign(p, patch);
  writeAll(p);
}
export function publish() {
  const p = readAll();
  p.publishedAt = Date.now();
  p.temporarilyPrivate = false;
  writeAll(p);
}
export function unpublishTemporarily(reason: string) {
  const p = readAll();
  p.temporarilyPrivate = true;
  p.temporarilyPrivateReason = reason;
  writeAll(p);
}
export function addTestimonial(t: Omit<Testimonial, "id" | "addedAt">) {
  const p = readAll();
  p.testimonials.push({ ...t, id: `t-${Date.now()}`, addedAt: Date.now() });
  writeAll(p);
}
export function removeTestimonial(id: string) {
  const p = readAll();
  p.testimonials = p.testimonials.filter((t) => t.id !== id);
  writeAll(p);
}
export function addFaq(q: string, a: string) {
  const p = readAll();
  p.faqs.push({ id: `f-${Date.now()}`, q, a });
  writeAll(p);
}
export function removeFaq(id: string) {
  const p = readAll();
  p.faqs = p.faqs.filter((f) => f.id !== id);
  writeAll(p);
}
export function useProfile(): Profile { return useSyncExternalStore(subscribe, getProfile, () => serverProfile); }

export function seoScore(p: Profile): { score: number; checks: { label: string; ok: boolean; hint?: string }[] } {
  const checks = [
    { label: "SEO title present and <60 chars", ok: p.seoTitle.length > 0 && p.seoTitle.length < 60, hint: `${p.seoTitle.length} chars` },
    { label: "Meta description 120-160 chars", ok: p.seoDescription.length >= 120 && p.seoDescription.length <= 160, hint: `${p.seoDescription.length} chars` },
    { label: "Headline names discipline + specialty", ok: /(psycholog|therap|counsell|clinician)/i.test(p.headline) && p.specialties.length > 0 },
    { label: "Bio is at least 400 characters", ok: p.bio.length >= 400, hint: `${p.bio.length} chars` },
    { label: "At least 3 credentials listed", ok: p.credentials.length >= 3 },
    { label: "At least 3 FAQs (Rich Results eligible)", ok: p.faqs.length >= 3 },
    { label: "Testimonials attributed (not full names)", ok: p.testimonials.every((t) => /,/.test(t.attribution)) },
    { label: "JSON-LD Person schema enabled", ok: p.jsonLdEnabled },
    { label: "Slug is short, lowercase, no dashes-mid-word", ok: /^[a-z0-9-]{3,32}$/.test(p.slug) },
  ];
  const score = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100);
  return { score, checks };
}
