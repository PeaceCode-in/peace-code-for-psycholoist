import { createFileRoute } from "@tanstack/react-router";
import { CompanyPage } from "@/components/marketing/CompanyPage";

export const Route = createFileRoute("/company/updates")({
  head: () => ({
    meta: [
      { title: "Product updates — PeaceCode" },
      { name: "description", content: "New features, refinements, and clinical improvements shipped by the PeaceCode team." },
      { property: "og:title", content: "Product updates — PeaceCode" },
      { property: "og:description", content: "What's new in PeaceCode this month." },
    ],
  }),
  component: () => (
    <CompanyPage
      tag="Product updates"
      title="What we shipped"
      italic="this month."
      subtitle="A calm, honest changelog. No emojis, no confetti — just the work."
      sections={[
        { eyebrow: "November 2026", heading: "In-session copilot, v2.",
          body: "Faster transcription, better SOAP/DAP formatting, and a per-session opt-in toggle. Audio is discarded the moment the note is drafted — recordings are never stored unless you explicitly ask." },
        { eyebrow: "October 2026", heading: "Group therapy attendance & billing.",
          body: "Track attendance across group sessions with one tap, split invoices automatically across attendees, and export a single reconciled statement for the group." },
        { eyebrow: "September 2026", heading: "DPDP-ready consent flows.",
          body: "New consent templates aligned to India's Digital Personal Data Protection Act 2023, with signed audit trails and a client-facing consent portal." },
        { eyebrow: "August 2026", heading: "Supervision & CPD logs.",
          body: "Log supervision hours and CPD credits against the ISCP/RCI frameworks. Export a compliant PDF portfolio for renewals in one click." },
      ]}
      ctaLabel="See the workspace"
    />
  ),
});
