import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/practice/StubPage";
export const Route = createFileRoute("/resources")({
  head: () => ({ meta: [{ title: "Resources — PeaceCode · Practice" }] }),
  component: () => <StubPage title="Resources" blurb="Library of worksheets, handouts, and homework you can share with patients in a click — landing next." />,
});
