import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/practice/StubPage";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Reviews & feedback — PeaceCode · Practice" },
      { name: "description", content: "Patient ratings and structured post-session feedback." },
    ],
  }),
  component: () => <StubPage title="Reviews & feedback" crumb="Reviews" blurb="Patient ratings and structured post-session feedback." />,
});
