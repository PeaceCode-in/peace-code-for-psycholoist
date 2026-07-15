import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/practice/AppShell";

export const Route = createFileRoute("/assessments")({
  head: () => ({
    meta: [
      { title: "Assessments — PeaceCode · Practice" },
      { name: "description", content: "Screeners, trajectories and clinical flags — PHQ-9, GAD-7, PCL-5, WSAS, C-SSRS." },
    ],
  }),
  component: () => <AppShell crumb="Assessments"><Outlet /></AppShell>,
});
