import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/practice/StubPage";

export const Route = createFileRoute("/case-conferences")({
  head: () => ({
    meta: [
      { title: "Case conferences — PeaceCode · Practice" },
      { name: "description", content: "Multidisciplinary case reviews with consent-scoped sharing." },
    ],
  }),
  component: () => <StubPage title="Case conferences" crumb="Case conferences" blurb="Multidisciplinary case reviews with consent-scoped sharing." />,
});
