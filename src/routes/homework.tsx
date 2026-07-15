import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/practice/StubPage";

export const Route = createFileRoute("/homework")({
  head: () => ({
    meta: [
      { title: "Homework — PeaceCode · Practice" },
      { name: "description", content: "Assign, track and review between-session work with completion signals." },
    ],
  }),
  component: () => <StubPage title="Homework" crumb="Homework" blurb="Assign, track and review between-session work with completion signals." />,
});
