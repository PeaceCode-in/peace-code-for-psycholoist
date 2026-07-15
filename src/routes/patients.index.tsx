import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/practice/StubPage";
export const Route = createFileRoute("/patients/")({
  head: () => ({ meta: [{ title: "Patients — PeaceCode · Practice" }] }),
  component: () => <StubPage title="Patients" blurb="Roster with tags, risk flags, intake status, and clinical timeline — landing next." />,
});
