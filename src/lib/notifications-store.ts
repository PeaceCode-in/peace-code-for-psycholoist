// Notifications store — single source of truth for every alert routed to the therapist.
// Persisted to localStorage. Seeded with 48h of plausible activity.

import { useSyncExternalStore, useCallback, useEffect, useRef } from "react";

export type NotifCategory =
  | "sessions"
  | "patients"
  | "billing"
  | "team"
  | "system";

export type NotifSeverity = "info" | "attention" | "urgent";

export type NotifType =
  | "session_reminder_24h"
  | "session_reminder_1h"
  | "session_starting"
  | "patient_message"
  | "assessment_submitted"
  | "risk_flag"
  | "invoice_paid"
  | "invoice_overdue"
  | "refund_issued"
  | "supervisor_comment"
  | "cosign_request"
  | "case_handoff"
  | "system_announcement"
  | "system_maintenance";

export type Notification = {
  id: string;
  type: NotifType;
  category: NotifCategory;
  severity: NotifSeverity;
  source: string;          // "Priya M." or "System" or "Dr. Nair"
  title: string;
  preview: string;
  body?: string;
  timestamp: number;
  readAt: number | null;
  snoozedUntil: number | null;
  archivedAt: number | null;
  deepLink: string;
  meta?: Record<string, string | number>;
};

export type NotifTask = {
  id: string;
  fromNotifId?: string;
  title: string;
  createdAt: number;
  dueAt: number | null;
  doneAt: number | null;
};

export type DigestMode = "realtime" | "hourly" | "daily" | "weekly";

export type ChannelMatrix = {
  inapp: boolean;
  email: boolean;
  sms: boolean;
  push: boolean;
};

export type NotifPreferences = {
  perType: Record<NotifType, ChannelMatrix>;
  digest: DigestMode;
  quietHours: { enabled: boolean; from: string; to: string; timezone: string };
  dnd: { enabled: boolean; until: number | null };
  sound: boolean; // soft chime for urgent
};

type Store = {
  items: Notification[];
  tasks: NotifTask[];
  prefs: NotifPreferences;
};

const KEY = "pc.notifs.v1";

const now = () => Date.now();
const HOUR = 3_600_000;
const MIN = 60_000;

function defaultChannel(over?: Partial<ChannelMatrix>): ChannelMatrix {
  return { inapp: true, email: true, sms: false, push: false, ...over };
}

function defaultPrefs(): NotifPreferences {
  const allTypes: NotifType[] = [
    "session_reminder_24h","session_reminder_1h","session_starting",
    "patient_message","assessment_submitted","risk_flag",
    "invoice_paid","invoice_overdue","refund_issued",
    "supervisor_comment","cosign_request","case_handoff",
    "system_announcement","system_maintenance",
  ];
  const perType = {} as Record<NotifType, ChannelMatrix>;
  for (const t of allTypes) perType[t] = defaultChannel();
  // sensible overrides
  perType.risk_flag = defaultChannel({ sms: true, push: true });
  perType.system_announcement = { inapp: true, email: false, sms: false, push: false };
  perType.system_maintenance = { inapp: true, email: false, sms: false, push: false };
  perType.invoice_paid = defaultChannel({ email: false });
  return {
    perType,
    digest: "realtime",
    quietHours: { enabled: true, from: "21:00", to: "07:30", timezone: "Asia/Kolkata" },
    dnd: { enabled: false, until: null },
    sound: false,
  };
}

function seed(): Store {
  const t = now();
  const mk = (n: Partial<Notification> & Pick<Notification, "type" | "category" | "severity" | "source" | "title" | "preview" | "timestamp" | "deepLink">): Notification => ({
    id: crypto.randomUUID(),
    body: undefined,
    readAt: null,
    snoozedUntil: null,
    archivedAt: null,
    ...n,
  });
  const items: Notification[] = [
    mk({ type: "risk_flag", category: "patients", severity: "urgent",
      source: "Priya M.", title: "PHQ-9 item 9 elevated",
      preview: "Priya M.'s intake assessment flagged self-harm ideation (item 9 = 2).",
      body: "PHQ-9 submitted 12 minutes ago. Total score 18. Item 9 (thoughts of being better off dead) rated 2 — more than half the days. Review before your 4:30pm session.",
      timestamp: t - 12 * MIN, deepLink: "/patients", meta: { score: 18 } }),
    mk({ type: "session_reminder_1h", category: "sessions", severity: "attention",
      source: "Calendar", title: "Session with Arjun K. in 55 minutes",
      preview: "Telehealth · Session 6 of 12 · Prep sheet ready.",
      timestamp: t - 5 * MIN, deepLink: "/sessions" }),
    mk({ type: "patient_message", category: "patients", severity: "attention",
      source: "Meera R.", title: "New message from Meera R.",
      preview: "Hi Dr. Sharma, I wanted to ask about the breathing exercise we discussed…",
      timestamp: t - 22 * MIN, deepLink: "/messages" }),
    mk({ type: "assessment_submitted", category: "patients", severity: "info",
      source: "Arjun K.", title: "GAD-7 completed by Arjun K.",
      preview: "Score 9 — mild anxiety. Down from 14 last month.",
      timestamp: t - 40 * MIN, deepLink: "/assessments", meta: { score: 9 } }),
    mk({ type: "invoice_paid", category: "billing", severity: "info",
      source: "Razorpay", title: "Invoice #INV-2041 paid",
      preview: "Meera R. · ₹2,400 · UPI",
      timestamp: t - 1 * HOUR - 10 * MIN, deepLink: "/billing/invoices" }),
    mk({ type: "session_reminder_24h", category: "sessions", severity: "info",
      source: "Calendar", title: "3 sessions tomorrow",
      preview: "Priya M. 10:00 · Arjun K. 14:00 · Rohan D. 17:30",
      timestamp: t - 2 * HOUR, deepLink: "/calendar", readAt: t - 90 * MIN }),
    mk({ type: "supervisor_comment", category: "team", severity: "attention",
      source: "Dr. Nair", title: "Dr. Nair left a supervision note",
      preview: "\"Consider revisiting the CBT formulation for R.D. — the schema piece looks under-developed.\"",
      timestamp: t - 3 * HOUR, deepLink: "/team/supervision" }),
    mk({ type: "cosign_request", category: "team", severity: "attention",
      source: "Anaya P.", title: "Co-sign requested by Anaya P.",
      preview: "Intake note for new patient · awaiting your review",
      timestamp: t - 4 * HOUR, deepLink: "/team/supervision" }),
    mk({ type: "invoice_overdue", category: "billing", severity: "attention",
      source: "Billing", title: "Invoice #INV-2032 is 4 days overdue",
      preview: "Rohan D. · ₹3,200 · last reminder sent 2 days ago",
      timestamp: t - 5 * HOUR, deepLink: "/billing/invoices" }),
    mk({ type: "patient_message", category: "patients", severity: "info",
      source: "Kabir S.", title: "New message from Kabir S.",
      preview: "Confirming Thursday at 11 works for me. Thanks.",
      timestamp: t - 7 * HOUR, deepLink: "/messages", readAt: t - 6 * HOUR }),
    mk({ type: "case_handoff", category: "team", severity: "info",
      source: "Dr. Iyer", title: "Case handoff accepted",
      preview: "You now hold primary care for M.R. — history syncs on your next login.",
      timestamp: t - 10 * HOUR, deepLink: "/team/handoffs", readAt: t - 9 * HOUR }),
    mk({ type: "refund_issued", category: "billing", severity: "info",
      source: "Billing", title: "Refund issued to Sana Q.",
      preview: "₹1,600 refunded — session rescheduled",
      timestamp: t - 14 * HOUR, deepLink: "/billing/invoices", readAt: t - 12 * HOUR }),
    mk({ type: "system_announcement", category: "system", severity: "info",
      source: "PeaceCode", title: "New: cascading snooze menu in the inbox",
      preview: "Try pressing S on any notification to see it in action.",
      timestamp: t - 22 * HOUR, deepLink: "/inbox", readAt: t - 20 * HOUR }),
    mk({ type: "system_maintenance", category: "system", severity: "info",
      source: "PeaceCode", title: "Scheduled maintenance · Sunday 2am–3am IST",
      preview: "The video service will restart briefly. No sessions are affected.",
      timestamp: t - 30 * HOUR, deepLink: "/inbox", readAt: t - 26 * HOUR }),
    mk({ type: "assessment_submitted", category: "patients", severity: "info",
      source: "Rohan D.", title: "PHQ-9 completed by Rohan D.",
      preview: "Score 6 — mild. Steady improvement over 3 weeks.",
      timestamp: t - 34 * HOUR, deepLink: "/assessments", readAt: t - 32 * HOUR, meta: { score: 6 } }),
    mk({ type: "invoice_paid", category: "billing", severity: "info",
      source: "Razorpay", title: "Invoice #INV-2039 paid",
      preview: "Kabir S. · ₹2,400 · Card",
      timestamp: t - 38 * HOUR, deepLink: "/billing/invoices", readAt: t - 36 * HOUR }),
    mk({ type: "patient_message", category: "patients", severity: "info",
      source: "Priya M.", title: "New message from Priya M.",
      preview: "Sharing the mood log for this week as promised.",
      timestamp: t - 44 * HOUR, deepLink: "/messages", readAt: t - 40 * HOUR }),
  ];
  return {
    items,
    tasks: [
      { id: crypto.randomUUID(), title: "Draft C-SSRS follow-up plan for Priya M.", createdAt: t - 30 * MIN, dueAt: t + 6 * HOUR, doneAt: null },
      { id: crypto.randomUUID(), title: "Review Rohan D. treatment plan mid-point", createdAt: t - 20 * HOUR, dueAt: t + 30 * HOUR, doneAt: null },
      { id: crypto.randomUUID(), title: "Reply to Meera about breathing exercise variants", createdAt: t - 22 * MIN, dueAt: null, doneAt: null },
    ],
    prefs: defaultPrefs(),
  };
}

function load(): Store {
  if (typeof window === "undefined") return { items: [], tasks: [], prefs: defaultPrefs() };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const s = seed();
      localStorage.setItem(KEY, JSON.stringify(s));
      return s;
    }
    const parsed = JSON.parse(raw) as Store;
    if (!parsed.prefs) parsed.prefs = defaultPrefs();
    if (!parsed.tasks) parsed.tasks = [];
    return parsed;
  } catch {
    return seed();
  }
}

let state: Store = typeof window === "undefined" ? { items: [], tasks: [], prefs: defaultPrefs() } : load();
const listeners = new Set<() => void>();

function save() {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
}
function emit() {
  save();
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) { listeners.add(l); return () => { listeners.delete(l); }; }
function getSnapshot() { return state; }

// ─── selectors ──────────────────────────────────────────────────────────
export function useNotifs() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

const isVisible = (n: Notification) => !n.archivedAt && (!n.snoozedUntil || n.snoozedUntil <= now());

export function useUnreadCount() {
  const s = useNotifs();
  return s.items.filter((n) => isVisible(n) && !n.readAt).length;
}

export function useHasUrgent() {
  const s = useNotifs();
  return s.items.some((n) => isVisible(n) && !n.readAt && n.severity === "urgent");
}

export function useRecent(limit = 5) {
  const s = useNotifs();
  return s.items
    .filter(isVisible)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}

export type InboxCategoryKey =
  | "today" | "needs" | "sessions" | "patients" | "billing" | "team" | "system" | "archived" | "snoozed";

export function categoryLabel(k: InboxCategoryKey): string {
  return ({
    today: "Today", needs: "Needs response", sessions: "Sessions", patients: "Patients",
    billing: "Billing", team: "Team", system: "System", archived: "Archived", snoozed: "Snoozed",
  })[k];
}

function filterByCategory(items: Notification[], k: InboxCategoryKey): Notification[] {
  const t = now();
  const isToday = (ts: number) => {
    const d = new Date(ts); const n = new Date();
    return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
  };
  if (k === "archived") return items.filter((n) => n.archivedAt);
  if (k === "snoozed") return items.filter((n) => n.snoozedUntil && n.snoozedUntil > t && !n.archivedAt);
  const base = items.filter(isVisible);
  if (k === "today") return base.filter((n) => isToday(n.timestamp));
  if (k === "needs") return base.filter((n) => !n.readAt && (n.severity !== "info" || n.type === "patient_message"));
  if (k === "sessions") return base.filter((n) => n.category === "sessions");
  if (k === "patients") return base.filter((n) => n.category === "patients");
  if (k === "billing") return base.filter((n) => n.category === "billing");
  if (k === "team") return base.filter((n) => n.category === "team");
  if (k === "system") return base.filter((n) => n.category === "system");
  return base;
}

export function useCategoryItems(k: InboxCategoryKey) {
  const s = useNotifs();
  return filterByCategory(s.items, k).sort((a, b) => b.timestamp - a.timestamp);
}

export function useCategoryCounts(): Record<InboxCategoryKey, number> {
  const s = useNotifs();
  const keys: InboxCategoryKey[] = ["today","needs","sessions","patients","billing","team","system","archived","snoozed"];
  const out = {} as Record<InboxCategoryKey, number>;
  for (const k of keys) {
    const list = filterByCategory(s.items, k);
    out[k] = k === "archived" || k === "snoozed"
      ? list.length
      : list.filter((n) => !n.readAt).length;
  }
  return out;
}

export function useTasks() {
  const s = useNotifs();
  return s.tasks;
}

// ─── mutations ─────────────────────────────────────────────────────────
export function markRead(id: string, read = true) {
  state = { ...state, items: state.items.map((n) => n.id === id ? { ...n, readAt: read ? now() : null } : n) };
  emit();
}
export function markAllRead(ids?: string[]) {
  const set = ids ? new Set(ids) : null;
  const t = now();
  state = { ...state, items: state.items.map((n) => (!set || set.has(n.id)) ? { ...n, readAt: n.readAt ?? t } : n) };
  emit();
}
export function archive(id: string) {
  state = { ...state, items: state.items.map((n) => n.id === id ? { ...n, archivedAt: now() } : n) };
  emit();
}
export function unarchive(id: string) {
  state = { ...state, items: state.items.map((n) => n.id === id ? { ...n, archivedAt: null } : n) };
  emit();
}
export function snooze(id: string, until: number) {
  state = { ...state, items: state.items.map((n) => n.id === id ? { ...n, snoozedUntil: until, readAt: n.readAt ?? now() } : n) };
  emit();
}
export function unsnooze(id: string) {
  state = { ...state, items: state.items.map((n) => n.id === id ? { ...n, snoozedUntil: null } : n) };
  emit();
}
export function bulkArchive(ids: string[]) {
  const set = new Set(ids); const t = now();
  state = { ...state, items: state.items.map((n) => set.has(n.id) ? { ...n, archivedAt: t } : n) };
  emit();
}
export function bulkSnooze(ids: string[], until: number) {
  const set = new Set(ids); const t = now();
  state = { ...state, items: state.items.map((n) => set.has(n.id) ? { ...n, snoozedUntil: until, readAt: n.readAt ?? t } : n) };
  emit();
}

export function convertToTask(id: string) {
  const item = state.items.find((n) => n.id === id);
  if (!item) return;
  const task: NotifTask = {
    id: crypto.randomUUID(),
    fromNotifId: id,
    title: item.title,
    createdAt: now(),
    dueAt: null,
    doneAt: null,
  };
  state = { ...state, tasks: [task, ...state.tasks], items: state.items.map((n) => n.id === id ? { ...n, readAt: n.readAt ?? now(), archivedAt: now() } : n) };
  emit();
}
export function addTask(title: string, dueAt: number | null = null) {
  const task: NotifTask = { id: crypto.randomUUID(), title, createdAt: now(), dueAt, doneAt: null };
  state = { ...state, tasks: [task, ...state.tasks] };
  emit();
}
export function toggleTask(id: string) {
  state = { ...state, tasks: state.tasks.map((t) => t.id === id ? { ...t, doneAt: t.doneAt ? null : now() } : t) };
  emit();
}
export function removeTask(id: string) {
  state = { ...state, tasks: state.tasks.filter((t) => t.id !== id) };
  emit();
}

export function setPrefs(updater: (p: NotifPreferences) => NotifPreferences) {
  state = { ...state, prefs: updater(state.prefs) };
  emit();
}
export function setDND(enabled: boolean, until: number | null = null) {
  setPrefs((p) => ({ ...p, dnd: { enabled, until } }));
}

// ─── ticker: drip in a fresh event every few minutes so the UI feels awake ──
const TICKER_EVENTS: Array<Partial<Notification> & Pick<Notification, "type" | "category" | "severity" | "source" | "title" | "preview" | "deepLink">> = [
  { type: "patient_message", category: "patients", severity: "info", source: "Sana Q.",
    title: "New message from Sana Q.", preview: "Thank you for the resources — the workbook is helpful.", deepLink: "/messages" },
  { type: "assessment_submitted", category: "patients", severity: "info", source: "Meera R.",
    title: "GAD-7 completed by Meera R.", preview: "Score 7 — mild. Stable over 4 weeks.", deepLink: "/assessments" },
  { type: "invoice_paid", category: "billing", severity: "info", source: "Razorpay",
    title: "Invoice #INV-2044 paid", preview: "Sana Q. · ₹2,400 · UPI", deepLink: "/billing/invoices" },
];

let tickerStarted = false;
export function useNotificationTicker() {
  const ref = useRef<number | null>(null);
  useEffect(() => {
    if (tickerStarted) return;
    tickerStarted = true;
    ref.current = window.setInterval(() => {
      // pause during DND
      if (state.prefs.dnd.enabled) return;
      const e = TICKER_EVENTS[Math.floor(Math.random() * TICKER_EVENTS.length)];
      const n: Notification = {
        id: crypto.randomUUID(),
        readAt: null, snoozedUntil: null, archivedAt: null,
        timestamp: Date.now(),
        ...e,
      } as Notification;
      state = { ...state, items: [n, ...state.items].slice(0, 200) };
      emit();
    }, 4 * 60_000); // 4 min
    return () => { if (ref.current) window.clearInterval(ref.current); tickerStarted = false; };
  }, []);
}

// ─── helpers ─────────────────────────────────────────────────────────
export function relTime(ts: number, ref = now()): string {
  const d = ref - ts;
  if (d < 60_000) return "now";
  if (d < HOUR) return `${Math.floor(d / MIN)}m`;
  if (d < 24 * HOUR) return `${Math.floor(d / HOUR)}h`;
  const days = Math.floor(d / (24 * HOUR));
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d`;
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function absTime(ts: number): string {
  return new Date(ts).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function snoozeOptions(): Array<{ label: string; at: number }> {
  const t = now();
  const d = new Date(t);
  // this evening: 6pm today (or tomorrow if past)
  const evening = new Date(d); evening.setHours(18, 0, 0, 0);
  if (evening.getTime() <= t) evening.setDate(evening.getDate() + 1);
  // tomorrow morning: 8am
  const morning = new Date(d); morning.setDate(morning.getDate() + 1); morning.setHours(8, 0, 0, 0);
  // next week: next Monday 8am
  const nextWeek = new Date(d);
  const dow = nextWeek.getDay();
  const daysUntilMon = ((1 - dow + 7) % 7) || 7;
  nextWeek.setDate(nextWeek.getDate() + daysUntilMon); nextWeek.setHours(8, 0, 0, 0);
  return [
    { label: "In 1 hour",       at: t + HOUR },
    { label: "In 3 hours",      at: t + 3 * HOUR },
    { label: "This evening",    at: evening.getTime() },
    { label: "Tomorrow morning",at: morning.getTime() },
    { label: "Next week",       at: nextWeek.getTime() },
  ];
}

// undo bar handling
type UndoAction = { message: string; undo: () => void; at: number };
let currentUndo: UndoAction | null = null;
const undoListeners = new Set<() => void>();
function emitUndo() { undoListeners.forEach((l) => l()); }
export function pushUndo(message: string, undo: () => void) {
  currentUndo = { message, undo, at: now() };
  emitUndo();
  window.setTimeout(() => {
    if (currentUndo && Date.now() - currentUndo.at >= 9500) { currentUndo = null; emitUndo(); }
  }, 10000);
}
export function useUndo() {
  const snap = useSyncExternalStore(
    useCallback((l: () => void) => { undoListeners.add(l); return () => undoListeners.delete(l); }, []),
    () => currentUndo,
    () => currentUndo,
  );
  return {
    action: snap,
    dismiss: () => { currentUndo = null; emitUndo(); },
    run: () => { snap?.undo(); currentUndo = null; emitUndo(); },
  };
}

export const ALL_NOTIF_TYPES: NotifType[] = [
  "session_reminder_24h","session_reminder_1h","session_starting",
  "patient_message","assessment_submitted","risk_flag",
  "invoice_paid","invoice_overdue","refund_issued",
  "supervisor_comment","cosign_request","case_handoff",
  "system_announcement","system_maintenance",
];

export const NOTIF_TYPE_LABEL: Record<NotifType, string> = {
  session_reminder_24h: "Session reminder · 24h",
  session_reminder_1h: "Session reminder · 1h",
  session_starting: "Session starting",
  patient_message: "Patient message",
  assessment_submitted: "Assessment submitted",
  risk_flag: "Risk flag",
  invoice_paid: "Invoice paid",
  invoice_overdue: "Invoice overdue",
  refund_issued: "Refund issued",
  supervisor_comment: "Supervisor comment",
  cosign_request: "Co-sign request",
  case_handoff: "Case handoff",
  system_announcement: "Announcement",
  system_maintenance: "Maintenance",
};
