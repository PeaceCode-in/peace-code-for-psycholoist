import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/practice/StubPage";

export const Route = createFileRoute("/inbox")({
  head: () => ({
    meta: [
      { title: "Inbox — PeaceCode · Practice" },
      { name: "description", content: "Patient messages, unread threads, and reply templates in one place." },
    ],
  }),
  component: () => <StubPage title="Inbox" crumb="Inbox" blurb="Patient messages, unread threads, and reply templates in one place." />,
});
