// PeaceCode · Practice — Messages store.
// Threaded HIPAA-shaped inbox. localStorage-backed, event-driven.

import { useSyncExternalStore } from "react";
import { listPatients, getPatient, type Patient } from "./patients-store";

// ─── Types ──────────────────────────────────────────────────
export type Role = "therapist" | "patient" | "system";

export type Attachment = {
  id: string;
  filename: string;
  sizeBytes: number;
  mimeType: string;
  uploadedAt: string;
};

export type Message = {
  id: string;
  threadId: string;
  senderId: string;
  senderRole: Role;
  body: string;
  attachments: Attachment[];
  sentAt: string;
  readBy: { userId: string; readAt: string }[];
  editedAt?: string;
  deletedAt?: string;
  replyToId?: string;
};

export type Thread = {
  id: string;
  patientId: string;
  subject: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
  lastMessagePreview: string;
  unreadCount: number;
  isStarred: boolean;
  isArchived: boolean;
  labels: string[];
  participantIds: string[];
};

export type CannedResponse = {
  id: string;
  shortcut: string;
  title: string;
  body: string;
  category: "scheduling" | "clinical" | "billing" | "warmth";
  useCount: number;
};

export type AutoReply = {
  enabled: boolean;
  startAt?: string;
  endAt?: string;
  message: string;
  emergencyRedirect: boolean;
};

export type MessageSettings = {
  signature: string;
  signatureEnabled: boolean;
  autoReply: AutoReply;
  notifyEmail: boolean;
  notifyDesktop: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  retention: "forever" | "7y" | "3y";
};

export type Draft = {
  threadId?: string;
  patientId?: string;
  subject?: string;
  body: string;
  updatedAt: string;
};

export type AuditAction =
  | "send" | "read" | "edit" | "delete"
  | "download_attachment" | "star" | "unstar" | "archive" | "unarchive"
  | "label_add" | "label_remove" | "auto_reply_fired" | "canned_used";

export type AuditEvent = {
  id: string;
  at: string;
  actorId: string;
  actorRole: Role;
  action: AuditAction;
  threadId: string;
  messageId?: string;
  meta?: Record<string, unknown>;
};

type StoreShape = {
  threads: Thread[];
  messages: Message[];
  canned: CannedResponse[];
  settings: MessageSettings;
  drafts: Draft[];
  audit: AuditEvent[];
};

// ─── Constants ──────────────────────────────────────────────
export const THERAPIST_ID = "me";
export const THERAPIST_NAME = "Dr. Sharma";
export const ALLOWED_MIME = [
  "application/pdf", "image/png", "image/jpeg", "text/plain", "audio/mpeg",
] as const;
export const MAX_BODY = 8000;
export const MAX_SUBJECT = 140;
export const MAX_FILENAME = 200;

const KEY = "pc.msg.store.v1";

// ─── Event bus ──────────────────────────────────────────────
const listeners = new Set<() => void>();
function emit() { listeners.forEach((fn) => fn()); }
function subscribe(fn: () => void) { listeners.add(fn); return () => listeners.delete(fn); }

// ─── Persistence ────────────────────────────────────────────
function isBrowser() { return typeof window !== "undefined" && typeof localStorage !== "undefined"; }

let cache: StoreShape | null = null;

function load(): StoreShape {
  if (!isBrowser()) return seed();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const s = seed();
      localStorage.setItem(KEY, JSON.stringify(s));
      return s;
    }
    return JSON.parse(raw) as StoreShape;
  } catch { return seed(); }
}
function save(s: StoreShape) {
  if (!isBrowser()) return;
  try { localStorage.setItem(KEY, JSON.stringify(s)); emit(); } catch { /* quota */ }
}
function state(): StoreShape {
  if (!cache) cache = load();
  return cache;
}
function mutate(fn: (s: StoreShape) => StoreShape) {
  cache = fn(state());
  save(cache);
}

// ─── IDs ────────────────────────────────────────────────────
function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}
function now(): string { return new Date().toISOString(); }

// ─── Validation ─────────────────────────────────────────────
export function validateBody(body: string): { ok: true } | { ok: false; error: string } {
  if (!body.trim()) return { ok: false, error: "Message cannot be empty" };
  if (body.length > MAX_BODY) return { ok: false, error: `Message exceeds ${MAX_BODY} chars` };
  return { ok: true };
}
export function validateSubject(subj: string): { ok: true } | { ok: false; error: string } {
  if (!subj.trim()) return { ok: false, error: "Subject required" };
  if (subj.length > MAX_SUBJECT) return { ok: false, error: `Subject exceeds ${MAX_SUBJECT} chars` };
  return { ok: true };
}
export function validateAttachment(a: { filename: string; sizeBytes: number; mimeType: string }):
  { ok: true } | { ok: false; error: string } {
  if (a.filename.length > MAX_FILENAME) return { ok: false, error: "Filename too long" };
  if (!(ALLOWED_MIME as readonly string[]).includes(a.mimeType)) return { ok: false, error: "File type not allowed" };
  if (a.sizeBytes > 25 * 1024 * 1024) return { ok: false, error: "File exceeds 25MB" };
  return { ok: true };
}

// ─── Selectors ──────────────────────────────────────────────
export function listThreads(opts?: { filter?: "all" | "unread" | "starred" | "archived" | "urgent"; search?: string }): Thread[] {
  const s = state();
  let out = [...s.threads];
  const f = opts?.filter ?? "all";
  if (f === "unread") out = out.filter((t) => t.unreadCount > 0 && !t.isArchived);
  else if (f === "starred") out = out.filter((t) => t.isStarred && !t.isArchived);
  else if (f === "archived") out = out.filter((t) => t.isArchived);
  else if (f === "urgent") out = out.filter((t) => t.labels.includes("urgent") && !t.isArchived);
  else out = out.filter((t) => !t.isArchived);

  const q = opts?.search?.toLowerCase().trim();
  if (q) {
    out = out.filter((t) => {
      const p = getPatient(t.patientId);
      const pn = p?.fullName.toLowerCase() ?? "";
      if (t.subject.toLowerCase().includes(q)) return true;
      if (t.lastMessagePreview.toLowerCase().includes(q)) return true;
      if (pn.includes(q)) return true;
      return s.messages.some((m) => m.threadId === t.id && m.body.toLowerCase().includes(q));
    });
  }
  return out.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
}
export function getThread(id: string): Thread | undefined {
  return state().threads.find((t) => t.id === id);
}
export function listMessages(threadId: string): Message[] {
  return state().messages
    .filter((m) => m.threadId === threadId)
    .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
}
export function unreadThreadCount(): number {
  return state().threads.filter((t) => t.unreadCount > 0 && !t.isArchived).length;
}

// ─── Mutations ──────────────────────────────────────────────
function logAudit(evt: Omit<AuditEvent, "id" | "at">) {
  mutate((s) => ({
    ...s,
    audit: [{ id: uid("aud"), at: now(), ...evt }, ...s.audit].slice(0, 2000),
  }));
}

export function sendMessage(input: {
  threadId: string; body: string; attachments?: Attachment[]; replyToId?: string;
  senderId?: string; senderRole?: Role;
}): Message {
  const senderId = input.senderId ?? THERAPIST_ID;
  const senderRole: Role = input.senderRole ?? "therapist";
  const msg: Message = {
    id: uid("msg"),
    threadId: input.threadId,
    senderId,
    senderRole,
    body: input.body.slice(0, MAX_BODY),
    attachments: input.attachments ?? [],
    sentAt: now(),
    readBy: [{ userId: senderId, readAt: now() }],
    replyToId: input.replyToId,
  };
  mutate((s) => {
    const preview = input.body.replace(/\s+/g, " ").trim().slice(0, 120);
    const threads = s.threads.map((t) => t.id === input.threadId
      ? {
          ...t,
          lastMessageAt: msg.sentAt,
          updatedAt: msg.sentAt,
          lastMessagePreview: preview,
          unreadCount: senderRole === "patient" ? t.unreadCount + 1 : t.unreadCount,
        }
      : t);
    return { ...s, threads, messages: [...s.messages, msg] };
  });
  logAudit({ actorId: senderId, actorRole: senderRole, action: "send", threadId: input.threadId, messageId: msg.id });
  return msg;
}

export function createThread(input: { patientId: string; subject: string; body: string; attachments?: Attachment[] }): Thread {
  const tid = uid("thr");
  const t: Thread = {
    id: tid,
    patientId: input.patientId,
    subject: input.subject.slice(0, MAX_SUBJECT),
    createdAt: now(),
    updatedAt: now(),
    lastMessageAt: now(),
    lastMessagePreview: input.body.replace(/\s+/g, " ").trim().slice(0, 120),
    unreadCount: 0,
    isStarred: false,
    isArchived: false,
    labels: [],
    participantIds: [THERAPIST_ID, input.patientId],
  };
  mutate((s) => ({ ...s, threads: [t, ...s.threads] }));
  sendMessage({ threadId: tid, body: input.body, attachments: input.attachments });
  return t;
}

export function markThreadRead(threadId: string): void {
  const s = state();
  const t = s.threads.find((x) => x.id === threadId);
  if (!t || t.unreadCount === 0) return;
  const readAt = now();
  mutate((prev) => ({
    ...prev,
    threads: prev.threads.map((th) => th.id === threadId ? { ...th, unreadCount: 0 } : th),
    messages: prev.messages.map((m) => {
      if (m.threadId !== threadId) return m;
      if (m.senderRole !== "patient") return m;
      if (m.readBy.some((r) => r.userId === THERAPIST_ID)) return m;
      return { ...m, readBy: [...m.readBy, { userId: THERAPIST_ID, readAt }] };
    }),
  }));
  logAudit({ actorId: THERAPIST_ID, actorRole: "therapist", action: "read", threadId });
}

export function editMessage(id: string, body: string): void {
  mutate((s) => ({
    ...s,
    messages: s.messages.map((m) => m.id === id ? { ...m, body: body.slice(0, MAX_BODY), editedAt: now() } : m),
  }));
  const m = state().messages.find((x) => x.id === id);
  if (m) logAudit({ actorId: THERAPIST_ID, actorRole: "therapist", action: "edit", threadId: m.threadId, messageId: id });
}

export function deleteMessage(id: string): void {
  const m = state().messages.find((x) => x.id === id);
  mutate((s) => ({
    ...s,
    messages: s.messages.map((x) => x.id === id ? { ...x, deletedAt: now(), body: "" } : x),
  }));
  if (m) logAudit({ actorId: THERAPIST_ID, actorRole: "therapist", action: "delete", threadId: m.threadId, messageId: id });
}

export function toggleStar(threadId: string): void {
  let starred = false;
  mutate((s) => ({
    ...s,
    threads: s.threads.map((t) => {
      if (t.id !== threadId) return t;
      starred = !t.isStarred;
      return { ...t, isStarred: starred };
    }),
  }));
  logAudit({ actorId: THERAPIST_ID, actorRole: "therapist", action: starred ? "star" : "unstar", threadId });
}
export function toggleArchive(threadId: string): void {
  let archived = false;
  mutate((s) => ({
    ...s,
    threads: s.threads.map((t) => {
      if (t.id !== threadId) return t;
      archived = !t.isArchived;
      return { ...t, isArchived: archived };
    }),
  }));
  logAudit({ actorId: THERAPIST_ID, actorRole: "therapist", action: archived ? "archive" : "unarchive", threadId });
}
export function addLabel(threadId: string, label: string): void {
  const clean = label.trim().toLowerCase().slice(0, 24);
  if (!clean) return;
  mutate((s) => ({
    ...s,
    threads: s.threads.map((t) => t.id === threadId && !t.labels.includes(clean) ? { ...t, labels: [...t.labels, clean] } : t),
  }));
  logAudit({ actorId: THERAPIST_ID, actorRole: "therapist", action: "label_add", threadId, meta: { label: clean } });
}
export function removeLabel(threadId: string, label: string): void {
  mutate((s) => ({
    ...s,
    threads: s.threads.map((t) => t.id === threadId ? { ...t, labels: t.labels.filter((l) => l !== label) } : t),
  }));
  logAudit({ actorId: THERAPIST_ID, actorRole: "therapist", action: "label_remove", threadId, meta: { label } });
}
export function deleteThread(threadId: string): void {
  mutate((s) => ({
    ...s,
    threads: s.threads.filter((t) => t.id !== threadId),
    messages: s.messages.filter((m) => m.threadId !== threadId),
  }));
  logAudit({ actorId: THERAPIST_ID, actorRole: "therapist", action: "delete", threadId });
}
export function logAttachmentDownload(threadId: string, messageId: string, attachmentId: string): void {
  logAudit({ actorId: THERAPIST_ID, actorRole: "therapist", action: "download_attachment", threadId, messageId, meta: { attachmentId } });
}

// ─── Canned ─────────────────────────────────────────────────
export function listCanned(): CannedResponse[] { return [...state().canned]; }
export function getCanned(id: string): CannedResponse | undefined { return state().canned.find((c) => c.id === id); }
export function upsertCanned(c: Omit<CannedResponse, "id" | "useCount"> & { id?: string }): CannedResponse {
  const shortcut = c.shortcut.startsWith("/") ? c.shortcut : `/${c.shortcut}`;
  if (c.id) {
    let updated: CannedResponse | undefined;
    mutate((s) => ({
      ...s,
      canned: s.canned.map((x) => x.id === c.id ? (updated = { ...x, ...c, shortcut }) : x),
    }));
    return updated!;
  }
  const nc: CannedResponse = { ...c, shortcut, id: uid("can"), useCount: 0 };
  mutate((s) => ({ ...s, canned: [nc, ...s.canned] }));
  return nc;
}
export function deleteCanned(id: string): void {
  mutate((s) => ({ ...s, canned: s.canned.filter((c) => c.id !== id) }));
}
export function applyCannedTemplate(cannedId: string, patientId: string): string {
  const c = getCanned(cannedId);
  const p = getPatient(patientId);
  if (!c) return "";
  mutate((s) => ({
    ...s,
    canned: s.canned.map((x) => x.id === cannedId ? { ...x, useCount: x.useCount + 1 } : x),
  }));
  return interpolate(c.body, p);
}
export function interpolate(body: string, patient?: Patient): string {
  const map: Record<string, string> = {
    "patient.firstName": patient?.preferredName ?? patient?.fullName.split(" ")[0] ?? "there",
    "patient.fullName": patient?.fullName ?? "there",
    "next_session.date": patient?.nextSessionAt
      ? new Date(patient.nextSessionAt).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })
      : "your next session",
    "clinic.address": "PeaceCode Clinic, Indiranagar, Bengaluru 560038",
    "therapist.signature": `— ${THERAPIST_NAME}`,
    "therapist.name": THERAPIST_NAME,
  };
  return body.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, k) => map[k] ?? `{{${k}}}`);
}

// ─── Settings ───────────────────────────────────────────────
export function getSettings(): MessageSettings { return state().settings; }
export function updateSettings(patch: Partial<MessageSettings>): void {
  mutate((s) => ({ ...s, settings: { ...s.settings, ...patch, autoReply: { ...s.settings.autoReply, ...(patch.autoReply ?? {}) } } }));
}

// ─── Drafts ─────────────────────────────────────────────────
export function saveDraft(d: Draft): void {
  mutate((s) => {
    const key = d.threadId ?? `new:${d.patientId ?? ""}`;
    const rest = s.drafts.filter((x) => (x.threadId ?? `new:${x.patientId ?? ""}`) !== key);
    return { ...s, drafts: [{ ...d, updatedAt: now() }, ...rest].slice(0, 20) };
  });
}
export function getDraft(threadId?: string, patientId?: string): Draft | undefined {
  const key = threadId ?? `new:${patientId ?? ""}`;
  return state().drafts.find((d) => (d.threadId ?? `new:${d.patientId ?? ""}`) === key);
}
export function clearDraft(threadId?: string, patientId?: string): void {
  const key = threadId ?? `new:${patientId ?? ""}`;
  mutate((s) => ({ ...s, drafts: s.drafts.filter((d) => (d.threadId ?? `new:${d.patientId ?? ""}`) !== key) }));
}

// ─── Audit ──────────────────────────────────────────────────
export function listAudit(filter?: { patientId?: string; action?: AuditAction | "all"; from?: string; to?: string }): AuditEvent[] {
  const s = state();
  let out = [...s.audit];
  if (filter?.patientId) {
    const threadIds = new Set(s.threads.filter((t) => t.patientId === filter.patientId).map((t) => t.id));
    out = out.filter((e) => threadIds.has(e.threadId));
  }
  if (filter?.action && filter.action !== "all") out = out.filter((e) => e.action === filter.action);
  if (filter?.from) { const t = new Date(filter.from).getTime(); out = out.filter((e) => new Date(e.at).getTime() >= t); }
  if (filter?.to) { const t = new Date(filter.to).getTime() + 86400000; out = out.filter((e) => new Date(e.at).getTime() <= t); }
  return out.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

// ─── Hooks ──────────────────────────────────────────────────
export function useLiveThreads(opts?: { filter?: "all" | "unread" | "starred" | "archived" | "urgent"; search?: string }): Thread[] {
  return useSyncExternalStore(subscribe, () => listThreads(opts), () => listThreads(opts));
}
export function useLiveThread(id: string): Thread | undefined {
  return useSyncExternalStore(subscribe, () => getThread(id), () => getThread(id));
}
export function useLiveMessages(threadId: string): Message[] {
  return useSyncExternalStore(subscribe, () => listMessages(threadId), () => listMessages(threadId));
}
export function useUnreadThreadCount(): number {
  return useSyncExternalStore(subscribe, () => unreadThreadCount(), () => 0);
}
export function useLiveCanned(): CannedResponse[] {
  return useSyncExternalStore(subscribe, () => listCanned(), () => listCanned());
}
export function useLiveSettings(): MessageSettings {
  return useSyncExternalStore(subscribe, () => getSettings(), () => getSettings());
}
export function useLiveAudit(filter?: Parameters<typeof listAudit>[0]): AuditEvent[] {
  return useSyncExternalStore(subscribe, () => listAudit(filter), () => listAudit(filter));
}

// ─── Seed ───────────────────────────────────────────────────
function seed(): StoreShape {
  // We defer patient lookup until first use to avoid SSR cycles.
  const patients = typeof window !== "undefined" ? listPatients() : [];
  const now = Date.now();
  const day = 86_400_000;
  const iso = (offsetMs: number) => new Date(now - offsetMs).toISOString();

  const threads: Thread[] = [];
  const messages: Message[] = [];

  const seedThreads: Array<{
    subject: string; label?: string; unread?: boolean; starred?: boolean;
    convo: Array<{ role: Role; body: string; hoursAgo: number }>;
  }> = [
    {
      subject: "Session prep for Tuesday",
      unread: true, label: "clinical",
      convo: [
        { role: "patient", body: "Hi Doctor, thanks for last week. Wanted to share what came up before Tuesday — I've been noticing the mid-afternoon dip again. Should I bring the mood log?", hoursAgo: 27 },
        { role: "therapist", body: "Yes please, bring the last two weeks of the log. We'll look at the dip together — I have a couple of hypotheses. Anything else you'd like to lead with?", hoursAgo: 24 },
        { role: "patient", body: "Thanks — I've been thinking about what you said on interoception. I want to try that exercise again but I lose track after a minute.", hoursAgo: 6 },
      ],
    },
    {
      subject: "Homework: sleep window",
      label: "clinical", starred: true,
      convo: [
        { role: "therapist", body: "Sharing the sleep-window worksheet we discussed. Fill it in for 5 nights before Thursday — even partial data is useful.", hoursAgo: 96 },
        { role: "patient", body: "Received. I'll aim for a 10:30 lights-out this week.", hoursAgo: 92 },
        { role: "therapist", body: "Good. Remember the wind-down starts at 9:45 — the worksheet is asking about the hour before, not the moment of.", hoursAgo: 90 },
        { role: "patient", body: "Right. Will re-read the prompts tonight.", hoursAgo: 88 },
      ],
    },
    {
      subject: "Invoice for September",
      label: "billing",
      convo: [
        { role: "patient", body: "Could you resend the September invoice? I need it for insurance reimbursement.", hoursAgo: 50 },
        { role: "therapist", body: "Just sent — check your email. Let me know if the itemization is what your insurer needs.", hoursAgo: 48 },
        { role: "patient", body: "Got it, thank you.", hoursAgo: 47 },
      ],
    },
    {
      subject: "Rescheduling next week",
      label: "scheduling",
      convo: [
        { role: "patient", body: "Something came up at work — can we move Wednesday to Friday same time?", hoursAgo: 72 },
        { role: "therapist", body: "Friday 4pm works. I've moved it in the calendar — you'll get a confirmation.", hoursAgo: 70 },
      ],
    },
    {
      subject: "Sharing what came up this week",
      unread: true, label: "clinical",
      convo: [
        { role: "patient", body: "I don't want to wait till Monday to say this — the conversation with my father went better than I expected. I noticed the urge to shut down and stayed with it. It was uncomfortable but not unbearable.", hoursAgo: 4 },
        { role: "therapist", body: "That's significant — thank you for telling me while it's still fresh. Hold on to the felt sense of 'uncomfortable but not unbearable' — that's the exact edge we're working at.", hoursAgo: 3 },
        { role: "patient", body: "I keep wanting to explain it away. Like, maybe he was just in a good mood. But something also shifted in me.", hoursAgo: 2 },
      ],
    },
    {
      subject: "Consent form for records request",
      label: "clinical",
      convo: [
        { role: "therapist", body: "Attached is the consent form for the records request you asked about. Read carefully, sign, and send back — no rush.", hoursAgo: 200 },
        { role: "patient", body: "Received. I'll sign and return by the weekend.", hoursAgo: 198 },
        { role: "patient", body: "Signed copy attached.", hoursAgo: 150 },
        { role: "therapist", body: "Got it, thank you. I'll process the request Monday.", hoursAgo: 148 },
      ],
    },
    {
      subject: "Between-session note",
      label: "warmth",
      convo: [
        { role: "therapist", body: "Just checking in — you mentioned Wednesday might be hard. No need to reply. I'm here if you want to.", hoursAgo: 400 },
        { role: "patient", body: "Thank you. Wednesday was okay, actually. I used the grounding exercise twice.", hoursAgo: 380 },
      ],
    },
    {
      subject: "Question about medication interaction",
      label: "urgent",
      convo: [
        { role: "patient", body: "My GP prescribed something new for migraines — should I check with you before starting? I don't want it to conflict with anything we've talked about.", hoursAgo: 8 },
        { role: "therapist", body: "Good instinct to ask. Share the name here and I'll flag if there's anything that intersects with what you're on. If it's urgent, please also call your GP.", hoursAgo: 7 },
        { role: "patient", body: "It's called Sumatriptan. Not urgent — the migraine passed.", hoursAgo: 6 },
        { role: "therapist", body: "Sumatriptan is generally fine alongside what you're on. Take it as your GP prescribed. Note it in the log so we can track any patterns.", hoursAgo: 5 },
      ],
    },
  ];

  seedThreads.forEach((st, i) => {
    if (!patients.length) return;
    const p = patients[i % patients.length];
    const tid = `thr_seed${i}`;
    const last = st.convo[st.convo.length - 1];
    const t: Thread = {
      id: tid,
      patientId: p.id,
      subject: st.subject,
      createdAt: iso(st.convo[0].hoursAgo * 3600_000),
      updatedAt: iso(last.hoursAgo * 3600_000),
      lastMessageAt: iso(last.hoursAgo * 3600_000),
      lastMessagePreview: last.body.slice(0, 120),
      unreadCount: st.unread ? st.convo.filter((c) => c.role === "patient").slice(-2).length : 0,
      isStarred: !!st.starred,
      isArchived: false,
      labels: st.label ? [st.label] : [],
      participantIds: [THERAPIST_ID, p.id],
    };
    threads.push(t);
    st.convo.forEach((c, ci) => {
      const sentAt = iso(c.hoursAgo * 3600_000);
      const isPatient = c.role === "patient";
      const senderId = isPatient ? p.id : THERAPIST_ID;
      messages.push({
        id: `msg_seed${i}_${ci}`,
        threadId: tid,
        senderId,
        senderRole: c.role,
        body: c.body,
        attachments: [],
        sentAt,
        readBy: st.unread && isPatient && ci >= st.convo.length - 2
          ? [{ userId: senderId, readAt: sentAt }]
          : [
              { userId: senderId, readAt: sentAt },
              { userId: isPatient ? THERAPIST_ID : p.id, readAt: iso((c.hoursAgo - 0.2) * 3600_000) },
            ],
      });
    });
  });

  const canned: CannedResponse[] = [
    { id: "can_prep", shortcut: "/prep", title: "Session prep reminder", category: "scheduling",
      body: "Hi {{patient.firstName}} — a reminder for {{next_session.date}}. If anything's come up since we last spoke, feel free to send it ahead so we can use the hour well.\n\n{{therapist.signature}}", useCount: 12 },
    { id: "can_late", shortcut: "/late", title: "Running a few minutes late", category: "scheduling",
      body: "Hi {{patient.firstName}} — I'm running about five minutes behind. Grab a glass of water and I'll be with you shortly.\n\n{{therapist.signature}}", useCount: 6 },
    { id: "can_reschedule", shortcut: "/reschedule", title: "Reschedule confirmation", category: "scheduling",
      body: "Confirming we've moved our session to {{next_session.date}}. You'll get a calendar update shortly.\n\n{{therapist.signature}}", useCount: 4 },
    { id: "can_invoice", shortcut: "/invoice", title: "Invoice follow-up", category: "billing",
      body: "Hi {{patient.firstName}} — sending the invoice for last month. Let me know if you need anything itemized differently for insurance.\n\n{{therapist.signature}}", useCount: 3 },
    { id: "can_receipt", shortcut: "/receipt", title: "Payment received", category: "billing",
      body: "Payment received — thank you, {{patient.firstName}}. A receipt is on the way.\n\n{{therapist.signature}}", useCount: 8 },
    { id: "can_superbill", shortcut: "/superbill", title: "Superbill sent", category: "billing",
      body: "Superbill for the quarter has been sent to your email. It includes CPT codes and diagnosis for your insurer.\n\n{{therapist.signature}}", useCount: 1 },
    { id: "can_homework", shortcut: "/homework", title: "Between-session practice", category: "clinical",
      body: "Sharing this week's practice — take it gently, notice rather than force. We'll unpack what comes up on {{next_session.date}}.\n\n{{therapist.signature}}", useCount: 7 },
    { id: "can_grounding", shortcut: "/grounding", title: "Grounding reminder", category: "clinical",
      body: "If you're finding the anxiety loud right now, try the 5-4-3-2-1: five things you can see, four you can touch, three you can hear, two you can smell, one you can taste. Then breathe out longer than in.\n\n{{therapist.signature}}", useCount: 5 },
    { id: "can_crisis", shortcut: "/crisis", title: "Crisis resources", category: "clinical",
      body: "If you're in immediate danger, please call iCall at 9152987821 or Vandrevala Foundation at 1860-2662-345 — both are free and confidential. I'll follow up as soon as I can.\n\n{{therapist.signature}}", useCount: 2 },
    { id: "can_checkin", shortcut: "/checkin", title: "Warm check-in", category: "warmth",
      body: "Just checking in, {{patient.firstName}}. No need to reply — I'm here if you'd like to.\n\n{{therapist.signature}}", useCount: 9 },
    { id: "can_thanks", shortcut: "/thanks", title: "Thanks for sharing", category: "warmth",
      body: "Thank you for telling me this. It takes something to put it into words — let's hold it together next session.\n\n{{therapist.signature}}", useCount: 4 },
    { id: "can_welcome", shortcut: "/welcome", title: "New patient welcome", category: "warmth",
      body: "Welcome, {{patient.firstName}}. I'm glad you're here. Ahead of our first session on {{next_session.date}}, please read through the intake form and let me know if anything doesn't sit right.\n\n{{therapist.signature}}", useCount: 2 },
  ];

  const settings: MessageSettings = {
    signature: `Warmly,\n${THERAPIST_NAME}\nClinical Psychologist · MPhil · RCI`,
    signatureEnabled: true,
    autoReply: {
      enabled: false,
      message: "I'm away from the clinic and reading messages once a day. For non-urgent matters I'll reply on my return. If you need urgent support, please contact iCall at 9152987821.",
      emergencyRedirect: true,
    },
    notifyEmail: true,
    notifyDesktop: false,
    quietHoursStart: "21:00",
    quietHoursEnd: "08:00",
    retention: "3y",
  };

  return {
    threads,
    messages,
    canned,
    settings,
    drafts: [],
    audit: threads.slice(0, 3).map((t, i) => ({
      id: `aud_seed${i}`,
      at: iso(day * (i + 1)),
      actorId: THERAPIST_ID,
      actorRole: "therapist",
      action: "read",
      threadId: t.id,
    })),
  };
}

// Force re-seed when patients arrive (first client render after SSR seed emitted empty).
export function ensureSeededWithPatients(): void {
  const s = state();
  if (s.threads.length === 0 && typeof window !== "undefined") {
    const fresh = seed();
    cache = fresh;
    save(fresh);
  }
}
