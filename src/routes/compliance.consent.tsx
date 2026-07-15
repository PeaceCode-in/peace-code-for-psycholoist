import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/practice/StubPage";

export const Route = createFileRoute("/compliance/consent")({
  head: () => ({
    meta: [
      { title: "Consent & DPDP — PeaceCode · Practice" },
      { name: "description", content: "DPDP-aligned consent records and data handling policies." },
    ],
  }),
  component: () => <StubPage title="Consent & DPDP" crumb="Consent" blurb="DPDP-aligned consent records and data handling policies." />,
});
