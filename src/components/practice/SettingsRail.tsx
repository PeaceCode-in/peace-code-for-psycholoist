import { Link, useRouterState } from "@tanstack/react-router";
import { palette } from "@/components/practice/palette";
import { MentalHealthIllustration } from "@/components/practice/MentalHealthIllustration";
import {
  User, IdCard, Palette, Bell, CalendarClock, Briefcase, Wallet, Video,
  ClipboardList, LifeBuoy, ShieldAlert, Shield, Lock, Database, FileLock2,
  Users, Plug, Accessibility, Info, LogOut, Trash2, Settings as Cog,
} from "lucide-react";

type Item = { to: string; label: string; icon: React.ComponentType<{ className?: string }> };
type Section = { label: string; items: Item[] };

export const SETTINGS_SECTIONS: Section[] = [
  {
    label: "Account",
    items: [
      { to: "/settings/profile", label: "Clinical profile", icon: User },
      { to: "/settings/credentials", label: "Credentials", icon: IdCard },
      { to: "/settings/appearance", label: "Appearance", icon: Palette },
      { to: "/settings/accessibility", label: "Accessibility", icon: Accessibility },
      { to: "/settings/notifications", label: "Notifications", icon: Bell },
    ],
  },
  {
    label: "Practice",
    items: [
      { to: "/settings/availability", label: "Availability", icon: CalendarClock },
      { to: "/settings/services", label: "Services & pricing", icon: Briefcase },
      { to: "/settings/payments", label: "Payments", icon: Wallet },
      { to: "/settings/telehealth", label: "Telehealth", icon: Video },
      { to: "/settings/clinical-defaults", label: "Clinical defaults", icon: ClipboardList },
      { to: "/settings/emergency-protocol", label: "Emergency protocol", icon: ShieldAlert },
    ],
  },
  {
    label: "Data & compliance",
    items: [
      { to: "/settings/privacy", label: "Privacy", icon: Shield },
      { to: "/settings/security", label: "Security", icon: Lock },
      { to: "/settings/data", label: "Data & export", icon: Database },
      { to: "/settings/compliance", label: "Compliance", icon: FileLock2 },
    ],
  },
  {
    label: "Workspace",
    items: [
      { to: "/settings/team", label: "Team", icon: Users },
      { to: "/settings/integrations", label: "Integrations", icon: Plug },
    ],
  },
  {
    label: "Other",
    items: [
      { to: "/settings/about", label: "About", icon: Info },
      { to: "/settings/support", label: "Support", icon: LifeBuoy },
      { to: "/settings/delete", label: "Deactivate", icon: Trash2 },
      { to: "/settings/logout", label: "Sign out", icon: LogOut },
    ],
  },
];

export function SettingsRail() {
  const { surface, border, ink, muted, primary, surface2 } = palette;
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <aside className="w-full lg:w-60 shrink-0">
      <div
        className="relative rounded-2xl p-3 lg:sticky lg:top-4 max-h-[calc(100dvh-2rem)] overflow-hidden lg:overflow-y-auto"
        style={{ background: surface, border: `1px solid ${border}` }}
      >
        <MentalHealthIllustration kind="gear" color={primary} size={120} className="-right-3 -top-3" />
        <div
          className="relative px-2 py-1.5 mb-1 text-[11px] tracking-[0.22em] uppercase flex items-center gap-1.5"
          style={{ color: muted }}
        >
          <Cog className="w-3 h-3 pc-icon-hover-tilt" /> Settings
        </div>
        {SETTINGS_SECTIONS.map((s) => (
          <div key={s.label} className="mt-3">
            <div className="px-2 text-[10px] tracking-[0.22em] uppercase mb-1" style={{ color: muted }}>
              {s.label}
            </div>
            <div className="flex flex-col">
              {s.items.map((it) => {
                const active = pathname === it.to;
                return (
                  <Link
                    key={it.to}
                    to={it.to}
                    className="px-2 py-1.5 rounded-lg text-[12.5px] flex items-center gap-2 transition-colors hover:bg-black/[0.02]"
                    style={{ background: active ? surface2 : "transparent", color: active ? ink : muted }}
                  >
                    <it.icon className={"w-3.5 h-3.5"} />
                    <span style={{ color: active ? ink : muted }}>{it.label}</span>
                    {active && (
                      <span className="ml-auto w-1 h-3 rounded-full" style={{ background: primary }} />
                    )}
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
