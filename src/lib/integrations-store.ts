// Integrations store — catalog + connections + webhooks + tokens + automations.
// Local-first, seeded so the UI feels alive. Real OAuth wiring lands with the
// Spring Boot backend; every "connect" here runs a scripted Connecting → Connected
// transition, but the shape of state is what the real backend will produce.
import { useEffect, useState, useSyncExternalStore } from "react";

export type IntegrationCategory =
  | "payments" | "telehealth" | "calendar"
  | "communication" | "storage" | "clinical" | "analytics";

export type IntegrationStatus = "connected" | "available" | "coming-soon" | "degraded" | "error";

export type ConfigField =
  | { key: string; label: string; hint?: string; kind: "text" | "url" | "email"; placeholder?: string; masked?: false }
  | { key: string; label: string; hint?: string; kind: "secret"; placeholder?: string; masked: true };

export type Integration = {
  slug: string;
  name: string;
  vendor: string;                 // e.g. "Razorpay Software Pvt Ltd"
  category: IntegrationCategory;
  purpose: string;                // one line
  description: string;            // longer prose
  glyph: string;                  // single-letter or symbol used in the outline mark
  region?: "India" | "Global";
  status: IntegrationStatus;      // catalog default (overridden by connection)
  recommended?: boolean;
  permissions: string[];          // "Create payment orders", etc.
  dataFlow: { from: string; to: string; fields: string[]; required?: boolean }[];
  config: ConfigField[];
  events: string[];               // events this integration emits into our system
  docsUrl?: string;
};

export type Connection = {
  slug: string;
  status: IntegrationStatus;
  connectedAt?: number;
  lastSyncAt?: number;
  uptime?: number;                // 0..1 last 24h
  events24h?: number;
  errors24h?: number;
  config: Record<string, string>; // stored values (secrets stored plaintext locally for the demo)
  environment?: "live" | "test";
};

export type ActivityEvent = {
  id: string;
  slug: string;
  at: number;
  kind: "sync" | "webhook.in" | "webhook.out" | "config" | "error";
  actor: "system" | "you";
  method?: "GET" | "POST" | "PUT" | "DELETE";
  path?: string;
  status?: number;
  summary: string;
  payload?: string; // never contains secrets
};

export type WebhookSub = {
  id: string;
  url: string;
  events: string[];
  secret: string;
  enabled: boolean;
  createdAt: number;
  lastDeliveryAt?: number;
  lastStatus?: number;
};

export type ApiToken = {
  id: string;
  name: string;
  prefix: string;      // shown always, e.g. "pc_live_9f2q"
  scopes: string[];
  createdAt: number;
  lastUsedAt?: number;
  revoked?: boolean;
};

export type Automation = {
  id: string;
  title: string;
  when: string;        // trigger, plain English
  then: string;        // action, plain English
  tools: ("Zapier" | "Make" | "n8n")[];
  triggerUrl: string;
};

// ────────────────────────────────────────────────────────────────────────────
const K = {
  connections: "pc.integrations.connections.v1",
  activity: "pc.integrations.activity.v1",
  webhooks: "pc.integrations.webhooks.v1",
  tokens: "pc.integrations.tokens.v1",
  seeded: "pc.integrations.seeded.v1",
} as const;

const read = <T,>(k: string, fb: T): T => {
  if (typeof window === "undefined") return fb;
  try { const r = localStorage.getItem(k); return r ? JSON.parse(r) as T : fb; } catch { return fb; }
};
const write = (k: string, v: unknown) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(k, JSON.stringify(v));
  window.dispatchEvent(new CustomEvent("pc.integrations.change", { detail: { key: k } }));
};

// ─── Catalog ──────────────────────────────────────────────────────────────
export const EVENTS = [
  "session.scheduled", "session.completed", "session.cancelled",
  "patient.created", "patient.updated",
  "assessment.assigned", "assessment.submitted",
  "invoice.issued", "invoice.paid", "invoice.overdue",
  "payment.received", "payment.refunded",
  "message.sent", "message.received",
  "note.locked",
];

export const TOKEN_SCOPES = [
  "read:patients", "write:patients",
  "read:sessions", "write:sessions",
  "read:invoices", "write:invoices",
  "read:assessments", "write:assessments",
  "read:messages",
  "webhooks:manage",
];

export const CATEGORIES: Record<IntegrationCategory, { label: string; blurb: string; emptyLine: string }> = {
  payments:      { label: "Payments",      blurb: "Collect from clients, reconcile payouts.", emptyLine: "No payments yet. When you're ready, money should be the easy part." },
  telehealth:    { label: "Telehealth",    blurb: "Video rooms attached to sessions.",        emptyLine: "No video yet. Attach a room and it appears in every session." },
  calendar:      { label: "Calendar",      blurb: "Two-way sync with your everyday calendar.", emptyLine: "Your calendar lives here once you connect one. Nothing else changes." },
  communication: { label: "Communication", blurb: "Reminders and messages that reach people.", emptyLine: "Silence for now. Choose how you want to reach clients." },
  storage:       { label: "Storage",       blurb: "Where encrypted exports and records live.", emptyLine: "Storage sits empty until you point us at a drive." },
  clinical:      { label: "Clinical",      blurb: "Interoperability with the wider health system.", emptyLine: "Nothing wired to the clinical world yet." },
  analytics:     { label: "Analytics",     blurb: "Practice-owner dashboards, privately.",     emptyLine: "No analytics stream. Add one only if you want the numbers." },
};

export const INTEGRATIONS: Integration[] = [
  // ── payments
  {
    slug: "razorpay", name: "Razorpay", vendor: "Razorpay Software Pvt Ltd", category: "payments",
    purpose: "Collect card, UPI, and net-banking payments from clients in India.",
    description: "Create payment links for invoices, receive webhooks when a client pays, and reconcile settlements against sessions automatically.",
    glyph: "R", region: "India", status: "available", recommended: true,
    permissions: ["Create payment orders", "Read settlement status", "Refund payments"],
    dataFlow: [
      { from: "PeaceCode", to: "Razorpay", fields: ["invoice.amount", "patient.email", "invoice.id"], required: true },
      { from: "Razorpay", to: "PeaceCode", fields: ["payment.status", "settlement.utr", "fees"], required: true },
    ],
    config: [
      { key: "key_id", label: "Key ID", kind: "text", placeholder: "rzp_live_xxxx" },
      { key: "key_secret", label: "Key Secret", kind: "secret", masked: true },
      { key: "webhook_secret", label: "Webhook secret", kind: "secret", masked: true, hint: "Set the same value on your Razorpay dashboard webhook." },
    ],
    events: ["invoice.paid", "payment.received", "payment.refunded"],
    docsUrl: "https://razorpay.com/docs",
  },
  {
    slug: "stripe", name: "Stripe", vendor: "Stripe Payments Inc.", category: "payments",
    purpose: "Card payments and subscriptions for international clients.",
    description: "Route non-INR invoices through Stripe. Supports Payment Intents, Setup Intents for autopay, and Connect payouts.",
    glyph: "S", region: "Global", status: "available",
    permissions: ["Create charges", "Manage customers", "Read balance"],
    dataFlow: [
      { from: "PeaceCode", to: "Stripe", fields: ["invoice.amount", "customer.email"], required: true },
      { from: "Stripe", to: "PeaceCode", fields: ["charge.status", "receipt.url"], required: true },
    ],
    config: [
      { key: "publishable_key", label: "Publishable key", kind: "text", placeholder: "pk_live_..." },
      { key: "secret_key", label: "Secret key", kind: "secret", masked: true },
    ],
    events: ["invoice.paid", "payment.received"],
  },
  {
    slug: "upi-collect", name: "UPI Collect", vendor: "NPCI (via Razorpay/Cashfree)", category: "payments",
    purpose: "Ask clients to approve a UPI collect request on their phone.",
    description: "Send a push request to the client's UPI app for a specific amount tied to an invoice. Falls back to a static UPI QR when the app doesn't respond in 60 seconds.",
    glyph: "₹", region: "India", status: "coming-soon",
    permissions: ["Initiate collect requests", "Verify VPA"],
    dataFlow: [
      { from: "PeaceCode", to: "UPI PSP", fields: ["invoice.amount", "client.vpa"], required: true },
      { from: "UPI PSP", to: "PeaceCode", fields: ["txn.status", "rrn"], required: true },
    ],
    config: [],
    events: ["payment.received"],
  },

  // ── telehealth
  {
    slug: "zoom", name: "Zoom", vendor: "Zoom Video Communications", category: "telehealth",
    purpose: "Attach a Zoom room to every telehealth session automatically.",
    description: "When you schedule a session marked as telehealth, we create a Zoom meeting, share the link with the client, and log attendance after the call.",
    glyph: "▶", region: "Global", status: "available", recommended: true,
    permissions: ["Create meetings", "Read meeting metadata", "Read cloud recording links (optional)"],
    dataFlow: [
      { from: "PeaceCode", to: "Zoom", fields: ["session.startsAt", "session.duration", "therapist.email"], required: true },
      { from: "Zoom", to: "PeaceCode", fields: ["join_url", "meeting_id", "participants"], required: true },
      { from: "Zoom", to: "PeaceCode", fields: ["recording.url"], required: false },
    ],
    config: [
      { key: "account_id", label: "Account ID", kind: "text" },
      { key: "client_id", label: "Client ID", kind: "text" },
      { key: "client_secret", label: "Client secret", kind: "secret", masked: true },
    ],
    events: ["session.scheduled", "session.completed"],
  },
  {
    slug: "google-meet", name: "Google Meet", vendor: "Google", category: "telehealth",
    purpose: "Meet links attached to session invites automatically.",
    description: "If Google Calendar is connected, we can create Meet links on every telehealth session invite. No separate setup.",
    glyph: "M", region: "Global", status: "available",
    permissions: ["Create Google Meet on Calendar events"],
    dataFlow: [{ from: "PeaceCode", to: "Google", fields: ["event.title", "attendees"], required: true }],
    config: [],
    events: ["session.scheduled"],
  },
  {
    slug: "daily", name: "Daily.co", vendor: "Daily", category: "telehealth",
    purpose: "Embedded HIPAA-compatible video rooms inside the portal.",
    description: "Rooms open inside the session view — client and therapist never leave PeaceCode.",
    glyph: "D", region: "Global", status: "available",
    permissions: ["Create rooms", "Generate meeting tokens"],
    dataFlow: [{ from: "PeaceCode", to: "Daily", fields: ["room.name", "expiry"], required: true }],
    config: [{ key: "api_key", label: "API key", kind: "secret", masked: true }],
    events: ["session.scheduled"],
  },
  {
    slug: "whereby", name: "Whereby", vendor: "Whereby AS", category: "telehealth",
    purpose: "Persistent named rooms per therapist.",
    description: "Each therapist gets a fixed room URL. Clients bookmark it once.",
    glyph: "W", region: "Global", status: "coming-soon",
    permissions: ["Create meeting rooms"], dataFlow: [], config: [], events: [],
  },

  // ── calendar
  {
    slug: "google-calendar", name: "Google Calendar", vendor: "Google", category: "calendar",
    purpose: "Two-way sync with your primary Google calendar.",
    description: "Sessions push out to your Google calendar. Personal events on your calendar block your availability so double-bookings can't happen.",
    glyph: "◐", region: "Global", status: "available", recommended: true,
    permissions: ["Read events", "Create events", "Update event RSVPs"],
    dataFlow: [
      { from: "PeaceCode", to: "Google", fields: ["session.title", "startsAt", "attendees"], required: true },
      { from: "Google", to: "PeaceCode", fields: ["events.busy_ranges"], required: true },
    ],
    config: [{ key: "calendar_id", label: "Primary calendar", kind: "email", placeholder: "you@practice.com" }],
    events: ["session.scheduled", "session.cancelled"],
  },
  {
    slug: "outlook", name: "Outlook / Microsoft 365", vendor: "Microsoft", category: "calendar",
    purpose: "Two-way sync with Outlook and Microsoft 365.",
    description: "Same shape as Google Calendar, wired through Microsoft Graph.",
    glyph: "O", region: "Global", status: "available",
    permissions: ["Calendars.ReadWrite"],
    dataFlow: [
      { from: "PeaceCode", to: "Microsoft", fields: ["session.title", "startsAt"], required: true },
      { from: "Microsoft", to: "PeaceCode", fields: ["events.busy_ranges"], required: true },
    ],
    config: [{ key: "tenant_id", label: "Tenant ID", kind: "text" }],
    events: ["session.scheduled"],
  },
  {
    slug: "caldav", name: "Apple Calendar (CalDAV)", vendor: "Any CalDAV server", category: "calendar",
    purpose: "Sync via CalDAV — works with iCloud, Fastmail, self-hosted.",
    description: "The universal calendar interface. Slower than Google/Microsoft but works everywhere.",
    glyph: "C", region: "Global", status: "coming-soon",
    permissions: ["Read/write CalDAV events"], dataFlow: [], config: [], events: [],
  },

  // ── communication
  {
    slug: "resend", name: "Resend", vendor: "Resend Inc.", category: "communication",
    purpose: "Transactional email — reminders, receipts, portal invites.",
    description: "We deliver session reminders and receipts through your Resend domain, so email lands from your practice — not from us.",
    glyph: "✉", region: "Global", status: "available",
    permissions: ["Send email on your verified domain"],
    dataFlow: [{ from: "PeaceCode", to: "Resend", fields: ["to", "subject", "body", "from"], required: true }],
    config: [
      { key: "api_key", label: "API key", kind: "secret", masked: true, placeholder: "re_live_xxx" },
      { key: "from_domain", label: "From domain", kind: "text", placeholder: "practice.example.com" },
    ],
    events: ["session.scheduled", "invoice.issued"],
  },
  {
    slug: "postmark", name: "Postmark", vendor: "ActiveCampaign", category: "communication",
    purpose: "Transactional email with strong deliverability.",
    description: "Alternative to Resend for practices that already use Postmark.",
    glyph: "✉", region: "Global", status: "available",
    permissions: ["Send email"], dataFlow: [], config: [{ key: "server_token", label: "Server token", kind: "secret", masked: true }], events: [],
  },
  {
    slug: "twilio", name: "Twilio SMS", vendor: "Twilio Inc.", category: "communication",
    purpose: "SMS reminders and OTP for international clients.",
    description: "For clients outside India where SMS is still the most reliable channel.",
    glyph: "T", region: "Global", status: "available",
    permissions: ["Send SMS", "Read message status"],
    dataFlow: [{ from: "PeaceCode", to: "Twilio", fields: ["to", "body"], required: true }],
    config: [
      { key: "account_sid", label: "Account SID", kind: "text" },
      { key: "auth_token", label: "Auth token", kind: "secret", masked: true },
      { key: "from_number", label: "From number", kind: "text", placeholder: "+1..." },
    ],
    events: ["session.scheduled"],
  },
  {
    slug: "msg91", name: "MSG91", vendor: "MSG91", category: "communication",
    purpose: "Indian DLT-compliant SMS at scale.",
    description: "Preferred for Indian practices — templates registered under DLT.",
    glyph: "M", region: "India", status: "available",
    permissions: ["Send SMS", "Read delivery reports"],
    dataFlow: [{ from: "PeaceCode", to: "MSG91", fields: ["to", "template_id", "variables"], required: true }],
    config: [
      { key: "auth_key", label: "Auth key", kind: "secret", masked: true },
      { key: "sender_id", label: "Sender ID", kind: "text", placeholder: "PCPRAC" },
    ],
    events: ["session.scheduled"],
  },
  {
    slug: "whatsapp", name: "WhatsApp Business", vendor: "Meta", category: "communication",
    purpose: "Reminders and receipts on WhatsApp — where Indian clients live.",
    description: "Uses the official WhatsApp Business Cloud API. Requires an approved template per message type.",
    glyph: "W", region: "India", status: "available", recommended: true,
    permissions: ["Send template messages", "Read delivery status"],
    dataFlow: [
      { from: "PeaceCode", to: "Meta", fields: ["to", "template", "variables"], required: true },
      { from: "Meta", to: "PeaceCode", fields: ["delivery.status", "read.status"], required: true },
    ],
    config: [
      { key: "phone_number_id", label: "Phone number ID", kind: "text" },
      { key: "access_token", label: "Access token", kind: "secret", masked: true },
    ],
    events: ["session.scheduled", "invoice.paid"],
  },

  // ── storage
  {
    slug: "google-drive", name: "Google Drive", vendor: "Google", category: "storage",
    purpose: "Encrypted note exports and shared documents.",
    description: "We push a nightly encrypted backup of your notes to a folder you choose. Client-facing document shares can also be routed here.",
    glyph: "△", region: "Global", status: "available",
    permissions: ["drive.file — only files this app creates"],
    dataFlow: [{ from: "PeaceCode", to: "Google Drive", fields: ["backup.zip (encrypted)"], required: true }],
    config: [{ key: "folder_id", label: "Backup folder ID", kind: "text" }],
    events: [],
  },
  {
    slug: "dropbox", name: "Dropbox", vendor: "Dropbox Inc.", category: "storage",
    purpose: "Nightly encrypted backups.",
    description: "Same as Drive, in Dropbox.",
    glyph: "◇", region: "Global", status: "available",
    permissions: ["files.content.write"], dataFlow: [], config: [{ key: "access_token", label: "Access token", kind: "secret", masked: true }], events: [],
  },
  {
    slug: "s3", name: "S3-compatible storage", vendor: "AWS / Backblaze / Wasabi / R2", category: "storage",
    purpose: "Byo-bucket encrypted exports.",
    description: "Point us at any S3-compatible bucket for encrypted note exports and long-term retention.",
    glyph: "S", region: "Global", status: "available",
    permissions: ["s3:PutObject", "s3:GetObject (restore only)"],
    dataFlow: [{ from: "PeaceCode", to: "Bucket", fields: ["backup.tar.gz (age-encrypted)"], required: true }],
    config: [
      { key: "endpoint", label: "Endpoint", kind: "url", placeholder: "https://s3.ap-south-1.amazonaws.com" },
      { key: "bucket", label: "Bucket", kind: "text" },
      { key: "access_key_id", label: "Access key ID", kind: "text" },
      { key: "secret_access_key", label: "Secret access key", kind: "secret", masked: true },
    ],
    events: [],
  },

  // ── clinical
  {
    slug: "abha", name: "ABHA / ABDM", vendor: "National Health Authority (India)", category: "clinical",
    purpose: "Link client records to India's Ayushman Bharat Health Account.",
    description: "Discover and link a client's ABHA number, share consented health information (HIP/HIU flows), and publish care contexts — sessions, prescriptions, assessments — into the national health record.",
    glyph: "आ", region: "India", status: "available", recommended: true,
    permissions: ["Discovery via ABHA number", "Consent artefact management", "Publish care contexts", "Share health information on consent"],
    dataFlow: [
      { from: "PeaceCode", to: "ABDM Gateway", fields: ["patient.abhaNumber", "care_context.reference"], required: true },
      { from: "PeaceCode", to: "HIU (client's chosen app)", fields: ["session.summary", "assessment.result", "prescription"], required: false },
      { from: "ABDM Gateway", to: "PeaceCode", fields: ["consent.artefact", "notification.status"], required: true },
    ],
    config: [
      { key: "client_id", label: "HIP/HIU client ID", kind: "text" },
      { key: "client_secret", label: "Client secret", kind: "secret", masked: true },
      { key: "hip_id", label: "HIP registration ID", kind: "text", placeholder: "IN0000..." },
    ],
    events: ["session.completed", "assessment.submitted", "note.locked"],
    docsUrl: "https://sandbox.abdm.gov.in/",
  },
  {
    slug: "fhir", name: "FHIR export", vendor: "HL7 FHIR R4", category: "clinical",
    purpose: "Expose a read-only FHIR endpoint for interoperability.",
    description: "Publishes Patient, Encounter, Observation, and DocumentReference resources. Auth via SMART-on-FHIR client credentials.",
    glyph: "F", region: "Global", status: "available",
    permissions: ["Read Patient", "Read Encounter", "Read Observation", "Read DocumentReference"],
    dataFlow: [{ from: "External EHR", to: "PeaceCode FHIR", fields: ["Patient", "Encounter", "Observation"], required: true }],
    config: [{ key: "base_url", label: "Base URL", kind: "url", placeholder: "https://api.peacecode.in/fhir" }],
    events: [],
  },

  // ── analytics
  {
    slug: "posthog", name: "PostHog", vendor: "PostHog Inc.", category: "analytics",
    purpose: "Product analytics for practice owners — self-hostable.",
    description: "Emit anonymised events (no PHI) into PostHog so owners can see feature adoption and workflow health.",
    glyph: "P", region: "Global", status: "available",
    permissions: ["Ingest events"],
    dataFlow: [{ from: "PeaceCode", to: "PostHog", fields: ["event.name", "user.role (hashed)"], required: true }],
    config: [
      { key: "project_key", label: "Project key", kind: "text", placeholder: "phc_..." },
      { key: "host", label: "Host", kind: "url", placeholder: "https://app.posthog.com" },
    ],
    events: [],
  },
  {
    slug: "plausible", name: "Plausible", vendor: "Plausible Insights OÜ", category: "analytics",
    purpose: "Cookieless site analytics for your public profile page.",
    description: "Attach Plausible to your public /profile page so you can see marketing reach without compromising client privacy.",
    glyph: "•", region: "Global", status: "available",
    permissions: ["Read pageview counts"],
    dataFlow: [{ from: "Public profile", to: "Plausible", fields: ["pageview"], required: true }],
    config: [{ key: "site_id", label: "Site ID", kind: "text", placeholder: "practice.example.com" }],
    events: [],
  },
];

export function integrationBySlug(slug: string): Integration | undefined {
  return INTEGRATIONS.find(i => i.slug === slug);
}
export function byCategory(cat: IntegrationCategory): Integration[] {
  return INTEGRATIONS.filter(i => i.category === cat);
}

// ─── seed ────────────────────────────────────────────────────────────────
function seedIfNeeded() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(K.seeded)) return;
  const now = Date.now();
  const HOUR = 3600 * 1000;

  const connections: Record<string, Connection> = {
    "razorpay": {
      slug: "razorpay", status: "connected", connectedAt: now - 45 * 24 * HOUR, lastSyncAt: now - 22 * 60 * 1000,
      uptime: 0.998, events24h: 41, errors24h: 0, environment: "live",
      config: { key_id: "rzp_live_XY42q7bJmKcqvL", key_secret: "sk_rz_live_2f9k2l3m4n5o6p7q8r9s0t", webhook_secret: "whsec_pk9m2c8y3f1x7g4a" },
    },
    "google-calendar": {
      slug: "google-calendar", status: "connected", connectedAt: now - 62 * 24 * HOUR, lastSyncAt: now - 3 * 60 * 1000,
      uptime: 0.999, events24h: 118, errors24h: 0, environment: "live",
      config: { calendar_id: "anya@peacecode.in" },
    },
    "whatsapp": {
      slug: "whatsapp", status: "degraded", connectedAt: now - 12 * 24 * HOUR, lastSyncAt: now - 90 * 60 * 1000,
      uptime: 0.94, events24h: 23, errors24h: 2, environment: "live",
      config: { phone_number_id: "10238471029384", access_token: "EAAJk8mZAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" },
    },
    "resend": {
      slug: "resend", status: "connected", connectedAt: now - 30 * 24 * HOUR, lastSyncAt: now - 45 * 60 * 1000,
      uptime: 0.997, events24h: 62, errors24h: 1, environment: "live",
      config: { api_key: "re_live_9k2f8m3n4c7v1z0a", from_domain: "practice.peacecode.in" },
    },
  };
  const activity: ActivityEvent[] = [];
  const seedEvents = (slug: string, entries: [number, ActivityEvent["kind"], string, string?, number?, "GET" | "POST" | "PUT" | "DELETE"?][]) => {
    entries.forEach(([offsetMin, kind, summary, path, status, method], i) => {
      activity.push({ id: `${slug}_${i}_${offsetMin}`, slug, at: now - offsetMin * 60 * 1000, kind, actor: "system", summary, path, status, method });
    });
  };
  seedEvents("razorpay", [
    [22, "webhook.in", "payment.captured — INR 3,500 · order_9YfZ", "/webhooks/razorpay", 200, "POST"],
    [46, "sync", "Reconciled settlement UTR 2026071502134", "/v1/settlements/setl_9Yf", 200, "GET"],
    [172, "webhook.in", "order.paid — INR 4,200 · order_9YZg", "/webhooks/razorpay", 200, "POST"],
    [340, "config", "Webhook secret rotated"],
    [520, "webhook.in", "payment.failed — INR 3,500 · order_9YXm — retry queued", "/webhooks/razorpay", 200, "POST"],
  ]);
  seedEvents("google-calendar", [
    [3, "sync", "Pulled 4 events from primary calendar", "/calendar/v3/calendars/primary/events", 200, "GET"],
    [63, "sync", "Pushed session with Priya Menon — Thu 5:00pm", "/calendar/v3/calendars/primary/events", 201, "POST"],
    [124, "sync", "Removed cancelled session with A. Shah", "/calendar/v3/calendars/primary/events/evt_2z", 204, "DELETE"],
  ]);
  seedEvents("whatsapp", [
    [90, "error", "Template not approved: reminder_v3 — falling back to reminder_v2", "/v18.0/PHONE_ID/messages", 400, "POST"],
    [140, "webhook.out", "Sent reminder to +91 98111 22334 · reminder_v2", "/v18.0/PHONE_ID/messages", 200, "POST"],
    [420, "webhook.in", "Delivery status: read · +91 98222 33445", "/webhooks/whatsapp", 200, "POST"],
  ]);
  seedEvents("resend", [
    [45, "sync", "Sent invoice INV-2026-047 receipt to priya@demo.in", "/emails", 200, "POST"],
    [180, "sync", "Sent session reminder × 8", "/emails", 200, "POST"],
    [1220, "error", "Bounce: hard bounce on former@address.com", "/webhooks/resend", 200, "POST"],
  ]);

  const webhooks: WebhookSub[] = [
    { id: "wh_1", url: "https://hooks.zapier.com/hooks/catch/1029384/abx8qla/", events: ["session.completed"], secret: "whsec_z9p3k2f8m4n7c6v1", enabled: true, createdAt: now - 20 * 24 * HOUR, lastDeliveryAt: now - 5 * HOUR, lastStatus: 200 },
    { id: "wh_2", url: "https://api.mypractice.local/pc-events", events: ["invoice.paid", "invoice.overdue"], secret: "whsec_a1b2c3d4e5f6g7h8", enabled: true, createdAt: now - 60 * 24 * HOUR, lastDeliveryAt: now - 22 * HOUR, lastStatus: 200 },
    { id: "wh_3", url: "https://n8n.self-hosted/webhook/pc-sessions", events: ["session.scheduled", "session.cancelled"], secret: "whsec_9k7f2m3n8c4v6z1x", enabled: false, createdAt: now - 8 * 24 * HOUR, lastStatus: 500 },
  ];

  const tokens: ApiToken[] = [
    { id: "tk_1", name: "Practice dashboard (read-only)", prefix: "pc_live_9f2q", scopes: ["read:patients", "read:sessions", "read:invoices"], createdAt: now - 90 * 24 * HOUR, lastUsedAt: now - 3 * HOUR },
    { id: "tk_2", name: "Superbill export (nightly)", prefix: "pc_live_2m8k", scopes: ["read:invoices"], createdAt: now - 30 * 24 * HOUR, lastUsedAt: now - 12 * HOUR },
    { id: "tk_3", name: "Old Zapier — deprecated", prefix: "pc_live_7x4b", scopes: ["webhooks:manage"], createdAt: now - 400 * 24 * HOUR, revoked: true },
  ];

  write(K.connections, connections);
  write(K.activity, activity);
  write(K.webhooks, webhooks);
  write(K.tokens, tokens);
  localStorage.setItem(K.seeded, "1");
}

// ─── reactive plumbing ───────────────────────────────────────────────────
function subscribe(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener("pc.integrations.change", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("pc.integrations.change", handler);
    window.removeEventListener("storage", handler);
  };
}
function useSnap<T>(getter: () => T, fb: T): T {
  const [ready, setReady] = useState(false);
  useEffect(() => { seedIfNeeded(); setReady(true); }, []);
  const v = useSyncExternalStore(subscribe, getter, () => fb);
  return ready ? v : fb;
}

// ─── selectors ───────────────────────────────────────────────────────────
export function useConnections(): Record<string, Connection> {
  return useSnap(() => read<Record<string, Connection>>(K.connections, {}), {});
}
export function useConnection(slug: string): Connection | undefined {
  const conns = useConnections();
  return conns[slug];
}
export function useIntegrationActivity(slug?: string): ActivityEvent[] {
  return useSnap(() => {
    const all = read<ActivityEvent[]>(K.activity, []);
    return (slug ? all.filter(a => a.slug === slug) : all).sort((a, b) => b.at - a.at);
  }, []);
}
export function useWebhooks(): WebhookSub[] {
  return useSnap(() => read<WebhookSub[]>(K.webhooks, []), []);
}
export function useTokens(): ApiToken[] {
  return useSnap(() => read<ApiToken[]>(K.tokens, []), []);
}

// ─── mutations ───────────────────────────────────────────────────────────
export function connectIntegration(slug: string, config: Record<string, string> = {}) {
  const conns = read<Record<string, Connection>>(K.connections, {});
  conns[slug] = {
    slug, status: "connected", connectedAt: Date.now(), lastSyncAt: Date.now(),
    uptime: 1, events24h: 0, errors24h: 0, environment: "live", config,
  };
  write(K.connections, conns);
  logActivity(slug, { kind: "config", summary: "Connected. Initial handshake successful.", actor: "you" });
}
export function disconnectIntegration(slug: string) {
  const conns = read<Record<string, Connection>>(K.connections, {});
  delete conns[slug];
  write(K.connections, conns);
  logActivity(slug, { kind: "config", summary: "Disconnected.", actor: "you" });
}
export function updateConfig(slug: string, patch: Record<string, string>) {
  const conns = read<Record<string, Connection>>(K.connections, {});
  const c = conns[slug]; if (!c) return;
  conns[slug] = { ...c, config: { ...c.config, ...patch } };
  write(K.connections, conns);
  logActivity(slug, { kind: "config", summary: `Updated ${Object.keys(patch).length} setting${Object.keys(patch).length === 1 ? "" : "s"}.`, actor: "you" });
}
export function triggerSync(slug: string) {
  const conns = read<Record<string, Connection>>(K.connections, {});
  const c = conns[slug]; if (!c) return;
  conns[slug] = { ...c, lastSyncAt: Date.now(), events24h: (c.events24h ?? 0) + 1 };
  write(K.connections, conns);
  logActivity(slug, { kind: "sync", summary: "Manual sync completed.", actor: "you", status: 200, method: "GET" });
}
function logActivity(slug: string, e: Omit<ActivityEvent, "id" | "slug" | "at">) {
  const list = read<ActivityEvent[]>(K.activity, []);
  list.push({ ...e, id: `${slug}_${Date.now()}`, slug, at: Date.now() });
  write(K.activity, list);
}

export function createWebhook(url: string, events: string[]): WebhookSub {
  const list = read<WebhookSub[]>(K.webhooks, []);
  const wh: WebhookSub = { id: `wh_${Date.now()}`, url, events, secret: randomSecret(), enabled: true, createdAt: Date.now() };
  write(K.webhooks, [...list, wh]);
  return wh;
}
export function toggleWebhook(id: string) {
  const list = read<WebhookSub[]>(K.webhooks, []);
  write(K.webhooks, list.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w));
}
export function removeWebhook(id: string) {
  write(K.webhooks, read<WebhookSub[]>(K.webhooks, []).filter(w => w.id !== id));
}
export function createToken(name: string, scopes: string[]): { token: ApiToken; fullValue: string } {
  const rand = randomSecret().slice(0, 24);
  const prefix = "pc_live_" + rand.slice(0, 4);
  const fullValue = `${prefix}_${rand}`;
  const token: ApiToken = { id: `tk_${Date.now()}`, name, prefix, scopes, createdAt: Date.now() };
  write(K.tokens, [...read<ApiToken[]>(K.tokens, []), token]);
  return { token, fullValue };
}
export function revokeToken(id: string) {
  const list = read<ApiToken[]>(K.tokens, []);
  write(K.tokens, list.map(t => t.id === id ? { ...t, revoked: true } : t));
}

function randomSecret(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let s = "";
  for (let i = 0; i < 32; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

// ─── automations ────────────────────────────────────────────────────────
export const AUTOMATIONS: Automation[] = [
  { id: "au_1", title: "Append completed sessions to a Google Sheet", when: "session.completed", then: "Add a row in your practice ledger sheet", tools: ["Zapier", "Make", "n8n"], triggerUrl: "https://hooks.peacecode.in/t/au_sessions_ledger" },
  { id: "au_2", title: "WhatsApp receipt when an invoice is paid", when: "invoice.paid", then: "Send a WhatsApp receipt to the client", tools: ["Zapier", "Make"], triggerUrl: "https://hooks.peacecode.in/t/au_wa_receipt" },
  { id: "au_3", title: "Slack the intake team when a new patient signs up", when: "patient.created", then: "Post to #new-clients in Slack", tools: ["Zapier", "n8n"], triggerUrl: "https://hooks.peacecode.in/t/au_slack_new_patient" },
  { id: "au_4", title: "Weekly digest of overdue invoices", when: "Every Monday at 09:00", then: "Email the practice owner a digest of overdue balances", tools: ["Make", "n8n"], triggerUrl: "https://hooks.peacecode.in/t/au_overdue_digest" },
  { id: "au_5", title: "Auto-create a Notion page for each new patient", when: "patient.created", then: "Create a private Notion page in your case-notes database", tools: ["Zapier", "Make", "n8n"], triggerUrl: "https://hooks.peacecode.in/t/au_notion_case_page" },
  { id: "au_6", title: "Push assessment results to a private Airtable", when: "assessment.submitted", then: "Append score + band to Airtable", tools: ["Zapier", "n8n"], triggerUrl: "https://hooks.peacecode.in/t/au_airtable_assessments" },
];

// ─── formatting ─────────────────────────────────────────────────────────
export function fmtRelative(ts?: number): string {
  if (!ts) return "—";
  const diff = Date.now() - ts;
  const min = Math.round(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function statusOf(catalog: Integration, connection?: Connection): IntegrationStatus {
  if (!connection) return catalog.status;
  return connection.status;
}
