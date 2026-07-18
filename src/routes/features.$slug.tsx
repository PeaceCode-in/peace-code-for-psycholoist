import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import type { ComponentType } from "react";
import {
  CalendarCheck, ArrowRight, Clock, Link2, BellOff, RefreshCw, ShieldCheck, Check,
  FileText, Sparkles, History, PenLine, Lock, ClipboardList, LineChart, Activity, Send,
  Video, DoorOpen, Camera, Wallet, Receipt, CreditCard, PiggyBank, MessageSquare, Inbox,
  BookOpen, Repeat, TrendingUp, UsersRound, HeartPulse, LifeBuoy, AlertTriangle, PhoneCall,
  Share2, Network, Users, Award, GraduationCap, FolderOpen, Library, BarChart3,
  Plug, Hourglass, Globe, Bell, Layers, MapPin, Zap, FileCheck, Building2, Star, ChevronDown,
} from "lucide-react";
import branchLeft from "@/assets/sakura/branch-left.svg";
import branchRight from "@/assets/sakura/branch-right.svg";
import { getDeepDive } from "@/components/marketing/features/deep-dives";



const LOGIN_URL = "/auth";

/** Per-feature "Get started" destination — deep-link into the matching app surface after auth. */
const FEATURE_APP_ROUTE: Record<string, { path: string; label: string }> = {
  scheduling:    { path: "/calendar",             label: "Open your calendar" },
  notes:         { path: "/notes",                label: "Start a note" },
  assessments:   { path: "/assessments/library",  label: "Browse assessments" },
  telehealth:    { path: "/telehealth",           label: "Launch a session" },
  billing:       { path: "/billing/invoices/new", label: "Create an invoice" },
  messages:      { path: "/inbox",                label: "Open the inbox" },
  homework:      { path: "/homework/assign",      label: "Assign homework" },
  groups:        { path: "/groups",               label: "Set up a group" },
  patients:      { path: "/patients",             label: "Open patient charts" },
  safety:        { path: "/patients",             label: "Start a safety plan" },
  referrals:     { path: "/referrals",            label: "Log a referral" },
  teams:         { path: "/team",                 label: "Invite your team" },
  supervision:   { path: "/supervision",          label: "Open supervision" },
  cpd:           { path: "/cpd",                  label: "Track CPD hours" },
  documents:     { path: "/documents",            label: "Open documents" },
  library:       { path: "/homework/library",     label: "Open the library" },
  analytics:     { path: "/analytics",            label: "See your analytics" },
  copilot:       { path: "/copilot",              label: "Meet the copilot" },
  compliance:    { path: "/compliance/audit",     label: "Review compliance" },
  integrations:  { path: "/settings/integrations",label: "Connect integrations" },
  waitlist:      { path: "/calendar/availability",label: "Configure waitlist" },
  profile:       { path: "/marketing/profile",    label: "Build your profile" },
};
const ctaFor = (slug: string) =>
  FEATURE_APP_ROUTE[slug] ?? { path: "/dashboard", label: "Get started free" };

type Cap = { icon: ComponentType<{ className?: string }>; title: string; body: string };
type Step = { step: string; title: string; body: string };
type Save = { metric: string; label: string; note: string };
type FAQ = { q: string; a: string };
type Feature = {
  slug: string;
  tag: string;
  title: string;
  italicWord: string;
  hero: string;
  subtitle: string;
  aeoSummary: string; // ~50-word snippet for AI Overviews / featured snippets
  keywords: string;
  capTitle: string;
  capItalic: string;
  problem: { title: string; body: string; points: string[] };
  capabilities: Cap[];
  workflow: Step[];
  savings: Save[];
  faq: FAQ[];
  cta: string;
  ctaItalic: string;
};

const mk = (f: Feature): Feature => f;

const FEATURES: Record<string, Feature> = {
  scheduling: mk({
    slug: "scheduling", tag: "Schedule", title: "A calendar that respects the way you", italicWord: "work.",
    hero: "Smart scheduling",
    subtitle: "Buffers between sessions, no-show automations, and one booking link that fits your practice — not the other way around.",
    aeoSummary: "PeaceCode scheduling is the best online booking system for psychologists. Clients book real availability through one link, buffers hold, 24h and 2h reminders fire automatically, no-shows can auto-charge or auto-release to your waitlist, and Google or Outlook stays in two-way sync — privately.",
    keywords: "online booking for psychologists, therapy scheduling software, no-show automation, waitlist for therapists",
    capTitle: "Everything the calendar", capItalic: "already knows.",
    problem: {
      title: "The scheduling tax on a clinical week",
      body: "For most psychologists the calendar is where the day quietly falls apart. Overlapping bookings, missed buffers, SMS threads, and no-shows that eat an hour of your evening.",
      points: ["Clients rebook over your lunch buffer", "Confirmations go out late — or not at all", "A cancellation cascades into an idle slot", "You chase reminders on WhatsApp"],
    },
    capabilities: [
      { icon: Clock, title: "Buffers that hold", body: "Pre and post buffers per service. Booking links respect them automatically." },
      { icon: Link2, title: "One booking link", body: "Clients pick from real availability, filtered by service, location, and mode." },
      { icon: BellOff, title: "No-show automations", body: "24h and 2h reminders. Auto-charge, auto-reschedule, or release to waitlist." },
      { icon: RefreshCw, title: "Two-way sync", body: "Google and Outlook stay in lockstep. Personal events block without exposing details." },
      { icon: ShieldCheck, title: "Privacy first", body: "Client names never appear on shared calendars. Sync sends 'Session' blocks." },
      { icon: CalendarCheck, title: "Waitlist that works", body: "Priority queue notified when a slot opens. First to confirm books automatically." },
    ],
    workflow: [
      { step: "01", title: "Define your week", body: "Set working hours, session lengths, and buffers once. Copy across weeks." },
      { step: "02", title: "Share your link", body: "One link. Clients see only the slots you want to fill." },
      { step: "03", title: "Let automations run", body: "Reminders, reschedules, cancellations — without your inbox." },
      { step: "04", title: "See the arc", body: "Weekly view: utilization, no-show rate, revenue at a glance." },
    ],
    savings: [
      { metric: "~4 hrs", label: "Saved per week", note: "on scheduling admin, from early-access clinicians" },
      { metric: "38%", label: "Fewer no-shows", note: "with 24h + 2h reminders enabled" },
      { metric: "1 link", label: "Instead of 40 SMS", note: "for a typical booking week" },
    ],
    faq: [
      { q: "Can I have different rules per service?", a: "Yes. Each service — assessment, first session, follow-up, couples — has its own duration, buffers, fee, and cancellation window." },
      { q: "What happens on a no-show?", a: "You pick the policy: charge the fee, offer one reschedule, or release to the waitlist. Configured per service." },
      { q: "Do clients need an account to book?", a: "No. Three-tap booking. An account is only created if you enable the client portal for that person." },
      { q: "Does it work offline in-clinic?", a: "Yes for reads. New bookings sync when you're back online." },
    ],
    cta: "Give your calendar the", ctaItalic: "same care",
  }),

  notes: mk({
    slug: "notes", tag: "Notes", title: "Notes that finish", italicWord: "themselves.",
    hero: "Clinical notes with a copilot",
    subtitle: "SOAP, DAP, intake, progress and discharge — drafted while you listen and signed with a click. Every version kept, every amendment tracked.",
    aeoSummary: "PeaceCode is the best therapy notes app for psychologists. Draft SOAP, DAP, progress, intake and discharge notes with an in-session copilot, sign digitally, keep every amendment in an immutable version history, and export any note as HIPAA/DPDP-compliant PDF at any time.",
    keywords: "therapy notes software, SOAP notes app, DAP notes, progress notes for psychologists, clinical documentation",
    capTitle: "Documentation, without", capItalic: "the tax.",
    problem: {
      title: "The Sunday-night notes backlog",
      body: "Clinical notes are the most avoided task in the week. Blank templates, retyping the same phrases, and hunting the last session's arc across three tools.",
      points: ["Notes queue quietly for days", "Templates don't match how you actually think", "No easy way to see the last three sessions in one glance", "Amendments overwrite the original — audit anxiety"],
    },
    capabilities: [
      { icon: Sparkles, title: "Session copilot", body: "Draft SOAP/DAP/progress in real time. You keep every word — or rewrite in one." },
      { icon: FileText, title: "Templates that adapt", body: "SOAP, DAP, BIRP, GIRP, intake, discharge, phone contact, missed session — one click each." },
      { icon: History, title: "Immutable amendments", body: "Every edit after sign-off creates an amendment. Original stays intact for audit." },
      { icon: PenLine, title: "Digital signature", body: "Sign once. Timestamped, tamper-evident, and attached to your credential." },
      { icon: Lock, title: "Client-locked", body: "Notes belong to the clinician. Never shared with insurers or trainers without explicit consent." },
      { icon: Layers, title: "Continuity brief", body: "Auto-summary of the last three sessions before you walk in. Never re-read cold." },
    ],
    workflow: [
      { step: "01", title: "Start the session", body: "Copilot pre-loads the last brief and the goals for today." },
      { step: "02", title: "Listen, don't type", body: "Draft assembles as you speak. Correct or ignore." },
      { step: "03", title: "Review & sign", body: "One-click review, edit, sign. Under 90 seconds for most notes." },
      { step: "04", title: "Always retrievable", body: "Search by patient, phrase, tag, or date. Export any time." },
    ],
    savings: [
      { metric: "~6 hrs", label: "Reclaimed weekly", note: "on documentation vs. blank-template workflows" },
      { metric: "<90s", label: "Per note", note: "median sign-off time with copilot on" },
      { metric: "100%", label: "Auditable", note: "immutable amendment trail per note" },
    ],
    faq: [
      { q: "Is the copilot listening to my sessions?", a: "Only when you enable it, per session. Audio is processed to text and discarded; the note is stored, the recording is not (unless you explicitly opt in)." },
      { q: "Can I keep my own template?", a: "Yes. Custom templates with your own headings, prompts, and default text." },
      { q: "What about amendments?", a: "Once signed, every change is an amendment with reason, timestamp, and user. Original remains intact." },
      { q: "Can I export?", a: "Any note as PDF; the whole chart as JSON. Your data, always." },
    ],
    cta: "Get your evenings", ctaItalic: "back.",
  }),

  assessments: mk({
    slug: "assessments", tag: "Assessments", title: "Outcomes you can actually", italicWord: "show.",
    hero: "Assessments & outcomes",
    subtitle: "PHQ-9, GAD-7, PCL-5, WHO-5, DASS-21 and 40+ instruments — assigned in a tap, scored automatically, plotted across time.",
    aeoSummary: "PeaceCode is the best PHQ-9 and GAD-7 tool for psychologists. Assign 40+ validated instruments including PCL-5, DASS-21, WHO-5, K10, PSS, ASRS, and custom scales; clients complete on any device; results score automatically and chart longitudinally with clinical cutoffs.",
    keywords: "PHQ-9 online, GAD-7 online, PCL-5 assessment, outcome measurement therapy, standardized assessments",
    capTitle: "A measurement stack, ", capItalic: "included.",
    problem: {
      title: "Paper forms don't scale",
      body: "Scoring by hand, chasing baselines, wondering if last month's PHQ-9 was really at 14 or 4. Outcomes shouldn't be this fragile.",
      points: ["Baselines get lost between sessions", "Manual scoring drifts", "Clients forget to bring the paper form", "You can't show progress in a single chart"],
    },
    capabilities: [
      { icon: ClipboardList, title: "40+ instruments", body: "PHQ-9, GAD-7, PCL-5, WHO-5, DASS-21, K10, PSS, ASRS, Y-BOCS, EDE-Q and more." },
      { icon: Send, title: "One-tap assign", body: "Send with a due date. Client opens the link — no login, no download." },
      { icon: Activity, title: "Auto-scored", body: "Subscales, cutoffs, and clinical bands calculated the moment they submit." },
      { icon: LineChart, title: "Trajectory chart", body: "Every score, every date, per instrument — with the last session marked." },
      { icon: FileCheck, title: "Custom instruments", body: "Build your own scale with Likert, VAS, or free-text items." },
      { icon: Zap, title: "Alerts on deterioration", body: "You get a quiet ping when a client's score crosses a threshold." },
    ],
    workflow: [
      { step: "01", title: "Pick an instrument", body: "Search a library of 40+ validated measures." },
      { step: "02", title: "Assign", body: "Tap 'Assign' on the patient's chart. Client gets a link." },
      { step: "03", title: "Client completes", body: "Any device, no login. Two minutes typically." },
      { step: "04", title: "Read the arc", body: "Score, band, and trajectory show up in the chart." },
    ],
    savings: [
      { metric: "40+", label: "Built-in instruments", note: "validated, translated, ready to assign" },
      { metric: "0 min", label: "Manual scoring", note: "everything scored the moment client submits" },
      { metric: "1 chart", label: "For every outcome", note: "longitudinal, per instrument, per patient" },
    ],
    faq: [
      { q: "Which instruments are included?", a: "PHQ-9, GAD-7, PCL-5, WHO-5, DASS-21, K10, PSS-10, ASRS-v1.1, Y-BOCS, EDE-Q, CD-RISC, ACE, AUDIT, DAST and many more. New ones added on request." },
      { q: "Can I build my own?", a: "Yes. Custom scales with Likert, VAS, multiple-choice and free-text items, with your own scoring rules." },
      { q: "Do clients need an app?", a: "No. Any browser, any device. The link is single-use and expires after submission." },
      { q: "Can I use these for research?", a: "Yes — with client consent. Anonymised exports are available for approved research use." },
    ],
    cta: "Measure what you", ctaItalic: "actually change.",
  }),

  telehealth: mk({
    slug: "telehealth", tag: "Telehealth", title: "Video that feels like the", italicWord: "room.",
    hero: "In-app secure video",
    subtitle: "Waiting room, consent capture, and end-to-end encrypted video that opens in the client's browser — no download, no account.",
    aeoSummary: "PeaceCode telehealth is the best secure video for psychologists. Clients join from any browser without downloading anything, pass through a virtual waiting room, sign informed consent digitally, and connect over end-to-end encrypted video — with optional recording only when both parties consent.",
    keywords: "telehealth for therapists, HIPAA video therapy, secure teletherapy platform, browser-based video psychology",
    capTitle: "Everything the session", capItalic: "needs.",
    problem: {
      title: "Zoom wasn't built for a session",
      body: "Waiting for the client to install something. Consent buried in a PDF. Recording that saves to somebody else's cloud. It's not the session, it's the friction around it.",
      points: ["Clients download an app they'll use once", "Consent isn't logged anywhere clinical", "Recording defaults to somebody else's cloud", "No waiting room — clients walk in mid-note"],
    },
    capabilities: [
      { icon: Video, title: "Browser-based video", body: "Zero install. The client clicks a link and joins." },
      { icon: DoorOpen, title: "Virtual waiting room", body: "Client waits until you admit. Chat with them before entry." },
      { icon: ShieldCheck, title: "End-to-end encrypted", body: "Signalling over TLS, media over encrypted SRTP. Not stored." },
      { icon: FileCheck, title: "Consent capture", body: "Consent form served in-session with digital signature." },
      { icon: Camera, title: "Consent-only recording", body: "Optional recording — requires explicit dual consent and is stored under your control." },
      { icon: MapPin, title: "Global-ready", body: "TURN relays across 5 continents for low-latency international sessions." },
    ],
    workflow: [
      { step: "01", title: "Session appears", body: "Both of you see the session on your calendar." },
      { step: "02", title: "Client waits", body: "They land in your waiting room. You get a ping." },
      { step: "03", title: "Admit & session", body: "Click Admit. Consent shown if not already signed." },
      { step: "04", title: "Wrap", body: "Session ends. Note copilot opens. Nothing recorded unless you chose to." },
    ],
    savings: [
      { metric: "0", label: "Downloads", note: "clients join from any modern browser" },
      { metric: "E2E", label: "Encryption", note: "audio, video, and chat" },
      { metric: "5 continents", label: "Low-latency", note: "distributed TURN infrastructure" },
    ],
    faq: [
      { q: "Do I need my client to install anything?", a: "No. Chrome, Safari, Edge, or Firefox — desktop or mobile — is enough." },
      { q: "Is it HIPAA / DPDP aligned?", a: "Yes. Encrypted transport, no persistent media, signed BAA on request for US practices, DPDP-aligned for Indian practices." },
      { q: "Can I record?", a: "Only with both-party consent, captured in-session. Recording is stored in your workspace, encrypted at rest." },
      { q: "What about group sessions?", a: "Up to 8 participants per session. Attendance auto-marks in your group roster." },
    ],
    cta: "Bring the room to", ctaItalic: "any browser.",
  }),

  billing: mk({
    slug: "billing", tag: "Billing", title: "Money that moves on its", italicWord: "own.",
    hero: "Billing without friction",
    subtitle: "GST-ready invoices, UPI and card payouts, insurance claims and monthly reports — reconciled the moment they're paid.",
    aeoSummary: "PeaceCode billing is the best invoicing and payments platform for psychologists. Send GST-compliant invoices, accept UPI, cards, and international payments via Stripe or Razorpay, file insurance claims, run payment plans, and reconcile automatically as payments arrive.",
    keywords: "therapy billing software India, GST invoice for psychologists, Razorpay Stripe therapist, insurance claims mental health",
    capTitle: "Every payment path,", capItalic: "one place.",
    problem: {
      title: "Invoices you keep forgetting to send",
      body: "Spreadsheets, WhatsApp payment screenshots, GST returns cobbled from memory. Money should move quietly in the background.",
      points: ["Invoices go out late — or not at all", "GST filings are a monthly scramble", "Insurance claims sit in a drawer", "Reconciliation is a manual chase"],
    },
    capabilities: [
      { icon: Receipt, title: "GST-ready invoices", body: "Auto-numbered, GSTIN-aware, e-invoice ready. Templates in your branding." },
      { icon: CreditCard, title: "UPI + cards + international", body: "Razorpay for India, Stripe globally. Clients pay in one tap." },
      { icon: FileCheck, title: "Insurance claims", body: "Track submitted → approved → paid, with attachments per claim." },
      { icon: PiggyBank, title: "Payment plans", body: "Split fees across sessions or months. Auto-charge on schedule." },
      { icon: BarChart3, title: "Monthly reports", body: "Revenue, outstanding, GST payable — exportable, CA-friendly." },
      { icon: RefreshCw, title: "Auto-reconciliation", body: "Payments match invoices the moment they land." },
    ],
    workflow: [
      { step: "01", title: "Set services", body: "Services with fees, tax codes, and default duration." },
      { step: "02", title: "Session runs", body: "Invoice drafts on session completion." },
      { step: "03", title: "Client pays", body: "One-tap UPI, card, or international payment link." },
      { step: "04", title: "Books close", body: "Everything reconciled. Reports ready for your CA." },
    ],
    savings: [
      { metric: "0", label: "Manual reconciliation", note: "payments match invoices automatically" },
      { metric: "GST-ready", label: "Compliance", note: "auto-numbered, GSTIN-aware, e-invoice compatible" },
      { metric: "48hr", label: "Payout", note: "for standard UPI and card transactions" },
    ],
    faq: [
      { q: "Which payment providers do you support?", a: "Razorpay and Stripe for cards, UPI, netbanking and international payments. Bring your own account or use ours." },
      { q: "Can I do payment plans?", a: "Yes. Split any invoice across sessions or dates with auto-charge on due." },
      { q: "How about insurance?", a: "Track each claim end-to-end with documents, submission and payment status." },
      { q: "Is it GST compliant?", a: "Yes — auto-numbered, GSTIN-aware invoices with the correct SAC codes for mental-health services." },
    ],
    cta: "Let money move", ctaItalic: "quietly.",
  }),

  messages: mk({
    slug: "messages", tag: "Messaging", title: "Client messaging that stays", italicWord: "clinical.",
    hero: "Secure client messaging",
    subtitle: "HIPAA/DPDP-aligned chat with canned replies, quiet hours, and a full audit trail — off WhatsApp, inside the chart.",
    aeoSummary: "PeaceCode messaging is the best secure client-messaging platform for psychologists. All conversations stay inside the patient chart with end-to-end encryption, canned replies for common requests, quiet-hours to protect your time, and an immutable audit log for every message sent.",
    keywords: "secure therapy messaging, HIPAA compliant chat therapist, WhatsApp alternative therapy, client portal messages",
    capTitle: "Boundaries, but", capItalic: "warmer.",
    problem: {
      title: "WhatsApp isn't a clinical channel",
      body: "Your personal number is in strangers' phones. Sensitive content mixes with family group chats. Nothing is auditable, and you're always on.",
      points: ["Clients text you at 2am", "Sensitive content in a consumer app", "No way to attach a message to a chart", "No audit if a boundary is breached"],
    },
    capabilities: [
      { icon: MessageSquare, title: "In-chart threads", body: "Every message tied to the patient chart, searchable and exportable." },
      { icon: Lock, title: "End-to-end encrypted", body: "Encrypted at rest and in transit. Not scanned for ads." },
      { icon: Inbox, title: "Canned replies", body: "One-tap responses for common requests — with per-client personalization." },
      { icon: BellOff, title: "Quiet hours", body: "Silence notifications between chosen hours. Emergency-only overrides." },
      { icon: History, title: "Audit trail", body: "Every message logged: sent, delivered, read, edited, deleted." },
      { icon: FileCheck, title: "Compliance-safe", body: "DPDP + HIPAA-aligned message posture. Retention policies you control." },
    ],
    workflow: [
      { step: "01", title: "Client requests portal", body: "Send them an invite from their chart." },
      { step: "02", title: "They message inside", body: "Threads appear in your inbox, tagged by patient." },
      { step: "03", title: "You reply — or automate", body: "Canned replies for scheduling, invoices, or forms." },
      { step: "04", title: "Everything auditable", body: "Full trail available on export or for a governance review." },
    ],
    savings: [
      { metric: "0", label: "Client texts to personal", note: "your number stays yours" },
      { metric: "Quiet", label: "Hours", note: "auto-silence notifications after hours" },
      { metric: "100%", label: "Auditable", note: "every interaction logged and exportable" },
    ],
    faq: [
      { q: "Do clients need an app?", a: "No. A web portal works on any device. iOS and Android wrappers are available." },
      { q: "Is it encrypted?", a: "Yes — TLS in transit, AES-256 at rest. Not scanned for advertising." },
      { q: "Can I set quiet hours?", a: "Yes, per practitioner. Emergency-flagged messages still notify — nothing else does." },
      { q: "What about group practices?", a: "Threads can be shared across a clinical team with role-based access." },
    ],
    cta: "Get off WhatsApp,", ctaItalic: "keep the warmth.",
  }),

  homework: mk({
    slug: "homework", tag: "Homework", title: "Care between the", italicWord: "sessions.",
    hero: "Homework & between-session care",
    subtitle: "CBT worksheets, thought records, behavioural logs and psychoeducation — assigned in a tap, tracked without asking.",
    aeoSummary: "PeaceCode homework is the best therapy-homework and between-session tracking tool for psychologists. Assign CBT worksheets, thought records, behavioural activation logs and psychoeducation from a rich library, track completion without asking, and pull compliance data into the next session's brief.",
    keywords: "CBT worksheets online, therapy homework app, thought record digital, behavioural activation log",
    capTitle: "The library your practice", capItalic: "already has.",
    problem: {
      title: "Homework nobody remembers",
      body: "You spend the last five minutes assigning a worksheet the client will lose. Next week begins with 'did you do the homework?' and a shrug.",
      points: ["Worksheets get forgotten in a bag", "You retype the same CBT template weekly", "No idea if anyone completed anything", "Between-session momentum evaporates"],
    },
    capabilities: [
      { icon: BookOpen, title: "Curated library", body: "CBT, DBT, ACT worksheets, thought records, exposure hierarchies, sleep diaries." },
      { icon: Repeat, title: "Recurring assignments", body: "Daily mood, weekly gratitude, thrice-weekly BA — set once, runs itself." },
      { icon: TrendingUp, title: "Compliance at a glance", body: "See who's engaging and who's drifting. Never mid-session surprise." },
      { icon: Send, title: "One-tap assign", body: "From the chart, send a worksheet with a due date and a note." },
      { icon: Sparkles, title: "Auto-populated brief", body: "Homework responses appear in your continuity brief next session." },
      { icon: FileText, title: "Custom worksheets", body: "Build your own with prompts, scales and text fields." },
    ],
    workflow: [
      { step: "01", title: "Pick worksheet", body: "Choose from library or a personal template." },
      { step: "02", title: "Assign in a tap", body: "Frequency, due date, and a personal note." },
      { step: "03", title: "Client completes", body: "In the portal — desktop or phone." },
      { step: "04", title: "Session opens", body: "Responses summarized in your continuity brief." },
    ],
    savings: [
      { metric: "3x", label: "Completion rate", note: "vs. paper handouts, in early-access clinicians" },
      { metric: "0 min", label: "Manual chasing", note: "compliance visible without asking" },
      { metric: "100+", label: "Worksheets", note: "curated CBT, DBT, ACT starter library" },
    ],
    faq: [
      { q: "What's in the library?", a: "CBT thought records, behavioural activation, exposure hierarchies, DBT skills logs, ACT values sorts, sleep diaries, mood trackers — with more added monthly." },
      { q: "Can I build my own?", a: "Yes. Any combination of prompts, scales, and free-text fields." },
      { q: "How does the client complete it?", a: "Through the portal. No download. Autosaves as they go." },
      { q: "Can I see partial completion?", a: "Yes — every field is timestamped. You see effort even when they didn't finish." },
    ],
    cta: "Keep momentum,", ctaItalic: "between weeks.",
  }),

  groups: mk({
    slug: "groups", tag: "Groups", title: "Group therapy that isn't a", italicWord: "spreadsheet.",
    hero: "Group & couples therapy",
    subtitle: "Rosters, attendance, per-member notes, shared homework and outcome measures — for groups, couples and family work.",
    aeoSummary: "PeaceCode is the best group-therapy platform for psychologists. Manage rosters, mark attendance in a tap, write per-member notes from a shared session, assign shared homework, and track outcomes per participant — for CBT groups, DBT skills groups, couples work and family therapy.",
    keywords: "group therapy software, DBT skills group tracker, couples therapy notes, family therapy platform",
    capTitle: "Groups without the", capItalic: "chaos.",
    problem: {
      title: "Groups fall through the tools",
      body: "A spreadsheet for the roster, a document for the notes, a WhatsApp group for reminders, a paper form for attendance. And that's before you think about outcomes.",
      points: ["Attendance is a chore each session", "Per-member notes require duplicating everything", "Shared homework never gets tracked", "Outcomes are impossible to compare"],
    },
    capabilities: [
      { icon: UsersRound, title: "Group roster", body: "Add or remove members, mark cohorts, set the session series." },
      { icon: CalendarCheck, title: "Attendance", body: "Tap to mark present, late, absent, or excused." },
      { icon: FileText, title: "Shared + private notes", body: "Group-level note plus a private line per participant." },
      { icon: ClipboardList, title: "Shared homework", body: "Assign to everyone in the group at once." },
      { icon: LineChart, title: "Outcomes per member", body: "PHQ-9 or your custom scale per participant across the series." },
      { icon: MessageSquare, title: "Group announcements", body: "One message to the cohort with delivery receipts." },
    ],
    workflow: [
      { step: "01", title: "Create group", body: "Name, format (CBT / DBT / couples / family), members." },
      { step: "02", title: "Schedule series", body: "Recurring weekly or fortnightly with the same participants." },
      { step: "03", title: "Run session", body: "Attendance, shared + private notes, homework." },
      { step: "04", title: "Track outcomes", body: "Individual and group-level charts across the series." },
    ],
    savings: [
      { metric: "1 view", label: "Whole cohort", note: "roster, attendance, outcomes on one screen" },
      { metric: "n × faster", label: "Per-member notes", note: "shared body, private lines — duplicate nothing" },
      { metric: "Any format", label: "CBT · DBT · couples · family", note: "same primitives, different flow" },
    ],
    faq: [
      { q: "Does this work for couples?", a: "Yes — a two-person group with shared and private notes per partner." },
      { q: "Can I run a closed cohort?", a: "Yes. Fix the members up front; no drop-ins until you re-open enrollment." },
      { q: "Do participants see each other?", a: "Only names by default. Contact details are never shared unless you enable a group directory." },
      { q: "What about outcomes across the series?", a: "Assign the same instrument to everyone; group and individual charts appear automatically." },
    ],
    cta: "Run the group,", ctaItalic: "not the spreadsheet.",
  }),

  patients: mk({
    slug: "patients", tag: "Patients", title: "Every chart, one calm", italicWord: "surface.",
    hero: "Patient charts",
    subtitle: "Timeline, notes, assessments, homework, invoices and messages — one scroll, one search, zero tab-hopping.",
    aeoSummary: "PeaceCode patient charts give psychologists a single calm surface per client: timeline of every session, all notes, assessments with trajectories, homework compliance, invoices, messages, and consent — searchable in one place, exportable as a full PDF or JSON chart.",
    keywords: "patient chart therapy, EHR mental health, client record psychologist, therapy client management",
    capTitle: "Everything about the client,", capItalic: "in one scroll.",
    problem: {
      title: "The chart lives in 8 tabs",
      body: "Notes here, invoices there, assessments in a folder, messages on WhatsApp. When you sit down to prepare for a session, the first ten minutes are archaeology.",
      points: ["Prep time is spent tab-hopping", "You forget which assessment they last did", "Session arc is invisible", "Handovers to a colleague are painful"],
    },
    capabilities: [
      { icon: HeartPulse, title: "One timeline", body: "Every event — session, note, assessment, invoice, message — chronological." },
      { icon: FileText, title: "Full note archive", body: "Every clinical note with amendments and signatures." },
      { icon: LineChart, title: "Assessment trajectories", body: "PHQ-9, GAD-7 and every scale, plotted per patient." },
      { icon: BookOpen, title: "Homework compliance", body: "What's assigned, what's done, what's late." },
      { icon: Wallet, title: "Financial ledger", body: "Invoices, payments, outstanding — reconciled." },
      { icon: FileCheck, title: "Consent + documents", body: "Signed forms, uploads, letters, certificates." },
    ],
    workflow: [
      { step: "01", title: "Search", body: "Find any patient by name, phone, tag, or diagnosis." },
      { step: "02", title: "Read the arc", body: "Continuity brief summarises the last three sessions." },
      { step: "03", title: "Act in place", body: "Assign, note, invoice, message — from the chart." },
      { step: "04", title: "Export any time", body: "Full PDF chart or JSON download in one click." },
    ],
    savings: [
      { metric: "1", label: "Screen for everything", note: "no tab switching" },
      { metric: "3-session", label: "Continuity brief", note: "auto-summary before every session" },
      { metric: "PDF · JSON", label: "Export", note: "your data, always portable" },
    ],
    faq: [
      { q: "Can I export a full chart?", a: "Yes — PDF summary or a complete JSON archive, at any time, per patient." },
      { q: "Can I share a chart with a colleague?", a: "With patient consent, share read-only or grant temporary write access for supervision." },
      { q: "What about right-to-erasure?", a: "One-click erasure that respects legal retention obligations for clinical records." },
      { q: "How is data stored?", a: "Encrypted at rest, backed up daily, in your region of choice." },
    ],
    cta: "See the whole client,", ctaItalic: "at once.",
  }),

  safety: mk({
    slug: "safety", tag: "Safety", title: "When risk shows up, the plan is", italicWord: "ready.",
    hero: "Risk & safety planning",
    subtitle: "Stanley-Brown safety plans, risk flags, escalation protocols and one-tap emergency contacts — because the moment matters.",
    aeoSummary: "PeaceCode safety planning is the best digital Stanley-Brown safety plan tool for psychologists. Co-create structured suicide-safety plans in-session, share to the client's phone, capture risk flags, define escalation protocols, and get quiet alerts when assessment scores cross thresholds.",
    keywords: "Stanley-Brown safety plan, suicide risk assessment digital, therapy safety planning app",
    capTitle: "The safety net,", capItalic: "already in place.",
    problem: {
      title: "Risk is a solo weight",
      body: "You leave a hard session carrying the weight alone. There's no way to know if the plan you built on paper is still with them.",
      points: ["Paper plans get folded and forgotten", "Escalation depends on remembering the right contact", "You can't tell if scores are drifting downward", "Handovers to on-call clinicians are ad-hoc"],
    },
    capabilities: [
      { icon: LifeBuoy, title: "Stanley-Brown template", body: "Warning signs, internal coping, distractions, people, professionals, environment safety." },
      { icon: AlertTriangle, title: "Risk flags", body: "Tag a chart with active or historical risk; visible at session start." },
      { icon: PhoneCall, title: "One-tap emergency", body: "Local crisis lines pre-configured — India, US, UK, EU, AU, SG." },
      { icon: Zap, title: "Score-crossing alerts", body: "Quiet ping when PHQ-9 item 9 changes or C-SSRS crosses a threshold." },
      { icon: FileCheck, title: "Client-owned copy", body: "The plan is shared to their portal — always accessible on their phone." },
      { icon: Users, title: "On-call handover", body: "Package a chart summary for a covering clinician in one action." },
    ],
    workflow: [
      { step: "01", title: "Co-create in-session", body: "Fill the plan on-screen together." },
      { step: "02", title: "Share to phone", body: "Client keeps a portal copy — no download." },
      { step: "03", title: "Set flags & alerts", body: "Assessment thresholds trigger quiet pings to you." },
      { step: "04", title: "Escalate cleanly", body: "One-tap emergency contacts, one-action on-call handover." },
    ],
    savings: [
      { metric: "60s", label: "To share the plan", note: "co-created and on their phone before session ends" },
      { metric: "Local", label: "Crisis lines", note: "pre-configured for India, US, UK, EU, AU, SG" },
      { metric: "Quiet", label: "Alerts", note: "pings only when a real threshold is crossed" },
    ],
    faq: [
      { q: "Is the template evidence-based?", a: "Yes — Stanley-Brown Safety Planning Intervention structure, with additional culturally-adapted sections available." },
      { q: "Which crisis lines are pre-loaded?", a: "iCall / Vandrevala (India), 988 (US), 111 / Samaritans (UK), EU country lines, Lifeline (AU), SOS (SG). Add your own." },
      { q: "Can I get alerts on scores?", a: "Yes — per patient, per instrument, threshold-based, with quiet-hours respected." },
      { q: "What about handovers to on-call?", a: "One action packages a chart summary, current plan, and risk flags for a covering clinician." },
    ],
    cta: "Carry less,", ctaItalic: "for the hard moments.",
  }),

  referrals: mk({
    slug: "referrals", tag: "Referrals", title: "Warm referrals, closed", italicWord: "loops.",
    hero: "Referrals in and out",
    subtitle: "Track where clients came from, refer to trusted colleagues, and see when they land — with source analytics that inform where to grow.",
    aeoSummary: "PeaceCode referrals help psychologists grow through warm, closed-loop referrals. Track incoming sources — GPs, psychiatrists, universities, community — and refer out to trusted colleagues with a full audit of when the client landed, was seen, and what came back.",
    keywords: "referral tracking therapy, therapist network India, mental health referral loop",
    capTitle: "A network that", capItalic: "shows up.",
    problem: {
      title: "Referrals disappear into the ether",
      body: "You send a client to a colleague and never hear back. A GP refers you a patient and never learns if they were seen. Everyone works harder than they should.",
      points: ["Referral sources aren't tracked", "Referred-out clients never get followed up", "Referring clinicians hear nothing back", "You can't tell which channels actually grow the practice"],
    },
    capabilities: [
      { icon: Share2, title: "One-click referral", body: "Refer out with context, consent, and a shared secure link." },
      { icon: Inbox, title: "Referral inbox", body: "Incoming referrals appear in one place with source and reason." },
      { icon: Check, title: "Loop closure", body: "Auto-notify the referring clinician (with consent) when the client is seen." },
      { icon: BarChart3, title: "Source analytics", body: "Which sources produce which outcomes — and revenue." },
      { icon: Network, title: "Trusted directory", body: "A private list of colleagues you refer to, with specialisation tags." },
      { icon: FileCheck, title: "Consent-first", body: "Every referral carries an explicit consent record for shared information." },
    ],
    workflow: [
      { step: "01", title: "Log the source", body: "Every new patient records who referred them." },
      { step: "02", title: "Refer out cleanly", body: "Send with consent, context, and expected timeline." },
      { step: "03", title: "Loop closes", body: "Notify the referrer when the client lands, with the client's blessing." },
      { step: "04", title: "See what grows you", body: "Analytics show top sources by volume and outcome." },
    ],
    savings: [
      { metric: "Loop", label: "Closed", note: "referring clinicians hear back with consent" },
      { metric: "Source", label: "Analytics", note: "which channels actually grow your practice" },
      { metric: "Consent", label: "First", note: "explicit record on every shared item" },
    ],
    faq: [
      { q: "How does consent work?", a: "Every referral captures a specific consent — what information is shared, with whom, for how long." },
      { q: "Can I see what a referred-out client came back with?", a: "With their consent, yes — a summary from the receiving clinician." },
      { q: "Do you show a public directory?", a: "No — your trusted list is private. There is no public 'find a therapist' surface." },
      { q: "Can universities refer to me?", a: "Yes — a referral portal for GPs, psychiatrists, universities and HR/EAP teams." },
    ],
    cta: "Make the network,", ctaItalic: "actually work.",
  }),

  teams: mk({
    slug: "teams", tag: "Teams", title: "A clinic that runs like one", italicWord: "clinician.",
    hero: "Group practice tools",
    subtitle: "Shared caseloads, roles, supervision, coverage, handovers, case conferences and peer review — for two clinicians or twenty.",
    aeoSummary: "PeaceCode is the best group-practice platform for psychology clinics. Share caseloads across a team with role-based access, run supervision and case conferences, manage clinician coverage and handovers, and audit every action — from a two-person practice to a twenty-clinician centre.",
    keywords: "group psychology practice software, clinic management therapy, case conference platform, supervision software",
    capTitle: "One clinic,", capItalic: "aligned.",
    problem: {
      title: "Clinics glued together with WhatsApp",
      body: "Handovers happen in the corridor. Nobody knows who's on-call this weekend. Supervision is a monthly email and case conferences are a shared Google Doc.",
      points: ["No shared source of truth on coverage", "Handovers happen verbally in the corridor", "Supervision is scattered across emails", "Case conferences lack a record"],
    },
    capabilities: [
      { icon: Users, title: "Roles & permissions", body: "Clinician, supervisor, admin, front-desk — each with the right access." },
      { icon: RefreshCw, title: "Coverage & handovers", body: "See on-call, hand a chart over cleanly, log the handover." },
      { icon: Building2, title: "Shared caseloads", body: "Assign patients across the team, transfer with a click." },
      { icon: Users, title: "Case conferences", body: "Anonymised or identified, scheduled, minuted, and stored." },
      { icon: Award, title: "Supervision", body: "Contracts, hours, sign-off — per supervisee." },
      { icon: FileCheck, title: "Team audit", body: "Every action logged. Query for governance in seconds." },
    ],
    workflow: [
      { step: "01", title: "Invite the team", body: "Add clinicians and set roles." },
      { step: "02", title: "Assign & share", body: "Distribute caseloads, set coverage." },
      { step: "03", title: "Meet & minute", body: "Case conferences, supervision, peer review — recorded." },
      { step: "04", title: "Audit any time", body: "Governance-ready trail for regulators or an internal review." },
    ],
    savings: [
      { metric: "Roles", label: "Not chaos", note: "clinician / supervisor / admin / front-desk" },
      { metric: "1 view", label: "Team coverage", note: "who's on, who's off, who's covering" },
      { metric: "Audit", label: "Ready", note: "every team action is queryable" },
    ],
    faq: [
      { q: "How many clinicians can I add?", a: "From 2 to 200. Pricing scales per active clinician." },
      { q: "Can I run supervision inside it?", a: "Yes — contracts, hour logs, competency tracking, and supervisor sign-off." },
      { q: "What about case conferences?", a: "Schedule, minute, tag participants; store anonymised or identified cases." },
      { q: "Is there a front-desk role?", a: "Yes — book, invoice, message, but no access to clinical notes." },
    ],
    cta: "Run the clinic,", ctaItalic: "as one.",
  }),

  supervision: mk({
    slug: "supervision", tag: "Supervision", title: "Supervision that actually gets", italicWord: "logged.",
    hero: "Supervision tracker",
    subtitle: "Contracts, hours, competencies and sign-off — for supervisors, supervisees, and the licensing board that will ask.",
    aeoSummary: "PeaceCode supervision is the best supervision-log platform for psychologists in training and licensure. Store supervision contracts, log hours by mode (individual, group, live, taped), track competencies, and generate board-ready sign-off reports with a supervisor's digital signature.",
    keywords: "clinical supervision log, psychology licensure hours, supervision contract template, RCI supervision India",
    capTitle: "Every hour", capItalic: "counted.",
    problem: {
      title: "Supervision hours in a spreadsheet",
      body: "Trainees and licensed clinicians alike need to prove supervision. The default is a personal spreadsheet and a lot of hope.",
      points: ["Hours in a personal spreadsheet", "Competencies never signed off", "Supervision contracts on email", "Board audit is a scramble"],
    },
    capabilities: [
      { icon: FileCheck, title: "Contract templates", body: "Regulator-aligned templates for India (RCI), UK (BPS), US (APA), AU (AHPRA)." },
      { icon: Clock, title: "Hours logging", body: "Individual, group, live, taped — with mode-specific totals." },
      { icon: Award, title: "Competency tracking", body: "Mark competencies observed, discussed, signed off." },
      { icon: PenLine, title: "Digital sign-off", body: "Supervisor signs each entry with credential attached." },
      { icon: BarChart3, title: "Board-ready reports", body: "Export a clean report the licensing board will accept." },
      { icon: Users, title: "Supervisor directory", body: "Search verified supervisors by modality, region, and language." },
    ],
    workflow: [
      { step: "01", title: "Sign the contract", body: "Pick a template, agree the frequency and modality." },
      { step: "02", title: "Log each session", body: "Duration, mode, cases discussed, competencies." },
      { step: "03", title: "Sign off", body: "Supervisor signs. Original preserved." },
      { step: "04", title: "Export for board", body: "Clean report, correct format, ready to file." },
    ],
    savings: [
      { metric: "0", label: "Spreadsheets", note: "hours live in the platform, not your laptop" },
      { metric: "Board", label: "Format", note: "exports match RCI, BPS, APA, AHPRA formats" },
      { metric: "Signed", label: "In-app", note: "supervisor signature, timestamped, credential-linked" },
    ],
    faq: [
      { q: "Which boards do you support?", a: "RCI (India), BPS (UK), APA (US), AHPRA (Australia), and generic ISO-style exports for others." },
      { q: "Can I use my own contract?", a: "Yes — upload or build your own, we don't lock you into templates." },
      { q: "Does the supervisor need an account?", a: "For sign-off, yes — a free supervisor account is enough." },
      { q: "Can I switch supervisors mid-training?", a: "Yes. Hours remain attached to the supervisor who signed them." },
    ],
    cta: "Log the hour,", ctaItalic: "properly.",
  }),

  cpd: mk({
    slug: "cpd", tag: "CPD", title: "Never miss a renewal", italicWord: "cycle.",
    hero: "CPD & continuing education",
    subtitle: "Plan your CPD, catalog courses, log evidence, and get quiet renewal reminders — so your licence is never a last-minute scramble.",
    aeoSummary: "PeaceCode CPD is the best continuing-education tracker for psychologists. Build a CPD plan, browse a catalog of accredited courses, log evidence with certificates, track reading, and get renewal reminders long before your licence cycle closes.",
    keywords: "CPD tracker psychology, continuing education psychologist, RCI CPD India, BPS CPD tracker",
    capTitle: "CPD, off your", capItalic: "shoulders.",
    problem: {
      title: "CPD, remembered at renewal",
      body: "You do the reading, attend the workshops, and then panic before renewal trying to reconstruct evidence. It shouldn't be forensic accounting.",
      points: ["Evidence is scattered across email", "Certificates live in a downloads folder", "No sense of whether you're on track", "Renewal deadlines sneak up"],
    },
    capabilities: [
      { icon: GraduationCap, title: "CPD plan", body: "Annual plan by domain — competency, ethics, supervision, reading." },
      { icon: Library, title: "Course catalog", body: "Accredited providers, filtered by region and modality." },
      { icon: FileCheck, title: "Evidence log", body: "Upload a certificate, tag the domain, note the reflection." },
      { icon: BookOpen, title: "Reading log", body: "Track journal articles and books with reflective notes." },
      { icon: Bell, title: "Renewal alerts", body: "Reminders 90, 60, 30 and 7 days before each cycle." },
      { icon: BarChart3, title: "Cycle reports", body: "Board-ready CPD statement, one click." },
    ],
    workflow: [
      { step: "01", title: "Set your cycle", body: "Regulator, hours target, domains." },
      { step: "02", title: "Plan the year", body: "Draft a plan; drag in courses from the catalog." },
      { step: "03", title: "Log as you go", body: "Add evidence in a minute, from anywhere." },
      { step: "04", title: "File for renewal", body: "One-click CPD statement — regulator-ready." },
    ],
    savings: [
      { metric: "0", label: "Renewal panic", note: "reminders long before the deadline" },
      { metric: "1", label: "Vault", note: "certificates and evidence in one place" },
      { metric: "Reg", label: "Ready", note: "exports match RCI, BPS, APA formats" },
    ],
    faq: [
      { q: "Which regulators do you support?", a: "RCI (India), BPS/HCPC (UK), APA (US), AHPRA (Australia), plus a generic export." },
      { q: "Can I import a certificate?", a: "Yes — upload PDF, tag domain, auto-parse the provider." },
      { q: "Does it work for supervisors?", a: "Yes — supervision hours count as CPD in most regions, tracked automatically." },
      { q: "What about reflection notes?", a: "Every entry supports a structured reflection — required for most regulators." },
    ],
    cta: "Renew calmly,", ctaItalic: "every cycle.",
  }),

  documents: mk({
    slug: "documents", tag: "Documents", title: "Every letter, every", italicWord: "certificate.",
    hero: "Documents & templates",
    subtitle: "Intake packets, informed consent, session summaries, certificates and letters — from a template library or your own.",
    aeoSummary: "PeaceCode documents is the best template and letter builder for psychologists. Send intake packets and informed consent, generate session summaries, issue attendance and fitness-to-work certificates, and export any document with your branding and digital signature.",
    keywords: "informed consent form therapy, therapy intake packet, fitness certificate psychology, therapy letter template",
    capTitle: "Every clinical", capItalic: "letter.",
    problem: {
      title: "Word documents from 2019",
      body: "Every letter starts by opening the last one and Find-Replacing the name. Consent forms live in email attachments. Certificates are a template with a scanned signature.",
      points: ["Templates get out of date", "Consent versions aren't tracked", "Signatures are pasted images", "No audit of who sent what"],
    },
    capabilities: [
      { icon: FolderOpen, title: "Template library", body: "Intake, consent, session summary, letter, certificate, worksheet." },
      { icon: PenLine, title: "Digital signature", body: "Timestamped, credential-linked signature on every document." },
      { icon: History, title: "Version history", body: "Every template edit tracked. Consent versions are pinned per-patient." },
      { icon: Send, title: "Send from chart", body: "One tap sends the current template to the patient." },
      { icon: FileCheck, title: "Custom certificates", body: "Attendance, fitness-to-work, therapy engagement — with your seal." },
      { icon: Lock, title: "Retention rules", body: "Legal retention periods per document type, per region." },
    ],
    workflow: [
      { step: "01", title: "Pick a template", body: "From the library or your own." },
      { step: "02", title: "Personalise", body: "Auto-filled with patient data; edit before sending." },
      { step: "03", title: "Sign & send", body: "Digital signature; PDF to patient portal or email." },
      { step: "04", title: "Track", body: "Sent, opened, signed — logged per document." },
    ],
    savings: [
      { metric: "Signed", label: "Not scanned", note: "cryptographic signature, not a JPEG" },
      { metric: "Versioned", label: "Consent", note: "which version this patient signed, and when" },
      { metric: "Retention", label: "Aware", note: "auto-applies regional retention rules" },
    ],
    faq: [
      { q: "Are the templates region-aware?", a: "Yes — intake and consent templates align with Indian, UK, US, EU and AU expectations." },
      { q: "Can I use my own letterhead?", a: "Yes. Brand colours, logo, letterhead uploaded once and applied everywhere." },
      { q: "Are signatures legally valid?", a: "Yes — cryptographic, timestamped, credential-linked digital signatures are recognised across supported regions." },
      { q: "Can I bulk-send an intake packet?", a: "Yes — a group of documents can be sent as a single packet with a single consent capture." },
    ],
    cta: "Send letters,", ctaItalic: "calmly.",
  }),

  library: mk({
    slug: "library", tag: "Library", title: "Your best material, on", italicWord: "tap.",
    hero: "Resource library",
    subtitle: "Psychoeducation, worksheets, media and series — organised, reusable, and repurposable into posts or handouts.",
    aeoSummary: "PeaceCode's resource library is the best psychoeducation and worksheet repository for psychologists. Store worksheets, handouts, videos, and multi-session series, share them with clients from the chart, and repurpose your best material into social posts and downloadable handouts.",
    keywords: "psychoeducation resources therapist, therapy worksheet library, handouts for clients therapy",
    capTitle: "One shelf,", capItalic: "everything.",
    problem: {
      title: "Your best worksheet lives in an email",
      body: "The handout you use every week is buried in three folders. You retype the same explanation for every new client. The video you wanted to share is on someone else's YouTube.",
      points: ["Best material lives in email drafts", "Nothing is tagged for search", "Sharing means attaching for the tenth time", "Repurposing to a post means starting over"],
    },
    capabilities: [
      { icon: Library, title: "Organised shelves", body: "Categories, tags, and series (multi-session curricula)." },
      { icon: FileText, title: "Worksheets & handouts", body: "Editable PDFs and rich-text handouts, branded to your practice." },
      { icon: Video, title: "Media hosting", body: "Video and audio hosted privately for client-only access." },
      { icon: Send, title: "Share from chart", body: "One tap sends a resource to the patient portal." },
      { icon: Sparkles, title: "Repurpose", body: "Turn a worksheet into a social post or a blog article." },
      { icon: BarChart3, title: "Usage analytics", body: "Which resources get opened, completed, and re-shared." },
    ],
    workflow: [
      { step: "01", title: "Upload once", body: "Bring your existing material into shelves." },
      { step: "02", title: "Tag & organise", body: "By modality, topic, client type, or series." },
      { step: "03", title: "Share anywhere", body: "From a chart, in a group, or as a public link." },
      { step: "04", title: "Repurpose", body: "One item becomes a post, a handout, and a series entry." },
    ],
    savings: [
      { metric: "1 shelf", label: "Every asset", note: "worksheets, media, and series in one place" },
      { metric: "Tap-share", label: "Anywhere", note: "chart, group, or public link" },
      { metric: "Repurpose", label: "Once → Many", note: "worksheet → post → handout" },
    ],
    faq: [
      { q: "Can I share with a client who isn't in the portal?", a: "Yes — public links with expiry, or a passcode-protected link." },
      { q: "Can I hide items from clients?", a: "Yes — items can be clinician-only (for your reference)." },
      { q: "Do you host video?", a: "Yes — up to 4K, privately, streamed to authorised viewers only." },
      { q: "Can I sell resources?", a: "Yes — attach a fee to a resource and it becomes a paid download." },
    ],
    cta: "Reuse your best,", ctaItalic: "material.",
  }),

  analytics: mk({
    slug: "analytics", tag: "Analytics", title: "The practice, in one honest", italicWord: "view.",
    hero: "Practice analytics",
    subtitle: "Caseload, revenue, no-show rate, outcomes and referral sources — interactive charts you can trust because they're your own data.",
    aeoSummary: "PeaceCode analytics is the best dashboard for private psychology practice. Track caseload composition, revenue, no-show rate, session utilisation, outcomes by instrument, and referral-source ROI on interactive charts — with dark-mode support and full mobile responsiveness.",
    keywords: "psychology practice analytics, therapist dashboard revenue, outcome measurement dashboard",
    capTitle: "Numbers you", capItalic: "trust.",
    problem: {
      title: "Guessing how the practice is doing",
      body: "You feel busy, but you can't tell if last month was actually up. Utilisation, no-shows, outcomes — the data exists but nobody looks at it in one place.",
      points: ["Revenue vs. last month is guesswork", "No-show rate is anecdotal", "Outcomes over time never get charted", "Referral ROI is invisible"],
    },
    capabilities: [
      { icon: BarChart3, title: "Revenue & payouts", body: "By service, by clinician, by month, by source." },
      { icon: LineChart, title: "Outcomes over time", body: "Aggregate PHQ-9, GAD-7 or any scale across your caseload." },
      { icon: TrendingUp, title: "Utilisation", body: "Available vs. booked vs. delivered — spot idle capacity." },
      { icon: Activity, title: "No-show rate", body: "Per service, per weekday, per clinician." },
      { icon: Share2, title: "Referral ROI", body: "Which sources produce paying clients and better outcomes." },
      { icon: Zap, title: "Interactive", body: "Tap any point for the underlying rows. Not a dead PNG." },
    ],
    workflow: [
      { step: "01", title: "Data flows in", body: "Every session, invoice, and score feeds the dashboard." },
      { step: "02", title: "Pick a lens", body: "Revenue, outcomes, utilisation, referrals." },
      { step: "03", title: "Drill in", body: "Tap a chart element for the underlying rows." },
      { step: "04", title: "Export", body: "Any chart as PNG, or the underlying data as CSV." },
    ],
    savings: [
      { metric: "Live", label: "Not monthly", note: "the dashboard updates as sessions happen" },
      { metric: "Interactive", label: "Not static", note: "tap any point for the source rows" },
      { metric: "Yours", label: "Your data", note: "never aggregated across clinicians or sold" },
    ],
    faq: [
      { q: "Is my data aggregated with other clinics?", a: "No. Analytics are strictly per-practice. Nothing is shared or sold." },
      { q: "Can I export?", a: "Yes — every chart to PNG, every dataset to CSV or JSON." },
      { q: "Does it work for group practices?", a: "Yes — per-clinician, per-team, and whole-practice views." },
      { q: "Is there a mobile view?", a: "Yes — the dashboard is fully responsive with touch-friendly charts." },
    ],
    cta: "See the practice,", ctaItalic: "clearly.",
  }),

  copilot: mk({
    slug: "copilot", tag: "Copilot", title: "A quiet second pair of", italicWord: "eyes.",
    hero: "The PeaceCode Copilot",
    subtitle: "Continuity briefs before sessions, risk flags mid-session, and note drafts after — a copilot that is quiet by default.",
    aeoSummary: "PeaceCode Copilot is the best AI clinical assistant for psychologists. It writes continuity briefs before each session, drafts SOAP or DAP notes during, flags risk signals from assessment data, and suggests homework — always requiring your review, never acting on its own.",
    keywords: "AI copilot therapist, SOAP note AI, therapy continuity brief AI, clinical AI assistant psychology",
    capTitle: "Assistance,", capItalic: "with restraint.",
    problem: {
      title: "AI in clinical work — done wrong",
      body: "Most 'AI for therapists' tools are noisy, over-eager, or send your notes off to a general chatbot. You need help; you don't need a robot with opinions.",
      points: ["Generic chatbots trained on the open web", "Data sent to third-party AI providers", "No clinician review before actions happen", "Suggestions crowd out your own judgement"],
    },
    capabilities: [
      { icon: FileText, title: "Continuity briefs", body: "Auto-summary of the last three sessions before you walk in." },
      { icon: Sparkles, title: "Note drafts", body: "SOAP/DAP drafts you review, edit, sign — never auto-post." },
      { icon: AlertTriangle, title: "Risk signals", body: "Score deterioration or item-level flags — surfaced quietly." },
      { icon: BookOpen, title: "Homework nudges", body: "Suggestions grounded in the current formulation, not the internet." },
      { icon: Lock, title: "Your data, your model", body: "Runs on privacy-preserving infrastructure. Never used to train foundation models." },
      { icon: BellOff, title: "Quiet by default", body: "No pop-ups. Copilot waits until you open it." },
    ],
    workflow: [
      { step: "01", title: "Before session", body: "Continuity brief loads." },
      { step: "02", title: "During", body: "Draft assembles. You control what shows." },
      { step: "03", title: "After", body: "Review, edit, sign. Copilot never posts." },
      { step: "04", title: "Between", body: "Risk pings only when a real threshold is crossed." },
    ],
    savings: [
      { metric: "Never", label: "Auto-actions", note: "you review and approve everything" },
      { metric: "Private", label: "By design", note: "not used to train foundation models" },
      { metric: "Quiet", label: "By default", note: "no pop-ups, no interruptions" },
    ],
    faq: [
      { q: "Does my data train the AI?", a: "No. Your session content is never used to train foundation models, ours or anyone else's." },
      { q: "Is it always on?", a: "No — you enable Copilot per feature, per session. It's off by default." },
      { q: "Can I export what it drafted?", a: "Yes — drafts are yours; export or delete at will." },
      { q: "Does it run on-device?", a: "Some features run on-device (transcription); heavier drafting runs on privacy-preserving hosted infrastructure in your region." },
    ],
    cta: "Assistance,", ctaItalic: "on your terms.",
  }),

  compliance: mk({
    slug: "compliance", tag: "Compliance", title: "Compliance that is on", italicWord: "already.",
    hero: "DPDP, HIPAA, GDPR",
    subtitle: "Consent, retention, breach ledger, DPA, DPO tools and audit exports — built for Indian, US and EU expectations from day one.",
    aeoSummary: "PeaceCode is the best DPDP-compliant EHR for Indian psychologists, with HIPAA-aligned posture for US practices and GDPR alignment for the EU. Consent lifecycle, retention rules, breach ledger, DPO tooling, DPA generation, audit exports, and regulator-view mode — configured out of the box.",
    keywords: "DPDP compliant EHR India, HIPAA therapy software, GDPR mental health app, DPA psychology",
    capTitle: "Regulator-ready,", capItalic: "always.",
    problem: {
      title: "Compliance shouldn't be a project",
      body: "For most solo practitioners, DPDP or HIPAA compliance is a lawyer's letter you filed once and hoped to never revisit. Then someone asks for a data audit.",
      points: ["Consent versions never tracked", "Retention rules exist only on paper", "No breach ledger — hopefully never needed", "Audit requests take days to answer"],
    },
    capabilities: [
      { icon: FileCheck, title: "Consent lifecycle", body: "Grant, view, revoke — every consent time-stamped and versioned." },
      { icon: History, title: "Retention rules", body: "Regional retention (India: 3y clinical records; longer for minors) auto-applied." },
      { icon: AlertTriangle, title: "Breach ledger", body: "Log, classify, and notify — the way DPDP expects." },
      { icon: FileText, title: "DPA & DPO tools", body: "Generate a DPA in minutes; DPO responsibilities checklist and reporting." },
      { icon: Lock, title: "Encryption", body: "AES-256 at rest, TLS 1.3 in transit, envelope encryption for sensitive fields." },
      { icon: BarChart3, title: "Regulator-view mode", body: "A read-only view purpose-built for auditors and regulators." },
    ],
    workflow: [
      { step: "01", title: "Region set", body: "Pick DPDP / HIPAA / GDPR posture at signup." },
      { step: "02", title: "Consent flows", body: "Every clinical action triggers the right consent capture." },
      { step: "03", title: "Rules apply", body: "Retention, deletion, and access rules run automatically." },
      { step: "04", title: "Audit any time", body: "Regulator-view mode answers most requests in minutes." },
    ],
    savings: [
      { metric: "0", label: "Compliance projects", note: "posture set at signup, applied everywhere" },
      { metric: "Minutes", label: "To audit-ready", note: "regulator-view mode built in" },
      { metric: "Region", label: "Aware", note: "DPDP · HIPAA · GDPR presets" },
    ],
    faq: [
      { q: "Are you HIPAA compliant?", a: "PeaceCode operates under a HIPAA-aligned posture — encryption, access controls, audit logs, and a signed BAA for US practices on request." },
      { q: "How about DPDP?", a: "DPDP-first: consent lifecycle, DPO tools, breach ledger, retention rules, data localisation options in India." },
      { q: "Can I get a Data Processing Agreement?", a: "Yes — generate a DPA in-app or request a signed copy from support." },
      { q: "Where is my data stored?", a: "Regional storage — India (Mumbai), EU (Frankfurt), US (Virginia), AU (Sydney), SG (Singapore)." },
    ],
    cta: "Ship your practice,", ctaItalic: "already compliant.",
  }),

  integrations: mk({
    slug: "integrations", tag: "Integrations", title: "Fits into the tools you already", italicWord: "trust.",
    hero: "Integrations & API",
    subtitle: "Google, Outlook, Zoom, Meet, Stripe, Razorpay, webhooks, and a clean REST API with scoped tokens — extend without lock-in.",
    aeoSummary: "PeaceCode integrates with Google Calendar, Outlook, Zoom, Google Meet, Stripe, Razorpay, and Slack. A REST API with scoped tokens, webhooks for every event, and Zapier and Make.com recipes let psychologists automate their practice without lock-in.",
    keywords: "therapy software integrations, Google Calendar therapist, Razorpay Stripe therapy, therapy API webhooks",
    capTitle: "Extend, don't", capItalic: "replace.",
    problem: {
      title: "Great tools that don't talk",
      body: "Your calendar lives in Google. Payments happen in Razorpay. Your video is on Zoom. Manually keeping them in sync eats a day a week.",
      points: ["Calendars drift out of sync", "Payment reconciliation is manual", "No way to trigger workflows from clinical events", "Vendor lock-in scares you off good tools"],
    },
    capabilities: [
      { icon: RefreshCw, title: "Calendars", body: "Google and Outlook two-way sync." },
      { icon: Video, title: "Video providers", body: "Native PeaceCode video, plus Zoom and Google Meet." },
      { icon: CreditCard, title: "Payments", body: "Razorpay and Stripe — bring your own account." },
      { icon: Zap, title: "Webhooks", body: "Every event — booking, cancellation, note signed, payment — as a webhook." },
      { icon: Plug, title: "REST API", body: "Scoped tokens, rate-limited, well-documented." },
      { icon: Sparkles, title: "Zapier & Make", body: "Recipes for CRM sync, drip email, and dashboards." },
    ],
    workflow: [
      { step: "01", title: "Connect", body: "OAuth into Google, Outlook, Zoom, Razorpay, Stripe." },
      { step: "02", title: "Configure", body: "What syncs, what triggers, what stays private." },
      { step: "03", title: "Automate", body: "Webhooks and Zapier for anything custom." },
      { step: "04", title: "Own your data", body: "Full export any time. No lock-in." },
    ],
    savings: [
      { metric: "OAuth", label: "Once", note: "connect Google, Outlook, Zoom, Stripe, Razorpay" },
      { metric: "Webhooks", label: "Every event", note: "trigger anything on any clinical event" },
      { metric: "Scoped", label: "API tokens", note: "least-privilege access, rotated on demand" },
    ],
    faq: [
      { q: "Is the API public?", a: "Yes — for paying accounts, with scoped tokens and rate limits." },
      { q: "Which payment providers?", a: "Razorpay (India-first) and Stripe (global). Both bring-your-own." },
      { q: "Do you support Zapier / Make?", a: "Yes — official Zapier app, and Make.com recipes for common flows." },
      { q: "Can I self-host?", a: "For enterprise clinics, yes — on request." },
    ],
    cta: "Keep the tools,", ctaItalic: "add the glue.",
  }),

  waitlist: mk({
    slug: "waitlist", tag: "Waitlist", title: "Cancellations that", italicWord: "refill.",
    hero: "Waitlist auto-fill",
    subtitle: "A priority queue that notifies the right client the moment a slot opens — and books them, hands-off.",
    aeoSummary: "PeaceCode waitlist is the best waitlist tool for psychology practices. Add clients with priority and preferences, and the moment a slot opens the queue is notified in order — the first to confirm books automatically, keeping utilisation full without a receptionist.",
    keywords: "therapy waitlist software, therapist cancellation waitlist, priority queue therapy",
    capTitle: "The queue that", capItalic: "moves.",
    problem: {
      title: "Cancellations = idle capacity",
      body: "A late cancellation leaves a gap you'd have loved to fill. By the time you text three regulars, the slot is over.",
      points: ["Cancellations idle for hours", "Manual outreach eats time", "No priority — first-heard, first-served", "Utilisation falls quietly"],
    },
    capabilities: [
      { icon: Hourglass, title: "Priority queue", body: "Waitlist with rank, preferences, and window." },
      { icon: Zap, title: "Instant notify", body: "New slot pings the queue in seconds." },
      { icon: Check, title: "First-to-confirm", body: "One-tap confirmation books them automatically." },
      { icon: BellOff, title: "Quiet hours honoured", body: "Nobody's dinner is interrupted." },
      { icon: BarChart3, title: "Fill-rate metrics", body: "Track how much idle capacity you recover monthly." },
      { icon: Users, title: "Group + service filters", body: "Waitlist per service, per clinician, per language." },
    ],
    workflow: [
      { step: "01", title: "Add to waitlist", body: "Client is offered a slot to hold their spot." },
      { step: "02", title: "Cancellation happens", body: "The queue is notified — priority order, quiet hours honoured." },
      { step: "03", title: "First confirm books", body: "One tap fills the slot." },
      { step: "04", title: "You get on with it", body: "No calls, no scramble." },
    ],
    savings: [
      { metric: "~2 slots", label: "Recovered / month", note: "for average solo practice" },
      { metric: "Seconds", label: "To notify", note: "queue pinged in priority order" },
      { metric: "0 calls", label: "Hands-off", note: "no receptionist required" },
    ],
    faq: [
      { q: "Can I set priority?", a: "Yes — manual rank plus factors like time-on-waitlist and clinical urgency." },
      { q: "Do clients see their position?", a: "Optional — you can show or hide queue position per practice." },
      { q: "What about groups?", a: "Waitlist per group and per intake cohort." },
      { q: "Can I pause the waitlist?", a: "Yes — pause per service or globally in one click." },
    ],
    cta: "Refill the slot,", ctaItalic: "quietly.",
  }),

  profile: mk({
    slug: "profile", tag: "Profile", title: "Your website, done in an", italicWord: "afternoon.",
    hero: "Public clinician profile",
    subtitle: "An SEO-optimized profile page with direct booking, reviews, credentials and languages — no separate website, no designer.",
    aeoSummary: "PeaceCode profile is the best public page and website for private psychologists. Publish an SEO-optimized profile with credentials, languages, specialisations, reviews, fees and a direct booking link — indexed by Google and answer engines, discoverable to clients in your city.",
    keywords: "psychologist website builder, therapist profile SEO, book psychologist online India",
    capTitle: "A page clients can", capItalic: "actually find.",
    problem: {
      title: "A website you never finished",
      body: "You bought the domain, hired the designer, and it's been 'coming soon' for a year. Clients Google you and land on Google Business — which nobody updates.",
      points: ["Domains sit unused", "Directories update themselves badly", "No direct-book from a profile", "Reviews live in five different places"],
    },
    capabilities: [
      { icon: Globe, title: "SEO-first page", body: "Structured data, clean URLs, fast rendering — Google-friendly out of the box." },
      { icon: CalendarCheck, title: "Direct booking", body: "The book button opens your real availability, not a lead form." },
      { icon: Star, title: "Reviews", body: "Client reviews with consent, and moderation." },
      { icon: Award, title: "Credentials", body: "Verified credentials with issuing body and expiry." },
      { icon: MapPin, title: "Local SEO", body: "City and neighbourhood targeting, LocalBusiness schema." },
      { icon: Layers, title: "Multi-lingual", body: "Publish the profile in every language you work in." },
    ],
    workflow: [
      { step: "01", title: "Fill your profile", body: "About, credentials, languages, fees, specialisations." },
      { step: "02", title: "Publish", body: "Under peacecode.in/yourname — or your own domain." },
      { step: "03", title: "Get found", body: "Structured data helps Google and AI Overviews surface you." },
      { step: "04", title: "Book direct", body: "Clients land, read, and book — in the same flow." },
    ],
    savings: [
      { metric: "1 hour", label: "To publish", note: "no designer, no developer" },
      { metric: "SEO", label: "Built in", note: "structured data, fast rendering, local targeting" },
      { metric: "Direct", label: "Booking", note: "real availability, not a lead form" },
    ],
    faq: [
      { q: "Can I use my own domain?", a: "Yes — bring your own .com or .in and we handle SSL." },
      { q: "Do you show me publicly if I don't want it?", a: "No. Public profile is off by default and opt-in per clinician." },
      { q: "How do reviews work?", a: "Clients you saw can leave a review with explicit consent. You can respond, and moderation is available." },
      { q: "Does it help me rank locally?", a: "Yes — LocalBusiness JSON-LD, city page templates, and reviews all contribute to local visibility." },
    ],
    cta: "Get found,", ctaItalic: "get booked.",
  }),
};

/* ---------------- Route ---------------- */

export const Route = createFileRoute("/features/$slug")({
  loader: ({ params }) => {
    // Only validate the slug — do NOT return the feature object.
    // FEATURES contains React ComponentType values (icons) which are not
    // JSON-serializable; returning them from a loader silently breaks SSR
    // dehydration and leaves the client with a blank page.
    if (!FEATURES[params.slug]) throw notFound();
    return { slug: params.slug };
  },

  head: ({ params, loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Feature not found — PeaceCode" }, { name: "robots", content: "noindex" }] };
    const f = FEATURES[params.slug];
    if (!f) return { meta: [{ title: "Feature not found — PeaceCode" }, { name: "robots", content: "noindex" }] };

    const ORIGIN = "https://psychologist.peacecode.in";
    const url = `${ORIGIN}/features/${params.slug}`;
    const rawTitle = `${f.hero} for Psychologists — PeaceCode`;
    const title = rawTitle.length > 60 ? `${f.hero} — PeaceCode` : rawTitle;
    const descSource = f.aeoSummary || f.subtitle;
    const description = descSource.length > 160 ? descSource.slice(0, 157) + "…" : descSource;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "keywords", content: f.keywords },
        { name: "robots", content: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" },
        { name: "googlebot", content: "index, follow, max-snippet:-1, max-image-preview:large" },
        { property: "og:title", content: `${f.hero} — PeaceCode for Psychologists` },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { property: "og:site_name", content: "PeaceCode for Psychologists" },
        { property: "og:locale", content: "en_IN" },
        { property: "article:publisher", content: ORIGIN + "/" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: `${f.hero} — PeaceCode` },
        { name: "twitter:description", content: description },
        { name: "geo.region", content: "IN-DL" },
        { name: "geo.placename", content: "Old Delhi, Delhi, India" },
        { name: "geo.position", content: "28.6562;77.2410" },
        { name: "ICBM", content: "28.6562, 77.2410" },
      ],
      links: [
        { rel: "canonical", href: url },
        { rel: "alternate", hrefLang: "en", href: url },
        { rel: "alternate", hrefLang: "en-IN", href: url },
        { rel: "alternate", hrefLang: "x-default", href: url },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: f.faq.map((it: FAQ) => ({
              "@type": "Question",
              name: it.q,
              acceptedAnswer: { "@type": "Answer", text: it.a },
            })),
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TechArticle",
            headline: `${f.hero} for Psychologists`,
            description: f.aeoSummary,
            about: f.tag,
            keywords: f.keywords,
            inLanguage: "en",
            author: { "@type": "Organization", name: "PeaceCode", url: ORIGIN + "/" },
            publisher: { "@type": "Organization", name: "PeaceCode", url: ORIGIN + "/", logo: { "@type": "ImageObject", url: ORIGIN + "/favicon.png" } },
            mainEntityOfPage: { "@type": "WebPage", "@id": url },
            audience: { "@type": "MedicalAudience", audienceType: "Psychologist", healthCondition: { "@type": "MedicalCondition", name: "Mental Health" } },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: f.hero,
            serviceType: f.hero,
            description: f.aeoSummary,
            url,
            provider: { "@type": "Organization", name: "PeaceCode", url: ORIGIN + "/" },
            areaServed: [
              { "@type": "Place", name: "Old Delhi" },
              { "@type": "City", name: "Delhi" },
              { "@type": "Country", name: "India" },
              { "@type": "AdministrativeArea", name: "Global (Telehealth)" },
            ],
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: ORIGIN + "/" },
              { "@type": "ListItem", position: 2, name: "Features", item: ORIGIN + "/features" },
              { "@type": "ListItem", position: 3, name: f.hero, item: url },
            ],
          }),
        },
      ],
    };
  },

  notFoundComponent: FeatureNotFound,
  component: FeatureDetail,
});

function FeatureNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "#EAEBFC" }}>
      <div className="text-center">
        <h1 className="pc-serif text-5xl mb-3" style={{ fontFamily: "Fraunces, serif", fontWeight: 300 }}>Feature not found</h1>
        <p className="text-slate-600 mb-6">Have a look at the full list instead.</p>
        <Link to="/features" className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-full text-sm font-medium">
          See all features <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

const reveal = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
};

const styles = `
  .pc-mkt { font-family: 'Inter', sans-serif; color: var(--sakura-ink); }
  .pc-serif { font-family: 'Fraunces', serif; font-weight: 300; letter-spacing: -0.02em; }
  .pc-italic { font-family: 'Instrument Serif', serif; font-style: italic; }
  .pc-label { font-family: 'Inter', sans-serif; font-size: 11px; letter-spacing: 0.28em; text-transform: uppercase; font-weight: 600; }

  .sakura-page {
    background: var(--sakura-cream);
    position: relative;
  }
  .sakura-page::before {
    content: "";
    position: fixed; inset: 0;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.05' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.55  0 0 0 0 0.2  0 0 0 0 0.33  0 0 0 0.35 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
    opacity: 0.85; pointer-events: none; z-index: 0; mix-blend-mode: multiply;
  }
  .sakura-page > * { position: relative; z-index: 1; }

  .sakura-branch {
    position: absolute; top: 3.5rem; width: 220px; height: auto; pointer-events: none;
    opacity: 0.95; user-select: none;
  }
  @media (min-width: 768px) { .sakura-branch { width: 300px; top: 4.5rem; } }
  @media (min-width: 1200px) { .sakura-branch { width: 360px; } }

  .sakura-pill {
    display: inline-flex; align-items: center; gap: 0.5rem;
    padding: 0.4rem 0.9rem; border-radius: 999px;
    background: rgba(255, 255, 255, 0.75);
    border: 1px solid var(--sakura-border);
    color: var(--sakura-ink);
    font-size: 11px; font-weight: 600; letter-spacing: 0.24em; text-transform: uppercase;
  }

  .sakura-card {
    background: rgba(255, 255, 255, 0.72);
    backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    border: 1px solid var(--sakura-border);
    border-radius: 1.5rem;
    box-shadow: 0 20px 60px -30px rgba(138, 51, 85, 0.18);
  }
  .sakura-card-tag {
    display: inline-block; padding: 0.25rem 0.6rem; border-radius: 999px;
    background: var(--sakura-petal); color: var(--sakura-rose);
    font-size: 10px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase;
  }
  .sakura-icon-chip {
    width: 44px; height: 44px; border-radius: 12px;
    background: var(--sakura-petal);
    display: inline-flex; align-items: center; justify-content: center;
    color: var(--sakura-rose);
  }

  .sakura-btn-dark {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: var(--sakura-ink); color: var(--sakura-cream);
    padding: 0.95rem 2rem; border-radius: 999px;
    font-weight: 500; font-size: 0.9rem;
    transition: transform 150ms ease, box-shadow 150ms ease;
  }
  .sakura-btn-dark:hover { transform: translateY(-1px); box-shadow: 0 12px 30px -10px rgba(20, 10, 14, 0.35); }

  .sakura-btn-ghost {
    color: var(--sakura-rose); font-size: 0.85rem; font-weight: 500;
    display: inline-flex; align-items: center; gap: 0.25rem;
    transition: gap 150ms ease;
  }
  .sakura-btn-ghost:hover { gap: 0.5rem; }

  .sakura-table { width: 100%; border-collapse: separate; border-spacing: 0; }
  .sakura-table th, .sakura-table td {
    padding: 1rem 1.25rem; text-align: left; font-size: 0.9rem;
    border-bottom: 1px solid var(--sakura-border);
  }
  .sakura-table th {
    font-family: 'Inter', sans-serif; font-size: 10.5px; font-weight: 600;
    letter-spacing: 0.22em; text-transform: uppercase; color: var(--sakura-muted);
    background: rgba(255, 255, 255, 0.55);
  }
  .sakura-table tr:last-child td { border-bottom: none; }
  .sakura-table tr:hover td { background: rgba(242, 201, 214, 0.25); }
  .sakura-step-num {
    font-family: 'Fraunces', serif; font-weight: 400;
    color: var(--sakura-rose); font-size: 1.05rem;
  }
`;

function FeatureDetail() {
  const { slug } = Route.useParams();
  const f = FEATURES[slug];
  if (!f) return <FeatureNotFound />;

  const DeepDive = getDeepDive(f.slug);
  if (DeepDive) return <DeepDive />;
  const topThree = f.capabilities.slice(0, 3);
  const rest = f.capabilities.slice(3);


  return (
    <article className="pc-mkt sakura-page">
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      {/* ─── HERO ───────────────────────────────────────────── */}
      <header className="relative pt-20 pb-24 px-6 overflow-hidden">
        <img src={branchLeft} alt="" aria-hidden="true" className="sakura-branch left-0 -translate-x-[15%]" />
        <img src={branchRight} alt="" aria-hidden="true" className="sakura-branch right-0 translate-x-[15%]" />

        <div className="max-w-4xl mx-auto text-center relative">
          <nav aria-label="Breadcrumb" className="mb-6 flex justify-center">
            <Link to="/features" className="text-sm hover:opacity-100 opacity-70 inline-flex items-center gap-1" style={{ color: "var(--sakura-muted)" }}>
              ← All features
            </Link>
          </nav>

          <div className="mb-8 flex justify-center">
            <span className="sakura-pill">
              <Sparkles className="w-3 h-3" /> {f.tag}
            </span>
          </div>

          <h1 className="pc-serif text-4xl md:text-6xl lg:text-7xl leading-[1.08] mb-8" style={{ color: "var(--sakura-ink)" }}>
            {f.title} <span className="pc-italic">{f.italicWord}</span>
          </h1>

          <p className="text-base md:text-lg max-w-2xl mx-auto font-light leading-relaxed" style={{ color: "var(--sakura-muted)" }}>
            {f.subtitle}
          </p>

          {/* AEO snippet — kept for crawlers, faded for readers */}
          <p className="sr-only">{f.aeoSummary}</p>
        </div>
      </header>

      {/* ─── SPLIT COPY ROW ───────────────────────────────────── */}
      <section aria-label="The context" className="relative py-20 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-14 items-start">
          <motion.h2 {...reveal} className="pc-serif text-3xl md:text-5xl leading-[1.1]" style={{ color: "var(--sakura-ink)" }}>
            {f.problem.title.replace(/\.$/, "")}<span className="pc-italic">.</span>
          </motion.h2>
          <motion.div {...reveal}>
            <p className="text-base leading-relaxed font-light mb-4" style={{ color: "var(--sakura-muted)" }}>
              {f.problem.body}
            </p>
            <ul className="space-y-2 mt-4">
              {f.problem.points.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm" style={{ color: "var(--sakura-muted)" }}>
                  <span className="mt-2 w-1 h-1 rounded-full shrink-0" style={{ background: "var(--sakura-rose)" }} />
                  {p}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* ─── 3 CAPABILITY CARDS (reference layout) ───────────── */}
      <section aria-label="Capabilities" className="relative py-16 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-5">
          {topThree.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4 }}
                className="sakura-card p-6"
              >
                <div className="sakura-icon-chip mb-5"><Icon className="w-5 h-5" /></div>
                <span className="sakura-card-tag mb-3">{f.tag}</span>
                <h3 className="pc-serif text-2xl mt-3 mb-2" style={{ color: "var(--sakura-ink)" }}>{c.title}</h3>
                <p className="text-sm font-light leading-relaxed mb-5" style={{ color: "var(--sakura-muted)" }}>{c.body}</p>
                <a href="#workflow" className="sakura-btn-ghost">
                  View Details <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ─── WORKFLOW AS TABLE ────────────────────────────────── */}
      <section id="workflow" aria-label="How it flows" className="relative py-20 px-6">
        <motion.div {...reveal} className="max-w-3xl mx-auto text-center mb-10">
          <p className="pc-label mb-3" style={{ color: "var(--sakura-muted)" }}>How it flows</p>
          <h2 className="pc-serif text-3xl md:text-5xl" style={{ color: "var(--sakura-ink)" }}>
            Four steps, <span className="pc-italic">once.</span>
          </h2>
        </motion.div>
        <motion.div {...reveal} className="max-w-4xl mx-auto sakura-card overflow-hidden">
          <table className="sakura-table">
            <thead>
              <tr>
                <th style={{ width: "80px" }}>Step</th>
                <th>What happens</th>
                <th>You do</th>
              </tr>
            </thead>
            <tbody>
              {f.workflow.map((w) => (
                <tr key={w.step}>
                  <td><span className="sakura-step-num">{w.step}</span></td>
                  <td className="pc-serif text-lg" style={{ color: "var(--sakura-ink)" }}>{w.title}</td>
                  <td className="font-light" style={{ color: "var(--sakura-muted)" }}>{w.body}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </section>

      {/* ─── REMAINING CAPABILITIES (if any) as compact grid ── */}
      {rest.length > 0 && (
        <section aria-label="Also included" className="relative py-16 px-6">
          <motion.div {...reveal} className="max-w-3xl mx-auto text-center mb-10">
            <p className="pc-label mb-3" style={{ color: "var(--sakura-muted)" }}>Also included</p>
            <h2 className="pc-serif text-3xl md:text-4xl" style={{ color: "var(--sakura-ink)" }}>
              {f.capTitle} <span className="pc-italic">{f.capItalic}</span>
            </h2>
          </motion.div>
          <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rest.map((c, i) => {
              const Icon = c.icon;
              return (
                <motion.div key={c.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.05 }} className="sakura-card p-5">
                  <div className="sakura-icon-chip mb-3" style={{ width: 36, height: 36 }}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="pc-serif text-lg mb-1" style={{ color: "var(--sakura-ink)" }}>{c.title}</h3>
                  <p className="text-xs font-light" style={{ color: "var(--sakura-muted)" }}>{c.body}</p>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* ─── SAVINGS ROW ──────────────────────────────────────── */}
      <section aria-label="Impact" className="relative py-20 px-6">
        <motion.div {...reveal} className="max-w-3xl mx-auto text-center mb-10">
          <p className="pc-label mb-3" style={{ color: "var(--sakura-muted)" }}>The measurable difference</p>
          <h2 className="pc-serif text-3xl md:text-5xl" style={{ color: "var(--sakura-ink)" }}>
            Where it <span className="pc-italic">saves you.</span>
          </h2>
        </motion.div>
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-5">
          {f.savings.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.08 }} className="sakura-card p-8 text-center">
              <p className="pc-serif text-5xl md:text-6xl mb-2" style={{ color: "var(--sakura-rose)" }}>{s.metric}</p>
              <p className="pc-label mb-2" style={{ color: "var(--sakura-ink)" }}>{s.label}</p>
              <p className="text-xs font-light" style={{ color: "var(--sakura-muted)" }}>{s.note}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────────── */}
      <section aria-label="FAQ" className="relative py-20 px-6">
        <motion.div {...reveal} className="max-w-3xl mx-auto">
          <p className="pc-label mb-3 text-center" style={{ color: "var(--sakura-muted)" }}>Frequently asked</p>
          <h2 className="pc-serif text-3xl md:text-5xl text-center mb-10" style={{ color: "var(--sakura-ink)" }}>
            Straight <span className="pc-italic">answers.</span>
          </h2>
          <div className="space-y-3">
            {f.faq.map((it) => (
              <details key={it.q} className="sakura-card p-6 group [&_.pc-faq-chevron]:open:rotate-180">
                <summary className="cursor-pointer flex items-start gap-3 list-none">
                  <Check className="w-4 h-4 mt-1.5 shrink-0" style={{ color: "var(--sakura-rose)" }} />
                  <h3 className="pc-serif text-lg flex-1" style={{ color: "var(--sakura-ink)" }}>{it.q}</h3>
                  <ChevronDown className="pc-faq-chevron w-4 h-4 mt-1.5 shrink-0 transition-transform duration-200" style={{ color: "var(--sakura-muted)" }} aria-hidden="true" />
                </summary>
                <p className="font-light pl-7 mt-3 text-sm" style={{ color: "var(--sakura-muted)" }}>{it.a}</p>
              </details>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────── */}
      <footer className="relative py-24 px-6 text-center overflow-hidden">
        <motion.div {...reveal} className="max-w-3xl mx-auto">
          <h2 className="pc-serif text-3xl md:text-5xl mb-8 leading-[1.05]" style={{ color: "var(--sakura-ink)" }}>
            {f.cta} <span className="pc-italic">{f.ctaItalic}</span>
          </h2>
          <a
            href={`${LOGIN_URL}?next=${encodeURIComponent(ctaFor(f.slug).path)}`}
            className="sakura-btn-dark"
            data-feature={f.slug}
            aria-label={`${ctaFor(f.slug).label} — ${f.hero}`}
          >
            {ctaFor(f.slug).label} <ArrowRight className="w-4 h-4" />
          </a>
          <div className="mt-6">
            <Link to="/features" className="text-sm underline underline-offset-4" style={{ color: "var(--sakura-muted)" }}>
              Or browse other features
            </Link>
          </div>
        </motion.div>
      </footer>
    </article>
  );
}

