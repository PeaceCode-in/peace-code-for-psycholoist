import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/practice/AppShell";
import { SettingsRail } from "@/components/practice/SettingsRail";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — PeaceCode · Practice" }] }),
  component: () => (
    <AppShell crumb="Settings">
      <div className="max-w-[1200px] mx-auto px-5 lg:px-8 py-6 lg:py-8 flex flex-col lg:flex-row gap-6">
        <SettingsRail />
        <div className="flex-1 min-w-0"><Outlet /></div>
      </div>
    </AppShell>
  ),
});
