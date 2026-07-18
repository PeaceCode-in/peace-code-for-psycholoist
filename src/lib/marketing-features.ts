// Single source of truth for the marketing feature catalogue.
// Imported by /for-psychologists (schema, catalogue) AND /sitemap.xml so
// adding a feature here automatically publishes a new sitemap entry.

export interface MarketingFeature {
  slug: string;
  name: string;
  desc: string;
}

export const MARKETING_FEATURES: MarketingFeature[] = [
  { slug: "scheduling", name: "Smart Scheduling for Therapists", desc: "Booking, buffers, waitlist auto-fill and no-show automations for psychology practices." },
  { slug: "notes", name: "Clinical Notes with AI Copilot", desc: "SOAP, DAP and progress notes with an optional, quiet AI copilot that never posts without review." },
  { slug: "assessments", name: "Standardized Psychological Assessments", desc: "40+ instruments including PHQ-9, GAD-7, PCL-5, WHO-5, DASS-21 with auto-scoring." },
  { slug: "telehealth", name: "HIPAA-Aligned Telehealth Video", desc: "In-app secure video sessions for online therapy — no downloads, no third-party apps." },
  { slug: "billing", name: "Practice Billing & GST Invoicing", desc: "GST-ready invoicing, UPI + card, Stripe & Razorpay, insurance claims." },
  { slug: "messages", name: "Secure Client Messaging", desc: "Auditable, encrypted messaging between clinician and client between sessions." },
  { slug: "homework", name: "CBT/DBT/ACT Homework Library", desc: "Between-session exercises with compliance tracking and outcome logging." },
  { slug: "groups", name: "Group, Couples & Family Therapy", desc: "Group cohorts, couples pairing and family workflows with per-member notes." },
  { slug: "patients", name: "Patient (Client) Records", desc: "Consolidated client charts, intake, consent, timeline and outcomes." },
  { slug: "safety", name: "Stanley-Brown Safety Planning", desc: "Evidence-based safety plans for suicidality risk with rapid distribution to the client." },
  { slug: "referrals", name: "Referral Management", desc: "In-network and out-of-network referrals with warm-handoff notes." },
  { slug: "team", name: "Multi-Clinician Team Workspace", desc: "Shared clinic workspace with roles, permissions and cross-clinician coverage." },
  { slug: "supervision", name: "Clinical Supervision", desc: "Supervision contracts, logged hours, session recordings and sign-off." },
  { slug: "cpd", name: "CPD & Licensure Tracker", desc: "Continuing-professional-development hours with renewal alerts by jurisdiction." },
  { slug: "documents", name: "Consent & Document Vault", desc: "Encrypted intake forms, consent, ROI and evidence uploads." },
  { slug: "library", name: "Psychoeducation Library", desc: "Curated worksheets, handouts and psychoeducation to send to clients." },
  { slug: "analytics", name: "Interactive Practice Analytics", desc: "Outcome, retention and revenue analytics for psychology practices." },
  { slug: "copilot", name: "PeaceCode Clinical Copilot", desc: "Optional AI drafting for notes, continuity briefs and treatment-plan updates." },
  { slug: "compliance", name: "DPDP, HIPAA & GDPR Compliance", desc: "Consent lifecycle, retention rules, breach ledger and DPO tooling out of the box." },
  { slug: "integrations", name: "Integrations", desc: "Google Calendar, Outlook, Zoom, Google Meet, Stripe, Razorpay and more." },
  { slug: "waitlist", name: "Intelligent Waitlist", desc: "Auto-fills cancellations from a prioritised waitlist to maximise utilisation." },
  { slug: "profile", name: "Public Clinician Profile", desc: "SEO-friendly public profile with a direct booking link for online and in-person sessions." },
];

// Marketing-only routes (public, indexable). App/dashboard routes are excluded —
// they sit behind auth and must not appear in the public sitemap.
export const MARKETING_STATIC_ROUTES: Array<{
  path: string;
  priority: string;
  changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
}> = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/for-psychologists", priority: "1.0", changefreq: "weekly" },
  { path: "/features", priority: "0.9", changefreq: "weekly" },
  { path: "/company/story", priority: "0.6", changefreq: "monthly" },
  { path: "/company/updates", priority: "0.7", changefreq: "weekly" },
  { path: "/company/faq", priority: "0.6", changefreq: "monthly" },
  { path: "/company/contact", priority: "0.6", changefreq: "monthly" },
];
