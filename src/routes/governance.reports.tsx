import { createFileRoute } from "@tanstack/react-router";
import { GovHeader } from "@/routes/governance";
import { useGovernance } from "@/lib/governance-store";
import { Panel, VAULT, Mono, Serif, Data, StatusPill, Glyph } from "@/components/practice/governance/primitives";

export const Route = createFileRoute("/governance/reports")({
  component: ComplianceReports,
});

function ComplianceReports() {
  const g = useGovernance();
  const monthEvents = g.auditLog.filter((e) => e.at > Date.now() - 30 * 86_400_000).length;
  const anomalies = g.auditLog.filter((e) => e.anomalyScore > 0.6).length;
  const quarterRights = g.rights.filter((r) => r.openedAt > Date.now() - 90 * 86_400_000);

  const reports = [
    { title: "Monthly access summary", period: "Rolling 30 days", meta: `${monthEvents.toLocaleString()} events · ${anomalies} anomalies flagged`, kind: "monthly", glyph: "ledger" as const },
    { title: "Quarterly rights report", period: "Rolling 90 days", meta: `${quarterRights.length} requests · ${quarterRights.filter((r) => r.status === "fulfilled").length} fulfilled`, kind: "quarterly", glyph: "scale" as const },
    { title: "Annual compliance posture", period: "Rolling 12 months", meta: "Full audit-ready dossier · policies, DPAs, retention adherence, drills, DPO log.", kind: "annual", glyph: "vault" as const },
  ] as const;

  return (
    <div>
      <GovHeader eyebrow="Reports" title="Auto-generated. Archivable." sub="Every report signs its manifest and files itself into the compliance journal." />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reports.map((r) => (
          <Panel key={r.kind} className="p-6">
            <div className="flex items-start justify-between">
              <Glyph kind={r.glyph} size={26} color={VAULT.accent} />
              <StatusPill tone="ok">up to date</StatusPill>
            </div>
            <div className="mt-4 text-[18px]"><Serif>{r.title}</Serif></div>
            <Data style={{ color: VAULT.muted }}>{r.period}</Data>
            <p className="mt-3 text-[12.5px]" style={{ color: VAULT.muted, fontFamily: "'Fraunces', serif", lineHeight: 1.55 }}>{r.meta}</p>
            <div className="mt-4 flex items-center justify-between pt-4" style={{ borderTop: `1px solid ${VAULT.border}` }}>
              <Mono style={{ color: VAULT.muted }}>PDF · signed</Mono>
              <button className="text-[11.5px]" style={{ color: VAULT.accent, fontFamily: "'DM Mono', ui-monospace, monospace", letterSpacing: "0.14em", textTransform: "uppercase" }}>Generate →</button>
            </div>
          </Panel>
        ))}
      </div>

      <div className="mt-8">
        <Mono style={{ color: VAULT.muted }}>Archive</Mono>
        <div className="mt-1 text-[18px] mb-3"><Serif>Previously filed.</Serif></div>
        <Panel className="p-5">
          <ul className="divide-y" style={{ borderColor: VAULT.border }}>
            {[
              { name: "Monthly access summary · May 2026",     at: "2026-06-01", hash: "fnv1a-64:9f22 08c1 44ab e7a1" },
              { name: "Quarterly rights report · Q1 2026",     at: "2026-04-05", hash: "fnv1a-64:1c72 5a80 b12e 0a44" },
              { name: "Annual compliance posture · CY 2025",   at: "2026-01-15", hash: "fnv1a-64:c418 e3d2 7799 fe10" },
            ].map((f) => (
              <li key={f.name} className="py-3 flex items-center gap-4">
                <Data style={{ color: VAULT.muted, minWidth: 110 }}>{f.at}</Data>
                <div className="flex-1 text-[13.5px]" style={{ color: VAULT.ink }}>{f.name}</div>
                <Data style={{ color: VAULT.muted }}>{f.hash}</Data>
                <button className="text-[11.5px]" style={{ color: VAULT.accent, fontFamily: "'DM Mono', ui-monospace, monospace", letterSpacing: "0.14em", textTransform: "uppercase" }}>Download</button>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
