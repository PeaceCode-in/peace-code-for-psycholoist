import { createFileRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
import { AppShell, palette } from "@/components/practice/AppShell";
import { Users, ShieldCheck, GraduationCap, ArrowRightLeft, Share2, CalendarClock, BarChart3, ScrollText, Mail } from "lucide-react";
import type { ReactNode } from "react";
import { usePendingCounts } from "@/lib/team-store";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Team — PeaceCode · Practice" },
      { name: "description", content: "Roster, roles, supervision, handoffs, referrals, coverage, and audit." },
    ],
  }),
  component: () => (
    <AppShell crumb="Team">
      <TeamShell>
        <Outlet />
      </TeamShell>
    </AppShell>
  ),
});

const TABS: { to: string; label: string; icon: React.ComponentType<{ className?: string }>; badgeKey?: "referrals" | "handoffs" | "cosigns" }[] = [
  { to: "/team",             label: "Roster",       icon: Users },
  { to: "/team/roles",       label: "Roles",        icon: ShieldCheck },
  { to: "/team/supervision", label: "Supervision",  icon: GraduationCap, badgeKey: "cosigns" },
  { to: "/team/handoffs",    label: "Handoffs",     icon: ArrowRightLeft, badgeKey: "handoffs" },
  { to: "/team/referrals",   label: "Referrals",    icon: Share2, badgeKey: "referrals" },
  { to: "/team/coverage",    label: "Coverage",     icon: CalendarClock },
  { to: "/team/analytics",   label: "Analytics",    icon: BarChart3 },
  { to: "/team/audit",       label: "Audit",        icon: ScrollText },
  { to: "/team/invite",      label: "Invite",       icon: Mail },
];

function TeamShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const pending = usePendingCounts();
  const isActive = (to: string) => to === "/team" ? path === "/team" : path === to || path.startsWith(to + "/");
  return (
    <div className="min-h-full" style={{ background: "linear-gradient(180deg, #FFF7FA 0%, #FBF7F8 240px)" }}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-6">
        <div className="flex items-baseline justify-between gap-4 mb-1">
          <div>
            <div className="uppercase text-[10.5px] tracking-[0.22em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Practice · Team</div>
            <h1 className="mt-1 text-[26px] leading-tight tracking-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>
              The people behind every session
            </h1>
          </div>
        </div>
        <p className="text-[13px] max-w-xl" style={{ color: palette.muted }}>
          Who's on shift, who needs a co-sign, who's covering whom — the back-office of a well-run clinic.
        </p>

        <nav
          className="mt-6 flex items-center gap-1 overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 pb-1"
          role="tablist"
          aria-label="Team sections"
        >
          {TABS.map((t) => {
            const active = isActive(t.to);
            const badge = t.badgeKey ? pending[t.badgeKey] : 0;
            return (
              <Link
                key={t.to}
                to={t.to}
                className="relative inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[12px] transition-colors whitespace-nowrap"
                style={{
                  background: active ? palette.ink : "transparent",
                  color: active ? "#fff" : palette.muted,
                  border: `1px solid ${active ? palette.ink : palette.border}`,
                }}
              >
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
                {badge > 0 && (
                  <span
                    className="ml-0.5 min-w-[16px] h-[16px] px-1 rounded-full text-[9.5px] tabular-nums flex items-center justify-center"
                    style={{
                      background: active ? "rgba(255,255,255,0.2)" : palette.primary,
                      color: "#fff",
                      fontFamily: "'DM Mono', ui-monospace, monospace",
                    }}
                  >
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <hr className="mt-3 border-0 h-px" style={{ background: palette.border }} />
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-24 pt-6">
        {children}
      </div>
    </div>
  );
}
