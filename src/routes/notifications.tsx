import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/practice/StubPage";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — PeaceCode · Practice" },
      { name: "description", content: "All alerts, mentions, and system messages." },
    ],
  }),
  component: () => <StubPage title="Notifications" crumb="Notifications" blurb="All alerts, mentions, and system messages." />,
});
