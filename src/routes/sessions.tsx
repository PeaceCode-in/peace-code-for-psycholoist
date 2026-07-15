import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/practice/StubPage";
export const Route = createFileRoute("/sessions")({
  head: () => ({ meta: [{ title: "Sessions — PeaceCode · Practice" }] }),
  component: () => <StubPage title="Sessions" blurb="Session log with join links, no-show tracking, and post-session summaries — landing next." />,
});
