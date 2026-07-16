import { createFileRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
import { AppShell } from "@/components/practice/AppShell";
import { palette } from "@/components/practice/palette";
import { CalendarClock, FileSignature, Target, UserSearch } from "lucide-react";

export const Route = createFileRoute("/supervision")({
  head: () => ({
    meta: [
      { title: "Supervision Log — PeaceCode · Practice" },
      { name: "description", content: "Supervision contracts, sessions, competency framework and CPD hours — accountable, private, regulator-ready." },
    ],
  }),
  component: SupervisionLayout,
});

const TABS = [
  { to: "/supervision", label: "Sessions", icon: CalendarClock, exact: true },
  { to: "/supervision/contracts", label: "Contracts", icon: FileSignature },
  { to: "/supervision/competencies", label: "Competencies", icon: Target },
  { to: "/supervision/supervisors", label: "Find supervisor", icon: UserSearch },
];

function SupervisionLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const active = (to: string, exact = false) => (exact ? pathname === to : pathname === to || pathname.startsWith(to + "/"));
  return (
    <AppShell crumb="Supervision">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
          <div>
            <h1 className="text-[clamp(1.6rem,2.4vw,2.1rem)] leading-tight tracking-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>
              Supervision
            </h1>
            <p className="text-[12px] mt-1" style={{ color: palette.muted }}>
              The professional's mirror. Contracts, sessions, competencies — private where it matters, verifiable where it counts.
            </p>
          </div>
          <div className="inline-flex flex-wrap items-center rounded-full border p-1" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
            {TABS.map((t) => {
              const on = active(t.to, t.exact);
              const Icon = t.icon;
              return (
                <Link key={t.to} to={t.to} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] transition-all duration-[180ms]" style={{ fontFamily: "'DM Mono', ui-monospace, monospace", background: on ? palette.ink : "transparent", color: on ? "#fff" : palette.muted }}>
                  <Icon className="h-3.5 w-3.5" /> {t.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
      <Outlet />
    </AppShell>
  );
}
