import { createFileRoute } from "@tanstack/react-router";
import { GovHeader } from "@/routes/governance";
import { useGovernance } from "@/lib/governance-store";
import { Panel, VAULT, Mono, Serif, Glyph, Data, StatusPill } from "@/components/practice/governance/primitives";

export const Route = createFileRoute("/governance/")({
  component: GovernanceHome,
});

function GovernanceHome() {
  const g = useGovernance();
  const active = g.consents.filter((c) => c.status === "active").length;
  const pending = g.rights.filter((r) => r.status !== "fulfilled" && r.status !== "refused").length;
  const donesQuarter = g.rights.filter((r) => (r.status === "fulfilled" || r.status === "refused") && r.openedAt > Date.now() - 90 * 86_400_000).length;
  const activeBreaches = g.breaches.filter((b) => !b.closedAt).length;
  const activeIntegrations = g.dpas.filter((d) => d.status === "signed").length;
  const mfaCoverage = Object.values(g.access.mfaRequired).filter(Boolean).length;
  const mfaTotal = Object.values(g.access.mfaRequired).length;

  return (
    <div>
      <GovHeader
        eyebrow="Overview"
        title="A quiet ledger, kept honest."
        sub="Every access recorded. Every retention window ticking. Every patient right one ceremony away."
        right={<StatusPill tone={activeBreaches ? "pulse" : "ok"}>{activeBreaches ? `${activeBreaches} incident open` : "All quiet"}</StatusPill>}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Pillar
          glyph="vault" title="Data at rest"
          rows={[
            ["Encryption", "AES-256 · at rest"],
            ["Primary region", "ap-south-1 (Mumbai)"],
            ["Backup region", "ap-southeast-1"],
            ["Retention policies", `${g.retention.length} classes · ${g.retention.reduce((a, r) => a + r.reviewQueue, 0)} in review`],
          ]}
        />
        <Pillar
          glyph="bolt" title="Data in motion"
          rows={[
            ["Active sessions", "3 clinicians · 1 patient"],
            ["Integrations exchanging", `${activeIntegrations} vendors under DPA`],
            ["Last sync", "Google Calendar · 2 min ago"],
            ["TLS", "1.3 · pinned"],
          ]}
        />
        <Pillar
          glyph="key" title="Access & identity"
          rows={[
            ["Active accounts", `${g.access.roles.length} roles configured`],
            ["MFA coverage", `${mfaCoverage} of ${mfaTotal} roles`],
            ["Off-hours access", "1 near-miss (9 days ago)"],
            ["Session policy", "60 min · owner · 30 min · read-only"],
          ]}
        />
        <Pillar
          glyph="scale" title="Rights & requests"
          rows={[
            ["Active consents", `${active} across ${new Set(g.consents.map((c) => c.patientId)).size} patients`],
            ["Pending requests", pending ? `${pending} in flight` : "None"],
            ["Fulfilled · 90 days", `${donesQuarter}`],
            ["Median response", "6.2 days · well within 30d SLA"],
          ]}
        />
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <Mono style={{ color: VAULT.muted }}>Compliance journal</Mono>
            <div className="mt-1 text-[18px]"><Serif>The historical record.</Serif></div>
          </div>
          <div className="text-[11.5px]" style={{ color: VAULT.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{g.journal.length} entries</div>
        </div>
        <Panel className="p-5">
          <ul className="divide-y" style={{ borderColor: VAULT.border }}>
            {g.journal.slice(0, 12).map((j) => (
              <li key={j.id} className="py-3 flex items-start gap-4">
                <Data style={{ color: VAULT.muted, minWidth: 110 }}>{new Date(j.at).toISOString().slice(0, 10)}</Data>
                <span className="mt-1 h-1.5 w-1.5 rounded-full" style={{ background: VAULT.accent, opacity: 0.7 }} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px]" style={{ color: VAULT.ink }}>{j.text}</div>
                  {j.actor && <div className="mt-0.5 text-[11.5px]" style={{ color: VAULT.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{j.actor}</div>}
                </div>
                <Mono style={{ color: VAULT.muted }}>{j.kind}</Mono>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

function Pillar({ glyph, title, rows }: { glyph: Parameters<typeof Glyph>[0]["kind"]; title: string; rows: [string, string][] }) {
  return (
    <Panel className="p-6">
      <div className="flex items-start gap-4">
        <div className="mt-1"><Glyph kind={glyph} size={28} color={VAULT.accent} /></div>
        <div className="flex-1">
          <div className="text-[19px]" style={{ color: VAULT.ink }}><Serif>{title}</Serif></div>
          <dl className="mt-4 space-y-2.5">
            {rows.map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-3">
                <dt className="text-[11.5px]" style={{ color: VAULT.muted, fontFamily: "'DM Mono', ui-monospace, monospace", letterSpacing: "0.14em", textTransform: "uppercase" }}>{k}</dt>
                <dd className="text-[13px] text-right" style={{ color: VAULT.ink }}>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Panel>
  );
}
