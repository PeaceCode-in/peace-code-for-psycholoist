// Governance layout — quiet slate rail with 10 sub-nav items.
import { Outlet, createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { AppShell } from "@/components/practice/AppShell";
import { VAULT, Mono, Serif, Glyph } from "@/components/practice/governance/primitives";
import type { ReactNode } from "react";

export const Route = createFileRoute("/governance")({
  head: () => ({ meta: [{ title: "Governance — PeaceCode · Practice" }, { name: "description", content: "Consent, audit, retention, patient rights, and breach protocol — the invisible spine of a trustworthy practice." }] }),
  component: GovernanceLayout,
});

const NAV: { to: string; label: string; kind: Parameters<typeof Glyph>[0]["kind"] }[] = [
  { to: "/governance",           label: "Home",             kind: "vault" },
  { to: "/governance/consent",   label: "Consent",          kind: "seal" },
  { to: "/governance/audit",     label: "Audit log",        kind: "ledger" },
  { to: "/governance/retention", label: "Retention",        kind: "clock" },
  { to: "/governance/rights",    label: "Patient rights",   kind: "scale" },
  { to: "/governance/breach",    label: "Breach protocol",  kind: "bolt" },
  { to: "/governance/access",    label: "Access",           kind: "key" },
  { to: "/governance/dpa",       label: "DPAs",             kind: "letter" },
  { to: "/governance/dpo",       label: "DPO panel",        kind: "eye" },
  { to: "/governance/reports",   label: "Reports",          kind: "ledger" },
  { to: "/governance/regulator-view", label: "Regulator view", kind: "vault" },
];

function GovernanceLayout() {
  return (
    <AppShell crumb="Governance">
      <div className="min-h-full" style={{ background: VAULT.bg }}>
        <div className="max-w-[1400px] mx-auto flex gap-6 px-6 py-6">
          <GovRail />
          <div className="flex-1 min-w-0"><Outlet /></div>
        </div>
      </div>
    </AppShell>
  );
}

function GovRail() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <aside className="w-[220px] shrink-0">
      <div className="sticky top-4">
        <div className="mb-4 pl-1">
          <div className="flex items-center gap-2">
            <Glyph kind="vault" size={22} color={VAULT.accent} />
            <div>
              <div className="text-[15px] leading-none"><Serif>Governance</Serif></div>
              <Mono style={{ color: VAULT.muted }}>Back of the house</Mono>
            </div>
          </div>
        </div>
        <nav className="space-y-0.5">
          {NAV.map((n) => {
            const active = pathname === n.to || (n.to !== "/governance" && pathname.startsWith(n.to));
            return (
              <Link
                key={n.to}
                to={n.to}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[12.5px] transition-colors"
                style={{
                  background: active ? "rgba(176,86,122,0.08)" : "transparent",
                  color: active ? VAULT.accent : VAULT.ink,
                  border: `1px solid ${active ? "rgba(176,86,122,0.22)" : "transparent"}`,
                }}
              >
                <Glyph kind={n.kind} size={14} color={active ? VAULT.accent : VAULT.slate} />
                <span>{n.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-6 rounded-xl p-3" style={{ background: "rgba(30,20,32,0.03)", border: `1px solid ${VAULT.border}` }}>
          <Mono style={{ color: VAULT.muted }}>DPDP · 2023</Mono>
          <div className="text-[11.5px] mt-1.5" style={{ color: VAULT.muted, lineHeight: 1.55, fontFamily: "'Fraunces', serif" }}>
            Compliance is architecture, not anxiety.
          </div>
        </div>
      </div>
    </aside>
  );
}

export function GovHeader({ eyebrow, title, sub, right }: { eyebrow: string; title: string; sub?: string; right?: ReactNode }) {
  return (
    <header className="flex items-end justify-between gap-4 mb-6">
      <div>
        <Mono style={{ color: VAULT.muted }}>{eyebrow}</Mono>
        <h1 className="mt-1 text-[30px] leading-tight" style={{ color: VAULT.ink }}><Serif>{title}</Serif></h1>
        {sub && <p className="mt-1 text-[13.5px] max-w-2xl" style={{ color: VAULT.muted }}>{sub}</p>}
      </div>
      {right}
    </header>
  );
}
