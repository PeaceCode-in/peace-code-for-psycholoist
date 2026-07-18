import { createFileRoute } from "@tanstack/react-router";
import { CompanyPage } from "@/components/marketing/CompanyPage";

export const Route = createFileRoute("/company/faq")({
  head: () => ({
    meta: [
      { title: "FAQs — PeaceCode for Psychologists" },
      { name: "description", content: "Answers to the questions psychologists ask before switching to PeaceCode: pricing, security, migration, and clinical workflows." },
      { property: "og:title", content: "FAQs — PeaceCode" },
      { property: "og:description", content: "Everything psychologists ask before switching." },
    ],
  }),
  component: () => (
    <CompanyPage
      tag="FAQs"
      title="Everything you"
      italic="wanted to ask."
      subtitle="Straight answers, no marketing. If your question isn't here, our team replies within one working day."
      sections={[
        { eyebrow: "Security", heading: "Where is my client data stored?",
          body: "Encrypted at rest and in transit, hosted in Mumbai (ap-south-1). We are DPDP-aligned and follow HIPAA-grade practices. You can export or delete any client's full record at any time." },
        { eyebrow: "Pricing", heading: "What does PeaceCode cost?",
          body: "One flat monthly subscription per practitioner. No per-note fees, no per-client fees, no upsells for basic features like scheduling or notes. Group practice pricing is transparent and volume-based." },
        { eyebrow: "Migration", heading: "Can I bring my existing records?",
          body: "Yes. Import from CSV, PDF, or your existing EHR. Our onboarding team handles the mapping — most solo practitioners are fully migrated within a week." },
        { eyebrow: "Clinical", heading: "Does the AI copilot replace my clinical judgement?",
          body: "No. The copilot drafts structure — SOAP/DAP/progress note skeletons — from what you say aloud. You always review, edit, and sign. Nothing is auto-submitted, and nothing leaves your account without your action." },
        { eyebrow: "Compliance", heading: "Are you RCI / ISCP compliant?",
          body: "PeaceCode's supervision, CPD, and record-keeping modules are built against RCI and ISCP guidelines. We publish our compliance matrix openly — ask for it and we'll send it over." },
      ]}
      ctaLabel="Start a trial"
    />
  ),
});
