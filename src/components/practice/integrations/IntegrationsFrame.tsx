import { type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { AppShell } from "@/components/practice/AppShell";
import { ix } from "./tokens";

const TABS = [
  { to: "/integrations", label: "Directory", exact: true },
  { to: "/integrations/webhooks", label: "Webhooks" },
  { to: "/integrations/tokens", label: "API tokens" },
  { to: "/integrations/automations", label: "Automations" },
];

export function IntegrationsFrame({ children, wide = true }: { children: ReactNode; wide?: boolean }) {
  const path = useRouterState({ select: s => s.location.pathname });
  return (
    <AppShell>
      <div className="min-h-screen" style={{ background: ix.bg, color: ix.ink, fontFamily: "'DM Sans', system-ui" }}>
        <header className="border-b" style={{ borderColor: ix.border, background: `${ix.bg}` }}>
          <div className={`mx-auto ${wide ? "max-w-6xl" : "max-w-4xl"} px-6 pt-8 pb-0`}>
            <p className="text-[12px] uppercase" style={{ color: ix.muted, letterSpacing: 1.4 }}>Practice</p>
            <h1 className="mt-2" style={{ fontFamily: ix.serif, fontSize: 32, fontWeight: 400, letterSpacing: -0.5, lineHeight: 1.1 }}>
              Integrations
            </h1>
            <p className="mt-2 max-w-2xl text-[14.5px]" style={{ color: ix.muted }}>
              Every tool your practice runs on, in one control room. Connect, monitor, and hand data across systems with intent.
            </p>
            <nav className="mt-6 flex flex-wrap gap-1">
              {TABS.map(t => {
                const active = t.exact ? path === t.to : path.startsWith(t.to);
                return (
                  <Link key={t.to} to={t.to} className="rounded-full px-4 py-1.5 text-[13px] transition-colors"
                    style={{ color: active ? "#FFFFFF" : ix.muted, background: active ? ix.rose : "transparent" }}>
                    {t.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>
        <div className={`mx-auto ${wide ? "max-w-6xl" : "max-w-4xl"} px-6 py-10`}>{children}</div>
      </div>
    </AppShell>
  );
}

export function Brand({ glyph, size = 44 }: { glyph: string; size?: number }) {
  return (
    <div
      className="grid shrink-0 place-items-center rounded-2xl"
      style={{
        width: size, height: size,
        border: `1px solid ${ix.border}`,
        background: ix.paper,
        color: ix.ink,
        fontFamily: ix.serif,
        fontSize: Math.round(size * 0.5),
        lineHeight: 1,
      }}
      aria-hidden
    >
      {glyph}
    </div>
  );
}

export function StatusPill({ tone, dot, children }: { tone: { bg: string; fg: string; dot: string; label: string }; dot?: boolean; children?: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11.5px]"
      style={{ background: tone.bg, color: tone.fg, letterSpacing: 0.2 }}>
      {dot !== false ? <span className="h-1.5 w-1.5 rounded-full" style={{ background: tone.dot }} /> : null}
      {children ?? tone.label}
    </span>
  );
}
