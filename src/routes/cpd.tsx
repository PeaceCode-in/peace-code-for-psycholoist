import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/practice/StubPage";

export const Route = createFileRoute("/cpd")({
  head: () => ({
    meta: [
      { title: "CPD & supervision — PeaceCode · Practice" },
      { name: "description", content: "Continuing professional development hours and supervision log." },
    ],
  }),
  component: () => <StubPage title="CPD & supervision" crumb="CPD" blurb="Continuing professional development hours and supervision log." />,
});
