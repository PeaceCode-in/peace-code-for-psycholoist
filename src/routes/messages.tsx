import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/practice/StubPage";
export const Route = createFileRoute("/messages")({
  head: () => ({ meta: [{ title: "Messages — PeaceCode · Practice" }] }),
  component: () => <StubPage title="Messages" blurb="Secure patient messaging with response-time guardrails and out-of-office replies — landing next." />,
});
