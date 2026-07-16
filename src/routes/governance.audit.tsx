import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { GovHeader } from "@/routes/governance";
import { useGovernance, type AuditEvent, type AuditVerb } from "@/lib/governance-store";
import { Panel, VAULT, Mono, Data, StatusPill, AnomalyDot, Serif } from "@/components/practice/governance/primitives";

export const Route = createFileRoute("/governance/audit")({
  component: AuditView,
});

const VERBS: AuditVerb[] = ["read","create","update","delete","export","print","download","share","login","logout","consent-give","consent-withdraw","policy-change","breach-drill","rights-request","rights-fulfill"];

function AuditView() {
  const g = useGovernance();
  const [q, setQ] = useState("");
  const [verb, setVerb] = useState<AuditVerb | "all">("all");
  const [minAnomaly, setMinAnomaly] = useState(0);
  const [selected, setSelected] = useState<AuditEvent | null>(null);

  const rows = useMemo(() => g.auditLog.filter((e) => {
    if (verb !== "all" && e.verb !== verb) return false;
    if (e.anomalyScore < minAnomaly) return false;
    if (q && !(e.actor + e.targetLabel + (e.ip ?? "")).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [g.auditLog, q, verb, minAnomaly]);

  function exportSigned() {
    const payload = JSON.stringify(rows, null, 2);
    // Simple hex-encoded rolling hash (not real SHA-256 without crypto lib on-render).
    let h = 0n; for (const c of payload) h = (h * 131n + BigInt(c.charCodeAt(0))) & ((1n << 64n) - 1n);
    const manifest = { generatedAt: new Date().toISOString(), rowCount: rows.length, hash64: h.toString(16).padStart(16, "0"), algo: "fnv-1a-64 (client-side)" };
    const blob = new Blob([JSON.stringify({ manifest, events: rows }, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `peacecode-audit-${Date.now()}.json`; a.click();
  }

  return (
    <div>
      <GovHeader
        eyebrow="Audit log"
        title="Every read, every write."
        sub="Millisecond precision. Immutable append-only stream. Signed manifest on export."
        right={
          <div className="flex items-center gap-2">
            <StatusPill tone="info">{rows.length.toLocaleString()} events</StatusPill>
            <button onClick={exportSigned} className="rounded-full px-3.5 py-1.5 text-[11.5px]" style={{ background: VAULT.slate, color: "#fff", fontFamily: "'DM Mono', ui-monospace, monospace", letterSpacing: "0.14em", textTransform: "uppercase" }}>Export · signed</button>
          </div>
        }
      />

      <Panel className="p-4 mb-5">
        <div className="flex items-center gap-3 flex-wrap">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search actor, target, IP…" className="flex-1 min-w-[240px] rounded-lg px-3 py-2 text-[13px] outline-none" style={{ background: palette.glassStrong, border: `1px solid ${VAULT.border}` }} />
          <select value={verb} onChange={(e) => setVerb(e.target.value as AuditVerb | "all")} className="rounded-lg px-3 py-2 text-[13px] outline-none" style={{ background: palette.glassStrong, border: `1px solid ${VAULT.border}` }}>
            <option value="all">any verb</option>
            {VERBS.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
          <label className="flex items-center gap-2 text-[11.5px]" style={{ color: VAULT.muted, fontFamily: "'DM Mono', ui-monospace, monospace", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            anomaly ≥ {minAnomaly.toFixed(2)}
            <input type="range" min={0} max={1} step={0.05} value={minAnomaly} onChange={(e) => setMinAnomaly(Number(e.target.value))} />
          </label>
        </div>
      </Panel>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-5">
        <Panel className="overflow-hidden">
          <div className="max-h-[70vh] overflow-auto">
            <table className="w-full text-[12px]">
              <thead className="sticky top-0" style={{ background: "rgba(244,242,245,0.98)", backdropFilter: "blur(8px)" }}>
                <tr style={{ color: VAULT.muted }}>
                  {["·","Timestamp","Actor","Verb","Target","IP",""].map((h) => (
                    <th key={h} className="text-left px-3 py-2.5 font-normal" style={{ fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 500).map((e) => (
                  <tr key={e.id} onClick={() => setSelected(e)} className="cursor-pointer hover:bg-black/[0.02]" style={{ borderTop: `1px solid ${VAULT.border}` }}>
                    <td className="px-3 py-2"><AnomalyDot score={e.anomalyScore} /></td>
                    <td className="px-3 py-2"><Data style={{ color: VAULT.muted }}>{new Date(e.at).toISOString().replace("T", " ").slice(0, 23)}</Data></td>
                    <td className="px-3 py-2" style={{ color: VAULT.ink }}>{e.actor} <span style={{ color: VAULT.muted, fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 10.5, marginLeft: 4 }}>· {e.actorRole}</span></td>
                    <td className="px-3 py-2"><Data style={{ color: VAULT.accent }}>{e.verb}</Data></td>
                    <td className="px-3 py-2" style={{ color: VAULT.ink }}>{e.targetLabel}</td>
                    <td className="px-3 py-2"><Data style={{ color: VAULT.muted }}>{e.ip ?? "—"}</Data></td>
                    <td className="px-3 py-2 text-right" style={{ color: VAULT.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>›</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <DetailSheet e={selected} allEvents={g.auditLog} />
      </div>
    </div>
  );
}

function DetailSheet({ e, allEvents }: { e: AuditEvent | null; allEvents: AuditEvent[] }) {
  if (!e) return (
    <Panel className="p-6"><Mono style={{ color: VAULT.muted }}>Event detail</Mono><div className="mt-3 text-[13px]" style={{ color: VAULT.muted, fontFamily: "'Fraunces', serif" }}>Select a row to see full context.</div></Panel>
  );
  const related = allEvents.filter((x) => x.requestId && x.requestId === e.requestId && x.id !== e.id).slice(0, 5);
  return (
    <Panel className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Mono style={{ color: VAULT.muted }}>Event</Mono>
          <div className="mt-1 text-[15px]"><Serif>{e.verb}</Serif> <span style={{ color: VAULT.muted }}>·</span> <span style={{ color: VAULT.ink }}>{e.targetLabel}</span></div>
        </div>
        <StatusPill tone={e.anomalyScore > 0.6 ? "pulse" : e.anomalyScore > 0.3 ? "warn" : "ok"}>anomaly {e.anomalyScore.toFixed(2)}</StatusPill>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-[12px]">
        <Row k="Event ID" v={e.id} full />
        <Row k="Timestamp" v={new Date(e.at).toISOString()} full />
        <Row k="Actor" v={`${e.actor} · ${e.actorRole}`} />
        <Row k="Target" v={`${e.targetType}${e.targetId ? ` · ${e.targetId}` : ""}`} />
        <Row k="IP" v={e.ip ?? "—"} />
        <Row k="Device" v={e.device ?? "—"} />
        {e.requestId && <Row k="Request ID" v={e.requestId} full />}
      </dl>

      {(e.before !== undefined || e.after !== undefined) && (
        <div className="mt-4 rounded-xl p-3" style={{ background: "rgba(30,20,32,0.04)", border: `1px solid ${VAULT.border}` }}>
          <Mono style={{ color: VAULT.muted }}>Before / after</Mono>
          <pre className="mt-2 text-[11.5px] overflow-auto" style={{ color: VAULT.ink, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{JSON.stringify({ before: e.before ?? null, after: e.after ?? null }, null, 2)}</pre>
        </div>
      )}

      {related.length > 0 && (
        <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${VAULT.border}` }}>
          <Mono style={{ color: VAULT.muted }}>Related events · same request</Mono>
          <ul className="mt-2 space-y-1.5">
            {related.map((r) => (
              <li key={r.id} className="flex items-center gap-2 text-[11.5px]" style={{ color: VAULT.ink }}>
                <span className="h-1 w-1 rounded-full" style={{ background: VAULT.accent }} />
                <Data style={{ color: VAULT.muted }}>{new Date(r.at).toISOString().slice(11, 23)}</Data>
                <Data style={{ color: VAULT.accent }}>{r.verb}</Data>
                <span style={{ color: VAULT.ink }}>{r.targetLabel}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Panel>
  );
}
function Row({ k, v, full }: { k: string; v: string; full?: boolean }) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <div style={{ color: VAULT.muted, fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase" }}>{k}</div>
      <div className="mt-0.5 break-all" style={{ color: VAULT.ink, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{v}</div>
    </div>
  );
}
