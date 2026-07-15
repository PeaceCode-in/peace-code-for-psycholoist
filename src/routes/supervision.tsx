import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/practice/StubPage";

export const Route = createFileRoute("/supervision")({
  head: () => ({
    meta: [
      { title: "Supervision — PeaceCode · Practice" },
      { name: "description", content: "Book supervisor time and log supervision hours." },
    ],
  }),
  component: () => <StubPage title="Supervision" crumb="Supervision" blurb="Book supervisor time and log supervision hours." />,
});
