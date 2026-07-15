import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/practice/StubPage";

export const Route = createFileRoute("/templates")({
  head: () => ({
    meta: [
      { title: "Templates — PeaceCode · Practice" },
      { name: "description", content: "Note templates, letter templates, and reusable homework packs." },
    ],
  }),
  component: () => <StubPage title="Templates" crumb="Templates" blurb="Note templates, letter templates, and reusable homework packs." />,
});
