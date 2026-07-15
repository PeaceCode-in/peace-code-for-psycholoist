import { createFileRoute } from "@tanstack/react-router";
import { GovHeader } from "@/routes/governance";
import { useGovernance, type DpaStatus } from "@/lib/governance-store";
import { Panel, VAULT, Mono, Serif, Data, StatusPill } from "@/components/practice/governance/primitives";

export const Route = createFileRoute("/governance/dpa")({
  component: DpaRegistry,
});

function statusTone(s: DpaStatus) {
  if (s === "signed") return "ok";
  if (s === "pending") return "warn";
  if (s === "expired") return "pulse";
  return "muted";
}

function DpaRegistry() {
  const g = useGovernance();
  return (
    <div>
      <GovHeader
        eyebrow="Data processing agreements"
        title="Every vendor, on record."
        sub="Any integration that touches patient data must carry a signed DPA. Track effective and expiry dates. Request a new one in a click."
        right={<StatusPill tone="info">{g.dpas.length} vendors</StatusPill>}
      />

      <Panel className="overflow-hidden">
        <table className="w-full text-[12.5px]">
          <thead>
            <tr style={{ background: "rgba(30,20,32,0.03)", color: VAULT.muted }}>
              {["Vendor","Category","Data classes","Sub-processors","Country","Status","Effective","Expires",""].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-normal" style={{ fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {g.dpas.map((d) => (
              <tr key={d.id} style={{ borderTop: `1px solid ${VAULT.border}` }}>
                <td className="px-4 py-3" style={{ color: VAULT.ink }}><Serif>{d.vendor}</Serif></td>
                <td className="px-4 py-3" style={{ color: VAULT.muted }}>{d.category}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {d.dataClasses.map((c) => <span key={c} className="rounded-full px-2 py-0.5" style={{ background: "rgba(30,20,32,0.05)", color: VAULT.ink, fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 10.5, letterSpacing: "0.1em" }}>{c}</span>)}
                  </div>
                </td>
                <td className="px-4 py-3"><Data style={{ color: VAULT.muted }}>{d.subprocessors.join(", ") || "—"}</Data></td>
                <td className="px-4 py-3"><Data style={{ color: VAULT.muted }}>{d.country}</Data></td>
                <td className="px-4 py-3"><StatusPill tone={statusTone(d.status)}>{d.status}</StatusPill></td>
                <td className="px-4 py-3"><Data style={{ color: VAULT.muted }}>{d.effectiveAt ? new Date(d.effectiveAt).toISOString().slice(0, 10) : "—"}</Data></td>
                <td className="px-4 py-3"><Data style={{ color: d.expiresAt && d.expiresAt < Date.now() ? VAULT.pulse : VAULT.muted }}>{d.expiresAt ? new Date(d.expiresAt).toISOString().slice(0, 10) : "—"}</Data></td>
                <td className="px-4 py-3 text-right">
                  <button className="text-[11px] underline underline-offset-4" style={{ color: VAULT.accent, fontFamily: "'DM Mono', ui-monospace, monospace", letterSpacing: "0.14em", textTransform: "uppercase" }}>Request DPA</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
