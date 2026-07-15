import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/practice/AppShell";

export const Route = createFileRoute("/sessions")({
  head: () => ({ meta: [{ title: "Sessions — PeaceCode · Practice" }] }),
  component: SessionsLayout,
});

function SessionsLayout() {
  return (
    <AppShell crumb="Sessions">
      <Outlet />
    </AppShell>
  );
}
