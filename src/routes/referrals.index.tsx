import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, ArrowLeft, AlertOctagon, Clock, CheckCircle2, XCircle } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { useReferrals, SOURCE_LABEL, STATUS_LABEL, type ReferralStatus, type ReferralDirection, conversionStats } from "@/lib/referrals-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/referrals/")({
  component: ReferralsIndex,
});

const URGENCY_TONE: Record<string, { color: string; bg: string }> = {
  urgent: { color: "#B85A3E", bg: "rgba(184,90,62,0.10)" },
  priority: { color: "#8a6d1e", bg: "rgba(203,167,66,0.14)" },
  routine: { color: "#3a3a3a", bg: "rgba(0,0,0,0.04)" },
};

function ReferralsIndex() {
  const hydrated = useHydrated();
  const referrals = useReferrals();
  const [dir, setDir] = useState<"all" | ReferralDirection>("all");
  const [status, setStatus] = useState<"all" | ReferralStatus>("all");

  const stats = useMemo(() => conversionStats(referrals), [referrals]);
  const filtered = referrals
    .filter((r) => dir === "all" || r.direction === dir)
    .filter((r) => status === "all" || r.status === status);

  if (!hydrated) return null;

  return (
    <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-16">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label="Incoming · 30d" value={String(referrals.filter((r) => r.direction === "incoming" && r.receivedAt > Date.now() - 30 * 86400000).length)} sub={`${stats.pending} pending response`} tone={stats.pending ? "warn" : "ok"} />
        <Stat label="Conversion rate" value={`${stats.rate}%`} sub={`${stats.converted} converted / ${stats.total} received`} />
        <Stat label="Urgent open" value={String(referrals.filter((r) => r.direction === "incoming" && r.urgency === "urgent" && r.status !== "converted" && r.status !== "declined" && r.status !== "closed").length)} sub="action within 24h" tone="warn" />
        <Stat label="Outgoing this quarter" value={String(referrals.filter((r) => r.direction === "outgoing" && r.receivedAt > Date.now() - 90 * 86400000).length)} sub="warm handoffs" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center rounded-full border p-1" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
            {(["all", "incoming", "outgoing"] as const).map((k) => (
              <button key={k} onClick={() => setDir(k)} className="rounded-full px-3 py-1 text-[11px] capitalize" style={{ fontFamily: "'DM Mono', ui-monospace, monospace", background: dir === k ? palette.ink : "transparent", color: dir === k ? "#fff" : palette.muted }}>{k}</button>
            ))}
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value as "all" | ReferralStatus)} className="border rounded-full px-3 py-1.5 text-[11px]" style={{ borderColor: palette.border, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
            <option value="all">All statuses</option>
            {(Object.keys(STATUS_LABEL) as ReferralStatus[]).map((k) => <option key={k} value={k}>{STATUS_LABEL[k]}</option>)}
          </select>
        </div>
        <div className="text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{filtered.length} shown</div>
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.7)" }}>
        <div className="grid grid-cols-[48px_1fr_1.4fr_140px_120px_100px_100px] gap-3 px-4 py-2 text-[11px] uppercase tracking-[0.14em]" style={{ color: palette.muted, background: "rgba(0,0,0,0.02)", fontFamily: "'DM Mono', ui-monospace, monospace" }}>
          <div>Dir</div><div>Source</div><div>Patient / presenting</div><div>Urgency</div><div>Status</div><div>Received</div><div>Convert</div>
        </div>
        {filtered.map((r) => {
          const tone = URGENCY_TONE[r.urgency];
          return (
            <Link key={r.id} to="/referrals/$rid" params={{ rid: r.id }} className="grid grid-cols-[48px_1fr_1.4fr_140px_120px_100px_100px] gap-3 px-4 py-3 border-t items-center text-[13px] hover:bg-black/[0.02] transition-colors" style={{ borderColor: palette.border, color: palette.ink }}>
              <div style={{ color: palette.muted }}>{r.direction === "incoming" ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}</div>
              <div>
                <div>{r.sourceName}</div>
                <div className="text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{SOURCE_LABEL[r.source]}</div>
              </div>
              <div>
                <div>{r.patientName} <span className="text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>· {r.patientInitials}</span></div>
                <div className="text-[11px] line-clamp-1" style={{ color: palette.muted }}>{r.presenting}</div>
              </div>
              <div>
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]" style={{ background: tone.bg, color: tone.color, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                  {r.urgency === "urgent" && <AlertOctagon className="h-3 w-3" />} {r.urgency}
                </span>
              </div>
              <div className="text-[12px]" style={{ fontFamily: "'DM Mono', ui-monospace, monospace", color: palette.ink }}>{STATUS_LABEL[r.status]}</div>
              <div className="text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{new Date(r.receivedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>
              <div>
                {r.status === "converted" ? <CheckCircle2 className="h-4 w-4" style={{ color: "#3B7A57" }} /> :
                  r.status === "declined" ? <XCircle className="h-4 w-4" style={{ color: palette.muted }} /> :
                  <Clock className="h-4 w-4" style={{ color: palette.muted }} />}
              </div>
            </Link>
          );
        })}
        {filtered.length === 0 && <div className="p-8 text-center text-[12px]" style={{ color: palette.muted }}>No referrals match.</div>}
      </div>
    </div>
  );
}

function Stat({ label, value, sub, tone = "ok" }: { label: string; value: string; sub: string; tone?: "ok" | "warn" }) {
  const border = tone === "warn" ? "rgba(203,108,84,0.4)" : palette.border;
  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: border, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(14px)" }}>
      <div className="text-[11px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{label}</div>
      <div className="mt-1 text-[24px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{value}</div>
      <div className="text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{sub}</div>
    </div>
  );
}
