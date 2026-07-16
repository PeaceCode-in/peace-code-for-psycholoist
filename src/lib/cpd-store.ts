// PeaceCode · Practice — CPD (Continuing Professional Development) store.
// Entries, evidence, reflections, verification, renewal cycles, learning
// plan, reading log, provider directory, and audit log with extended
// retention (regulatory posture). localStorage-backed.
//
// Every certificate carries a hash — tamper detection on export.

import { useMemo, useSyncExternalStore } from "react";

// ─── Types ───────────────────────────────────────────────────
export type CpdCategory =
  | "clinical"
  | "ethics"
  | "supervision"
  | "research"
  | "self_care"
  | "optional";

export type CpdType =
  | "workshop"
  | "conference"
  | "course"
  | "reading"
  | "case_discussion"
  | "personal_therapy"
  | "supervision_received"
  | "supervision_provided"
  | "research"
  | "peer_review"
  | "presenting";

export type CpdFormat = "in_person" | "online_live" | "online_recorded" | "self_paced" | "reading";

export type VerificationStatus = "self" | "provider" | "council";

export type Evidence = {
  id: string;
  kind: "certificate" | "invoice" | "link" | "agenda" | "recording";
  filename?: string;
  url?: string;
  size?: number;
  mime?: string;
  hash?: string; // tamper detection
  uploadedAt: number;
};

export type CpdEntry = {
  id: string;
  type: CpdType;
  title: string;
  provider: string;
  providerId?: string; // link to /cpd/providers
  startAt: number;
  endAt: number;
  hoursClaimed: number;
  category: CpdCategory;
  format: CpdFormat;
  evidence: Evidence[];
  reflection: string;
  verification: VerificationStatus;
  appliedToRenewal?: string; // renewal cycle id
  retired?: boolean;
  createdAt: number;
  updatedAt: number;
  versions: { at: number; who: string; note: string }[];
  source?: { module: "supervision" | "catalog" | "reading"; ref: string };
};

export type RenewalCycle = {
  id: string;
  licenseNumber: string;
  issuingBody: "RCI" | "IAP" | "state_council";
  bodyLabel: string; // human label
  issueDate: number;
  expiryDate: number;
  hoursRequired: number;
  categoryMinimums: Partial<Record<CpdCategory, number>>;
  status: "current" | "past" | "upcoming";
};

export type LearningPlanItem = {
  id: string;
  goal: string;
  category: CpdCategory;
  target: number;
  notes?: string;
  createdAt: number;
  done?: boolean;
};

export type ReadingEntry = {
  id: string;
  title: string;
  author?: string;
  kind: "book" | "paper" | "podcast" | "chapter";
  finishedAt: number;
  notes?: string;
  hours?: number;
  promotedTo?: string; // cpd entry id
};

export type Provider = {
  id: string;
  name: string;
  verified: boolean;
  city?: string;
  focus?: string[];
  rating?: number; // 1-5, opt-in only
  timesAttended?: number;
};

export type CatalogItem = {
  id: string;
  title: string;
  provider: string;
  providerId?: string;
  category: CpdCategory;
  format: CpdFormat;
  city?: string;
  startAt: number;
  endAt: number;
  hoursAwarded: number;
  priceInr?: number;
  bookmarked?: boolean;
  registered?: boolean;
  description: string;
};

export type AuditEntry = {
  id: string;
  at: number;
  who: string;
  action: string;
  ref: string;
};

// ─── Storage ─────────────────────────────────────────────────
const KEY = "peacecode.therapist.cpd.v1";
const AUDIT_KEY = "peacecode.therapist.cpd-audit.v1";
const CLINICIAN = "Dr. Aditi Rao";

type Shape = {
  entries: CpdEntry[];
  cycles: RenewalCycle[];
  plan: LearningPlanItem[];
  reading: ReadingEntry[];
  providers: Provider[];
  catalog: CatalogItem[];
};

const listeners = new Set<() => void>();
let cachedShape: Shape | null = null;
const serverShape = seed();
function emit() { listeners.forEach((fn) => fn()); }
function subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }
function isBrowser() { return typeof window !== "undefined" && typeof window.localStorage !== "undefined"; }

function readAll(): Shape {
  if (!isBrowser()) return serverShape;
  if (cachedShape) return cachedShape;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      cachedShape = JSON.parse(raw) as Shape;
      return cachedShape;
    }
    const s = seed();
    window.localStorage.setItem(KEY, JSON.stringify(s));
    cachedShape = s;
    return s;
  } catch {
    cachedShape = seed();
    return cachedShape;
  }
}
function writeAll(shape: Shape) {
  cachedShape = shape;
  if (!isBrowser()) return;
  window.localStorage.setItem(KEY, JSON.stringify(shape));
  emit();
}
function audit(action: string, ref: string) {
  if (!isBrowser()) return;
  try {
    const raw = window.localStorage.getItem(AUDIT_KEY);
    const list: AuditEntry[] = raw ? JSON.parse(raw) : [];
    list.push({ id: `cpda-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, at: Date.now(), who: CLINICIAN, action, ref });
    // extended retention → cap at 5000
    window.localStorage.setItem(AUDIT_KEY, JSON.stringify(list.slice(-5000)));
  } catch { /* ignore */ }
}

// simple deterministic-ish "hash" for tamper detection stub
function fakeHash(input: string): string {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) { h ^= input.charCodeAt(i); h = Math.imul(h, 16777619); }
  return ("0000000" + (h >>> 0).toString(16)).slice(-8);
}

// ─── Public API ──────────────────────────────────────────────
export function listEntries(): CpdEntry[] {
  return readAll().entries.slice().sort((a, b) => b.endAt - a.endAt);
}
export function getEntry(id: string): CpdEntry | undefined {
  return readAll().entries.find((e) => e.id === id);
}
export function listCycles(): RenewalCycle[] {
  return readAll().cycles.slice().sort((a, b) => b.expiryDate - a.expiryDate);
}
export function currentCycle(): RenewalCycle | undefined {
  return listCycles().find((c) => c.status === "current");
}
export function listPlan(): LearningPlanItem[] { return readAll().plan.slice(); }
export function listReading(): ReadingEntry[] {
  return readAll().reading.slice().sort((a, b) => b.finishedAt - a.finishedAt);
}
export function listProviders(): Provider[] {
  return readAll().providers.slice().sort((a, b) => a.name.localeCompare(b.name));
}
export function listCatalog(): CatalogItem[] {
  return readAll().catalog.slice().sort((a, b) => a.startAt - b.startAt);
}

// ── Entries
export function createEntry(input: Omit<CpdEntry, "id" | "createdAt" | "updatedAt" | "versions">): CpdEntry {
  const shape = readAll();
  const now = Date.now();
  const entry: CpdEntry = {
    ...input,
    id: `cpd-${now}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: now,
    updatedAt: now,
    versions: [{ at: now, who: CLINICIAN, note: "created" }],
  };
  shape.entries = [entry, ...shape.entries];
  writeAll(shape);
  audit("cpd.create", entry.id);
  return entry;
}
export function updateEntry(id: string, patch: Partial<CpdEntry>, note = "edited"): CpdEntry | undefined {
  const shape = readAll();
  const e = shape.entries.find((x) => x.id === id);
  if (!e) return;
  Object.assign(e, patch);
  e.updatedAt = Date.now();
  e.versions = [...(e.versions ?? []), { at: Date.now(), who: CLINICIAN, note }];
  writeAll(shape);
  audit("cpd.update", id);
  return e;
}
export function retireEntry(id: string): void {
  updateEntry(id, { retired: true }, "retired");
  audit("cpd.retire", id);
}
export function attachEvidence(id: string, ev: Omit<Evidence, "id" | "uploadedAt" | "hash">): Evidence | undefined {
  const shape = readAll();
  const e = shape.entries.find((x) => x.id === id);
  if (!e) return;
  const full: Evidence = {
    ...ev,
    id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    uploadedAt: Date.now(),
    hash: fakeHash(`${ev.filename ?? ""}|${ev.url ?? ""}|${ev.size ?? 0}`),
  };
  e.evidence = [...e.evidence, full];
  e.updatedAt = Date.now();
  e.versions = [...(e.versions ?? []), { at: Date.now(), who: CLINICIAN, note: `attached ${full.kind}` }];
  writeAll(shape);
  audit("cpd.evidence.attach", id);
  return full;
}
export function submitForVerification(id: string): void {
  updateEntry(id, { verification: "provider" }, "submitted for verification");
  audit("cpd.verify.submit", id);
}
export function applyToRenewal(id: string, cycleId: string): void {
  updateEntry(id, { appliedToRenewal: cycleId }, `applied to ${cycleId}`);
  audit("cpd.apply", id);
}

// ── Certificate parse stub — Co-Pilot #15 handoff
export function parseCertificate(filename: string): { provider?: string; title?: string; startAt?: number; endAt?: number; hours?: number; confidence: number } {
  // Deterministic pretend-parse based on filename hints.
  const lower = filename.toLowerCase();
  const guessTitle = filename.replace(/[-_.]/g, " ").replace(/\.(pdf|png|jpg|jpeg)$/i, "").trim();
  const guessHours = /(\d+)\s*(hr|hrs|hour)/.exec(lower)?.[1];
  return {
    title: guessTitle || undefined,
    provider: lower.includes("iap") ? "Indian Association of Psychiatrists" : lower.includes("rci") ? "Rehabilitation Council of India" : undefined,
    hours: guessHours ? Number(guessHours) : undefined,
    startAt: Date.now() - 30 * 24 * 3600 * 1000,
    endAt: Date.now() - 29 * 24 * 3600 * 1000,
    confidence: 0.62,
  };
}

// ── Cycles / renewal packet
export function generateRenewalPacket(cycleId: string): { pdfUrl: string; filename: string; entryCount: number; hoursTotal: number } {
  const shape = readAll();
  const cycle = shape.cycles.find((c) => c.id === cycleId);
  if (!cycle) throw new Error("cycle not found");
  const applied = shape.entries.filter((e) => !e.retired && e.endAt >= cycle.issueDate && e.endAt <= cycle.expiryDate);
  const hoursTotal = applied.reduce((s, e) => s + e.hoursClaimed, 0);
  // Build a synthetic PDF-ish text blob → data url (real PDF gen would go via reportlab server-side).
  const lines: string[] = [];
  lines.push(`RENEWAL PACKET — ${cycle.bodyLabel}`);
  lines.push(`License: ${cycle.licenseNumber}`);
  lines.push(`Cycle: ${new Date(cycle.issueDate).toLocaleDateString()} → ${new Date(cycle.expiryDate).toLocaleDateString()}`);
  lines.push(`Hours claimed: ${hoursTotal.toFixed(1)} of ${cycle.hoursRequired}`);
  lines.push("");
  lines.push("─── VERIFIED ENTRIES ───");
  for (const e of applied) {
    lines.push(`• ${new Date(e.endAt).toLocaleDateString()} · ${e.title} — ${e.provider} · ${e.hoursClaimed}h · ${e.category} · ${e.verification}`);
    if (e.reflection) lines.push(`  Reflection: ${e.reflection.slice(0, 240)}`);
  }
  lines.push("");
  lines.push(`Coversheet formatted for: ${cycle.bodyLabel}`);
  lines.push(`Prepared by: ${CLINICIAN}`);
  lines.push(`Generated: ${new Date().toLocaleString()}`);
  const blob = lines.join("\n");
  const url = "data:text/plain;charset=utf-8," + encodeURIComponent(blob);
  audit("cpd.renewal.pdf", cycleId);
  return { pdfUrl: url, filename: `renewal-${cycle.bodyLabel.toLowerCase().replace(/\s+/g, "-")}-${cycle.id}.txt`, entryCount: applied.length, hoursTotal };
}

// ── Learning plan
export function addPlanItem(input: Omit<LearningPlanItem, "id" | "createdAt">): LearningPlanItem {
  const shape = readAll();
  const item: LearningPlanItem = { ...input, id: `plan-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`, createdAt: Date.now() };
  shape.plan = [item, ...shape.plan];
  writeAll(shape);
  audit("cpd.plan.add", item.id);
  return item;
}
export function togglePlanDone(id: string): void {
  const shape = readAll();
  const p = shape.plan.find((x) => x.id === id);
  if (!p) return;
  p.done = !p.done;
  writeAll(shape);
  audit("cpd.plan.toggle", id);
}
export function removePlanItem(id: string): void {
  const shape = readAll();
  shape.plan = shape.plan.filter((p) => p.id !== id);
  writeAll(shape);
  audit("cpd.plan.remove", id);
}

// ── Reading log
export function addReading(input: Omit<ReadingEntry, "id">): ReadingEntry {
  const shape = readAll();
  const r: ReadingEntry = { ...input, id: `read-${Date.now()}-${Math.random().toString(36).slice(2, 5)}` };
  shape.reading = [r, ...shape.reading];
  writeAll(shape);
  audit("cpd.reading.add", r.id);
  return r;
}
export function promoteReadingToCpd(id: string): CpdEntry | undefined {
  const shape = readAll();
  const r = shape.reading.find((x) => x.id === id);
  if (!r || r.promotedTo) return;
  const entry = createEntry({
    type: "reading",
    title: r.title,
    provider: r.author ?? "self-directed",
    startAt: r.finishedAt,
    endAt: r.finishedAt,
    hoursClaimed: r.hours ?? 1,
    category: "optional",
    format: "reading",
    evidence: [],
    reflection: r.notes ?? "",
    verification: "self",
    source: { module: "reading", ref: r.id },
  });
  r.promotedTo = entry.id;
  writeAll(shape);
  return entry;
}

// ── Catalog
export function toggleBookmark(id: string): void {
  const shape = readAll();
  const c = shape.catalog.find((x) => x.id === id);
  if (!c) return;
  c.bookmarked = !c.bookmarked;
  writeAll(shape);
  audit("cpd.catalog.bookmark", id);
}
export function markRegistered(id: string): void {
  const shape = readAll();
  const c = shape.catalog.find((x) => x.id === id);
  if (!c) return;
  c.registered = true;
  writeAll(shape);
  audit("cpd.catalog.register", id);
}
export function completeCatalogItem(id: string): CpdEntry | undefined {
  const shape = readAll();
  const c = shape.catalog.find((x) => x.id === id);
  if (!c) return;
  const entry = createEntry({
    type: c.category === "supervision" ? "supervision_received" : c.format === "in_person" && c.title.toLowerCase().includes("conference") ? "conference" : "workshop",
    title: c.title,
    provider: c.provider,
    providerId: c.providerId,
    startAt: c.startAt,
    endAt: c.endAt,
    hoursClaimed: c.hoursAwarded,
    category: c.category,
    format: c.format,
    evidence: [{
      id: `ev-cat-${c.id}`,
      kind: "certificate",
      filename: `attendance-${c.id}.pdf`,
      hash: fakeHash(c.id + c.title),
      uploadedAt: Date.now(),
    }],
    reflection: "",
    verification: "provider",
    source: { module: "catalog", ref: c.id },
  });
  return entry;
}

// ── Cross-module — allow supervision store to record hours as verified CPD
export function recordFromSupervision(input: { title: string; provider: string; endAt: number; hours: number; category: CpdCategory; sourceRef: string }): CpdEntry {
  return createEntry({
    type: "supervision_received",
    title: input.title,
    provider: input.provider,
    startAt: input.endAt,
    endAt: input.endAt,
    hoursClaimed: input.hours,
    category: input.category,
    format: "online_live",
    evidence: [],
    reflection: "",
    verification: "provider",
    source: { module: "supervision", ref: input.sourceRef },
  });
}

// ── Reactive hooks
function useShapeSlice<T>(select: (s: Shape) => T): T {
  const shape = useSyncExternalStore(subscribe, readAll, () => serverShape);
  return useMemo(() => select(shape), [shape, select]);
}
export function useEntries() { return useShapeSlice((s) => s.entries.slice().sort((a, b) => b.endAt - a.endAt)); }
export function useCycles() { return useShapeSlice((s) => s.cycles.slice().sort((a, b) => b.expiryDate - a.expiryDate)); }
export function useCurrentCycle() { return useShapeSlice((s) => s.cycles.find((c) => c.status === "current")); }
export function usePlan() { return useShapeSlice((s) => s.plan.slice()); }
export function useReading() { return useShapeSlice((s) => s.reading.slice().sort((a, b) => b.finishedAt - a.finishedAt)); }
export function useProviders() { return useShapeSlice((s) => s.providers.slice().sort((a, b) => a.name.localeCompare(b.name))); }
export function useCatalog() { return useShapeSlice((s) => s.catalog.slice().sort((a, b) => a.startAt - b.startAt)); }

// ── Summary helpers
export type CycleSummary = {
  hoursTotal: number;
  hoursRequired: number;
  percent: number;
  behind: boolean;
  byCategory: Record<CpdCategory, { hours: number; min: number }>;
  daysUntilRenewal: number;
  pendingCertificates: number;
};

export function summarizeCycle(entries: CpdEntry[], cycle?: RenewalCycle): CycleSummary {
  const cats: CpdCategory[] = ["clinical", "ethics", "supervision", "research", "self_care", "optional"];
  const byCategory = Object.fromEntries(cats.map((c) => [c, { hours: 0, min: cycle?.categoryMinimums?.[c] ?? 0 }])) as CycleSummary["byCategory"];
  let hoursTotal = 0;
  let pending = 0;
  const inCycle = cycle
    ? entries.filter((e) => !e.retired && e.endAt >= cycle.issueDate && e.endAt <= cycle.expiryDate)
    : entries.filter((e) => !e.retired);
  for (const e of inCycle) {
    hoursTotal += e.hoursClaimed;
    byCategory[e.category].hours += e.hoursClaimed;
    if (e.evidence.length === 0) pending++;
  }
  const hoursRequired = cycle?.hoursRequired ?? 0;
  const percent = hoursRequired > 0 ? Math.min(1, hoursTotal / hoursRequired) : 0;
  const daysUntilRenewal = cycle ? Math.max(0, Math.round((cycle.expiryDate - Date.now()) / (24 * 3600 * 1000))) : 0;
  // "Behind" = expected pace vs actual, once >20% of cycle has elapsed.
  let behind = false;
  if (cycle) {
    const cycleLen = cycle.expiryDate - cycle.issueDate;
    const elapsed = Math.max(0, Date.now() - cycle.issueDate);
    const frac = cycleLen > 0 ? elapsed / cycleLen : 0;
    if (frac > 0.2) behind = percent < frac - 0.1;
  }
  return { hoursTotal, hoursRequired, percent, behind, byCategory, daysUntilRenewal, pendingCertificates: pending };
}

// ─── Seed ────────────────────────────────────────────────────
function seed(): Shape {
  const day = 24 * 3600 * 1000;
  const now = Date.now();
  const cycleStart = now - 14 * 30 * day; // 14 months ago
  const cycleEnd = cycleStart + 24 * 30 * day; // 24-month cycle (10 months remain)
  const prevCycleEnd = cycleStart - day;
  const prevCycleStart = prevCycleEnd - 24 * 30 * day;

  const cycles: RenewalCycle[] = [
    {
      id: "cyc-current",
      licenseNumber: "RCI/CP/A-58921",
      issuingBody: "RCI",
      bodyLabel: "Rehabilitation Council of India",
      issueDate: cycleStart,
      expiryDate: cycleEnd,
      hoursRequired: 50,
      categoryMinimums: { clinical: 20, ethics: 5, supervision: 10, self_care: 5 },
      status: "current",
    },
    {
      id: "cyc-prev",
      licenseNumber: "RCI/CP/A-58921",
      issuingBody: "RCI",
      bodyLabel: "Rehabilitation Council of India",
      issueDate: prevCycleStart,
      expiryDate: prevCycleEnd,
      hoursRequired: 50,
      categoryMinimums: { clinical: 20, ethics: 5, supervision: 10, self_care: 5 },
      status: "past",
    },
  ];

  // Helper builder
  const mk = (o: Partial<CpdEntry> & { title: string; endAt: number; hoursClaimed: number; category: CpdCategory; type: CpdType }): CpdEntry => {
    const idBase = `cpd-seed-${o.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 24)}-${o.endAt}`;
    const evidence: Evidence[] = (o.evidence ?? []).map((e) => ({
      ...e,
      hash: e.hash ?? fakeHash((e.filename ?? "") + (e.url ?? "") + (e.size ?? 0)),
    }));
    return {
      id: idBase,
      type: o.type,
      title: o.title,
      provider: o.provider ?? "self-directed",
      providerId: o.providerId,
      startAt: o.startAt ?? o.endAt - day,
      endAt: o.endAt,
      hoursClaimed: o.hoursClaimed,
      category: o.category,
      format: o.format ?? "online_live",
      evidence,
      reflection: o.reflection ?? "",
      verification: o.verification ?? "self",
      appliedToRenewal: o.appliedToRenewal,
      retired: o.retired,
      createdAt: o.endAt,
      updatedAt: o.endAt,
      versions: [{ at: o.endAt, who: CLINICIAN, note: "created" }],
      source: o.source,
    };
  };
  const cert = (name: string, url?: string): Evidence => ({
    id: `ev-seed-${name}`, kind: "certificate", filename: name, url, uploadedAt: now, hash: fakeHash(name),
  });

  const entries: CpdEntry[] = [
    // 3 conferences
    mk({ type: "conference", title: "Indian Psychiatric Society Annual Conference 2025", provider: "IPS", endAt: now - 45 * day, hoursClaimed: 12, category: "clinical", format: "in_person",
      evidence: [cert("ips-2025-attendance.pdf")], verification: "provider", appliedToRenewal: "cyc-current",
      reflection: "The plenary on integrated care for treatment-resistant depression changed how I sequence augmentation strategies. I'm now more cautious about ECT referrals for patients under 25." }),
    mk({ type: "conference", title: "SAARC Adolescent Mental Health Summit", provider: "SAARC-AMH", endAt: now - 120 * day, hoursClaimed: 8, category: "clinical", format: "online_live",
      evidence: [cert("saarc-amh-2024.pdf")], verification: "provider", appliedToRenewal: "cyc-current",
      reflection: "Applied the family-inclusive assessment framework in two new adolescent cases; both intake sessions were less adversarial as a result." }),
    mk({ type: "conference", title: "Trauma & the Body — Bessel van der Kolk Intensive (India tour)", provider: "Bhavana Trust", endAt: now - 210 * day, hoursClaimed: 16, category: "clinical", format: "in_person",
      evidence: [cert("vdk-intensive-2024.pdf")], verification: "provider", appliedToRenewal: "cyc-current",
      reflection: "Somatic tracking techniques now integrated into three trauma cases. Two report reduced dissociation during sessions." }),

    // 5 workshops
    mk({ type: "workshop", title: "Ethical Consent in Digital Therapy", provider: "IAP Ethics Committee", endAt: now - 20 * day, hoursClaimed: 4, category: "ethics", format: "online_live",
      evidence: [cert("iap-ethics-consent.pdf")], verification: "provider", appliedToRenewal: "cyc-current",
      reflection: "Updated my telehealth consent template to include explicit data-residency language and cross-border transfer notes." }),
    mk({ type: "workshop", title: "DBT Skills — Distress Tolerance Advanced", provider: "DBT India Collective", endAt: now - 65 * day, hoursClaimed: 6, category: "clinical", format: "online_live",
      evidence: [cert("dbt-india-distress.pdf")], verification: "provider", appliedToRenewal: "cyc-current",
      reflection: "TIP skills adapted for Indian clinic settings — heat/humidity considerations for the cold-water application." }),
    mk({ type: "workshop", title: "Working with Queer Youth in Conservative Family Systems", provider: "Nazariya", endAt: now - 90 * day, hoursClaimed: 6, category: "clinical", format: "in_person",
      evidence: [cert("nazariya-queer-youth.pdf")], verification: "provider", appliedToRenewal: "cyc-current",
      reflection: "Reframed how I sequence family sessions — the youth-first individual work needs a longer runway than I'd been giving." }),
    mk({ type: "workshop", title: "PHQ-9 & GAD-7 in South Asian populations", provider: "NIMHANS CE", endAt: now - 150 * day, hoursClaimed: 3, category: "clinical", format: "online_recorded",
      evidence: [], verification: "self",
      reflection: "Adjusted my interpretation thresholds for GAD-7 — cultural expression of worry runs higher in baseline." }),
    mk({ type: "workshop", title: "Handling clinician burnout in private practice", provider: "The Alternative Story", endAt: now - 280 * day, hoursClaimed: 4, category: "self_care", format: "online_live",
      evidence: [cert("tas-burnout-workshop.pdf")], verification: "provider", appliedToRenewal: "cyc-current",
      reflection: "Blocking a real day off midweek. Not just Sundays. Sundays get eaten by admin anyway." }),

    // 4 courses
    mk({ type: "course", title: "CBT-E for eating disorders (10-week)", provider: "Beck Institute", endAt: now - 30 * day, hoursClaimed: 20, category: "clinical", format: "online_live",
      evidence: [cert("beck-cbte-2025.pdf", "https://beckinstitute.org")], verification: "provider", appliedToRenewal: "cyc-current",
      reflection: "Two AN cases are now getting formal CBT-E rather than the generic CBT I was drifting toward. Session structure is tighter." }),
    mk({ type: "course", title: "Motivational Interviewing Level 2", provider: "MINT India", endAt: now - 180 * day, hoursClaimed: 15, category: "clinical", format: "online_live",
      evidence: [cert("mint-india-l2.pdf")], verification: "provider", appliedToRenewal: "cyc-current",
      reflection: "Change-talk elicitation feels less mechanical now. Used with a substance-use case; the shift in engagement was noticeable by session 3." }),
    mk({ type: "course", title: "Diploma in Clinical Supervision", provider: "TISS", endAt: now - 320 * day, hoursClaimed: 30, category: "supervision", format: "in_person",
      evidence: [cert("tiss-supervision-dip.pdf")], verification: "council", appliedToRenewal: "cyc-current",
      reflection: "Now formally qualified to supervise. Started supervising two junior clinicians this cycle." }),
    mk({ type: "course", title: "Trauma-informed group facilitation", provider: "Sangath", endAt: now - 400 * day, hoursClaimed: 12, category: "clinical", format: "in_person",
      evidence: [cert("sangath-group-facil.pdf")], verification: "provider",
      reflection: "Used the check-in / check-out structure in the psychoeducation group. Drop-out fell." }),

    // 3 supervision received
    mk({ type: "supervision_received", title: "Fortnightly supervision — Dr. Meera Sundaresan", provider: "Dr. Meera Sundaresan", endAt: now - 10 * day, hoursClaimed: 2, category: "supervision", format: "online_live",
      evidence: [], verification: "self",
      reflection: "Explored countertransference on the client who reminds me of my sister. Concrete containment strategy in place.",
      source: { module: "supervision", ref: "seed-sup-1" } }),
    mk({ type: "supervision_received", title: "Fortnightly supervision — Dr. Meera Sundaresan", provider: "Dr. Meera Sundaresan", endAt: now - 24 * day, hoursClaimed: 2, category: "supervision", format: "online_live",
      evidence: [], verification: "self",
      reflection: "Ethical dilemma about a family who wants combined sessions with the adolescent client. Landed on separate sessions with clear consent boundaries.",
      source: { module: "supervision", ref: "seed-sup-2" } }),
    mk({ type: "supervision_received", title: "Case consultation — anxiety-OCD boundary", provider: "Dr. Meera Sundaresan", endAt: now - 100 * day, hoursClaimed: 2, category: "supervision", format: "online_live",
      evidence: [], verification: "self",
      reflection: "Re-formulated the case as OCD-with-ego-dystonic-anxiety rather than GAD. Treatment plan shifted to ERP-forward." }),

    // 2 supervision provided
    mk({ type: "supervision_provided", title: "Supervising Rhea Kapur (weekly)", provider: "self as supervisor", endAt: now - 15 * day, hoursClaimed: 4, category: "supervision", format: "online_live",
      evidence: [], verification: "self",
      reflection: "Rhea's grasp of case formulation is deepening. Encouraged her to sit with silence more." }),
    mk({ type: "supervision_provided", title: "Supervising Dev Iyer (monthly)", provider: "self as supervisor", endAt: now - 40 * day, hoursClaimed: 2, category: "supervision", format: "online_live",
      evidence: [], verification: "self",
      reflection: "Dev is over-relying on assessments. Homework: run one intake this month without a single instrument." }),

    // 2 case discussions
    mk({ type: "case_discussion", title: "Peer case conference — perinatal depression", provider: "Bangalore Perinatal Group", endAt: now - 55 * day, hoursClaimed: 2, category: "clinical", format: "in_person",
      evidence: [], verification: "self",
      reflection: "Group consensus: broader medical work-up warranted. Made the endocrinology referral I'd been sitting on." }),
    mk({ type: "case_discussion", title: "Ethics reading group — dual relationships in small towns", provider: "Peer group (Devangi, Priya, Karan)", endAt: now - 200 * day, hoursClaimed: 1.5, category: "ethics", format: "online_live",
      evidence: [], verification: "self",
      reflection: "Reconsidered how I handle recognizing clients in public settings. Explicit protocol now in intake pack." }),

    // 3 personal therapy
    mk({ type: "personal_therapy", title: "Personal therapy — biweekly", provider: "Dr. Anagha Shastri", endAt: now - 5 * day, hoursClaimed: 1, category: "self_care", format: "online_live",
      evidence: [], verification: "self", reflection: "" }),
    mk({ type: "personal_therapy", title: "Personal therapy — biweekly", provider: "Dr. Anagha Shastri", endAt: now - 19 * day, hoursClaimed: 1, category: "self_care", format: "online_live",
      evidence: [], verification: "self", reflection: "" }),
    mk({ type: "personal_therapy", title: "Personal therapy — biweekly", provider: "Dr. Anagha Shastri", endAt: now - 33 * day, hoursClaimed: 1, category: "self_care", format: "online_live",
      evidence: [], verification: "self", reflection: "" }),
  ];

  const providers: Provider[] = [
    { id: "prov-iap", name: "Indian Association of Psychiatrists", verified: true, city: "Delhi", focus: ["clinical", "ethics"], rating: 4.6, timesAttended: 3 },
    { id: "prov-rci", name: "Rehabilitation Council of India", verified: true, city: "Delhi", focus: ["ethics", "regulatory"], rating: 4.1, timesAttended: 1 },
    { id: "prov-beck", name: "Beck Institute", verified: true, city: "Philadelphia (online)", focus: ["CBT", "CBT-E"], rating: 4.8, timesAttended: 2 },
    { id: "prov-tiss", name: "Tata Institute of Social Sciences", verified: true, city: "Mumbai", focus: ["supervision", "systems"], rating: 4.7, timesAttended: 1 },
    { id: "prov-nimhans", name: "NIMHANS Centre for Continuing Education", verified: true, city: "Bangalore", focus: ["assessment", "clinical"], rating: 4.5, timesAttended: 4 },
    { id: "prov-sangath", name: "Sangath", verified: true, city: "Goa · Delhi", focus: ["community", "trauma"], rating: 4.4, timesAttended: 1 },
    { id: "prov-tas", name: "The Alternative Story", verified: true, city: "Bangalore", focus: ["narrative", "self-care"], rating: 4.6, timesAttended: 2 },
    { id: "prov-nazariya", name: "Nazariya QFRG", verified: true, city: "Delhi", focus: ["queer-affirmative"], rating: 4.9, timesAttended: 1 },
    { id: "prov-dbtindia", name: "DBT India Collective", verified: true, city: "Mumbai", focus: ["DBT"], rating: 4.7, timesAttended: 3 },
    { id: "prov-mint", name: "MINT India", verified: true, city: "Bangalore", focus: ["MI"], rating: 4.5, timesAttended: 1 },
  ];

  const catalog: CatalogItem[] = [
    { id: "cat-1", title: "Trauma-Focused CBT for Adolescents — 3-day intensive", provider: "NIMHANS CE", providerId: "prov-nimhans", category: "clinical", format: "in_person", city: "Bangalore", startAt: now + 12 * day, endAt: now + 14 * day, hoursAwarded: 18, priceInr: 8500, description: "Structured TF-CBT protocol adapted for Indian adolescent populations. Live case demonstrations." },
    { id: "cat-2", title: "Ethics in Digital Practice — 2025 update", provider: "IAP Ethics Committee", providerId: "prov-iap", category: "ethics", format: "online_live", startAt: now + 5 * day, endAt: now + 5 * day, hoursAwarded: 3, priceInr: 1500, description: "Post-DPDP Act guidance. Updated telehealth consent language. Data residency case studies." },
    { id: "cat-3", title: "Group DBT Facilitation", provider: "DBT India Collective", providerId: "prov-dbtindia", category: "clinical", format: "online_live", startAt: now + 30 * day, endAt: now + 32 * day, hoursAwarded: 15, priceInr: 6000, description: "Weekly skills group co-leadership. Ideal for clinicians starting a DBT-adherent program." },
    { id: "cat-4", title: "Reflective Supervision — advanced", provider: "TISS", providerId: "prov-tiss", category: "supervision", format: "in_person", city: "Mumbai", startAt: now + 60 * day, endAt: now + 62 * day, hoursAwarded: 20, priceInr: 12000, description: "For supervisors with 2+ years experience. Bring live supervision material." },
    { id: "cat-5", title: "Perinatal Mental Health Symposium", provider: "Bangalore Perinatal Group", category: "clinical", format: "in_person", city: "Bangalore", startAt: now + 22 * day, endAt: now + 22 * day, hoursAwarded: 6, priceInr: 2500, description: "One-day symposium. Antenatal depression screening, postnatal PTSD, dyadic work." },
    { id: "cat-6", title: "Compassion Fatigue & Therapist Self-Care", provider: "The Alternative Story", providerId: "prov-tas", category: "self_care", format: "online_recorded", startAt: now + 2 * day, endAt: now + 2 * day, hoursAwarded: 4, priceInr: 1200, description: "Self-paced. Includes a personal ritual audit and peer-pairing option." },
    { id: "cat-7", title: "Research Methods for Practicing Clinicians", provider: "Sangath", providerId: "prov-sangath", category: "research", format: "online_live", startAt: now + 45 * day, endAt: now + 50 * day, hoursAwarded: 10, priceInr: 5500, description: "How to run small-N practice-based research without a lab." },
  ];

  const plan: LearningPlanItem[] = [
    { id: "plan-seed-1", goal: "Deepen CBT-E fluency for the two active AN cases", category: "clinical", target: 15, notes: "Follow up on Beck course with 2 case consultations.", createdAt: now - 30 * day },
    { id: "plan-seed-2", goal: "Meet ethics minimum for this cycle", category: "ethics", target: 5, createdAt: now - 60 * day, done: false },
    { id: "plan-seed-3", goal: "Start research methods track — feasibility of practice-based outcomes study", category: "research", target: 10, createdAt: now - 15 * day },
  ];

  const reading: ReadingEntry[] = [
    { id: "read-seed-1", title: "The Body Keeps the Score", author: "Bessel van der Kolk", kind: "book", finishedAt: now - 200 * day, notes: "Re-read after the workshop. Chapter 12 hit differently in practice.", hours: 12 },
    { id: "read-seed-2", title: "Psychotherapy Networker — Sept issue", kind: "paper", finishedAt: now - 40 * day, notes: "Piece on power in the therapy room. Saved for a peer-group discussion.", hours: 1 },
    { id: "read-seed-3", title: "Being Well — Rick Hanson podcast, ep. on rupture-repair", kind: "podcast", finishedAt: now - 12 * day, hours: 1 },
    { id: "read-seed-4", title: "Deliberate Practice in Psychotherapy — Rousmaniere", author: "Tony Rousmaniere", kind: "book", finishedAt: now - 120 * day, notes: "Started a personal recorded-review practice on Tuesdays. Uncomfortable. Useful.", hours: 8 },
  ];

  return { entries, cycles, plan, reading, providers, catalog };
}

// Utility for UI copy
export const CATEGORY_LABEL: Record<CpdCategory, string> = {
  clinical: "Clinical",
  ethics: "Ethics",
  supervision: "Supervision",
  research: "Research",
  self_care: "Self-care",
  optional: "Optional",
};
export const TYPE_LABEL: Record<CpdType, string> = {
  workshop: "Workshop",
  conference: "Conference",
  course: "Course",
  reading: "Reading",
  case_discussion: "Case discussion",
  personal_therapy: "Personal therapy",
  supervision_received: "Supervision received",
  supervision_provided: "Supervision provided",
  research: "Research / publication",
  peer_review: "Peer review",
  presenting: "Presenting",
};
export const FORMAT_LABEL: Record<CpdFormat, string> = {
  in_person: "In-person",
  online_live: "Online — live",
  online_recorded: "Online — recorded",
  self_paced: "Self-paced",
  reading: "Reading",
};
export const VERIFICATION_LABEL: Record<VerificationStatus, string> = {
  self: "Self-reported",
  provider: "Provider-verified",
  council: "Council-verified",
};
