import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/practice/StubPage";
export const Route = createFileRoute("/notes")({
  head: () => ({ meta: [{ title: "Notes — PeaceCode · Practice" }] }),
  component: () => <StubPage title="Clinical notes" blurb="SOAP / DAP templates, dictation, session-linked notes with audit trail — landing next." />,
});
