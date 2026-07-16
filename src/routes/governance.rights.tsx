import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GovHeader } from "@/routes/governance";
import { advanceRight, useGovernance, type RightsRequest, type RightKind, type RightStatus } from "@/lib/governance-store";
import { Panel, VAULT, Mono, Serif, StatusPill, Data, Glyph } from "@/components/practice/governance/primitives";

export const Route = createFileRoute("/governance/rights")({
  component: RightsCenter,
});

const KIND_LABEL: Record<RightKind, string> = { access: "Right to Access", correction: "Right to Correction", portability: "Right to Portability", erasure: "Right to Erasure" };
const KIND_GLYPH: Record<RightKind, Parameters<typeof Glyph>[0]["kind"]> = { access: "ledger", correction: "letter", portability: "vault", erasure: "bolt" };

function RightsCenter() {
  const g = useGovernance();
  const [selected, setSelected] = useState<RightsRequest | null>(g.rights.find((r) => r.kind === "erasure") ?? g.rights[0] ?? null);

  const open = g.rights.filter((r) => r.status !== "fulfilled" && r.status !== "refused");
  const closed = g.rights.filter((r) => r.status === "fulfilled" || r.status === "refused");

  return (
    <div>
      <GovHeader
        eyebrow="Patient rights"
        title="Four ceremonies, thirty days."
        sub="Every DPDP right lives here: access, correction, portability, erasure. Each request opens a case number and starts a countdown."
        right={<StatusPill tone={open.length ? "pulse" : "ok"}>{open.length} in flight</StatusPill>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-5">
        <div>
          <Panel className="p-4">
            <Mono style={{ color: VAULT.muted }}>Queue</Mono>
            <ul className="mt-2 space-y-1">
              {[...open, ...closed].map((r) => (
                <li key={r.id}>
                  <button onClick={() => setSelected(r)} className="w-full text-left rounded-lg px-3 py-2.5 transition-colors"
                    style={{ background: selected?.id === r.id ? "rgba(176,86,122,0.08)" : "transparent", border: `1px solid ${selected?.id === r.id ? "rgba(176,86,122,0.28)" : "transparent"}` }}>
                    <div className="flex items-center justify-between gap-2">
                      <Data style={{ color: VAULT.accent }}>{r.id}</Data>
                      <StatusPill tone={r.status === "fulfilled" ? "ok" : r.status === "refused" ? "muted" : r.status === "reviewing" ? "warn" : "info"}>{r.status}</StatusPill>
                    </div>
                    <div className="mt-1 text-[13px]" style={{ color: VAULT.ink }}><Serif>{KIND_LABEL[r.kind]}</Serif></div>
                    <div className="text-[11.5px]" style={{ color: VAULT.muted }}>{r.patientName}</div>
                  </button>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        {selected && <Ceremony key={selected.id} r={selected} />}
      </div>
    </div>
  );
}

function Ceremony({ r }: { r: RightsRequest }) {
  const [reason, setReason] = useState("");
  const [refusal, setRefusal] = useState("");
  const daysLeft = Math.max(0, Math.round((r.slaDueAt - Date.now()) / 86_400_000));
  const steps = [
    { n: 1, label: "Intake",  detail: "Request received. Scope captured. Countdown begins." },
    { n: 2, label: "Review",  detail: "You verify identity, refine scope, and check for legal holds or clinical necessity." },
    { n: 3, label: "Deliver", detail: r.kind === "erasure" ? "Cascade preview, soft delete (30-day grace), then hard delete with cryptographic tombstone." : "Signed packet generated and delivered via the patient portal." },
  ];

  return (
    <Panel className="p-7">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-start gap-4">
          <Glyph kind={KIND_GLYPH[r.kind]} size={30} color={VAULT.accent} />
          <div>
            <Data style={{ color: VAULT.accent }}>{r.id}</Data>
            <h2 className="mt-1 text-[26px] leading-tight"><Serif>{KIND_LABEL[r.kind]}</Serif></h2>
            <div className="text-[13px] mt-0.5" style={{ color: VAULT.muted }}>Requested by {r.patientName} on {new Date(r.openedAt).toISOString().slice(0, 10)}</div>
          </div>
        </div>
        <div className="text-right">
          <StatusPill tone={daysLeft < 7 ? "pulse" : "info"}>SLA · {daysLeft}d left</StatusPill>
          <div className="mt-1.5 text-[10.5px]" style={{ color: VAULT.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Due {new Date(r.slaDueAt).toISOString().slice(0, 10)}</div>
        </div>
      </div>

      {/* Step rail */}
      <div className="mb-6 flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.n} className="flex items-center gap-2 flex-1">
            <div className="h-5 w-5 rounded-full flex items-center justify-center text-[10px]" style={{
              background: r.step >= s.n ? VAULT.accent : "rgba(30,20,32,0.06)",
              color: r.step >= s.n ? "#fff" : VAULT.muted,
              fontFamily: "'DM Mono', ui-monospace, monospace",
            }}>{s.n}</div>
            <Mono style={{ color: r.step >= s.n ? VAULT.ink : VAULT.muted }}>{s.label}</Mono>
            {i < steps.length - 1 && <div className="flex-1 h-px" style={{ background: r.step > s.n ? VAULT.accent : VAULT.border }} />}
          </div>
        ))}
      </div>

      <div className="rounded-2xl p-5" style={{ background: "rgba(30,20,32,0.03)", border: `1px solid ${VAULT.border}` }}>
        <Mono style={{ color: VAULT.muted }}>Step {r.step} of 3 · {steps[r.step - 1].label}</Mono>
        <p className="mt-2 text-[14px]" style={{ color: VAULT.ink, fontFamily: "'Fraunces', serif", lineHeight: 1.6 }}>{steps[r.step - 1].detail}</p>

        {r.kind === "erasure" && r.step === 2 && (
          <div className="mt-4 rounded-xl p-4" style={{ background: "rgba(176,86,122,0.06)", border: `1px dashed rgba(176,86,122,0.4)` }}>
            <Mono style={{ color: VAULT.pulse }}>Cascade preview</Mono>
            <ul className="mt-2 space-y-1 text-[12.5px]" style={{ color: VAULT.ink }}>
              {[
                ["patients", "1 record (soft-delete, 30-day grace)"],
                ["notes", "14 SOAP notes (soft-delete)"],
                ["assessments", "6 results (soft-delete)"],
                ["documents", "4 signed artifacts (retained per legal basis — see policy)"],
                ["billing", "3 invoices (retained · Income Tax Act 8yr)"],
                ["messages", "22 messages (soft-delete)"],
                ["audit_log", "kept · immutable"],
              ].map(([k, v]) => (
                <li key={k} className="flex items-baseline gap-3">
                  <Data style={{ color: VAULT.accent, minWidth: 110 }}>{k}</Data>
                  <span>{v}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 text-[11.5px]" style={{ color: VAULT.muted, fontFamily: "'Fraunces', serif" }}>
              A cryptographic tombstone (SHA-256 hash of erased content + timestamp) will replace each soft-deleted record after grace expires.
            </div>
          </div>
        )}
      </div>

      {r.status !== "fulfilled" && r.status !== "refused" && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl p-4" style={{ background: palette.glass, border: `1px solid ${VAULT.border}` }}>
            <Mono style={{ color: VAULT.muted }}>Advance</Mono>
            <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Note for the ledger (optional)" className="mt-2 w-full rounded-lg px-3 py-2 text-[13px] outline-none" style={{ background: palette.glassStrong, border: `1px solid ${VAULT.border}` }} />
            <button
              onClick={() => advanceRight(r.id, r.step >= 3 ? { status: "fulfilled" } : { step: (r.step + 1) as 1 | 2 | 3, status: "reviewing" as RightStatus, reason })}
              className="mt-3 w-full rounded-lg px-4 py-2.5 text-[13px]"
              style={{ background: VAULT.accent, color: "#fff" }}
            >
              {r.step >= 3 ? "Mark fulfilled" : `Advance to step ${r.step + 1}`}
            </button>
          </div>
          <div className="rounded-xl p-4" style={{ background: palette.glass, border: `1px solid ${VAULT.border}` }}>
            <Mono style={{ color: VAULT.muted }}>Refuse — with reason</Mono>
            <textarea value={refusal} onChange={(e) => setRefusal(e.target.value)} rows={2} placeholder="Legal hold, clinical necessity, incomplete verification…" className="mt-2 w-full rounded-lg px-3 py-2 text-[13px] outline-none" style={{ background: palette.glassStrong, border: `1px solid ${VAULT.border}`, fontFamily: "'Fraunces', serif" }} />
            <button
              disabled={!refusal.trim()}
              onClick={() => advanceRight(r.id, { status: "refused", refusalReason: refusal })}
              className="mt-2 w-full rounded-lg px-4 py-2.5 text-[13px] disabled:opacity-40"
              style={{ background: VAULT.slate, color: "#fff" }}
            >
              Refuse (logged)
            </button>
          </div>
        </div>
      )}

      {(r.status === "fulfilled" || r.status === "refused") && (
        <div className="mt-5 rounded-xl p-4" style={{ background: "rgba(107,138,106,0.06)", border: `1px solid ${VAULT.border}` }}>
          <Mono style={{ color: VAULT.muted }}>Closed</Mono>
          <div className="mt-1 text-[13px]" style={{ color: VAULT.ink, fontFamily: "'Fraunces', serif" }}>
            {r.status === "refused" ? `Refused — ${r.refusalReason ?? "no reason recorded"}.` : "Fulfilled. Signed manifest archived to the compliance journal."}
          </div>
        </div>
      )}
    </Panel>
  );
}
