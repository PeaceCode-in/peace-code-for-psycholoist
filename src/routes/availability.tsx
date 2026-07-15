import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/practice/StubPage";

export const Route = createFileRoute("/availability")({
  head: () => ({
    meta: [
      { title: "Availability — PeaceCode · Practice" },
      { name: "description", content: "Weekly slots, blocked time, and buffer rules for booking." },
    ],
  }),
  component: () => <StubPage title="Availability" crumb="Availability" blurb="Weekly slots, blocked time, and buffer rules for booking." />,
});
