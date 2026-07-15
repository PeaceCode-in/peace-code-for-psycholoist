import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/practice/StubPage";
export const Route = createFileRoute("/schedule")({
  head: () => ({ meta: [{ title: "Schedule — PeaceCode · Practice" }] }),
  component: () => <StubPage title="Schedule" blurb="Your calendar with drag-to-reschedule, waitlist, buffer times, and Google Calendar / Zoom sync — landing next." />,
});
