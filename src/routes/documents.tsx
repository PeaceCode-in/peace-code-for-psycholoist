import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/documents")({
  head: () => ({
    meta: [
      { title: "Documents — PeaceCode · Practice" },
      { name: "description", content: "Intake, consent, treatment agreements, and clinical worksheets — created, sent, signed, stored." },
    ],
  }),
  component: () => <Outlet />,
});
