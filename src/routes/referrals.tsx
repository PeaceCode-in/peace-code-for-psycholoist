import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/practice/StubPage";

export const Route = createFileRoute("/referrals")({
  head: () => ({
    meta: [
      { title: "Referrals — PeaceCode · Practice" },
      { name: "description", content: "Incoming and outgoing referrals with source, reason, and status." },
    ],
  }),
  component: () => <StubPage title="Referrals" crumb="Referrals" blurb="Incoming and outgoing referrals with source, reason, and status." />,
});
