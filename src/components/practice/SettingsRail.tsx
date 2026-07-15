import { Link, useRouterState } from "@tanstack/react-router";
import { palette } from "@/components/practice/palette";
import {
  User, IdCard, Building2, CalendarClock, Wallet, Palette, Bell, Lock,
  Shield, Users, Plug, AlertTriangle, Info, Briefcase, Settings as Cog,
} from "lucide-react";

const SECTIONS = [
  {
    label: "Account",
    items: [
      { to: "/settings/profile", label: "Profile", icon: User },
      { to: "/settings/credentials", label: "Credentials", icon: IdCard },
      { to: "/settings/security", label: "Security", icon: Lock },
    ],
  },
  {
    label: "Practice",
    items: [
      { to: "/settings/practice", label: "Clinic", icon: Building2 },
      { to: "/settings/availability", label: "Availability", icon: CalendarClock },
      { to: "/settings/services", label: "Services & pricing", icon: Briefcase },
      { to: "/settings/payouts", label: "Payouts", icon: Wallet },
      { to: "/settings/team", label: "Team", icon: Users },
      { to: "/settings/integrations", label: "Integrations", icon: Plug },
    ],
  },
  {
    label: "Preferences",
    items: [
      { to: "/settings/appearance", label: "Appearance", icon: Palette },
      { to: "/settings/notifications", label: "Notifications", icon: Bell },
      { to: "/settings/privacy", label: "Privacy", icon: Shield },
    ],
  },
  {
    label: "Other",
    items: [
      { to: "/settings/danger", label: "Danger zone", icon: AlertTriangle },
      { to: "/settings/about", label: "About", icon: Info },
    ],
  },
];

export function SettingsRail() {
  const { surface, border, ink, muted, primary, surface2 } = palette;
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <aside className="w-full lg:w-60 shrink-0">
      <div className="rounded-2xl p-3 sticky top-4" style={{ background: surface, border: `1px solid ${border}` }}>
        <div className="px-2 py-1.5 mb-1 text-[11px] tracking-[0.22em] uppercase flex items-center gap-1.5" style={{ color: muted }}>
          <Cog className="w-3 h-3" /> Settings
        </div>
        {SECTIONS.map((s) => (
          <div key={s.label} className="mt-3">
            <div className="px-2 text-[10px] tracking-[0.22em] uppercase mb-1" style={{ color: muted }}>{s.label}</div>
            <div className="flex flex-col">
              {s.items.map((it) => {
                const active = pathname === it.to;
                return (
                  <Link key={it.to} to={it.to}
                    className="px-2 py-1.5 rounded-lg text-[12.5px] flex items-center gap-2 transition"
                    style={{ background: active ? surface2 : "transparent", color: active ? ink : muted }}>
                    <it.icon className="w-3.5 h-3.5" style={{ color: active ? primary : muted }} />
                    {it.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
