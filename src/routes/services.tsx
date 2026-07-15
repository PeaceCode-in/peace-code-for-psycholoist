import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/practice/StubPage";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services & pricing — PeaceCode · Practice" },
      { name: "description", content: "Session types, durations, modalities, and fees." },
    ],
  }),
  component: () => <StubPage title="Services & pricing" crumb="Services" blurb="Session types, durations, modalities, and fees." />,
});
