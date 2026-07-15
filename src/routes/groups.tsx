import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/practice/StubPage";

export const Route = createFileRoute("/groups")({
  head: () => ({
    meta: [
      { title: "Groups — PeaceCode · Practice" },
      { name: "description", content: "Run and manage group therapy cohorts with shared notes and homework." },
    ],
  }),
  component: () => <StubPage title="Groups" crumb="Groups" blurb="Run and manage group therapy cohorts with shared notes and homework." />,
});
