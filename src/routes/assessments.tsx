import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/practice/StubPage";

export const Route = createFileRoute("/assessments")({
  head: () => ({
    meta: [
      { title: "Assessments — PeaceCode · Practice" },
      { name: "description", content: "Administer and score PHQ-9, GAD-7, PCL-5, WHO-5, DASS-21, K10, Y-BOCS, AUDIT, MSSI and custom instruments." },
    ],
  }),
  component: () => <StubPage title="Assessments" crumb="Assessments" blurb="Administer and score PHQ-9, GAD-7, PCL-5, WHO-5, DASS-21, K10, Y-BOCS, AUDIT, MSSI and custom instruments." />,
});
