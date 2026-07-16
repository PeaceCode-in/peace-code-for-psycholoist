import { Link, useRouterState } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { AppShell } from "@/components/practice/AppShell";
import { palette } from "@/components/practice/palette";
import { CalendarDays, Columns3, Grid3x3, ListOrdered, Sparkles, Link2, Cable, Settings as SettingsIcon } from "lucide-react";

const VIEWS = [
  { to: "/calendar", label: "Week", icon: Columns3, exact: true },
  { to: "/calendar/day", label: "Day", icon: CalendarDays },
  { to: "/calendar/month", label: "Month", icon: Grid3x3 },
  { to: "/calendar/agenda", label: "Agenda", icon: ListOrdered },
];

const CONFIG_LINKS = [
  { to: "/calendar/availability", label: "Availability", icon: Sparkles },
  { to: "/calendar/booking-link", label: "Booking link", icon: Link2 },
  { to: "/calendar/integrations", label: "Integrations", icon: Cable },
  { to: "/calendar/settings", label: "Settings", icon: SettingsIcon },
];

export function CalendarShell({ children, title, subtitle, actions }: { children: ReactNode; title?: string; subtitle?: string; actions?: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const active = (to: string, exact = false) => (exact ? pathname === to : pathname === to || pathname.startsWith(to + "/"));

  return (
    <AppShell crumb="Calendar">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 min-w-0">
        <div className="flex items-baseline justify-between flex-wrap gap-3 mb-5 min-w-0">
          <div className="min-w-0">
            <h1 className="text-[clamp(1.4rem,2.4vw,2rem)] leading-tight tracking-tight truncate" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>
              {title ?? "Calendar"}
            </h1>
            <p className="text-[12px] mt-1 break-words" style={{ color: palette.muted }}>
              {subtitle ?? "Your time as a living canvas — drag, resize, publish."}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">{actions}</div>
        </div>


        {/* Segmented view switcher + config chips — scroll horizontally on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6 min-w-0">
          <div className="pc-scroll-x -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="inline-flex items-center rounded-full border p-1 whitespace-nowrap" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
              {VIEWS.map((v) => {
                const on = active(v.to, v.exact);
                const Icon = v.icon;
                return (
                  <Link
                    key={v.to}
                    to={v.to}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] transition-all duration-[180ms] shrink-0"
                    style={{
                      fontFamily: "'DM Mono', ui-monospace, monospace",
                      background: on ? palette.ink : "transparent",
                      color: on ? "#fff" : palette.muted,
                    }}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {v.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="pc-scroll-x -mx-4 px-4 sm:mx-0 sm:px-0 sm:ml-auto">
            <div className="inline-flex items-center gap-1.5 whitespace-nowrap">
              {CONFIG_LINKS.map((l) => {
                const on = active(l.to);
                const Icon = l.icon;
                return (
                  <Link key={l.to} to={l.to}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] border transition-all duration-[180ms] shrink-0"
                    style={{
                      borderColor: on ? palette.primary : palette.border,
                      color: on ? palette.primary : palette.muted,
                      background: on ? "rgba(176,86,122,0.06)" : "rgba(255,255,255,0.55)",
                    }}>
                    <Icon className="h-3.5 w-3.5" /> {l.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>


        {children}
      </div>
    </AppShell>
  );
}

// Whisper diagonal hatch for availability
export function HatchDefs({ id = "avail-hatch" }: { id?: string }) {
  return (
    <defs>
      <pattern id={id} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="8" stroke={palette.primary} strokeOpacity="0.35" strokeWidth="1" />
      </pattern>
    </defs>
  );
}
