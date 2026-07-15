import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/practice/StubPage";

export const Route = createFileRoute("/risk")({
  head: () => ({
    meta: [
      { title: "Risk & safety plans — PeaceCode · Practice" },
      { name: "description", content: "Structured safety plans, means restriction, and escalation protocols." },
    ],
  }),
  component: () => <StubPage title="Risk & safety plans" crumb="Risk" blurb="Structured safety plans, means restriction, and escalation protocols." />,
});
