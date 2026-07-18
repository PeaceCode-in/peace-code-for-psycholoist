import { createFileRoute } from "@tanstack/react-router";
import { CompanyPage } from "@/components/marketing/CompanyPage";

export const Route = createFileRoute("/company/contact")({
  head: () => ({
    meta: [
      { title: "Contact — PeaceCode for Psychologists" },
      { name: "description", content: "Talk to a human at PeaceCode. Sales, support, clinical questions, or partnerships — we reply within one working day." },
      { property: "og:title", content: "Contact — PeaceCode" },
      { property: "og:description", content: "Talk to a human. We reply within one working day." },
    ],
  }),
  component: () => (
    <CompanyPage
      tag="Contact"
      title="Talk to a"
      italic="human."
      subtitle="Real people, based in Old Delhi. We reply within one working day — usually faster."
      sections={[
        { eyebrow: "Sales & demos", heading: "hello@peacecode.in",
          body: "Book a 20-minute walkthrough tailored to your practice — solo, group, or institution. We'll show you exactly the modules you'd use." },
        { eyebrow: "Support", heading: "support@peacecode.in",
          body: "Existing customers: reach the same team that built the product. Median first response time is under 2 hours during business days." },
        { eyebrow: "Clinical partnerships", heading: "clinical@peacecode.in",
          body: "For universities, hospitals, and NGO mental-health programmes exploring PeaceCode at scale. Our clinical lead responds personally." },
        { eyebrow: "Office", heading: "Old Delhi, 110006 · India",
          body: "By appointment only. We're a small team and prefer video calls, but we love hosting clinicians when they're in town." },
      ]}
      ctaLabel="Email hello@peacecode.in"
    />
  ),
});
