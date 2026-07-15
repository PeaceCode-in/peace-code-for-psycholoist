import { createFileRoute } from "@tanstack/react-router";
import { GovHeader } from "@/routes/governance";
import { setAccessCell, toggleMfa, useGovernance, type AccessLevel, type RoleKey } from "@/lib/governance-store";
import { AccessDot, Panel, VAULT, Mono, Serif, Data, StatusPill } from "@/components/practice/governance/primitives";

export const Route = createFileRoute("/governance/access")({
  component: AccessGovernance,
});

const LEVELS: AccessLevel[] = ["full","read","with-reason","none"];
const NEXT: Record<AccessLevel, AccessLevel> = { full: "read", read: "with-reason", "with-reason": "none", none: "full" };
const ROLE_LABEL: Record<RoleKey, string> = { owner: "Owner", clinician: "Clinician", supervisor: "Supervisor", "front-desk": "Front desk", billing: "Billing", auditor: "Auditor", "read-only": "Read-only", system: "System", patient: "Patient" };

function AccessGovernance() {
  const g = useGovernance();
  const { access } = g;

  return (
    <div>
      <GovHeader
        eyebrow="Access governance"
        title="Who sees what."
        sub="Roles down, data classes across. Filled means full. Half means read. Striped means break-glass with reason. Empty means never."
      />

      <Panel className="overflow-hidden">
        <table className="w-full text-[12.5px]">
          <thead>
            <tr style={{ background: "rgba(30,20,32,0.03)" }}>
              <th className="text-left px-4 py-3" style={{ color: VAULT.muted, fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase" }}>Role</th>
              {access.classes.map((c) => (
                <th key={c.key} className="text-center px-3 py-3" style={{ color: VAULT.muted, fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase" }}>{c.label}</th>
              ))}
              <th className="text-center px-3 py-3" style={{ color: VAULT.muted, fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase" }}>MFA</th>
              <th className="text-right px-4 py-3" style={{ color: VAULT.muted, fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase" }}>Session</th>
            </tr>
          </thead>
          <tbody>
            {access.roles.map((role) => (
              <tr key={role} style={{ borderTop: `1px solid ${VAULT.border}` }}>
                <td className="px-4 py-3" style={{ color: VAULT.ink }}>{ROLE_LABEL[role]}</td>
                {access.classes.map((c) => {
                  const cell = access.cells[`${role}::${c.key}`] ?? "none";
                  return (
                    <td key={c.key} className="px-3 py-3 text-center">
                      <button onClick={() => setAccessCell(role, c.key, NEXT[cell])} title={cell} className="inline-flex items-center justify-center rounded-full h-6 w-6 transition-colors hover:bg-black/[0.04]">
                        <AccessDot level={cell} />
                      </button>
                    </td>
                  );
                })}
                <td className="px-3 py-3 text-center">
                  <button onClick={() => toggleMfa(role)} className="text-[10.5px] rounded-full px-2 py-0.5"
                    style={{
                      background: access.mfaRequired[role] ? "rgba(107,138,106,0.14)" : "rgba(30,20,32,0.06)",
                      color: access.mfaRequired[role] ? "#5F8A6A" : VAULT.muted,
                      fontFamily: "'DM Mono', ui-monospace, monospace", letterSpacing: "0.14em", textTransform: "uppercase",
                      border: `1px solid ${VAULT.border}`,
                    }}>
                    {access.mfaRequired[role] ? "required" : "optional"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right"><Data style={{ color: VAULT.muted }}>{access.sessionMinutes[role]}m</Data></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-4 flex items-center gap-4 text-[11px]" style={{ borderTop: `1px solid ${VAULT.border}`, color: VAULT.muted }}>
          <Mono style={{ color: VAULT.muted }}>Legend</Mono>
          {LEVELS.map((l) => (
            <span key={l} className="inline-flex items-center gap-1.5"><AccessDot level={l} /><span style={{ fontFamily: "'DM Mono', ui-monospace, monospace", letterSpacing: "0.14em", textTransform: "uppercase" }}>{l}</span></span>
          ))}
        </div>
      </Panel>

      <div className="mt-8 grid md:grid-cols-2 gap-5">
        <Panel className="p-5">
          <Mono style={{ color: VAULT.muted }}>Anomaly monitor</Mono>
          <div className="mt-1 text-[17px]"><Serif>Softly noticed.</Serif></div>
          <ul className="mt-3 space-y-2 text-[12.5px]" style={{ color: VAULT.ink }}>
            <li className="flex items-start gap-3"><StatusPill tone="pulse">near-miss</StatusPill><span>Firefox 120 from 203.192.14.88 accessed Isha Kapoor's chart at 03:12 IST · 9 days ago.</span></li>
            <li className="flex items-start gap-3"><StatusPill tone="warn">off-hours</StatusPill><span>Meera Nair reviewed 6 charts after 22:00 last week.</span></li>
            <li className="flex items-start gap-3"><StatusPill tone="ok">nominal</StatusPill><span>No rapid-browsing patterns detected in the last 24h.</span></li>
          </ul>
        </Panel>
        <Panel className="p-5">
          <Mono style={{ color: VAULT.muted }}>Device trust</Mono>
          <div className="mt-1 text-[17px]"><Serif>Known, remembered.</Serif></div>
          <ul className="mt-3 space-y-2 text-[12.5px]" style={{ color: VAULT.ink }}>
            {["MacBook Pro · Chrome 128 · Bengaluru", "iPhone 15 · Safari 17 · Bengaluru", "Windows Surface · Edge 128 · Mumbai (new)"].map((d, i) => (
              <li key={d} className="flex items-center gap-3">
                <StatusPill tone={i === 2 ? "warn" : "ok"}>{i === 2 ? "review" : "trusted"}</StatusPill>
                <Data style={{ color: VAULT.ink }}>{d}</Data>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
