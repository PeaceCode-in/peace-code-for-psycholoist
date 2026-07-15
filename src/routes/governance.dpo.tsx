import { createFileRoute } from "@tanstack/react-router";
import { GovHeader } from "@/routes/governance";
import { useGovernance } from "@/lib/governance-store";
import { Panel, VAULT, Mono, Serif, Data, StatusPill, Glyph } from "@/components/practice/governance/primitives";

export const Route = createFileRoute("/governance/dpo")({
  component: DpoPanel,
});

function DpoPanel() {
  const g = useGovernance();
  const escalations = g.dpo.decisions.filter((d) => d.decision === "escalated");
  return (
    <div>
      <GovHeader eyebrow="Data Protection Officer" title="The quiet ratifier." sub="Every governance decision passes through here. Above threshold size, this seat is required by law." />

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-5">
        <Panel className="p-6">
          <div className="flex items-start gap-4">
            <Glyph kind="eye" size={30} color={VAULT.accent} />
            <div>
              <Mono style={{ color: VAULT.muted }}>Designated DPO</Mono>
              <div className="mt-1 text-[19px]"><Serif>{g.dpo.name}</Serif></div>
              <Data style={{ color: VAULT.muted }}>{g.dpo.contact}</Data>
              <div className="mt-1 text-[12px]" style={{ color: VAULT.muted, fontFamily: "'Fraunces', serif" }}>{g.dpo.credential}</div>
            </div>
          </div>

          {g.dpo.selfDesignated && (
            <div className="mt-5 rounded-xl p-3 text-[12px]" style={{ background: "rgba(138,118,72,0.08)", border: `1px solid rgba(138,118,72,0.24)`, color: VAULT.gold, fontFamily: "'Fraunces', serif" }}>
              You have self-designated as DPO. Above a threshold practice size, this seat is a legal role — consider appointing an independent DPO as the practice grows.
            </div>
          )}

          <div className="mt-6">
            <Mono style={{ color: VAULT.muted }}>Escalation queue</Mono>
            {escalations.length === 0 ? (
              <div className="mt-2 text-[13px]" style={{ color: VAULT.muted, fontFamily: "'Fraunces', serif" }}>No items awaiting your review.</div>
            ) : (
              <ul className="mt-2 space-y-2">
                {escalations.map((e) => (
                  <li key={e.id} className="rounded-lg p-3" style={{ background: "rgba(176,86,122,0.05)", border: `1px solid ${VAULT.border}` }}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[13px]" style={{ color: VAULT.ink }}>{e.subject}</div>
                      <StatusPill tone="pulse">escalated</StatusPill>
                    </div>
                    <div className="mt-1 text-[11.5px]" style={{ color: VAULT.muted, fontFamily: "'Fraunces', serif" }}>{e.note}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Panel>

        <Panel className="p-6">
          <Mono style={{ color: VAULT.muted }}>Decisions log</Mono>
          <div className="mt-1 text-[18px] mb-4"><Serif>Every ratification, kept.</Serif></div>
          <ul className="divide-y" style={{ borderColor: VAULT.border }}>
            {g.dpo.decisions.map((d) => (
              <li key={d.id} className="py-3 flex items-start gap-4">
                <Data style={{ color: VAULT.muted, minWidth: 110 }}>{new Date(d.at).toISOString().slice(0, 10)}</Data>
                <div className="flex-1">
                  <div className="text-[13.5px]" style={{ color: VAULT.ink }}>{d.subject}</div>
                  <div className="mt-0.5 text-[12px]" style={{ color: VAULT.muted, fontFamily: "'Fraunces', serif" }}>{d.note}</div>
                  <div className="mt-1"><Mono style={{ color: VAULT.muted }}>{d.officer}</Mono></div>
                </div>
                <StatusPill tone={d.decision === "approved" ? "ok" : d.decision === "escalated" ? "pulse" : "muted"}>{d.decision}</StatusPill>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
