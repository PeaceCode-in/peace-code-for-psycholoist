import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/practice/StubPage";

export const Route = createFileRoute("/documents")({
  head: () => ({
    meta: [
      { title: "Documents & consents — PeaceCode · Practice" },
      { name: "description", content: "Signed intake forms, informed consents, and clinical documents." },
    ],
  }),
  component: () => <StubPage title="Documents & consents" crumb="Documents" blurb="Signed intake forms, informed consents, and clinical documents." />,
});
