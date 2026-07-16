import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { GovHeader } from "@/routes/governance";
import { CONSENT_CATEGORY_LABEL, useGovernance, withdrawConsent, type Consent, type ConsentCategory, type ConsentStatus } from "@/lib/governance-store";
import { Panel, VAULT, Mono, Data, StatusPill, Serif } from "@/components/practice/governance/primitives";

export const Route = createFileRoute("/governance/consent")({
  component: ConsentLedger,
});

function ConsentLedger() {
  const g = useGovernance();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<ConsentStatus | "all">("all");
  const [selected, setSelected] = useState<Consent | null>(null);

  const rows = useMemo(() => {
    return g.consents
      .filter((c) => (status === "all" ? true : c.status === status))
      .filter((c) => (q ? (c.patientName + c.category + c.clause).toLowerCase().includes(q.toLowerCase()) : true))
      .sort((a, b) => b.givenAt - a.givenAt);
  }, [g.consents, q, status]);

  const byCat = useMemo(() => {
    const out: Record<ConsentCategory, number> = {} as Record<ConsentCategory, number>;
    for (const c of g.consents) out[c.category] = (out[c.category] ?? 0) + 1;
    return out;
  }, [g.consents]);

  return (
    <div>
      <GovHeader
        eyebrow="Consent ledger"
        title="Every yes, every withdrawal — kept."
        sub="DPDP Act 2023 categories. Verbatim clauses. Ceremonial withdrawal with cascade preview."
        right={<StatusPill tone="info">{rows.length} entries</StatusPill>}
      />

      <Panel className="p-4 mb-5">
        <div className="flex items-center gap-3 flex-wrap">
          <input
            value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search patient, category, clause…"
            className="flex-1 min-w-[240px] rounded-lg px-3 py-2 text-[13px] outline-none"
            style={{ background: palette.glassStrong, border: `1px solid ${VAULT.border}`, color: VAULT.ink }}
          />
          {(["all","active","withdrawn","expired"] as const).map((s) => (
            <button key={s} onClick={() => setStatus(s)} className="rounded-full px-3 py-1.5 text-[11.5px]"
              style={{
                background: status === s ? VAULT.accent : "transparent",
                color: status === s ? "#fff" : VAULT.muted,
                border: `1px solid ${status === s ? VAULT.accent : VAULT.border}`,
                fontFamily: "'DM Mono', ui-monospace, monospace", letterSpacing: "0.14em", textTransform: "uppercase",
              }}>{s}</button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {(Object.keys(CONSENT_CATEGORY_LABEL) as ConsentCategory[]).map((c) => (
            <span key={c} className="rounded-full px-3 py-1 text-[11.5px]" style={{ background: "rgba(30,20,32,0.04)", color: VAULT.ink, border: `1px solid ${VAULT.border}` }}>
              {CONSENT_CATEGORY_LABEL[c]} <span style={{ color: VAULT.muted, marginLeft: 6 }}>{byCat[c] ?? 0}</span>
            </span>
          ))}
        </div>
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5">
        <Panel className="overflow-hidden">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr style={{ background: "rgba(30,20,32,0.03)", color: VAULT.muted }}>
                {["Patient","Category","Method","Given","Status",""].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 font-normal" style={{ fontFamily: "'DM Mono', ui-monospace, monospace", letterSpacing: "0.14em", textTransform: "uppercase", fontSize: 10.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} onClick={() => setSelected(c)} className="cursor-pointer transition-colors hover:bg-black/[0.02]" style={{ borderTop: `1px solid ${VAULT.border}` }}>
                  <td className="px-4 py-3" style={{ color: VAULT.ink }}>{c.patientName}</td>
                  <td className="px-4 py-3" style={{ color: VAULT.ink }}>{CONSENT_CATEGORY_LABEL[c.category]}</td>
                  <td className="px-4 py-3"><Data style={{ color: VAULT.muted }}>{c.method}</Data></td>
                  <td className="px-4 py-3"><Data style={{ color: VAULT.muted }}>{new Date(c.givenAt).toISOString().slice(0, 10)}</Data></td>
                  <td className="px-4 py-3">
                    <StatusPill tone={c.status === "active" ? "ok" : c.status === "withdrawn" ? "pulse" : "muted"}>{c.status}</StatusPill>
                  </td>
                  <td className="px-4 py-3 text-right" style={{ color: VAULT.muted, fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 11 }}>›</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center" style={{ color: VAULT.muted, fontFamily: "'Fraunces', serif" }}>No consents match.</td></tr>
              )}
            </tbody>
          </table>
        </Panel>

        <ConsentDetail c={selected} onWithdraw={(reason) => selected && withdrawConsent(selected.id, reason, Date.now())} />
      </div>
    </div>
  );
}

function ConsentDetail({ c, onWithdraw }: { c: Consent | null; onWithdraw: (r: string) => void }) {
  const [reason, setReason] = useState("");
  if (!c) return (
    <Panel className="p-6"><Mono style={{ color: VAULT.muted }}>Detail</Mono><div className="mt-4 text-[13px]" style={{ color: VAULT.muted, fontFamily: "'Fraunces', serif" }}>Select a row to see the verbatim clause and lifecycle.</div></Panel>
  );
  return (
    <Panel className="p-5">
      <Mono style={{ color: VAULT.muted }}>Consent</Mono>
      <div className="mt-1 text-[17px]"><Serif>{CONSENT_CATEGORY_LABEL[c.category]}</Serif></div>
      <div className="mt-0.5 text-[12.5px]" style={{ color: VAULT.muted }}>{c.patientName}</div>

      <div className="mt-4 rounded-xl p-4" style={{ background: "rgba(30,20,32,0.03)", border: `1px solid ${VAULT.border}` }}>
        <Mono style={{ color: VAULT.muted }}>Verbatim clause</Mono>
        <p className="mt-2 text-[13.5px]" style={{ color: VAULT.ink, fontFamily: "'Fraunces', serif", lineHeight: 1.6 }}>{c.clause}</p>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-[12px]">
        <Row k="Given" v={new Date(c.givenAt).toLocaleString()} />
        <Row k="Method" v={c.method} />
        <Row k="IP" v={c.ip ?? "—"} />
        <Row k="Status" v={c.status} />
        {c.withdrawnAt && <Row k="Withdrawn" v={new Date(c.withdrawnAt).toLocaleString()} />}
        {c.withdrawReason && <Row k="Reason" v={c.withdrawReason} full />}
      </dl>

      {c.status === "active" && (
        <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${VAULT.border}` }}>
          <Mono style={{ color: VAULT.muted }}>Withdraw · ceremony</Mono>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3}
            placeholder="Reason for withdrawal (recorded in ledger)…"
            className="mt-2 w-full rounded-lg px-3 py-2 text-[13px] outline-none"
            style={{ background: palette.glassStrong, border: `1px solid ${VAULT.border}`, color: VAULT.ink, fontFamily: "'Fraunces', serif" }}
          />
          <div className="mt-2 rounded-lg p-3 text-[11.5px]" style={{ background: "rgba(176,86,122,0.06)", border: `1px solid ${VAULT.border}`, color: VAULT.muted }}>
            <span style={{ color: VAULT.pulse, fontFamily: "'DM Mono', ui-monospace, monospace" }}>CASCADE PREVIEW · </span>
            withdrawing <b style={{ color: VAULT.ink }}>{CONSENT_CATEGORY_LABEL[c.category]}</b> for {c.patientName} will remove access from downstream systems that depend on this purpose.
          </div>
          <button
            disabled={!reason.trim()}
            onClick={() => { onWithdraw(reason); setReason(""); }}
            className="mt-3 w-full rounded-lg px-4 py-2.5 text-[13px] disabled:opacity-40"
            style={{ background: VAULT.accent, color: "#fff" }}
          >
            Withdraw consent
          </button>
        </div>
      )}
    </Panel>
  );
}

function Row({ k, v, full }: { k: string; v: string; full?: boolean }) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <div style={{ color: VAULT.muted, fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase" }}>{k}</div>
      <div className="mt-0.5" style={{ color: VAULT.ink }}>{v}</div>
    </div>
  );
}
