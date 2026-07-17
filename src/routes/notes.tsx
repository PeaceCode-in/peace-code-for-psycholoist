import { createFileRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
import { AppShell } from "@/components/practice/AppShell";
import { palette } from "@/components/practice/palette";
import { MentalHealthIllustration } from "@/components/practice/MentalHealthIllustration";
import { FileText, LayoutTemplate, Inbox, CheckSquare } from "lucide-react";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "Notes — PeaceCode · Practice" },
      { name: "description", content: "Clinical documentation with autosave, sign & lock, and amendment history." },
    ],
  }),
  component: NotesLayout,
});

const TABS = [
  { to: "/notes", label: "All notes", icon: FileText, exact: true },
  { to: "/notes/drafts", label: "Drafts", icon: Inbox },
  { to: "/notes/templates", label: "Templates", icon: LayoutTemplate },
  { to: "/notes/bulk", label: "Bulk", icon: CheckSquare },
];

function NotesLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const active = (to: string, exact = false) => (exact ? pathname === to : pathname === to || pathname.startsWith(to + "/"));
  return (
    <AppShell crumb="Notes">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 min-w-0">
        <div className="relative flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3 mb-4 min-w-0 overflow-hidden">
          <MentalHealthIllustration kind="journal" color={palette.primary} size={150} className="-right-4 -top-4 hidden sm:block" />
          <div className="min-w-0 relative">
            <h1 className="text-[clamp(1.4rem,2.4vw,2.1rem)] leading-tight tracking-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>
              Notes
            </h1>
            <p className="text-[12px] mt-1 break-words" style={{ color: palette.muted }}>
              Every session, kept honest. Written once, signed once, amended in the open.
            </p>
          </div>
          <div className="pc-scroll-x -mx-4 px-4 sm:mx-0 sm:px-0 relative">
            <div className="inline-flex items-center rounded-full border p-1 whitespace-nowrap" style={{ borderColor: palette.border, background: palette.glass, backdropFilter: "blur(12px)" }}>
              {TABS.map((t) => {
                const on = active(t.to, t.exact);
                const Icon = t.icon;
                return (
                  <Link key={t.to} to={t.to} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] transition-all duration-[180ms] shrink-0"
                    style={{ fontFamily: "'DM Mono', ui-monospace, monospace", background: on ? palette.ink : "transparent", color: on ? "#fff" : palette.muted }}>
                    <Icon className="h-3.5 w-3.5 pc-icon-hover-tilt" /> {t.label}
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
