import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/practice/StubPage";

export const Route = createFileRoute("/waitlist")({
  head: () => ({
    meta: [
      { title: "Waitlist — PeaceCode · Practice" },
      { name: "description", content: "Prospective patients waiting for a slot, sorted by urgency and preference." },
    ],
  }),
  component: () => <StubPage title="Waitlist" crumb="Waitlist" blurb="Prospective patients waiting for a slot, sorted by urgency and preference." />,
});
