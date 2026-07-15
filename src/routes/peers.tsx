import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/practice/StubPage";

export const Route = createFileRoute("/peers")({
  head: () => ({
    meta: [
      { title: "Peer network — PeaceCode · Practice" },
      { name: "description", content: "Connect, discuss cases (anonymised), and share methodology with peers." },
    ],
  }),
  component: () => <StubPage title="Peer network" crumb="Peer network" blurb="Connect, discuss cases (anonymised), and share methodology with peers." />,
});
