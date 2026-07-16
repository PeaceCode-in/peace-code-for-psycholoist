import { createFileRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
import { AppShell } from "@/components/practice/AppShell";
import { palette } from "@/components/practice/palette";
import { CalendarDays, Clock, Repeat, Share2 } from "lucide-react";

export const Route = createFileRoute("/schedule")({
  head: () => ({
    meta: [
      { title: "Schedule — PeaceCode · Practice" },
      { name: "description", content: "Your calendar with drag-to-move, availability rules, recurring blocks, and iCal export." },
    ],
  }),
  component: ScheduleLayout,
});

const TABS = [
  { to: "/schedule", label: "Calendar", icon: CalendarDays, exact: true },
  { to: "/schedule/availability", label: "Availability", icon: Clock },
  { to: "/schedule/recurring", label: "Recurring", icon: Repeat },
  { to: "/schedule/export", label: "Export", icon: Share2 },
];

function ScheduleLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const active = (to: string, exact = false) => (exact ? pathname === to : pathname === to || pathname.startsWith(to + "/"));
  return (
    <AppShell crumb="Schedule">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3 mb-4 min-w-0">
          <div className="min-w-0">
            <h1 className="text-[clamp(1.4rem,2.4vw,2.1rem)] leading-tight tracking-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>
              Schedule
            </h1>
            <p className="text-[12px] mt-1 break-words" style={{ color: palette.muted }}>
              Your time as a living surface. Drag, block, rebook, publish.
            </p>
          </div>
          <div className="pc-scroll-x -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="inline-flex items-center rounded-full border p-1 whitespace-nowrap" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
              {TABS.map((t) => {
                const on = active(t.to, t.exact);
                const Icon = t.icon;
                return (
                  <Link key={t.to} to={t.to} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] transition-all duration-[180ms] shrink-0"
                    style={{ fontFamily: "'DM Mono', ui-monospace, monospace", background: on ? palette.ink : "transparent", color: on ? "#fff" : palette.muted }}>
                    <Icon className="h-3.5 w-3.5" /> {t.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <Outlet />
    </AppShell>
  );
}
