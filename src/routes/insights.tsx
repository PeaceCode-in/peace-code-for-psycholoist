import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/practice/StubPage";
export const Route = createFileRoute("/insights")({
  head: () => ({ meta: [{ title: "Insights — PeaceCode · Practice" }] }),
  component: () => <StubPage title="Insights" blurb="Practice analytics — outcome tracking, retention, revenue mix, and workload trends — landing next." />,
});
