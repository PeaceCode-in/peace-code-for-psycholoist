import { createFileRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
import { AppShell } from "@/components/practice/AppShell";
import { palette } from "@/components/practice/palette";
import { GraduationCap, CalendarClock, ScrollText, BookMarked, Target, BookOpen, Building2 } from "lucide-react";

export const Route = createFileRoute("/cpd")({
  head: () => ({
    meta: [
      { title: "CPD — PeaceCode · Practice" },
      { name: "description", content: "Continuing professional development hours, evidence and renewal packet for RCI · IAP · state councils." },
    ],
  }),
  component: CpdLayout,
});

const TABS = [
  { to: "/cpd", label: "Ledger", icon: GraduationCap, exact: true },
  { to: "/cpd/catalog", label: "Catalog", icon: CalendarClock },
  { to: "/cpd/renewal", label: "Renewal", icon: ScrollText },
  { to: "/cpd/plan", label: "Learning plan", icon: Target },
  { to: "/cpd/reading", label: "Reading", icon: BookOpen },
  { to: "/cpd/providers", label: "Providers", icon: Building2 },
];

function CpdLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const active = (to: string, exact = false) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");
  return (
    <AppShell crumb="CPD">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
          <div>
            <h1
              className="text-[clamp(1.6rem,2.4vw,2.1rem)] leading-tight tracking-tight"
              style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}
            >
              Continuing professional development
            </h1>
            <p className="text-[12px] mt-1" style={{ color: palette.muted }}>
              A quiet, verifiable ledger. Every hour, every reflection, every certificate.
            </p>
          </div>
          <div
            className="inline-flex flex-wrap items-center rounded-full border p-1"
            style={{ borderColor: palette.border, background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}
          >
            {TABS.map((t) => {
              const on = active(t.to, t.exact);
              const Icon = t.icon;
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] transition-all duration-[180ms]"
                  style={{
                    fontFamily: "'DM Mono', ui-monospace, monospace",
                    background: on ? palette.ink : "transparent",
                    color: on ? "#fff" : palette.muted,
                  }}
                >
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
