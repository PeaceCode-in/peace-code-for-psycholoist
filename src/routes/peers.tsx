import { createFileRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
import { AppShell } from "@/components/practice/AppShell";
import { palette } from "@/components/practice/palette";
import { Users2, MessagesSquare, BookOpen, Share2, UserSearch } from "lucide-react";

export const Route = createFileRoute("/peers")({
  head: () => ({
    meta: [
      { title: "Peer Network — PeaceCode · Practice" },
      { name: "description", content: "Anonymised case discussions, journal club, referrals and endorsements — the professional community layer." },
    ],
  }),
  component: PeersLayout,
});

const TABS = [
  { to: "/peers", label: "Home", icon: Users2, exact: true },
  { to: "/peers/discussions", label: "Discussions", icon: MessagesSquare },
  { to: "/peers/journal-club", label: "Journal club", icon: BookOpen },
  { to: "/peers/referrals", label: "Referrals", icon: Share2 },
  { to: "/peers/directory", label: "Directory", icon: UserSearch },
];

function PeersLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const active = (to: string, exact = false) => (exact ? pathname === to : pathname === to || pathname.startsWith(to + "/"));
  return (
    <AppShell crumb="Peer network">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
          <div>
            <h1 className="text-[clamp(1.6rem,2.4vw,2.1rem)] leading-tight tracking-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>
              Peer network
            </h1>
            <p className="text-[12px] mt-1" style={{ color: palette.muted }}>
              A colleagues' room. Anonymised case work, methodology, and mutual referrals — never a competition.
            </p>
          </div>
          <div className="inline-flex flex-wrap items-center rounded-full border p-1" style={{ borderColor: palette.border, background: palette.glass, backdropFilter: "blur(12px)" }}>
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
