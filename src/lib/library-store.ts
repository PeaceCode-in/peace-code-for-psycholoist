// PeaceCode · Practice — Content Library store.
// Pieces (articles, worksheets, guides, video, podcast), series,
// versions, analytics events, audience flags, publication state.
// localStorage-backed with an event bus.

import { useSyncExternalStore } from "react";

// ─── Types ───────────────────────────────────────────────────
export type PieceFormat = "Article" | "Worksheet" | "Guide" | "Video" | "Podcast" | "Talk" | "Presentation" | "Announcement";
export type PieceStatus = "draft" | "in_review" | "scheduled" | "published" | "archived";
export type PieceAudience = "public" | "patients" | "students" | "team";
export type PieceCategory =
  | "Anxiety" | "Depression" | "Relationships" | "Life transitions"
  | "Sleep" | "Trauma" | "Growth" | "Practice announcements";

export type Block =
  | { id: string; type: "h2" | "h3"; text: string }
  | { id: string; type: "p"; text: string }
  | { id: string; type: "quote"; text: string; by?: string }
  | { id: string; type: "pull"; text: string }
  | { id: string; type: "callout"; kind: "info" | "caution"; text: string }
  | { id: string; type: "image"; src: string; caption?: string; alt: string }
  | { id: string; type: "video"; src: string; caption?: string }
  | { id: string; type: "audio"; src: string; caption?: string }
  | { id: string; type: "reference"; author: string; title: string; year: number; url?: string };

export type PieceVersion = { id: string; at: number; label: string; blocks: Block[]; title: string };

export type PieceAnalytics = { views: number; completions: number; avgScrollPct: number; shares: number; helpful: number };

export type Piece = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  format: PieceFormat;
  status: PieceStatus;
  audience: PieceAudience;
  category: PieceCategory;
  seriesId?: string;
  tags: string[];
  coverImage?: string;
  metaTitle?: string;
  metaDescription?: string;
  blocks: Block[];
  featured: boolean;
  scheduledFor?: number;
  publishedAt?: number;
  createdAt: number;
  updatedAt: number;
  versions: PieceVersion[];
  analytics: PieceAnalytics;
  worksheetPdfUrl?: string;
};

export type Series = {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImage?: string;
  createdAt: number;
};

export type LibraryState = { pieces: Piece[]; series: Series[] };

const KEY = "peacecode.library.v1";
const listeners = new Set<() => void>();
let cache: LibraryState | null = null;

function seed(): LibraryState {
  const now = Date.now();
  const day = 86_400_000;
  const mkId = () => Math.random().toString(36).slice(2, 10);

  const series: Series[] = [
    { id: "sr-anx", slug: "understanding-anxiety", title: "Understanding anxiety", description: "A four-part guide for people who suspect they've been anxious longer than they realized.", createdAt: now - 90 * day },
    { id: "sr-plc", slug: "placement-season", title: "Placement season survival guide", description: "For final-year students staring down interview slates and moving cities. Written from the therapist's chair, not a coach's.", createdAt: now - 60 * day },
  ];

  const P = (o: Partial<Piece> & Pick<Piece, "title" | "format" | "category" | "audience" | "status">): Piece => ({
    id: mkId(), slug: o.slug ?? o.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    title: o.title, subtitle: o.subtitle, format: o.format, status: o.status,
    audience: o.audience, category: o.category, seriesId: o.seriesId, tags: o.tags ?? [],
    coverImage: o.coverImage, metaTitle: o.metaTitle ?? o.title, metaDescription: o.metaDescription ?? "",
    blocks: o.blocks ?? [], featured: o.featured ?? false, scheduledFor: o.scheduledFor,
    publishedAt: o.publishedAt, createdAt: o.createdAt ?? now, updatedAt: o.updatedAt ?? now,
    versions: o.versions ?? [], analytics: o.analytics ?? { views: 0, completions: 0, avgScrollPct: 0, shares: 0, helpful: 0 },
    worksheetPdfUrl: o.worksheetPdfUrl,
  });

  const b = (blocks: Block[]): Block[] => blocks.map((x, i) => ({ ...x, id: `b-${i}-${mkId()}` }));

  const pieces: Piece[] = [
    P({
      title: "Understanding anxiety — a working definition",
      slug: "understanding-anxiety-a-working-definition",
      subtitle: "Part one of four. Where the word came from, and what most people miss.",
      format: "Article", category: "Anxiety", audience: "public", status: "published",
      seriesId: "sr-anx", featured: true, tags: ["anxiety", "primer"],
      metaDescription: "A therapist's working definition of anxiety — where the word came from, and why most first-line advice sits on the wrong end of it.",
      publishedAt: now - 42 * day, createdAt: now - 55 * day, updatedAt: now - 42 * day,
      analytics: { views: 4211, completions: 2103, avgScrollPct: 78, shares: 42, helpful: 168 },
      blocks: b([
        { type: "p", text: "Anxiety is often treated as a volume knob on fear. Turn it down and you're calm. That framing is convenient and, in most cases, wrong. Fear responds to a specific thing. Anxiety responds to a shape you can't quite see yet.", id: "" },
        { type: "h2", text: "Where the word came from", id: "" },
        { type: "p", text: "The Latin angere meant to choke, to press narrow. Not to be afraid — to feel walls closing. That's a better starting point than any DSM criterion, because it tells you why the body reads it as urgent.", id: "" },
        { type: "quote", text: "You don't get anxious because something bad will happen. You get anxious because you can't tell yet whether it will.", by: "Alicia Krieger", id: "" },
        { type: "h2", text: "Why deep breaths sometimes make it worse", id: "" },
        { type: "p", text: "The autonomic nervous system doesn't read intentions; it reads inputs. A person told to breathe deeply while their thoughts are still racing often over-oxygenates, feels dizzier, and reads that dizziness as more evidence of danger. The intervention was correct in isolation. The order was wrong.", id: "" },
        { type: "callout", kind: "info", text: "Pace before depth. Slower first, deeper second — never the reverse.", id: "" },
        { type: "reference", author: "Barlow, D. H.", title: "Anxiety and its disorders (2nd ed.)", year: 2002, id: "" },
      ]),
    }),
    P({
      title: "Grief in your twenties",
      slug: "grief-in-your-twenties",
      subtitle: "The losses no one warns you about, and the ones you have to name yourself.",
      format: "Article", category: "Life transitions", audience: "public", status: "published",
      featured: true, tags: ["grief", "twenties"],
      metaDescription: "Grief in your twenties often isn't for someone who died. Naming what you're actually mourning is where the work starts.",
      publishedAt: now - 21 * day, createdAt: now - 30 * day, updatedAt: now - 21 * day,
      analytics: { views: 6890, completions: 3512, avgScrollPct: 82, shares: 118, helpful: 342 },
      blocks: b([
        { type: "p", text: "Most twenty-somethings who come in describing grief are not grieving a person. They're grieving a version of themselves they thought they'd be by now. That grief is quieter, and less socially legible, which is exactly why it lingers longer.", id: "" },
        { type: "h2", text: "The unnamed losses", id: "" },
        { type: "p", text: "A friendship that never got a fight, just a slow silence. A city you moved for that never gave you the life the move implied. A parent whose approval you finally stopped waiting for — a relief and a small funeral at once.", id: "" },
        { type: "pull", text: "You're allowed to mourn a life that never technically began.", id: "" },
        { type: "h3", text: "What helps", id: "" },
        { type: "p", text: "Say the specific thing out loud. Not to a therapist first, necessarily — to yourself, to a walk, to a piece of paper. Naming is not resolution, but ambiguity is what makes this kind of grief sit in the chest indefinitely.", id: "" },
      ]),
    }),
    P({
      title: "Why sleep is therapy's silent partner",
      slug: "why-sleep-is-therapys-silent-partner",
      format: "Article", category: "Sleep", audience: "public", status: "published",
      tags: ["sleep", "cbt-i"],
      metaDescription: "The night before a session shapes the session. A short piece on why sleep is doing more of the work than most therapies acknowledge.",
      publishedAt: now - 12 * day, createdAt: now - 20 * day, updatedAt: now - 12 * day,
      analytics: { views: 2044, completions: 1211, avgScrollPct: 74, shares: 22, helpful: 89 },
      blocks: b([
        { type: "p", text: "A patient who slept four hours the night before rarely has a productive session — not because they can't focus, but because the emotional register they'd normally have access to is flat. You can talk about the same problem and it will feel further away.", id: "" },
        { type: "h2", text: "What we ask before every session, quietly", id: "" },
        { type: "p", text: "Not aloud, most of the time. But if a session is stuck, the first place to look is usually the last three nights, not the last three years.", id: "" },
      ]),
    }),
    P({
      title: "What CBT actually is",
      slug: "what-cbt-actually-is",
      format: "Article", category: "Growth", audience: "public", status: "published",
      tags: ["cbt", "primer"],
      metaDescription: "A short honest description of cognitive behavioural therapy — what it does, what it doesn't, and who it isn't for.",
      publishedAt: now - 6 * day, createdAt: now - 10 * day, updatedAt: now - 6 * day,
      analytics: { views: 1188, completions: 702, avgScrollPct: 71, shares: 14, helpful: 51 },
      blocks: b([
        { type: "p", text: "CBT is not thinking positively. It's noticing the specific sentence your mind hands you in a specific situation, and asking whether that sentence is doing you any favours.", id: "" },
        { type: "h2", text: "What it doesn't do", id: "" },
        { type: "p", text: "It doesn't dig for childhood roots. It doesn't sit long with feelings. If those are what you need, CBT will feel thin — and that's a good signal, not a failure.", id: "" },
      ]),
    }),
    // Worksheets
    P({
      title: "Thought record starter",
      slug: "thought-record-starter",
      format: "Worksheet", category: "Anxiety", audience: "patients", status: "published",
      tags: ["cbt", "worksheet"], featured: true,
      metaDescription: "A simple thought record you can carry in your pocket. Two columns, one prompt.",
      publishedAt: now - 40 * day, createdAt: now - 45 * day, updatedAt: now - 40 * day,
      worksheetPdfUrl: "/pdf/thought-record.pdf",
      analytics: { views: 812, completions: 0, avgScrollPct: 0, shares: 41, helpful: 96 },
      blocks: b([
        { type: "p", text: "Print this, or use it in a notes app. Two columns: what happened, and what your mind said about it. That's the whole exercise for week one.", id: "" },
      ]),
    }),
    P({
      title: "Sleep hygiene checklist",
      slug: "sleep-hygiene-checklist",
      format: "Worksheet", category: "Sleep", audience: "patients", status: "published",
      tags: ["sleep", "worksheet"],
      publishedAt: now - 25 * day, createdAt: now - 28 * day, updatedAt: now - 25 * day,
      worksheetPdfUrl: "/pdf/sleep-hygiene.pdf",
      analytics: { views: 604, completions: 0, avgScrollPct: 0, shares: 18, helpful: 44 },
      blocks: b([{ type: "p", text: "Twelve items. Pick three. Not all twelve. That's the whole trick — sleep hygiene fails when it becomes another performance.", id: "" }]),
    }),
    P({
      title: "Weekly reflection prompts",
      slug: "weekly-reflection-prompts",
      format: "Worksheet", category: "Growth", audience: "patients", status: "published",
      tags: ["reflection", "worksheet"],
      publishedAt: now - 15 * day, createdAt: now - 18 * day, updatedAt: now - 15 * day,
      worksheetPdfUrl: "/pdf/weekly-reflection.pdf",
      analytics: { views: 341, completions: 0, avgScrollPct: 0, shares: 9, helpful: 22 },
      blocks: b([{ type: "p", text: "Five prompts. Ten minutes on a Sunday. That's it.", id: "" }]),
    }),
    // Guides
    P({
      title: "First time in therapy — what to expect",
      slug: "first-time-in-therapy",
      format: "Guide", category: "Growth", audience: "public", status: "published",
      tags: ["intake", "orientation"], featured: true,
      metaDescription: "An honest orientation to your first therapy session — what the room feels like, what to bring, and what not to worry about.",
      publishedAt: now - 70 * day, createdAt: now - 78 * day, updatedAt: now - 70 * day,
      analytics: { views: 9101, completions: 5211, avgScrollPct: 88, shares: 201, helpful: 512 },
      blocks: b([
        { type: "p", text: "You will not be asked to describe your childhood in the first ten minutes. You will probably be asked what made you pick up the phone this month. Come with that answer, however partial.", id: "" },
      ]),
    }),
    P({
      title: "Preparing for an intake session",
      slug: "preparing-for-an-intake-session",
      format: "Guide", category: "Growth", audience: "patients", status: "published",
      tags: ["intake"],
      publishedAt: now - 33 * day, createdAt: now - 40 * day, updatedAt: now - 33 * day,
      analytics: { views: 2410, completions: 1802, avgScrollPct: 85, shares: 44, helpful: 118 },
      blocks: b([{ type: "p", text: "Bring one specific example. Not the biggest example — a specific one. Specificity is what lets us work.", id: "" }]),
    }),
    // Video
    P({
      title: "A 5-minute grounding exercise",
      slug: "five-minute-grounding-exercise",
      format: "Video", category: "Anxiety", audience: "public", status: "published",
      tags: ["grounding", "video"],
      metaDescription: "A five-minute grounding exercise you can do at your desk without anyone noticing.",
      publishedAt: now - 50 * day, createdAt: now - 55 * day, updatedAt: now - 50 * day,
      analytics: { views: 12030, completions: 8412, avgScrollPct: 95, shares: 380, helpful: 901 },
      blocks: b([{ type: "video", src: "https://www.youtube.com/embed/dQw4w9WgXcQ", caption: "Five minutes. Eyes open. No incense required.", id: "" }]),
    }),
    // Podcast
    P({
      title: "Talking with a psychiatrist about medication",
      slug: "talking-with-a-psychiatrist-about-medication",
      format: "Podcast", category: "Depression", audience: "public", status: "published",
      tags: ["medication", "podcast"],
      metaDescription: "An honest 40-minute conversation with a psychiatrist about starting, staying on, and coming off antidepressants.",
      publishedAt: now - 18 * day, createdAt: now - 22 * day, updatedAt: now - 18 * day,
      analytics: { views: 3210, completions: 2018, avgScrollPct: 76, shares: 78, helpful: 201 },
      blocks: b([{ type: "audio", src: "https://example.com/podcast/ep-04.mp3", caption: "Episode 4 · 42 min", id: "" }]),
    }),
    // Series 2 pieces
    P({
      title: "Placement season — a preface",
      slug: "placement-season-preface",
      format: "Article", category: "Life transitions", audience: "students", status: "published",
      seriesId: "sr-plc", tags: ["placement", "students"],
      metaDescription: "Why placement season leaves so many students flat — and why the flat feeling is data, not weakness.",
      publishedAt: now - 55 * day, createdAt: now - 60 * day, updatedAt: now - 55 * day,
      analytics: { views: 1440, completions: 812, avgScrollPct: 79, shares: 33, helpful: 108 },
      blocks: b([{ type: "p", text: "Placement season is the first time many of you will be evaluated on things you don't control. That is worth naming before it happens, not after.", id: "" }]),
    }),
    P({
      title: "Interview weeks — sleep, not slides",
      slug: "interview-weeks-sleep-not-slides",
      format: "Article", category: "Life transitions", audience: "students", status: "published",
      seriesId: "sr-plc", tags: ["placement", "sleep"],
      publishedAt: now - 45 * day, createdAt: now - 50 * day, updatedAt: now - 45 * day,
      analytics: { views: 902, completions: 511, avgScrollPct: 74, shares: 12, helpful: 41 },
      blocks: b([{ type: "p", text: "The delta between an okay interview and a good one is almost never one more revision of the deck. It's the six hours of sleep you traded for that revision.", id: "" }]),
    }),
    P({
      title: "After the offer — or after there isn't one",
      slug: "after-the-offer",
      format: "Article", category: "Life transitions", audience: "students", status: "published",
      seriesId: "sr-plc", tags: ["placement"],
      publishedAt: now - 30 * day, createdAt: now - 35 * day, updatedAt: now - 30 * day,
      analytics: { views: 611, completions: 402, avgScrollPct: 81, shares: 8, helpful: 34 },
      blocks: b([{ type: "p", text: "Both outcomes need a small ritual. Not celebration, not consolation — a marker. Otherwise the week bleeds into the next one and you never get to leave.", id: "" }]),
    }),
    // Announcements
    P({
      title: "A new anxiety group starts in March",
      slug: "new-anxiety-group-march",
      format: "Announcement", category: "Practice announcements", audience: "public", status: "published",
      tags: ["group", "announcement"],
      metaDescription: "Eight weeks, six people, one Wednesday evening. Applications open through the end of February.",
      publishedAt: now - 8 * day, createdAt: now - 10 * day, updatedAt: now - 8 * day,
      analytics: { views: 812, completions: 610, avgScrollPct: 90, shares: 41, helpful: 22 },
      blocks: b([{ type: "p", text: "Small group format, eight weeks, Wednesday evenings. If you've been on a waitlist for one-on-one work, this is often a better first step than we let on.", id: "" }]),
    }),
    P({
      title: "Summer availability — reduced hours in June",
      slug: "summer-availability-june",
      format: "Announcement", category: "Practice announcements", audience: "public", status: "published",
      tags: ["announcement"],
      publishedAt: now - 4 * day, createdAt: now - 5 * day, updatedAt: now - 4 * day,
      analytics: { views: 402, completions: 380, avgScrollPct: 96, shares: 6, helpful: 11 },
      blocks: b([{ type: "p", text: "Between June 10 and June 24, sessions run only Monday and Wednesday. Existing weekly patients will be contacted directly.", id: "" }]),
    }),
    P({
      title: "PeaceCode goes live",
      slug: "peacecode-launch",
      format: "Announcement", category: "Practice announcements", audience: "public", status: "published",
      tags: ["announcement", "peacecode"], featured: true,
      metaDescription: "A short note on why this practice moved to PeaceCode, and what changes for existing patients (very little).",
      publishedAt: now - 2 * day, createdAt: now - 3 * day, updatedAt: now - 2 * day,
      analytics: { views: 1802, completions: 1601, avgScrollPct: 92, shares: 88, helpful: 42 },
      blocks: b([{ type: "p", text: "You'll book the same way. Sessions run the same way. What's new lives behind the scenes — cleaner notes, better continuity, less waiting on receipts.", id: "" }]),
    }),
    // Draft
    P({
      title: "On being underslept and overworked in your first job",
      slug: "underslept-overworked-first-job",
      format: "Article", category: "Growth", audience: "public", status: "draft",
      tags: ["work", "draft"],
      metaDescription: "",
      analytics: { views: 0, completions: 0, avgScrollPct: 0, shares: 0, helpful: 0 },
      blocks: b([{ type: "p", text: "Draft — first pass, not shareable yet.", id: "" }]),
    }),
  ];

  return { pieces, series };
}

function read(): LibraryState {
  if (cache) return cache;
  if (typeof window === "undefined") { cache = seed(); return cache; }
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { cache = JSON.parse(raw); return cache!; }
  } catch { /* ignore */ }
  cache = seed();
  try { localStorage.setItem(KEY, JSON.stringify(cache)); } catch { /* ignore */ }
  return cache;
}

function write(s: LibraryState) {
  cache = s;
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) { listeners.add(l); return () => { listeners.delete(l); }; }

// ─── Selectors ───────────────────────────────────────────────
export function listPieces(): Piece[] { return read().pieces.slice().sort((a, b) => (b.updatedAt - a.updatedAt)); }
export function listPublishedPublic(): Piece[] {
  return read().pieces.filter((p) => p.status === "published" && p.audience === "public").sort((a, b) => (b.publishedAt ?? 0) - (a.publishedAt ?? 0));
}
export function getPiece(id: string): Piece | undefined { return read().pieces.find((p) => p.id === id); }
export function getPieceBySlug(slug: string): Piece | undefined { return read().pieces.find((p) => p.slug === slug); }
export function listSeries(): Series[] { return read().series; }
export function getSeries(id: string): Series | undefined { return read().series.find((s) => s.id === id); }
export function getSeriesBySlug(slug: string): Series | undefined { return read().series.find((s) => s.slug === slug); }
export function piecesInSeries(id: string): Piece[] { return read().pieces.filter((p) => p.seriesId === id).sort((a, b) => (a.publishedAt ?? 0) - (b.publishedAt ?? 0)); }
export function featuredPieces(): Piece[] { return read().pieces.filter((p) => p.featured && p.status === "published"); }

// ─── Mutations ───────────────────────────────────────────────
export function createPiece(input: Partial<Piece> & Pick<Piece, "title" | "format">): Piece {
  const s = read();
  const now = Date.now();
  const p: Piece = {
    id: Math.random().toString(36).slice(2, 10),
    slug: (input.slug ?? input.title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    title: input.title, subtitle: input.subtitle, format: input.format,
    status: input.status ?? "draft", audience: input.audience ?? "public",
    category: input.category ?? "Growth", seriesId: input.seriesId, tags: input.tags ?? [],
    coverImage: input.coverImage, metaTitle: input.metaTitle ?? input.title,
    metaDescription: input.metaDescription ?? "", blocks: input.blocks ?? [{ id: "b0", type: "p", text: "" }],
    featured: false, publishedAt: undefined, createdAt: now, updatedAt: now,
    versions: [], analytics: { views: 0, completions: 0, avgScrollPct: 0, shares: 0, helpful: 0 },
  };
  write({ ...s, pieces: [p, ...s.pieces] });
  return p;
}

export function updatePiece(id: string, patch: Partial<Piece>) {
  const s = read();
  write({ ...s, pieces: s.pieces.map((p) => p.id === id ? { ...p, ...patch, updatedAt: Date.now() } : p) });
}

export function snapshotVersion(id: string, label = "Autosave") {
  const s = read();
  const p = s.pieces.find((x) => x.id === id);
  if (!p) return;
  const v: PieceVersion = { id: Math.random().toString(36).slice(2, 9), at: Date.now(), label, blocks: p.blocks, title: p.title };
  write({ ...s, pieces: s.pieces.map((x) => x.id === id ? { ...x, versions: [v, ...x.versions].slice(0, 30) } : x) });
}

export function publishPiece(id: string) {
  const now = Date.now();
  const s = read();
  write({ ...s, pieces: s.pieces.map((p) => p.id === id ? { ...p, status: "published", publishedAt: p.publishedAt ?? now, updatedAt: now } : p) });
}
export function unpublishPiece(id: string) { updatePiece(id, { status: "draft" }); }
export function schedulePiece(id: string, at: number) { updatePiece(id, { status: "scheduled", scheduledFor: at }); }
export function archivePiece(id: string) { updatePiece(id, { status: "archived" }); }
export function toggleFeatured(id: string) {
  const p = getPiece(id); if (!p) return;
  updatePiece(id, { featured: !p.featured });
}
export function deletePiece(id: string) {
  const s = read();
  write({ ...s, pieces: s.pieces.filter((p) => p.id !== id) });
}
export function trackView(id: string) {
  const s = read();
  write({ ...s, pieces: s.pieces.map((p) => p.id === id ? { ...p, analytics: { ...p.analytics, views: p.analytics.views + 1 } } : p) });
}
export function markHelpful(id: string) {
  const s = read();
  write({ ...s, pieces: s.pieces.map((p) => p.id === id ? { ...p, analytics: { ...p.analytics, helpful: p.analytics.helpful + 1 } } : p) });
}

// ─── Text helpers ────────────────────────────────────────────
export function readingTimeMin(blocks: Block[]): number {
  const text = blocks.map((b) => ("text" in b ? b.text : "")).join(" ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
export function wordCount(blocks: Block[]): number {
  return blocks.map((b) => ("text" in b ? b.text : "")).join(" ").split(/\s+/).filter(Boolean).length;
}
export function excerpt(blocks: Block[], n = 180): string {
  const first = blocks.find((b) => b.type === "p") as Extract<Block, { type: "p" }> | undefined;
  const t = first?.text ?? "";
  return t.length > n ? t.slice(0, n).trimEnd() + "…" : t;
}
export function outline(blocks: Block[]): Array<{ level: 2 | 3; text: string; id: string }> {
  return blocks.filter((b) => b.type === "h2" || b.type === "h3").map((b) => ({ level: b.type === "h2" ? 2 : 3, text: (b as { text: string }).text, id: b.id }));
}

// ─── Hooks ───────────────────────────────────────────────────
export function useLibrary(): LibraryState {
  return useSyncExternalStore(subscribe, read, read);
}
export function useLivePieces(): Piece[] {
  useSyncExternalStore(subscribe, read, read);
  return listPieces();
}
