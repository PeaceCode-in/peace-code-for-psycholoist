import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/practice/StubPage";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "Research & studies — PeaceCode · Practice" },
      { name: "description", content: "Participate in and contribute to clinical studies." },
    ],
  }),
  component: () => <StubPage title="Research & studies" crumb="Research" blurb="Participate in and contribute to clinical studies." />,
});
