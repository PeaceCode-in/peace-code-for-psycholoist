import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/practice/StubPage";

export const Route = createFileRoute("/prescriptions")({
  head: () => ({
    meta: [
      { title: "Prescriptions & referrals — PeaceCode · Practice" },
      { name: "description", content: "Psychiatrist-only prescriptions and outgoing medical referrals." },
    ],
  }),
  component: () => <StubPage title="Prescriptions & referrals" crumb="Prescriptions" blurb="Psychiatrist-only prescriptions and outgoing medical referrals." />,
});
