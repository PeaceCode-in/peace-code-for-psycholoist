import { createFileRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
import { AppShell } from "@/components/practice/AppShell";
import { palette } from "@/components/practice/palette";
import { BookOpen, FileText, Film, LineChart } from "lucide-react";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "Content library — PeaceCode · Practice" },
      { name: "description", content: "Articles, worksheets, guides, video and podcast episodes — your body of writing, kept honest." },
    ],
  }),
  component: LibraryLayout,
});

const TABS = [
  { to: "/library", label: "All pieces", icon: BookOpen, exact: true },
  { to: "/library/worksheets", label: "Worksheets", icon: FileText },
  { to: "/library/media", label: "Media", icon: Film },
  { to: "/library/analytics", label: "Analytics", icon: LineChart },
];

function LibraryLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const active = (to: string, exact = false) => (exact ? pathname === to : pathname === to || pathname.startsWith(to + "/"));
  return (
    <AppShell crumb="Content library">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
          <div>
            <h1 className="text-[clamp(1.6rem,2.4vw,2.1rem)] leading-tight tracking-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>
              Content library
            </h1>
            <p className="text-[12px] mt-1" style={{ color: palette.muted }}>
              One good piece a month is a career. Write once, project everywhere.
            </p>
          </div>
          <div className="inline-flex items-center rounded-full border p-1" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
            {TABS.map((t) => {
              const on = active(t.to, t.exact);
              const Icon = t.icon;
              return (
                <Link key={t.to} to={t.to} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] transition-all duration-[180ms]"
                  style={{ fontFamily: "'DM Mono', ui-monospace, monospace", background: on ? palette.ink : "transparent", color: on ? "#fff" : palette.muted }}>
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
