import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/practice/StubPage";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "Content library — PeaceCode · Practice" },
      { name: "description", content: "Resources — handouts, worksheets, audio — you can share with patients." },
    ],
  }),
  component: () => <StubPage title="Content library" crumb="Content library" blurb="Resources — handouts, worksheets, audio — you can share with patients." />,
});
