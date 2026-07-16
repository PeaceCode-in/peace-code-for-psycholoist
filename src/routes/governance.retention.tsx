import { createFileRoute } from "@tanstack/react-router";
import { GovHeader } from "@/routes/governance";
import { updateRetention, useGovernance, releaseLegalHold, type DataClass } from "@/lib/governance-store";
import { Panel, VAULT, Mono, Serif, StatusPill, Data, Glyph } from "@/components/practice/governance/primitives";
import { useState } from "react";

export const Route = createFileRoute("/governance/retention")({
  component: Retention,
});

function Retention() {
  const g = useGovernance();
  const [editing, setEditing] = useState<DataClass | null>(null);
  const [draft, setDraft] = useState<number>(0);

  function commit(cls: DataClass) {
    updateRetention(cls, { windowDays: Math.max(1, Math.round(draft)) });
    setEditing(null);
  }

  return (
    <div>
      <GovHeader
        eyebrow="Retention"
        title="Every window, ticking."
        sub="Indian medical-record norms as defaults. Records past the edge queue for your ratification — nothing purges silently."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {g.retention.map((p) => {
          const years = (p.windowDays / 365).toFixed(p.windowDays >= 365 ? 0 : 1);
          const isEditing = editing === p.dataClass;
          return (
            <Panel key={p.dataClass} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <Mono style={{ color: VAULT.muted }}>{p.dataClass}</Mono>
                  <div className="mt-1 text-[18px]"><Serif>{p.label}</Serif></div>
                  <div className="mt-1 text-[12px]" style={{ color: VAULT.muted, fontFamily: "'Fraunces', serif" }}>{p.legalBasis}</div>
                </div>
                <Glyph kind="clock" size={22} color={VAULT.accent} />
              </div>

              <div className="mt-5 flex items-baseline gap-4">
                {isEditing ? (
                  <input type="number" value={draft} onChange={(e) => setDraft(Number(e.target.value))} className="w-28 rounded-lg px-2 py-1 text-[18px] outline-none" style={{ border: `1px solid ${VAULT.accent}`, background: palette.glassStrong }} />
                ) : (
                  <div className="text-[32px] leading-none" style={{ color: VAULT.ink, fontFamily: "'Fraunces', serif" }}>
                    {p.windowDays >= 365 ? `${years} ` : `${p.windowDays} `}
                    <span className="text-[13px]" style={{ color: VAULT.muted, fontFamily: "'DM Mono', ui-monospace, monospace", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                      {p.windowDays >= 365 ? "years" : "days"}
                    </span>
                  </div>
                )}
                <div className="ml-auto text-right">
                  <div className="text-[10.5px]" style={{ color: VAULT.muted, fontFamily: "'DM Mono', ui-monospace, monospace", letterSpacing: "0.14em", textTransform: "uppercase" }}>Aging (60d)</div>
                  <div className="text-[16px]" style={{ color: VAULT.ink }}>{p.agingCount}</div>
                </div>
              </div>

              {/* Live counter bar */}
              <div className="mt-4 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(30,20,32,0.06)" }}>
                <div style={{ width: `${Math.min(100, (p.agingCount / Math.max(p.agingCount + 30, 30)) * 100)}%`, background: `linear-gradient(90deg, ${VAULT.accent}, ${VAULT.gold})`, height: "100%" }} />
              </div>

              <div className="mt-4 flex items-center justify-between">
                {p.reviewQueue > 0 ? (
                  <StatusPill tone="pulse">{p.reviewQueue} awaiting review</StatusPill>
                ) : (
                  <StatusPill tone="ok">Nothing to review</StatusPill>
                )}
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <button onClick={() => setEditing(null)} className="text-[11.5px]" style={{ color: VAULT.muted, fontFamily: "'DM Mono', ui-monospace, monospace", letterSpacing: "0.14em", textTransform: "uppercase" }}>cancel</button>
                      <button onClick={() => commit(p.dataClass)} className="rounded-full px-3.5 py-1.5 text-[11.5px]" style={{ background: VAULT.accent, color: "#fff", fontFamily: "'DM Mono', ui-monospace, monospace", letterSpacing: "0.14em", textTransform: "uppercase" }}>save</button>
                    </>
                  ) : (
                    <button onClick={() => { setEditing(p.dataClass); setDraft(p.windowDays); }} className="text-[11.5px]" style={{ color: VAULT.accent, fontFamily: "'DM Mono', ui-monospace, monospace", letterSpacing: "0.14em", textTransform: "uppercase" }}>adjust window</button>
                  )}
                </div>
              </div>

              <div className="mt-4 text-[10.5px]" style={{ color: VAULT.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                Last change · {new Date(p.editedAt).toISOString().slice(0, 10)}{p.editedBy ? ` · ${p.editedBy}` : ""}
              </div>
            </Panel>
          );
        })}
      </div>

      {/* Legal holds */}
      <div className="mt-8">
        <Mono style={{ color: VAULT.muted }}>Legal holds</Mono>
        <div className="mt-1 text-[18px] mb-3"><Serif>Windows paused, with reason.</Serif></div>
        <Panel className="p-5">
          {g.legalHolds.length === 0 ? (
            <div className="text-[13px]" style={{ color: VAULT.muted, fontFamily: "'Fraunces', serif" }}>No active holds.</div>
          ) : (
            <ul className="divide-y" style={{ borderColor: VAULT.border }}>
              {g.legalHolds.map((h) => (
                <li key={h.id} className="py-3 flex items-start gap-4">
                  <Data style={{ color: VAULT.muted, minWidth: 110 }}>{new Date(h.appliedAt).toISOString().slice(0, 10)}</Data>
                  <div className="flex-1">
                    <div className="text-[13.5px]" style={{ color: VAULT.ink }}>{h.patientName}</div>
                    <div className="mt-0.5 text-[12px]" style={{ color: VAULT.muted, fontFamily: "'Fraunces', serif" }}>{h.reason}</div>
                    <div className="mt-1 text-[10.5px]" style={{ color: VAULT.muted, fontFamily: "'DM Mono', ui-monospace, monospace", letterSpacing: "0.14em" }}>Applied by {h.appliedBy}</div>
                  </div>
                  {h.releasedAt ? <StatusPill tone="muted">Released</StatusPill> : (
                    <button onClick={() => releaseLegalHold(h.id)} className="text-[11.5px]" style={{ color: VAULT.accent, fontFamily: "'DM Mono', ui-monospace, monospace", letterSpacing: "0.14em", textTransform: "uppercase" }}>release</button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
