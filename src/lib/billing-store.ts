// PeaceCode · Practice — Billing store.
// localStorage-backed, event-bus driven. Seeds ~50 invoices, 30+ payments, 8 claims
// across the 12 seeded patients so every chart & selector has real shape.
import { useEffect, useState, useSyncExternalStore } from "react";
import { listPatients, getPatient } from "@/lib/patients-store";

// ─── Types ───────────────────────────────────────────────────
export type InvoiceStatus = "draft" | "sent" | "viewed" | "paid" | "partial" | "overdue" | "void" | "refunded";
export type PaymentMethod = "upi" | "card" | "netbanking" | "cash" | "bank_transfer" | "insurance";
export type ClaimStatus = "not_submitted" | "submitted" | "in_review" | "approved" | "partial" | "denied" | "paid";
export type PaymentTerms = "immediate" | "net7" | "net15" | "net30";

export type LineItem = {
  id: string;
  description: string;
  sessionId?: string;
  qty: number;
  rate: number;
  amount: number;
  cptCode?: string;
};

export type Invoice = {
  id: string;                    // INV-2026-0142
  patientId: string;
  sessionIds: string[];
  issuedAt: number;
  dueAt: number;
  lineItems: LineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  amountPaid: number;
  balance: number;
  status: InvoiceStatus;
  currency: "INR";
  notes?: string;
  paymentTerms: PaymentTerms;
  remindersSent: number;
  activity: InvoiceEvent[];
};

export type InvoiceEvent = {
  id: string;
  at: number;
  kind: "created" | "sent" | "viewed" | "reminder" | "payment" | "paid" | "voided" | "refunded" | "converted_to_claim";
  note?: string;
};

export type Payment = {
  id: string;
  invoiceId: string;
  patientId: string;
  amount: number;
  method: PaymentMethod;
  receivedAt: number;
  reference?: string;
  reconciled: boolean;
};

export type ClaimDocument = { id: string; name: string; kind: "form" | "receipt" | "letter" };

export type InsuranceClaim = {
  id: string;                    // CLM-2026-0088
  invoiceId: string;
  patientId: string;
  insurer: string;
  policyNumber: string;
  submittedAt?: number;
  claimedAmount: number;
  approvedAmount?: number;
  paidAmount?: number;
  status: ClaimStatus;
  denialReason?: string;
  documents: ClaimDocument[];
  history: { at: number; status: ClaimStatus; note?: string }[];
};

export type ServiceRate = {
  id: string;
  service: string;
  duration: number;
  standardRate: number;
  slidingScaleRates?: { tier: string; rate: number }[];
  cptCode?: string;
};

type StoreShape = {
  invoices: Invoice[];
  payments: Payment[];
  claims: InsuranceClaim[];
  services: ServiceRate[];
  seq: { invoice: number; claim: number };
};

const KEY = "peacecode.therapist.billing.v1";
const DAY = 86_400_000;
const listeners = new Set<() => void>();
function emit() { listeners.forEach((fn) => fn()); }
function subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }
function isBrowser() { return typeof window !== "undefined" && typeof localStorage !== "undefined"; }

function load(): StoreShape {
  if (!isBrowser()) return seed();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) { const s = seed(); localStorage.setItem(KEY, JSON.stringify(s)); return s; }
    return JSON.parse(raw) as StoreShape;
  } catch { return seed(); }
}
function save(s: StoreShape) {
  if (!isBrowser()) return;
  try { localStorage.setItem(KEY, JSON.stringify(s)); emit(); } catch { /* quota */ }
}
let cache: StoreShape | null = null;
function state(): StoreShape { if (!cache) cache = load(); return cache; }
function mutate(fn: (s: StoreShape) => StoreShape) { cache = fn(state()); save(cache); }

function uid(p = "id") { return `${p}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`; }

// ─── Formatting ──────────────────────────────────────────────
export function formatINR(value: number, opts?: { withSymbol?: boolean; decimals?: boolean }): string {
  const withSymbol = opts?.withSymbol ?? true;
  const decimals = opts?.decimals ?? false;
  const abs = Math.abs(value);
  // Indian grouping: 1,20,000
  const fixed = decimals ? abs.toFixed(2) : Math.round(abs).toString();
  const [intPart, decPart] = fixed.split(".");
  const last3 = intPart.slice(-3);
  const rest = intPart.slice(0, -3);
  const grouped = rest ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + last3 : last3;
  const sign = value < 0 ? "− " : "";
  const body = decPart ? `${grouped}.${decPart}` : grouped;
  return withSymbol ? `${sign}₹ ${body}` : `${sign}${body}`;
}

export function nextInvoiceId(): string {
  const year = new Date().getFullYear();
  const n = String(state().seq.invoice + 1).padStart(4, "0");
  return `INV-${year}-${n}`;
}
export function nextClaimId(): string {
  const year = new Date().getFullYear();
  const n = String(state().seq.claim + 1).padStart(4, "0");
  return `CLM-${year}-${n}`;
}

// ─── Queries ─────────────────────────────────────────────────
export function listInvoices(filter?: { status?: InvoiceStatus | "all"; patientId?: string; search?: string }): Invoice[] {
  let out = [...state().invoices];
  if (filter?.status && filter.status !== "all") out = out.filter((i) => i.status === filter.status);
  if (filter?.patientId) out = out.filter((i) => i.patientId === filter.patientId);
  if (filter?.search) {
    const q = filter.search.toLowerCase();
    out = out.filter((i) => {
      const pName = getPatient(i.patientId)?.fullName.toLowerCase() ?? "";
      return i.id.toLowerCase().includes(q) || pName.includes(q);
    });
  }
  return out.sort((a, b) => b.issuedAt - a.issuedAt);
}
export function getInvoice(id: string): Invoice | undefined {
  return state().invoices.find((i) => i.id === id);
}
export function listPayments(): Payment[] {
  return [...state().payments].sort((a, b) => b.receivedAt - a.receivedAt);
}
export function paymentsForInvoice(invoiceId: string): Payment[] {
  return state().payments.filter((p) => p.invoiceId === invoiceId).sort((a, b) => b.receivedAt - a.receivedAt);
}
export function listClaims(filter?: { status?: ClaimStatus | "all" }): InsuranceClaim[] {
  let out = [...state().claims];
  if (filter?.status && filter.status !== "all") out = out.filter((c) => c.status === filter.status);
  return out.sort((a, b) => (b.submittedAt ?? 0) - (a.submittedAt ?? 0));
}
export function getClaim(id: string): InsuranceClaim | undefined {
  return state().claims.find((c) => c.id === id);
}
export function listServices(): ServiceRate[] { return [...state().services]; }
export function invoicesForPatient(pid: string): Invoice[] {
  return state().invoices.filter((i) => i.patientId === pid).sort((a, b) => b.issuedAt - a.issuedAt);
}
export function paymentsForPatient(pid: string): Payment[] {
  return state().payments.filter((p) => p.patientId === pid).sort((a, b) => b.receivedAt - a.receivedAt);
}

// ─── Mutations ───────────────────────────────────────────────
export function createInvoice(input: {
  patientId: string;
  sessionIds?: string[];
  lineItems: Omit<LineItem, "id" | "amount">[];
  discount?: number;
  taxRate?: number;
  notes?: string;
  paymentTerms?: PaymentTerms;
  status?: InvoiceStatus;
}): Invoice {
  const now = Date.now();
  const lineItems: LineItem[] = input.lineItems.map((li) => ({ ...li, id: uid("li"), amount: li.qty * li.rate }));
  const subtotal = lineItems.reduce((s, li) => s + li.amount, 0);
  const discount = input.discount ?? 0;
  const taxRate = input.taxRate ?? 0.18;
  const taxAmount = Math.round((subtotal - discount) * taxRate);
  const total = subtotal - discount + taxAmount;
  const terms = input.paymentTerms ?? "net15";
  const daysMap: Record<PaymentTerms, number> = { immediate: 0, net7: 7, net15: 15, net30: 30 };
  const invoice: Invoice = {
    id: nextInvoiceId(),
    patientId: input.patientId,
    sessionIds: input.sessionIds ?? [],
    issuedAt: now,
    dueAt: now + daysMap[terms] * DAY,
    lineItems,
    subtotal,
    taxRate,
    taxAmount,
    discount,
    total,
    amountPaid: 0,
    balance: total,
    status: input.status ?? "draft",
    currency: "INR",
    notes: input.notes,
    paymentTerms: terms,
    remindersSent: 0,
    activity: [{ id: uid("ev"), at: now, kind: "created" }],
  };
  mutate((s) => ({ ...s, invoices: [invoice, ...s.invoices], seq: { ...s.seq, invoice: s.seq.invoice + 1 } }));
  return invoice;
}

export function updateInvoiceStatus(id: string, status: InvoiceStatus, note?: string): void {
  mutate((s) => ({
    ...s,
    invoices: s.invoices.map((i) => i.id === id ? {
      ...i,
      status,
      activity: [...i.activity, { id: uid("ev"), at: Date.now(), kind: status === "sent" ? "sent" : status === "viewed" ? "viewed" : status === "paid" ? "paid" : status === "void" ? "voided" : status === "refunded" ? "refunded" : "created", note }],
    } : i),
  }));
}

export function sendReminder(id: string): void {
  mutate((s) => ({
    ...s,
    invoices: s.invoices.map((i) => i.id === id ? {
      ...i,
      remindersSent: i.remindersSent + 1,
      activity: [...i.activity, { id: uid("ev"), at: Date.now(), kind: "reminder" }],
    } : i),
  }));
}

export function recordPayment(input: { invoiceId: string; amount: number; method: PaymentMethod; reference?: string; reconciled?: boolean }): Payment {
  const now = Date.now();
  const inv = getInvoice(input.invoiceId);
  if (!inv) throw new Error("Invoice not found");
  const payment: Payment = {
    id: uid("pay"),
    invoiceId: input.invoiceId,
    patientId: inv.patientId,
    amount: input.amount,
    method: input.method,
    receivedAt: now,
    reference: input.reference,
    reconciled: input.reconciled ?? false,
  };
  mutate((s) => ({
    ...s,
    payments: [payment, ...s.payments],
    invoices: s.invoices.map((i) => {
      if (i.id !== input.invoiceId) return i;
      const amountPaid = i.amountPaid + input.amount;
      const balance = Math.max(0, i.total - amountPaid);
      const status: InvoiceStatus = balance === 0 ? "paid" : amountPaid > 0 ? "partial" : i.status;
      return {
        ...i,
        amountPaid,
        balance,
        status,
        activity: [...i.activity, { id: uid("ev"), at: now, kind: "payment", note: `${formatINR(input.amount)} · ${input.method.toUpperCase()}` }],
      };
    }),
  }));
  return payment;
}

export function toggleReconciled(paymentId: string): void {
  mutate((s) => ({
    ...s,
    payments: s.payments.map((p) => p.id === paymentId ? { ...p, reconciled: !p.reconciled } : p),
  }));
}

export function updateClaimStatus(id: string, status: ClaimStatus, note?: string): void {
  mutate((s) => ({
    ...s,
    claims: s.claims.map((c) => c.id === id ? {
      ...c,
      status,
      submittedAt: status === "submitted" && !c.submittedAt ? Date.now() : c.submittedAt,
      history: [...c.history, { at: Date.now(), status, note }],
    } : c),
  }));
}

export function upsertService(svc: ServiceRate): void {
  mutate((s) => {
    const exists = s.services.some((x) => x.id === svc.id);
    return { ...s, services: exists ? s.services.map((x) => x.id === svc.id ? svc : x) : [...s.services, svc] };
  });
}

// ─── Selectors / analytics ───────────────────────────────────
function isOverdue(inv: Invoice): boolean {
  return inv.balance > 0 && inv.status !== "paid" && inv.status !== "void" && inv.status !== "refunded" && Date.now() > inv.dueAt;
}

export function getOutstanding(): { total: number; count: number } {
  const invs = state().invoices.filter((i) => i.balance > 0 && i.status !== "void" && i.status !== "refunded");
  return { total: invs.reduce((s, i) => s + i.balance, 0), count: invs.length };
}

export function getOverdueCount(): number {
  return state().invoices.filter(isOverdue).length;
}
export function getOverdueTotal(): number {
  return state().invoices.filter(isOverdue).reduce((s, i) => s + i.balance, 0);
}

export function getRevenueByMonth(months = 6): Array<{ month: string; monthISO: string; byService: Record<string, number>; total: number }> {
  const now = new Date();
  const buckets: Array<{ month: string; monthISO: string; byService: Record<string, number>; total: number }> = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      month: d.toLocaleString("en", { month: "short" }),
      monthISO: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      byService: {},
      total: 0,
    });
  }
  for (const inv of state().invoices) {
    if (inv.status === "void" || inv.status === "refunded") continue;
    if (inv.amountPaid <= 0) continue;
    const d = new Date(inv.issuedAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const b = buckets.find((x) => x.monthISO === key);
    if (!b) continue;
    for (const li of inv.lineItems) {
      // rough service label from description
      const svc = li.description.split(" — ")[0];
      const share = (li.amount / inv.subtotal) * inv.amountPaid;
      b.byService[svc] = (b.byService[svc] ?? 0) + share;
      b.total += share;
    }
  }
  return buckets;
}

export function getAgingBuckets(): { label: string; days: string; amount: number; count: number }[] {
  const now = Date.now();
  const buckets = [
    { label: "Current", days: "not due", min: -Infinity, max: 0, amount: 0, count: 0 },
    { label: "1–30 days", days: "overdue", min: 0, max: 30, amount: 0, count: 0 },
    { label: "31–60 days", days: "overdue", min: 30, max: 60, amount: 0, count: 0 },
    { label: "60+ days", days: "overdue", min: 60, max: Infinity, amount: 0, count: 0 },
  ];
  for (const inv of state().invoices) {
    if (inv.balance <= 0 || inv.status === "void" || inv.status === "refunded") continue;
    const daysOverdue = (now - inv.dueAt) / DAY;
    for (const b of buckets) {
      if (daysOverdue > b.min && daysOverdue <= b.max) { b.amount += inv.balance; b.count += 1; break; }
    }
  }
  return buckets.map(({ label, days, amount, count }) => ({ label, days, amount, count }));
}

export function getRevenueByService(): { service: string; amount: number }[] {
  const map = new Map<string, number>();
  for (const inv of state().invoices) {
    if (inv.status === "void" || inv.status === "refunded") continue;
    for (const li of inv.lineItems) {
      const svc = li.description.split(" — ")[0];
      const share = inv.subtotal > 0 ? (li.amount / inv.subtotal) * inv.amountPaid : 0;
      map.set(svc, (map.get(svc) ?? 0) + share);
    }
  }
  return [...map.entries()].map(([service, amount]) => ({ service, amount })).sort((a, b) => b.amount - a.amount);
}

export function getRevenueByPatient(topN = 10): { patientId: string; name: string; amount: number }[] {
  const map = new Map<string, number>();
  for (const inv of state().invoices) {
    if (inv.status === "void" || inv.status === "refunded") continue;
    map.set(inv.patientId, (map.get(inv.patientId) ?? 0) + inv.amountPaid);
  }
  return [...map.entries()]
    .map(([patientId, amount]) => ({ patientId, amount, name: getPatient(patientId)?.fullName ?? patientId }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, topN);
}

export function getCollectionRate(days = 30): number {
  const cutoff = Date.now() - days * DAY;
  const invs = state().invoices.filter((i) => i.issuedAt >= cutoff && i.status !== "void" && i.status !== "refunded");
  const billed = invs.reduce((s, i) => s + i.total, 0);
  const paid = invs.reduce((s, i) => s + i.amountPaid, 0);
  return billed > 0 ? paid / billed : 0;
}

export function getAvgDaysToPay(): number {
  const paid = state().invoices.filter((i) => i.status === "paid");
  if (paid.length === 0) return 0;
  const days = paid.map((i) => {
    const lastPay = i.activity.filter((e) => e.kind === "payment" || e.kind === "paid").pop();
    return lastPay ? (lastPay.at - i.issuedAt) / DAY : 0;
  });
  return days.reduce((s, d) => s + d, 0) / days.length;
}

export function getInsuranceReimbursementRate(): number {
  const settled = state().claims.filter((c) => c.status === "paid" || c.status === "partial" || c.status === "denied");
  if (settled.length === 0) return 0;
  const claimed = settled.reduce((s, c) => s + c.claimedAmount, 0);
  const received = settled.reduce((s, c) => s + (c.paidAmount ?? 0), 0);
  return claimed > 0 ? received / claimed : 0;
}

export function getPaymentMix(days = 30): { method: PaymentMethod; amount: number; count: number }[] {
  const cutoff = Date.now() - days * DAY;
  const map = new Map<PaymentMethod, { amount: number; count: number }>();
  for (const p of state().payments) {
    if (p.receivedAt < cutoff) continue;
    const cur = map.get(p.method) ?? { amount: 0, count: 0 };
    map.set(p.method, { amount: cur.amount + p.amount, count: cur.count + 1 });
  }
  return [...map.entries()].map(([method, v]) => ({ method, ...v })).sort((a, b) => b.amount - a.amount);
}

export function getRevenueThisMonth(): { current: number; previous: number; delta: number } {
  const now = new Date();
  const startCur = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const startPrev = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
  let cur = 0, prev = 0;
  for (const p of state().payments) {
    if (p.receivedAt >= startCur) cur += p.amount;
    else if (p.receivedAt >= startPrev) prev += p.amount;
  }
  const delta = prev > 0 ? (cur - prev) / prev : 0;
  return { current: cur, previous: prev, delta };
}

// ─── Hooks ───────────────────────────────────────────────────
function useSnap<T>(read: () => T): T {
  const [v, setV] = useState<T>(read);
  useEffect(() => {
    setV(read());
    return subscribe(() => setV(read()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return v;
}
export function useLiveInvoices(filter?: Parameters<typeof listInvoices>[0]): Invoice[] {
  const key = JSON.stringify(filter ?? {});
  const [v, setV] = useState<Invoice[]>(() => listInvoices(filter));
  useEffect(() => { setV(listInvoices(filter)); return subscribe(() => setV(listInvoices(filter))); }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  return v;
}
export function useLiveInvoice(id: string): Invoice | undefined {
  const [v, setV] = useState(() => getInvoice(id));
  useEffect(() => { setV(getInvoice(id)); return subscribe(() => setV(getInvoice(id))); }, [id]);
  return v;
}
export function useLiveClaims(filter?: Parameters<typeof listClaims>[0]): InsuranceClaim[] {
  const key = JSON.stringify(filter ?? {});
  const [v, setV] = useState<InsuranceClaim[]>(() => listClaims(filter));
  useEffect(() => { setV(listClaims(filter)); return subscribe(() => setV(listClaims(filter))); }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  return v;
}
export function useLiveClaim(id: string): InsuranceClaim | undefined {
  const [v, setV] = useState(() => getClaim(id));
  useEffect(() => { setV(getClaim(id)); return subscribe(() => setV(getClaim(id))); }, [id]);
  return v;
}
export function useLivePayments(): Payment[] { return useSnap(() => listPayments()); }
export function useLiveServices(): ServiceRate[] { return useSnap(() => listServices()); }
export function useOverdueCount(): number { return useSnap(() => getOverdueCount()); }


// ─── Status meta ─────────────────────────────────────────────
export const INVOICE_STATUS_META: Record<InvoiceStatus, { label: string; color: string; soft: string }> = {
  draft:    { label: "Draft",    color: "#B7B0AF", soft: "#EFECEA" },
  sent:     { label: "Sent",     color: "#8A94A6", soft: "#EEF1F5" },
  viewed:   { label: "Viewed",   color: "#7A85A0", soft: "#E7ECF3" },
  paid:     { label: "Paid",     color: "#5C8F6B", soft: "#E6F0E8" },
  partial:  { label: "Partial",  color: "#B7935A", soft: "#F5ECDA" },
  overdue:  { label: "Overdue",  color: "#B6763A", soft: "#F3E4CE" },
  void:     { label: "Void",     color: "#9AA0AB", soft: "#ECEEF2" },
  refunded: { label: "Refunded", color: "#8B8AA4", soft: "#ECEAF3" },
};

export const CLAIM_STATUS_META: Record<ClaimStatus, { label: string; color: string; soft: string }> = {
  not_submitted: { label: "Not submitted", color: "#B7B0AF", soft: "#EFECEA" },
  submitted:     { label: "Submitted",     color: "#B7935A", soft: "#F5ECDA" },
  in_review:     { label: "In review",     color: "#B6763A", soft: "#F3E4CE" },
  approved:      { label: "Approved",      color: "#5C8F6B", soft: "#E6F0E8" },
  partial:       { label: "Partial",       color: "#B7935A", soft: "#F5ECDA" },
  denied:        { label: "Denied",        color: "#B0567A", soft: "#F1DCE4" },
  paid:          { label: "Paid",          color: "#5C8F6B", soft: "#E6F0E8" },
};

export const METHOD_META: Record<PaymentMethod, { label: string; color: string }> = {
  upi:           { label: "UPI",            color: "#7BA88A" },
  card:          { label: "Card",           color: "#B0567A" },
  netbanking:    { label: "Netbanking",     color: "#8AA2C8" },
  cash:          { label: "Cash",           color: "#C2A97E" },
  bank_transfer: { label: "Bank transfer",  color: "#9E8BB5" },
  insurance:     { label: "Insurance",      color: "#B6763A" },
};

// Palette shared with viz — muted, editorial.
export const CHART_PALETTE = ["#7BA88A", "#C2A97E", "#B0567A", "#9E8BB5", "#8AA2C8", "#B6763A"];

// ─── Seed ────────────────────────────────────────────────────
function seed(): StoreShape {
  const now = Date.now();
  const services: ServiceRate[] = [
    { id: "svc_ind50", service: "Individual Therapy", duration: 50, standardRate: 2400, cptCode: "90837", slidingScaleRates: [{ tier: "Student", rate: 1600 }, { tier: "Concession", rate: 1200 }] },
    { id: "svc_couples", service: "Couples Therapy", duration: 60, standardRate: 3600, cptCode: "90847" },
    { id: "svc_intake", service: "Intake / Diagnostic", duration: 90, standardRate: 4200, cptCode: "90791" },
    { id: "svc_assess", service: "Psychological Assessment", duration: 120, standardRate: 5500, cptCode: "96130" },
    { id: "svc_family", service: "Family Session", duration: 60, standardRate: 3200, cptCode: "90846" },
    { id: "svc_group", service: "Group Therapy", duration: 90, standardRate: 1400, cptCode: "90853" },
    { id: "svc_teleFollow", service: "Follow-up (Telehealth)", duration: 30, standardRate: 1600, cptCode: "90832" },
    { id: "svc_crisis", service: "Crisis Consultation", duration: 45, standardRate: 3000, cptCode: "90839" },
    { id: "svc_report", service: "Report Writing (per hour)", duration: 60, standardRate: 2800 },
    { id: "svc_supervision", service: "Clinical Supervision", duration: 60, standardRate: 2000 },
  ];

  const DAY_ = 86_400_000;
  const patients = [
    "pat_priya", "pat_aarav", "pat_ananya", "pat_kabir", "pat_diya",
    "pat_rohan", "pat_meera", "pat_sanjay", "pat_isha", "pat_vikram", "pat_zara",
  ];

  const invoices: Invoice[] = [];
  const payments: Payment[] = [];
  let invSeq = 0;
  const year = new Date().getFullYear();
  const invId = () => { invSeq += 1; return `INV-${year}-${String(invSeq).padStart(4, "0")}`; };

  // 6 months of history; each patient gets 3-6 invoices
  patients.forEach((pid, idx) => {
    const count = 3 + (idx % 4); // 3..6
    for (let i = 0; i < count; i++) {
      const daysAgo = 5 + i * 22 + (idx * 3);
      const svc = services[(i + idx) % 5];
      const issued = now - daysAgo * DAY_;
      const line: LineItem = {
        id: uid("li"),
        description: `${svc.service} — ${svc.duration} min`,
        qty: 1,
        rate: svc.standardRate,
        amount: svc.standardRate,
        cptCode: svc.cptCode,
      };
      const subtotal = line.amount;
      const discount = idx === 2 && i === 0 ? 500 : 0;
      const taxRate = 0.18;
      const taxAmount = Math.round((subtotal - discount) * taxRate);
      const total = subtotal - discount + taxAmount;
      const dueAt = issued + 15 * DAY_;

      // Status logic — mostly paid, few pending / overdue / partial
      let status: InvoiceStatus = "paid";
      let amountPaid = total;
      if (daysAgo < 6 && i === count - 1) { status = "sent"; amountPaid = 0; }
      else if (idx === 5 && i === count - 1) { status = "overdue"; amountPaid = 0; }
      else if (idx === 7 && i === count - 1) { status = "overdue"; amountPaid = 0; }
      else if (idx === 9 && i === count - 1) { status = "overdue"; amountPaid = 0; }
      else if (idx === 3 && i === count - 1) { status = "partial"; amountPaid = Math.round(total / 2); }
      else if (idx === 6 && i === 0) { status = "refunded"; amountPaid = total; }

      const balance = Math.max(0, total - amountPaid);
      const activity: InvoiceEvent[] = [{ id: uid("ev"), at: issued, kind: "created" }];
      activity.push({ id: uid("ev"), at: issued + 3600_000, kind: "sent" });
      if (amountPaid > 0 && status !== "refunded") activity.push({ id: uid("ev"), at: issued + 2 * DAY_, kind: "payment", note: `${formatINR(amountPaid)}` });
      if (status === "paid") activity.push({ id: uid("ev"), at: issued + 2 * DAY_ + 60_000, kind: "paid" });
      if (status === "refunded") activity.push({ id: uid("ev"), at: issued + 8 * DAY_, kind: "refunded" });

      const inv: Invoice = {
        id: invId(),
        patientId: pid,
        sessionIds: [],
        issuedAt: issued,
        dueAt,
        lineItems: [line],
        subtotal,
        taxRate,
        taxAmount,
        discount,
        total,
        amountPaid,
        balance,
        status,
        currency: "INR",
        paymentTerms: "net15",
        remindersSent: status === "overdue" ? 2 : 0,
        activity,
      };
      invoices.push(inv);

      // Payment records
      if (amountPaid > 0 && status !== "refunded") {
        const methods: PaymentMethod[] = ["upi", "card", "netbanking", "upi", "card", "cash", "insurance"];
        payments.push({
          id: uid("pay"),
          invoiceId: inv.id,
          patientId: pid,
          amount: amountPaid,
          method: methods[(idx + i) % methods.length],
          receivedAt: issued + 2 * DAY_,
          reference: `TXN${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
          reconciled: daysAgo > 10,
        });
      }
    }
  });

  // Insurance claims — 4 paid, 2 in review, 1 partial, 1 denied
  const insurers = ["Star Health", "HDFC ERGO", "ICICI Lombard", "Niva Bupa", "Care Health"];
  const claimSeed: Array<{ status: ClaimStatus; days: number; approvedPct?: number; denial?: string }> = [
    { status: "paid", days: 40, approvedPct: 1 },
    { status: "paid", days: 55, approvedPct: 1 },
    { status: "paid", days: 32, approvedPct: 1 },
    { status: "paid", days: 70, approvedPct: 1 },
    { status: "in_review", days: 12 },
    { status: "in_review", days: 22 },
    { status: "partial", days: 45, approvedPct: 0.6 },
    { status: "denied", days: 38, denial: "Pre-authorization not obtained prior to first session." },
  ];
  let clmSeq = 0;
  const clmId = () => { clmSeq += 1; return `CLM-${year}-${String(clmSeq).padStart(4, "0")}`; };
  const claims: InsuranceClaim[] = claimSeed.map((c, idx) => {
    const inv = invoices[idx * 3];
    const submittedAt = now - c.days * DAY_;
    const claimedAmount = inv.total;
    const approvedAmount = c.approvedPct !== undefined ? Math.round(claimedAmount * c.approvedPct) : undefined;
    const paidAmount = c.status === "paid" || c.status === "partial" ? approvedAmount : undefined;
    const history: { at: number; status: ClaimStatus; note?: string }[] = [
      { at: submittedAt, status: "submitted" },
      { at: submittedAt + 4 * DAY_, status: "in_review" },
    ];
    if (c.status === "paid") history.push({ at: submittedAt + 18 * DAY_, status: "approved" }, { at: submittedAt + 22 * DAY_, status: "paid" });
    if (c.status === "partial") history.push({ at: submittedAt + 20 * DAY_, status: "partial", note: "Approved at reduced rate per plan schedule." });
    if (c.status === "denied") history.push({ at: submittedAt + 15 * DAY_, status: "denied", note: c.denial });
    return {
      id: clmId(),
      invoiceId: inv.id,
      patientId: inv.patientId,
      insurer: insurers[idx % insurers.length],
      policyNumber: `PN${1_000_000 + idx * 137}`,
      submittedAt,
      claimedAmount,
      approvedAmount,
      paidAmount,
      status: c.status,
      denialReason: c.denial,
      documents: [
        { id: uid("doc"), name: "Claim form.pdf", kind: "form" },
        { id: uid("doc"), name: "Superbill.pdf", kind: "receipt" },
      ],
      history,
    };
  });

  return { invoices, payments, claims, services, seq: { invoice: invSeq, claim: clmSeq } };
}

// Ignore unused patient warnings — kept for future validators.
export const _ = { listPatients };
