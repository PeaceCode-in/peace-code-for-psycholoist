import { type ReactNode } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Home, CalendarHeart, NotebookPen, ClipboardCheck, MessageCircle, Sparkles, Receipt, FileText, User, LifeBuoy, LogOut } from "lucide-react";
import { portalSignOut, useCurrentClient, useUnreadFromTherapist, useWaitingOnYou } from "@/lib/portal-store";

// Warm sakura + rose tokens, inline so the portal feels distinct without new global tokens.
export const portal = {
  bg: "#FBF6F4",         // warm cream
  paper: "#FFFFFF",
  ink: "#2A1D22",
  muted: "#7B6A70",
  soft: "#F3E4E7",       // sakura wash
  border: "#EBDDE0",
  rose: "#B8637F",       // gentle rose
  roseDeep: "#8E4560",
  dusk: "#C58AA0",
  moss: "#7BA184",
  sun: "#E5B77B",
} as const;

type NavItem = { to: string; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; badge?: number };

const NAV: NavItem[] = [
  { to: "/portal", label: "Home", icon: Home },
  { to: "/portal/sessions", label: "Sessions", icon: CalendarHeart },
  { to: "/portal/homework", label: "Homework", icon: NotebookPen },
  { to: "/portal/assessments", label: "Check-ins", icon: ClipboardCheck },
  { to: "/portal/messages", label: "Messages", icon: MessageCircle },
  { to: "/portal/progress", label: "Progress", icon: Sparkles },
  { to: "/portal/billing", label: "Billing", icon: Receipt },
  { to: "/portal/documents", label: "Documents", icon: FileText },
  { to: "/portal/profile", label: "You", icon: User },
];

export function PortalShell({ children, title, subtitle }: { children: ReactNode; title?: string; subtitle?: string }) {
  const client = useCurrentClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const unread = useUnreadFromTherapist();
  const waiting = useWaitingOnYou();
  const nav = useNavigate();

  const navWithBadges = NAV.map(n => n.to === "/portal/messages" ? { ...n, badge: unread } : n.to === "/portal" && waiting.length ? { ...n, badge: waiting.length } : n);

  return (
    <div className="min-h-screen" style={{ background: portal.bg, color: portal.ink, fontFamily: "'DM Sans', system-ui" }}>
      {/* Top bar (mobile + desktop) */}
      <header className="sticky top-0 z-30 border-b backdrop-blur" style={{ background: `${portal.bg}f2`, borderColor: portal.border }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-8 md:py-4">
          <Link to="/portal" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full" style={{ background: portal.soft, color: portal.roseDeep }}>
              <span style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 500 }}>p</span>
            </span>
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 500, letterSpacing: -0.2 }}>Portal</span>
          </Link>
          <Link
            to="/portal/crisis"
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors md:px-4"
            style={{ background: portal.dusk, color: "#FFFFFF" }}
          >
            <LifeBuoy className="h-4 w-4" strokeWidth={1.6} />
            <span className="hidden sm:inline">I need help now</span>
            <span className="sm:hidden">Help</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-8 px-4 pb-28 md:px-8 md:pb-16 md:pt-8">
        {/* Desktop rail */}
        <aside className="hidden md:block md:w-56 md:shrink-0">
          <nav className="sticky top-24 flex flex-col gap-1">
            {navWithBadges.map(n => {
              const active = n.to === "/portal" ? pathname === "/portal" : pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className="group flex items-center justify-between rounded-2xl px-3 py-2.5 text-[15px] transition-colors"
                  style={{
                    background: active ? portal.soft : "transparent",
                    color: active ? portal.roseDeep : portal.ink,
                  }}
                >
                  <span className="flex items-center gap-3">
                    <n.icon className="h-4 w-4" strokeWidth={active ? 2 : 1.5} />
                    {n.label}
                  </span>
                  {n.badge ? (
                    <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px]" style={{ background: portal.rose, color: "#fff" }}>
                      {n.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
            {client ? (
              <button
                onClick={() => { portalSignOut(); nav({ to: "/portal/auth" }); }}
                className="mt-6 flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-[14px]"
                style={{ color: portal.muted }}
              >
                <LogOut className="h-4 w-4" strokeWidth={1.5} />
                Sign out
              </button>
            ) : null}
          </nav>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1">
          {title ? (
            <header className="mb-6 md:mb-10">
              <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 34, fontWeight: 400, letterSpacing: -0.6, lineHeight: 1.1 }}>{title}</h1>
              {subtitle ? <p className="mt-2 text-[15px]" style={{ color: portal.muted }}>{subtitle}</p> : null}
            </header>
          ) : null}
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t md:hidden"
        style={{ background: `${portal.paper}f5`, borderColor: portal.border, paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto flex max-w-6xl items-stretch justify-around px-2 py-1.5">
          {[navWithBadges[0], navWithBadges[1], navWithBadges[2], navWithBadges[4], navWithBadges[8]].map(n => {
            const active = n.to === "/portal" ? pathname === "/portal" : pathname.startsWith(n.to);
            return (
              <Link key={n.to} to={n.to} className="relative flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[11px]" style={{ color: active ? portal.roseDeep : portal.muted }}>
                <n.icon className="h-5 w-5" strokeWidth={active ? 2 : 1.5} />
                <span>{n.label}</span>
                {n.badge ? <span className="absolute right-3 top-1 h-1.5 w-1.5 rounded-full" style={{ background: portal.rose }} /> : null}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

// ─── small primitives ─────────────────────────────────────────────────────
export function Card({ children, className = "", pad = true }: { children: ReactNode; className?: string; pad?: boolean }) {
  return (
    <div className={className} style={{ background: portal.paper, border: `1px solid ${portal.border}`, borderRadius: 20, padding: pad ? 24 : 0 }}>
      {children}
    </div>
  );
}

export function SoftCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={className} style={{ background: portal.soft, borderRadius: 20, padding: 24 }}>
      {children}
    </div>
  );
}

export function Chip({ children, tone = "calm" }: { children: ReactNode; tone?: "calm" | "attend" | "elevated" | "muted" }) {
  const styles: Record<string, { bg: string; fg: string }> = {
    calm: { bg: "#EEF3EC", fg: "#4E7358" },
    attend: { bg: "#FCEFDE", fg: "#8A6023" },
    elevated: { bg: portal.soft, fg: portal.roseDeep },
    muted: { bg: "#F3EFEA", fg: portal.muted },
  };
  const s = styles[tone];
  return <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[12px]" style={{ background: s.bg, color: s.fg }}>{children}</span>;
}
