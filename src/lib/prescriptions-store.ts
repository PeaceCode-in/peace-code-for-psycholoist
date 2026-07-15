// PeaceCode · Practice — Prescriptions store.
// Medications, dose-change events, discontinuations, letters, formulary.
// Every mutation → audit. Letters lock on sign and require amendments to change.

import { useSyncExternalStore } from "react";
import { listPatients } from "@/lib/patients-store";

export type Frequency = "OD" | "BD" | "TID" | "QID" | "HS" | "PRN";
export type Route_ = "PO" | "SL" | "IM" | "IV" | "TD";
export type MedStatus = "active" | "titrating" | "tapering" | "discontinued" | "completed";
export type DrugClass =
  | "SSRI" | "SNRI" | "TCA" | "Atypical AD" | "Mood stabilizer" | "Antipsychotic"
  | "Benzodiazepine" | "Z-drug" | "ADHD stimulant" | "ADHD non-stimulant"
  | "Anxiolytic" | "Beta-blocker" | "Other";

export type FormularyDrug = {
  id: string;
  generic: string;
  brands: string[];
  drugClass: DrugClass;
  typicalRange: string; // e.g. "10–20 mg/day"
  defaultFrequency: Frequency;
  notes?: string;
  favorite?: boolean;
  hidden?: boolean;
  custom?: boolean;
};

export type DoseChange = {
  id: string;
  at: number;
  fromDose: string;
  toDose: string;
  reason: string;
  by: string;
};

export type Discontinuation = {
  at: number;
  reason: "side effects" | "not effective" | "condition resolved" | "patient preference" | "cost" | "other";
  taper?: string;
  by: string;
};

export type Medication = {
  id: string;
  patientId: string;
  drugId: string;
  drugSnapshot: Pick<FormularyDrug, "generic" | "brands" | "drugClass" | "typicalRange">;
  dose: string;
  frequency: Frequency;
  route: Route_;
  indication: string;
  startedAt: number;
  prescriber: string; // "self" for member-psychiatrist, else external name
  supplyDays?: number;
  notes?: string;
  status: MedStatus;
  taperPlan?: string;
  history: DoseChange[];
  discontinuation?: Discontinuation;
  lastReviewedAt?: number;
};

export type LetterStatus = "draft" | "signed" | "amended";
export type LetterAmendment = { id: string; at: number; reason: string; body: string; by: string };
export type Letter = {
  id: string;
  medicationId: string;
  body: string;
  status: LetterStatus;
  signedAt?: number;
  signedBy?: string;
  amendments: LetterAmendment[];
};

export type AllergyRecord = { patientId: string; allergen: string; reaction: string };

const KEY = "peacecode.therapist.prescriptions.v1";
const AUDIT_KEY = "peacecode.therapist.prescriptions-audit.v1";
const CLINICIAN = { name: "Dr. Aditi Rao, PsyD", license: "MP-04421" };

const listeners = new Set<() => void>();
let snapCache: Record<string, unknown> = {};
function emit() { snapCache = {}; listeners.forEach((fn) => fn()); }
function subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }

function isBrowser() { return typeof window !== "undefined" && typeof window.localStorage !== "undefined"; }

type Shape = {
  meds: Medication[];
  formulary: FormularyDrug[];
  letters: Letter[];
  allergies: AllergyRecord[];
};

function readAll(): Shape {
  const base: Shape = { meds: [], formulary: seedFormulary(), letters: [], allergies: [] };
  if (!isBrowser()) return base;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Shape;
      // Ensure any newly-added seed drugs are merged in.
      const missing = base.formulary.filter((d) => !parsed.formulary.some((x) => x.id === d.id));
      if (missing.length) parsed.formulary = [...parsed.formulary, ...missing];
      return parsed;
    }
    const seeded = seedFull(base);
    window.localStorage.setItem(KEY, JSON.stringify(seeded));
    return seeded;
  } catch {
    return base;
  }
}
function writeAll(s: Shape) { if (!isBrowser()) return; window.localStorage.setItem(KEY, JSON.stringify(s)); emit(); }
function audit(action: string, ref: string) {
  if (!isBrowser()) return;
  const raw = window.localStorage.getItem(AUDIT_KEY);
  const list = raw ? JSON.parse(raw) : [];
  list.push({ id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, at: Date.now(), who: CLINICIAN.name, action, ref });
  window.localStorage.setItem(AUDIT_KEY, JSON.stringify(list));
}

// ─── Interactions (small seeded set — 30-ish pairs) ─────────
export const INTERACTIONS: Array<{ a: string; b: string; note: string; severity: "moderate" | "severe" }> = [
  { a: "fluoxetine", b: "tramadol", note: "Serotonin syndrome risk", severity: "severe" },
  { a: "sertraline", b: "tramadol", note: "Serotonin syndrome risk", severity: "severe" },
  { a: "escitalopram", b: "tramadol", note: "Serotonin syndrome risk", severity: "severe" },
  { a: "fluoxetine", b: "linezolid", note: "Serotonin syndrome — avoid combination", severity: "severe" },
  { a: "sertraline", b: "warfarin", note: "Bleeding risk — monitor INR", severity: "moderate" },
  { a: "citalopram", b: "amitriptyline", note: "QT prolongation", severity: "moderate" },
  { a: "escitalopram", b: "amitriptyline", note: "QT prolongation", severity: "moderate" },
  { a: "venlafaxine", b: "tramadol", note: "Serotonin syndrome risk", severity: "severe" },
  { a: "duloxetine", b: "tramadol", note: "Serotonin syndrome risk", severity: "severe" },
  { a: "clonazepam", b: "alprazolam", note: "Additive CNS depression", severity: "moderate" },
  { a: "clonazepam", b: "zolpidem", note: "Additive CNS depression", severity: "moderate" },
  { a: "alprazolam", b: "zolpidem", note: "Additive CNS depression", severity: "moderate" },
  { a: "lithium", b: "ibuprofen", note: "Raised lithium levels", severity: "moderate" },
  { a: "lithium", b: "hydrochlorothiazide", note: "Raised lithium levels", severity: "moderate" },
  { a: "valproate", b: "lamotrigine", note: "Increased lamotrigine level — slow titration", severity: "moderate" },
  { a: "carbamazepine", b: "olanzapine", note: "Reduced olanzapine level", severity: "moderate" },
  { a: "quetiapine", b: "clarithromycin", note: "Raised quetiapine level", severity: "moderate" },
  { a: "risperidone", b: "carbamazepine", note: "Reduced risperidone level", severity: "moderate" },
  { a: "aripiprazole", b: "fluoxetine", note: "Raised aripiprazole level — lower dose", severity: "moderate" },
  { a: "olanzapine", b: "diazepam", note: "Sedation and hypotension", severity: "moderate" },
  { a: "methylphenidate", b: "clonidine", note: "Blood pressure fluctuations", severity: "moderate" },
  { a: "atomoxetine", b: "fluoxetine", note: "Raised atomoxetine level", severity: "moderate" },
  { a: "propranolol", b: "clonidine", note: "Rebound hypertension on withdrawal", severity: "moderate" },
  { a: "melatonin", b: "fluvoxamine", note: "Raised melatonin level", severity: "moderate" },
  { a: "mirtazapine", b: "tramadol", note: "Serotonin syndrome risk", severity: "severe" },
  { a: "bupropion", b: "tramadol", note: "Lowered seizure threshold", severity: "moderate" },
  { a: "buspirone", b: "fluoxetine", note: "Serotonin syndrome risk (uncommon)", severity: "moderate" },
  { a: "amitriptyline", b: "fluoxetine", note: "Raised TCA level", severity: "moderate" },
  { a: "haloperidol", b: "citalopram", note: "QT prolongation", severity: "moderate" },
  { a: "clozapine", b: "carbamazepine", note: "Avoid — additive myelosuppression", severity: "severe" },
];

export function findInteractions(meds: Medication[]) {
  const active = meds.filter((m) => m.status !== "discontinued");
  const found: Array<{ a: Medication; b: Medication; note: string; severity: "moderate" | "severe" }> = [];
  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const g1 = active[i].drugSnapshot.generic.toLowerCase();
      const g2 = active[j].drugSnapshot.generic.toLowerCase();
      const match = INTERACTIONS.find((x) =>
        (x.a === g1 && x.b === g2) || (x.a === g2 && x.b === g1),
      );
      if (match) found.push({ a: active[i], b: active[j], note: match.note, severity: match.severity });
    }
  }
  return found;
}

// ─── Public API ──────────────────────────────────────────────
export function listMeds(): Medication[] { return readAll().meds.slice().sort((a, b) => b.startedAt - a.startedAt); }
export function getMed(id: string): Medication | undefined { return readAll().meds.find((m) => m.id === id); }
export function medsForPatient(pid: string): Medication[] { return listMeds().filter((m) => m.patientId === pid); }
export function listLetters(): Letter[] { return readAll().letters; }
export function letterForMed(mid: string): Letter | undefined { return readAll().letters.find((l) => l.medicationId === mid); }
export function listFormulary(): FormularyDrug[] { return readAll().formulary.filter((d) => !d.hidden); }
export function listAllergies(pid: string): AllergyRecord[] { return readAll().allergies.filter((a) => a.patientId === pid); }

export function createMedication(input: Omit<Medication, "id" | "history" | "status" | "drugSnapshot"> & { status?: MedStatus }): Medication {
  const s = readAll();
  const drug = s.formulary.find((d) => d.id === input.drugId);
  if (!drug) throw new Error("drug not found");
  const med: Medication = {
    ...input,
    id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    drugSnapshot: { generic: drug.generic, brands: drug.brands, drugClass: drug.drugClass, typicalRange: drug.typicalRange },
    status: input.status ?? "active",
    history: [],
  };
  s.meds = [med, ...s.meds];
  writeAll(s);
  audit("create-med", med.id);
  return med;
}

export function titrateMed(mid: string, newDose: string, reason: string): Medication | undefined {
  const s = readAll();
  const m = s.meds.find((x) => x.id === mid);
  if (!m || m.status === "discontinued") return undefined;
  m.history = [...m.history, { id: `dc-${Date.now()}`, at: Date.now(), fromDose: m.dose, toDose: newDose, reason, by: CLINICIAN.name }];
  m.dose = newDose;
  m.status = "titrating";
  writeAll(s);
  audit("titrate", mid);
  return m;
}

export function discontinueMed(mid: string, reason: Discontinuation["reason"], taper?: string): Medication | undefined {
  const s = readAll();
  const m = s.meds.find((x) => x.id === mid);
  if (!m) return undefined;
  m.status = "discontinued";
  m.discontinuation = { at: Date.now(), reason, taper, by: CLINICIAN.name };
  writeAll(s);
  audit("discontinue", mid);
  return m;
}

export function markReviewed(mid: string): Medication | undefined {
  const s = readAll();
  const m = s.meds.find((x) => x.id === mid);
  if (!m) return undefined;
  m.lastReviewedAt = Date.now();
  writeAll(s);
  audit("review", mid);
  return m;
}

export function upsertLetter(mid: string, body: string): Letter {
  const s = readAll();
  let l = s.letters.find((x) => x.medicationId === mid);
  if (!l) {
    l = { id: `L-${Date.now()}`, medicationId: mid, body, status: "draft", amendments: [] };
    s.letters = [...s.letters, l];
  } else {
    if (l.status === "draft") l.body = body;
  }
  writeAll(s);
  audit("letter-save", l.id);
  return l;
}

export function signLetter(letterId: string): Letter | undefined {
  const s = readAll();
  const l = s.letters.find((x) => x.id === letterId);
  if (!l || l.status !== "draft") return l;
  l.status = "signed";
  l.signedAt = Date.now();
  l.signedBy = CLINICIAN.name;
  writeAll(s);
  audit("letter-sign", letterId);
  return l;
}

export function amendLetter(letterId: string, reason: string, body: string): Letter | undefined {
  const s = readAll();
  const l = s.letters.find((x) => x.id === letterId);
  if (!l || l.status === "draft") return l;
  l.amendments = [...l.amendments, { id: `am-${Date.now()}`, at: Date.now(), reason, body, by: CLINICIAN.name }];
  l.status = "amended";
  writeAll(s);
  audit("letter-amend", letterId);
  return l;
}

export function toggleFavorite(drugId: string) {
  const s = readAll();
  const d = s.formulary.find((x) => x.id === drugId);
  if (!d) return;
  d.favorite = !d.favorite;
  writeAll(s);
}
export function toggleHidden(drugId: string) {
  const s = readAll();
  const d = s.formulary.find((x) => x.id === drugId);
  if (!d) return;
  d.hidden = !d.hidden;
  writeAll(s);
}
export function addCustomDrug(d: Omit<FormularyDrug, "id" | "custom">): FormularyDrug {
  const s = readAll();
  const drug: FormularyDrug = { ...d, id: `d-custom-${Date.now()}`, custom: true };
  s.formulary = [...s.formulary, drug];
  writeAll(s);
  return drug;
}

export function clinicianIdentity() { return CLINICIAN; }

// ─── Hooks ───────────────────────────────────────────────────
function cached<T>(k: string, fn: () => T): T {
  if (k in snapCache) return snapCache[k] as T;
  const v = fn(); snapCache[k] = v; return v;
}
export function useLiveMeds() { return useSyncExternalStore(subscribe, () => cached("meds", listMeds), () => [] as Medication[]); }
export function useLiveMed(id: string) { return useSyncExternalStore(subscribe, () => cached(`m:${id}`, () => getMed(id)), () => undefined); }
export function useLiveMedsForPatient(pid: string) { return useSyncExternalStore(subscribe, () => cached(`mp:${pid}`, () => medsForPatient(pid)), () => [] as Medication[]); }
export function useLiveFormulary() { return useSyncExternalStore(subscribe, () => cached("form", listFormulary), () => [] as FormularyDrug[]); }
export function useLiveLetter(mid: string) { return useSyncExternalStore(subscribe, () => cached(`L:${mid}`, () => letterForMed(mid)), () => undefined); }
export function useLiveAllergies(pid: string) { return useSyncExternalStore(subscribe, () => cached(`al:${pid}`, () => listAllergies(pid)), () => [] as AllergyRecord[]); }

// ─── Seed ────────────────────────────────────────────────────
function seedFormulary(): FormularyDrug[] {
  const rows: Array<Omit<FormularyDrug, "id">> = [
    // SSRIs
    { generic: "fluoxetine", brands: ["Fludac", "Prodep"], drugClass: "SSRI", typicalRange: "20–60 mg/day", defaultFrequency: "OD" },
    { generic: "sertraline", brands: ["Zosert", "Serlift"], drugClass: "SSRI", typicalRange: "50–200 mg/day", defaultFrequency: "OD" },
    { generic: "escitalopram", brands: ["Nexito", "Rexipra"], drugClass: "SSRI", typicalRange: "10–20 mg/day", defaultFrequency: "OD" },
    { generic: "citalopram", brands: ["Citalec"], drugClass: "SSRI", typicalRange: "20–40 mg/day", defaultFrequency: "OD" },
    { generic: "fluvoxamine", brands: ["Faverin"], drugClass: "SSRI", typicalRange: "100–300 mg/day", defaultFrequency: "BD" },
    { generic: "paroxetine", brands: ["Xet", "Paxidep"], drugClass: "SSRI", typicalRange: "20–50 mg/day", defaultFrequency: "OD" },
    // SNRIs
    { generic: "venlafaxine", brands: ["Ventab XL"], drugClass: "SNRI", typicalRange: "75–225 mg/day", defaultFrequency: "OD" },
    { generic: "duloxetine", brands: ["Dulane"], drugClass: "SNRI", typicalRange: "30–120 mg/day", defaultFrequency: "OD" },
    { generic: "desvenlafaxine", brands: ["Desvela"], drugClass: "SNRI", typicalRange: "50–100 mg/day", defaultFrequency: "OD" },
    // Atypical AD
    { generic: "bupropion", brands: ["Bupron SR"], drugClass: "Atypical AD", typicalRange: "150–300 mg/day", defaultFrequency: "OD" },
    { generic: "mirtazapine", brands: ["Mirt"], drugClass: "Atypical AD", typicalRange: "15–45 mg/day", defaultFrequency: "HS" },
    { generic: "vortioxetine", brands: ["Brintellix"], drugClass: "Atypical AD", typicalRange: "10–20 mg/day", defaultFrequency: "OD" },
    { generic: "trazodone", brands: ["Trazalon"], drugClass: "Atypical AD", typicalRange: "50–150 mg HS", defaultFrequency: "HS" },
    // TCAs
    { generic: "amitriptyline", brands: ["Amitone"], drugClass: "TCA", typicalRange: "25–150 mg/day", defaultFrequency: "HS" },
    { generic: "imipramine", brands: ["Depsonil"], drugClass: "TCA", typicalRange: "25–150 mg/day", defaultFrequency: "OD" },
    { generic: "clomipramine", brands: ["Clonil"], drugClass: "TCA", typicalRange: "75–250 mg/day", defaultFrequency: "OD" },
    // Mood stabilisers
    { generic: "lithium", brands: ["Lithosun SR"], drugClass: "Mood stabilizer", typicalRange: "600–1200 mg/day", defaultFrequency: "BD" },
    { generic: "valproate", brands: ["Encorate", "Valparin"], drugClass: "Mood stabilizer", typicalRange: "500–1500 mg/day", defaultFrequency: "BD" },
    { generic: "lamotrigine", brands: ["Lametec"], drugClass: "Mood stabilizer", typicalRange: "100–200 mg/day", defaultFrequency: "OD" },
    { generic: "carbamazepine", brands: ["Mazetol"], drugClass: "Mood stabilizer", typicalRange: "400–1200 mg/day", defaultFrequency: "BD" },
    // Antipsychotics
    { generic: "olanzapine", brands: ["Oleanz"], drugClass: "Antipsychotic", typicalRange: "5–20 mg/day", defaultFrequency: "OD" },
    { generic: "risperidone", brands: ["Risdone"], drugClass: "Antipsychotic", typicalRange: "1–6 mg/day", defaultFrequency: "OD" },
    { generic: "quetiapine", brands: ["Qutan"], drugClass: "Antipsychotic", typicalRange: "50–800 mg/day", defaultFrequency: "HS" },
    { generic: "aripiprazole", brands: ["Arip MT"], drugClass: "Antipsychotic", typicalRange: "5–30 mg/day", defaultFrequency: "OD" },
    { generic: "clozapine", brands: ["Sizopin"], drugClass: "Antipsychotic", typicalRange: "150–600 mg/day", defaultFrequency: "BD", notes: "Requires WBC monitoring" },
    { generic: "haloperidol", brands: ["Serenace"], drugClass: "Antipsychotic", typicalRange: "1–10 mg/day", defaultFrequency: "BD" },
    // Benzos
    { generic: "clonazepam", brands: ["Rivotril", "Zapiz"], drugClass: "Benzodiazepine", typicalRange: "0.25–2 mg/day", defaultFrequency: "BD" },
    { generic: "alprazolam", brands: ["Alprax"], drugClass: "Benzodiazepine", typicalRange: "0.25–2 mg/day", defaultFrequency: "PRN" },
    { generic: "lorazepam", brands: ["Ativan"], drugClass: "Benzodiazepine", typicalRange: "1–4 mg/day", defaultFrequency: "BD" },
    { generic: "diazepam", brands: ["Valium"], drugClass: "Benzodiazepine", typicalRange: "2–10 mg/day", defaultFrequency: "BD" },
    // Z-drugs
    { generic: "zolpidem", brands: ["Zolfresh"], drugClass: "Z-drug", typicalRange: "5–10 mg HS", defaultFrequency: "HS" },
    { generic: "eszopiclone", brands: ["Fulnite"], drugClass: "Z-drug", typicalRange: "1–3 mg HS", defaultFrequency: "HS" },
    // ADHD
    { generic: "methylphenidate", brands: ["Addwize"], drugClass: "ADHD stimulant", typicalRange: "10–60 mg/day", defaultFrequency: "BD" },
    { generic: "atomoxetine", brands: ["Attentin"], drugClass: "ADHD non-stimulant", typicalRange: "40–100 mg/day", defaultFrequency: "OD" },
    { generic: "clonidine", brands: ["Cloneon"], drugClass: "ADHD non-stimulant", typicalRange: "0.1–0.4 mg/day", defaultFrequency: "BD" },
    // Anxiolytic
    { generic: "buspirone", brands: ["Buspin"], drugClass: "Anxiolytic", typicalRange: "15–30 mg/day", defaultFrequency: "BD" },
    { generic: "pregabalin", brands: ["Nurica"], drugClass: "Anxiolytic", typicalRange: "75–300 mg/day", defaultFrequency: "BD" },
    // Beta-blockers
    { generic: "propranolol", brands: ["Ciplar"], drugClass: "Beta-blocker", typicalRange: "20–160 mg/day", defaultFrequency: "BD" },
    // Sleep
    { generic: "melatonin", brands: ["Meloset"], drugClass: "Other", typicalRange: "3–5 mg HS", defaultFrequency: "HS" },
    { generic: "ramelteon", brands: ["Rozerem"], drugClass: "Other", typicalRange: "8 mg HS", defaultFrequency: "HS" },
  ];
  return rows.map((r, i) => ({ ...r, id: `d-${r.generic}-${i}` }));
}

function seedFull(base: Shape): Shape {
  const patients = listPatients().slice(0, 6);
  if (patients.length === 0) return base;
  const f = base.formulary;
  const drug = (g: string) => f.find((x) => x.generic === g)!;
  const now = Date.now();
  const day = 86400_000;

  const meds: Medication[] = [];

  function mk(p: number, drugName: string, dose: string, startedAgo: number, opts: Partial<Medication> = {}, history: Array<{ ago: number; from: string; to: string; reason: string }> = []): Medication {
    const d = drug(drugName);
    const startedAt = now - startedAgo * day;
    const m: Medication = {
      id: `m-seed-${drugName}-${p}`,
      patientId: patients[p].id,
      drugId: d.id,
      drugSnapshot: { generic: d.generic, brands: d.brands, drugClass: d.drugClass, typicalRange: d.typicalRange },
      dose, frequency: d.defaultFrequency, route: "PO",
      indication: opts.indication ?? "as clinically indicated",
      startedAt, prescriber: opts.prescriber ?? CLINICIAN.name,
      status: opts.status ?? "active", supplyDays: opts.supplyDays ?? 30,
      history: history.map((h, i) => ({
        id: `dc-seed-${drugName}-${p}-${i}`, at: now - h.ago * day,
        fromDose: h.from, toDose: h.to, reason: h.reason, by: CLINICIAN.name,
      })),
      lastReviewedAt: opts.lastReviewedAt,
      notes: opts.notes, taperPlan: opts.taperPlan,
      discontinuation: opts.discontinuation,
    };
    return m;
  }

  // Patient 0 — stable on escitalopram
  meds.push(mk(0, "escitalopram", "15 mg", 120, { indication: "GAD", lastReviewedAt: now - 20 * day },
    [{ ago: 90, from: "10 mg", to: "15 mg", reason: "Partial response at 10 mg" }]));

  // Patient 1 — titrating sertraline + PRN alprazolam
  meds.push(mk(1, "sertraline", "100 mg", 40, { status: "titrating", indication: "Panic disorder", lastReviewedAt: now - 3 * day },
    [{ ago: 20, from: "50 mg", to: "100 mg", reason: "Increased for panic frequency" }]));
  meds.push(mk(1, "alprazolam", "0.25 mg", 40, { indication: "PRN for panic", prescriber: "Dr. Sameer Kulkarni (external)", supplyDays: 14 }));

  // Patient 2 — combo of 3 (bipolar arc)
  meds.push(mk(2, "lithium", "600 mg", 200, { indication: "Bipolar I maintenance", lastReviewedAt: now - 100 * day }));
  meds.push(mk(2, "quetiapine", "300 mg", 200, { indication: "Sleep + mood stabilisation" },
    [{ ago: 150, from: "200 mg", to: "300 mg", reason: "Improved sleep, mood benefit" }]));
  meds.push(mk(2, "clonazepam", "0.5 mg", 60, { status: "tapering", indication: "Anxiety", taperPlan: "Reduce by 0.25 mg every 2 weeks" }));

  // Patient 3 — tapering off fluoxetine
  meds.push(mk(3, "fluoxetine", "10 mg", 180, { status: "tapering", indication: "MDD, remission", taperPlan: "10 mg → alternate days ×2 weeks → stop" },
    [{ ago: 40, from: "20 mg", to: "10 mg", reason: "Sustained remission, initiating taper" }]));

  // Patient 4 — completed course (discontinued)
  meds.push(mk(4, "escitalopram", "10 mg", 400, {
    status: "discontinued",
    indication: "Adjustment disorder, resolved",
    discontinuation: { at: now - 90 * day, reason: "condition resolved", by: CLINICIAN.name },
  }));

  // Patient 5 — sleep + review-due
  meds.push(mk(5, "melatonin", "3 mg", 90, { indication: "Sleep onset difficulty" }));
  meds.push(mk(5, "propranolol", "40 mg", 90, { indication: "Performance anxiety, PRN", supplyDays: 60 }));

  // Allergy on p1
  const allergies: AllergyRecord[] = [
    { patientId: patients[1].id, allergen: "Penicillin", reaction: "Rash" },
  ];

  return { ...base, meds, allergies };
}
