import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeftRight, Plus } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { useReferrals, usePeers, createReferral, updateReferralStatus, type Referral, listConnections } from "@/lib/peers-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/peers/referrals")({
  component: Referrals,
});

const STATUS_LABEL: Record<Referral["status"], string> = { open: "Open", accepted: "Accepted", declined: "Declined", closed: "Closed" };

function Referrals() {
  const hydrated = useHydrated();
  const referrals = useReferrals();
  const peers = usePeers();
  const pmap = useMemo(() => Object.fromEntries(peers.map((p) => [p.id, p])), [peers]);
  const [dir, setDir] = useState<"all" | "sent" | "received">("all");
  const [showNew, setShowNew] = useState(false);

  const filtered = dir === "all" ? referrals : referrals.filter((r) => r.direction === dir);

  if (!hydrated) return null;

  return (
    <div className="max-w-[1200px] mx-auto px-5 sm:px-8 pb-16">
      <div className="flex items-center justify-between mb-5">
        <div className="inline-flex items-center rounded-full border p-1" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
          {(["all", "sent", "received"] as const).map((k) => (
            <button key={k} onClick={() => setDir(k)} className="rounded-full px-3 py-1 text-[11px] capitalize" style={{ fontFamily: "'DM Mono', ui-monospace, monospace", background: dir === k ? palette.ink : "transparent", color: dir === k ? "#fff" : palette.muted }}>{k}</button>
          ))}
        </div>
        <button onClick={() => setShowNew(true)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px]" style={{ background: palette.ink, color: "#fff", fontFamily: "'DM Mono', ui-monospace, monospace" }}>
          <Plus className="h-3.5 w-3.5" /> Send referral
        </button>
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.7)" }}>
        <div className="grid grid-cols-[60px_1fr_1fr_180px_120px_140px] gap-3 px-4 py-2 text-[11px] uppercase tracking-[0.14em]" style={{ color: palette.muted, background: "rgba(0,0,0,0.02)", fontFamily: "'DM Mono', ui-monospace, monospace" }}>
          <div>Dir</div><div>Peer</div><div>Focus</div><div>Patient</div><div>Status</div><div>Updated</div>
        </div>
        {filtered.map((r) => {
          const p = pmap[r.counterpartId];
          return (
            <div key={r.id} className="grid grid-cols-[60px_1fr_1fr_180px_120px_140px] gap-3 px-4 py-3 border-t text-[13px] items-center" style={{ borderColor: palette.border, color: palette.ink }}>
              <div className="inline-flex items-center gap-1 text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                <ArrowLeftRight className="h-3 w-3" /> {r.direction === "sent" ? "→" : "←"}
              </div>
              <div>{p?.name ?? "—"}<div className="text-[11px]" style={{ color: palette.muted }}>{p?.city}</div></div>
              <div className="text-[13px]">{r.focus}<div className="text-[11px] italic mt-0.5" style={{ color: palette.muted }}>{r.reason}</div></div>
              <div className="text-[12px]" style={{ fontFamily: "'DM Mono', ui-monospace, monospace", color: palette.muted }}>{r.patientInitials}</div>
              <div>
                <select value={r.status} onChange={(e) => updateReferralStatus(r.id, e.target.value as Referral["status"])} className="border rounded-full px-2 py-0.5 text-[11px]" style={{ borderColor: palette.border, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                  {(Object.keys(STATUS_LABEL) as (keyof typeof STATUS_LABEL)[]).map((k) => <option key={k} value={k}>{STATUS_LABEL[k]}</option>)}
                </select>
              </div>
              <div className="text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{new Date(r.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>
            </div>
          );
        })}
        {filtered.length === 0 && <div className="p-6 text-center text-[12px]" style={{ color: palette.muted }}>No referrals.</div>}
      </div>

      {showNew && <NewReferral onClose={() => setShowNew(false)} />}
    </div>
  );
}

function NewReferral({ onClose }: { onClose: () => void }) {
  const peers = usePeers();
  const conn = listConnections().filter((c) => c.status === "connected");
  const options = peers.filter((p) => conn.some((c) => c.peerId === p.id));
  const [counterpartId, setCounterpartId] = useState(options[0]?.id ?? "");
  const [initials, setInitials] = useState("");
  const [focus, setFocus] = useState("");
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(20,20,20,0.4)" }} onClick={onClose}>
      <div className="w-full max-w-[520px] rounded-3xl border p-6" style={{ borderColor: palette.border, background: "#fff" }} onClick={(e) => e.stopPropagation()}>
        <div className="text-[11px] uppercase tracking-[0.14em] mb-3" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Send referral</div>
        <label className="text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>To peer</label>
        <select value={counterpartId} onChange={(e) => setCounterpartId(e.target.value)} className="w-full border rounded-xl px-3 py-2 text-[13px] mb-3 mt-1" style={{ borderColor: palette.border }}>
          {options.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.focus.join(", ")}</option>)}
        </select>
        <input value={initials} onChange={(e) => setInitials(e.target.value)} placeholder="Patient initials (e.g. S.M.)" className="w-full border rounded-xl px-3 py-2 text-[13px] mb-2" style={{ borderColor: palette.border, fontFamily: "'DM Mono', ui-monospace, monospace" }} />
        <input value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="Referral focus (short)" className="w-full border rounded-xl px-3 py-2 text-[13px] mb-2" style={{ borderColor: palette.border }} />
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Clinical reason — anonymised" rows={4} className="w-full border rounded-xl px-3 py-2 text-[13px] mb-3" style={{ borderColor: palette.border }} />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="text-[12px] px-3 py-1.5" style={{ color: palette.muted }}>Cancel</button>
          <button
            disabled={!counterpartId || !initials || !focus}
            onClick={() => { createReferral({ direction: "sent", counterpartId, patientInitials: initials, focus, reason, status: "open", notes: "" }); onClose(); }}
            className="rounded-full px-4 py-1.5 text-[12px] disabled:opacity-40"
            style={{ background: palette.ink, color: "#fff", fontFamily: "'DM Mono', ui-monospace, monospace" }}
          >Send</button>
        </div>
      </div>
    </div>
  );
}
