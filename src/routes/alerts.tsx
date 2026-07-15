import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/practice/StubPage";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Alerts — PeaceCode · Practice" },
      { name: "description", content: "Risk flags, missed sessions, and assessment triggers needing your attention." },
    ],
  }),
  component: () => <StubPage title="Alerts" crumb="Alerts" blurb="Risk flags, missed sessions, and assessment triggers needing your attention." />,
});
