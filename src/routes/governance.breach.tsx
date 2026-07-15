import { createFileRoute } from "@tanstack/react-router";
import { GovHeader } from "@/routes/governance";
import { startBreachDrill, useGovernance, type Breach, type BreachStep } from "@/lib/governance-store";
import { Panel, VAULT, Mono, Serif, StatusPill, Data, Glyph } from "@/components/practice/governance/primitives";
import { useState } from "react";

export const Route = createFileRoute("/governance/breach")({
  component: BreachRunbook,
});

const STEPS: { key: BreachStep; label: string; body: string }[] = [
  { key: "contain",  label: "01 · Contain",  body: "Freeze affected accounts, revoke sessions, isolate integrations. The bleeding stops first." },
  { key: "assess",   label: "02 · Assess",   body: "Scope estimator: how many records, what data classes, likelihood of harm to the data principal." },
  { key: "notify",   label: "03 · Notify",   body: "Auto-draft notifications to affected patients (DPDP · within 72h), to the Data Protection Board of India, and to insurance/legal counsel." },
  { key: "document", label: "04 · Document", body: "Timeline, actions taken, evidence preserved. The ledger becomes the report." },
  { key: "learn",    label: "05 · Learn",    body: "Post-incident review. Policy updates. A quieter next quarter." },
];

function BreachRunbook() {
  const g = useGovernance();
  const [selected, setSelected] = useState<Breach | null>(g.breaches[0] ?? null);

  return (
    <div>
      <GovHeader
        eyebrow="Breach protocol"
        title="A runbook, not a document."
        sub="Five steps. Five ceremonies. Time-boxed to the letter of the DPDP Act."
        right={
          <div className="flex items-center gap-2">
            {g.breaches.some((b) => !b.closedAt) ? <StatusPill tone="pulse">Incident active</StatusPill> : <StatusPill tone="ok">No breaches. May this stay dull forever.</StatusPill>}
            <button onClick={() => setSelected(startBreachDrill())} className="rounded-full px-3.5 py-1.5 text-[11.5px]" style={{ background: VAULT.slate, color: "#fff", fontFamily: "'DM Mono', ui-monospace, monospace", letterSpacing: "0.14em", textTransform: "uppercase" }}>Simulate drill</button>
          </div>
        }
      />

      {/* Runbook rail */}
      <Panel className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
          {STEPS.map((s, i) => (
            <div key={s.key} className="p-4 relative" style={{ borderRight: i < STEPS.length - 1 ? `1px solid ${VAULT.border}` : "none" }}>
              <Mono style={{ color: VAULT.accent }}>{s.label}</Mono>
              <div className="mt-2 text-[13px]" style={{ color: VAULT.ink, fontFamily: "'Fraunces', serif", lineHeight: 1.55 }}>{s.body}</div>
              <div className="mt-3 flex items-center gap-1.5">
                <Glyph kind={i === 0 ? "bolt" : i === 1 ? "eye" : i === 2 ? "letter" : i === 3 ? "ledger" : "seal"} size={16} color={VAULT.slate} />
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-5">
        <Panel className="p-4">
          <Mono style={{ color: VAULT.muted }}>Incidents & drills</Mono>
          <ul className="mt-3 space-y-1">
            {g.breaches.map((b) => (
              <li key={b.id}>
                <button onClick={() => setSelected(b)} className="w-full text-left rounded-lg px-3 py-2.5"
                  style={{ background: selected?.id === b.id ? "rgba(176,86,122,0.08)" : "transparent", border: `1px solid ${selected?.id === b.id ? "rgba(176,86,122,0.28)" : "transparent"}` }}>
                  <div className="flex items-center justify-between gap-2">
                    <Data style={{ color: VAULT.accent }}>{b.id}</Data>
                    <StatusPill tone={b.drill ? "info" : b.closedAt ? "muted" : "pulse"}>{b.drill ? "drill" : b.closedAt ? "closed" : "active"}</StatusPill>
                  </div>
                  <div className="mt-1 text-[13px]" style={{ color: VAULT.ink }}><Serif>{b.title}</Serif></div>
                  <div className="text-[11.5px]" style={{ color: VAULT.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{new Date(b.openedAt).toISOString().slice(0, 10)}</div>
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        {selected && (
          <Panel className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <Data style={{ color: VAULT.accent }}>{selected.id}</Data>
                <h2 className="mt-1 text-[24px]"><Serif>{selected.title}</Serif></h2>
                <div className="mt-1 text-[12.5px]" style={{ color: VAULT.muted }}>Opened {new Date(selected.openedAt).toISOString().slice(0, 10)} · scope {selected.scopeRecords} record(s) · classes {selected.dataClasses.join(", ")}</div>
              </div>
              <StatusPill tone={selected.drill ? "info" : selected.severity === "elevated" ? "pulse" : "warn"}>{selected.drill ? "drill" : selected.severity}</StatusPill>
            </div>

            <div className="mt-4">
              <Mono style={{ color: VAULT.muted }}>Timeline</Mono>
              <ol className="mt-3 relative pl-5" style={{ borderLeft: `1px solid ${VAULT.border}` }}>
                {selected.timeline.map((e, i) => (
                  <li key={i} className="pb-4 relative">
                    <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full" style={{ background: VAULT.accent, opacity: 0.8 }} />
                    <Data style={{ color: VAULT.muted }}>{new Date(e.at).toISOString().replace("T", " ").slice(0, 16)}</Data>
                    <div className="text-[13px] mt-1" style={{ color: VAULT.ink, fontFamily: "'Fraunces', serif" }}>{e.note}</div>
                    <div className="mt-1"><Mono style={{ color: VAULT.accent }}>{e.step}</Mono> <span className="ml-2 text-[10.5px]" style={{ color: VAULT.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{e.actor}</span></div>
                  </li>
                ))}
              </ol>
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}
