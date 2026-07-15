import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/practice/StubPage";

export const Route = createFileRoute("/compliance/export")({
  head: () => ({
    meta: [
      { title: "Data export — PeaceCode · Practice" },
      { name: "description", content: "Export patient records or your own practice data on request." },
    ],
  }),
  component: () => <StubPage title="Data export" crumb="Export" blurb="Export patient records or your own practice data on request." />,
});
