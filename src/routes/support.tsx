import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/practice/StubPage";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Help & support — PeaceCode · Practice" },
      { name: "description", content: "Docs, contact and status." },
    ],
  }),
  component: () => <StubPage title="Help & support" crumb="Support" blurb="Docs, contact and status." />,
});
