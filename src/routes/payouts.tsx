import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/practice/StubPage";

export const Route = createFileRoute("/payouts")({
  head: () => ({
    meta: [
      { title: "Payouts — PeaceCode · Practice" },
      { name: "description", content: "Settlement history and next payout." },
    ],
  }),
  component: () => <StubPage title="Payouts" crumb="Payouts" blurb="Settlement history and next payout." />,
});
