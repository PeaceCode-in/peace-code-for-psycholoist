import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/practice/StubPage";

export const Route = createFileRoute("/treatment-plans")({
  head: () => ({
    meta: [
      { title: "Treatment plans — PeaceCode · Practice" },
      { name: "description", content: "Goals, milestones, and evidence-based interventions per patient." },
    ],
  }),
  component: () => <StubPage title="Treatment plans" crumb="Treatment plans" blurb="Goals, milestones, and evidence-based interventions per patient." />,
});
