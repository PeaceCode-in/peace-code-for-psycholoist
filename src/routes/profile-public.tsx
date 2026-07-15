import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/practice/StubPage";

export const Route = createFileRoute("/profile-public")({
  head: () => ({
    meta: [
      { title: "Marketing profile — PeaceCode · Practice" },
      { name: "description", content: "The public listing students see when booking with you." },
    ],
  }),
  component: () => <StubPage title="Marketing profile" crumb="Marketing profile" blurb="The public listing students see when booking with you." />,
});
