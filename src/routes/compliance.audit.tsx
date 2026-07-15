import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/practice/StubPage";

export const Route = createFileRoute("/compliance/audit")({
  head: () => ({
    meta: [
      { title: "Audit log — PeaceCode · Practice" },
      { name: "description", content: "Every access, edit, and export — timestamped and immutable." },
    ],
  }),
  component: () => <StubPage title="Audit log" crumb="Audit log" blurb="Every access, edit, and export — timestamped and immutable." />,
});
