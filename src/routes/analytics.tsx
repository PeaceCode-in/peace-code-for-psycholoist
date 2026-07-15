import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/practice/StubPage";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — PeaceCode · Practice" },
      { name: "description", content: "Outcomes, retention, no-show rate, and revenue over time." },
    ],
  }),
  component: () => <StubPage title="Analytics" crumb="Analytics" blurb="Outcomes, retention, no-show rate, and revenue over time." />,
});
