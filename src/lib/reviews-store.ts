// PeaceCode · Practice — Reviews & feedback store.
import { useSyncExternalStore } from "react";
import { listPatients } from "@/lib/patients-store";

export type Review = {
  id: string;
  patientId: string;
  patientName: string;
  rating: number; // 1-5
  at: number;
  channel: "post_session" | "monthly" | "public";
  session?: string;
  headline: string;
  body: string;
  helpful: { warmth: number; clarity: number; pace: number; outcome: number }; // 1-5 sub-scores
  tags: string[];
  status: "new" | "acknowledged" | "responded" | "flagged";
  response?: { body: string; at: number };
  visibility: "private" | "public";
};

const KEY = "peacecode.therapist.reviews.v1";
const bus = new EventTarget();
let cache: Review[] | null = null;

const HEADLINES = [
  "Felt genuinely heard for the first time",
  "Practical, warm, and never rushed",
  "Structured but human — helped me sleep again",
  "Held space for the hard stuff",
  "Homework actually stuck this time",
  "First therapist who tracked my mood between weeks",
  "Direct feedback without judgement",
  "Notes and next steps came clearly by email",
  "Rescheduling was easy, sessions started on time",
  "I ended each session with something to try",
];
const TAG_POOL = ["warm", "structured", "practical", "on-time", "clear-plan", "empathetic", "direct", "professional", "responsive"];

function seed(): Review[] {
  const pats = listPatients();
  const day = 86_400_000;
  const now = Date.now();
  const out: Review[] = [];
  pats.slice(0, 9).forEach((p, i) => {
    const rating = i === 2 ? 3 : i === 7 ? 4 : 5;
    out.push({
      id: `rev_${i + 1}`,
      patientId: p.id,
      patientName: p.preferredName ?? p.fullName.split(" ")[0],
      rating,
      at: now - (i * 3 + 1) * day,
      channel: i % 3 === 0 ? "public" : "post_session",
      headline: HEADLINES[i % HEADLINES.length],
      body:
        rating >= 5
          ? "Sessions have a clear rhythm — check-in, one thing to work on, and something concrete to take away. I actually look forward to Tuesday."
          : rating === 4
          ? "Really helpful overall. The pace felt right for me. One session felt a bit hurried near the end but the follow-up email covered it."
          : "It's been useful, but I wish we spent more time on the anxiety pattern I raised. Homework felt heavy this month.",
      helpful: {
        warmth: Math.min(5, rating),
        clarity: Math.min(5, rating - (i % 2)),
        pace: Math.min(5, rating - ((i + 1) % 2)),
        outcome: Math.max(2, rating - 1),
      },
      tags: [TAG_POOL[i % TAG_POOL.length], TAG_POOL[(i + 3) % TAG_POOL.length]],
      status: i === 2 ? "flagged" : i < 3 ? "new" : i < 6 ? "acknowledged" : "responded",
      response:
        i >= 6
          ? { body: "Thank you for taking the time — I'll bring the pacing note into our next review.", at: now - i * day + 3600_000 }
          : undefined,
      visibility: i % 3 === 0 ? "public" : "private",
    });
  });
  return out;
}

function read(): Review[] {
  if (cache) return cache;
  if (typeof window === "undefined") { cache = seed(); return cache; }
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) { cache = JSON.parse(raw) as Review[]; return cache; }
  } catch {}
  cache = seed();
  write(cache);
  return cache;
}
function write(next: Review[]) {
  cache = next;
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  bus.dispatchEvent(new Event("change"));
}
function subscribe(cb: () => void) {
  const on = () => cb();
  bus.addEventListener("change", on);
  return () => bus.removeEventListener("change", on);
}

export function useReviews(): Review[] {
  return useSyncExternalStore(subscribe, read, read);
}

export function respondToReview(id: string, body: string) {
  write(read().map((r) => (r.id === id ? { ...r, status: "responded", response: { body, at: Date.now() } } : r)));
}
export function acknowledgeReview(id: string) {
  write(read().map((r) => (r.id === id ? { ...r, status: "acknowledged" } : r)));
}
export function flagReview(id: string) {
  write(read().map((r) => (r.id === id ? { ...r, status: "flagged" } : r)));
}
export function toggleVisibility(id: string) {
  write(read().map((r) => (r.id === id ? { ...r, visibility: r.visibility === "public" ? "private" : "public" } : r)));
}
