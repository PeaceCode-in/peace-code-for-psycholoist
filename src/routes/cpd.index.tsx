import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, FileCheck2, AlertTriangle, FileWarning, Clock } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { useEntries, useCurrentCycle, summarizeCycle, CATEGORY_LABEL, TYPE_LABEL, FORMAT_LABEL, VERIFICATION_LABEL, type CpdCategory, type VerificationStatus } from "@/lib/cpd-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/cpd/")({
  component: CpdIndex,
});

type Filter = "all" | "this_cycle" | "last_cycle" | "verified" | "pending" | "missing_cert";

function CpdIndex() {
  const hydrated = useHydrated();
  const entries = useEntries();
  const cycle = useCurrentCycle();
  const [filter, setFilter] = useState<Filter>("this_cycle");
  const [categoryFilter, setCategoryFilter] = useState<CpdCategory | "">("");

  const summary = useMemo(() => summarizeCycle(entries, cycle), [entries, cycle]);

  const filtered = useMemo(() => {
    let list = entries.filter((e) => !e.retired);
    if (filter === "this_cycle" && cycle) list = list.filter((e) => e.endAt >= cycle.issueDate && e.endAt <= cycle.expiryDate);
    if (filter === "last_cycle") list = list.filter((e) => cycle && e.endAt < cycle.issueDate);
    if (filter === "verified") list = list.filter((e) => e.verification !== "self");
    if (filter === "pending") list = list.filter((e) => e.verification === "self");
    if (filter === "missing_cert") list = list.filter((e) => e.evidence.length === 0);
    if (categoryFilter) list = list.filter((e) => e.category === categoryFilter);
    return list;
  }, [entries, filter, categoryFilter, cycle]);

  if (!hydrated) return null;

  return (
    <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-16">
      {/* Header strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <StatCard label="Hours this cycle" value={summary.hoursTotal.toFixed(1)} sub={`of ${summary.hoursRequired}`} />
        <StatCard label="Complete" value={`${Math.round(summary.percent * 100)}%`} sub={summary.behind ? "behind pace" : "on pace"} tone={summary.behind ? "warn" : "ok"} />
        <StatCard label="Renewal in" value={hydrated && cycle ? `${summary.daysUntilRenewal}` : "—"} sub="days" />
        <StatCard label="Pending certificates" value={String(summary.pendingCertificates)} sub={summary.pendingCertificates ? "attach evidence" : "all attached"} tone={summary.pendingCertificates ? "warn" : "ok"} />
        <StatCard label="License" value={cycle?.licenseNumber ?? "—"} sub={cycle?.bodyLabel.split(" ").slice(0, 3).join(" ") ?? ""} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        {/* Cycle ring + category breakdown */}
        <div className="rounded-2xl border p-5" style={{ borderColor: palette.border, background: palette.glassStrong, backdropFilter: "blur(14px)" }}>
          <div className="text-[11px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Cycle progress</div>
          <Ring percent={summary.percent} behind={summary.behind} />
          <div className="text-center text-[11px] mt-2" style={{ color: palette.muted }}>
            {cycle ? `${cycle.bodyLabel} · expires ${new Date(cycle.expiryDate).toLocaleDateString()}` : "No active cycle"}
          </div>

          <div className="mt-6">
            <div className="text-[11px] uppercase tracking-[0.14em] mb-3" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>By category</div>
            {(Object.entries(summary.byCategory) as [CpdCategory, { hours: number; min: number }][]).map(([cat, v]) => (
              <CategoryBar key={cat} label={CATEGORY_LABEL[cat]} hours={v.hours} min={v.min} />
            ))}
          </div>

          <Link to="/cpd/log" className="mt-6 flex items-center justify-center gap-1.5 rounded-full py-2 text-[13px]"
            style={{ background: palette.ink, color: "#fff", fontFamily: "'DM Mono', ui-monospace, monospace" }}>
            <Plus className="h-3.5 w-3.5" /> Log training
          </Link>
        </div>

        {/* Entries */}
        <div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {(["this_cycle", "last_cycle", "all", "verified", "pending", "missing_cert"] as Filter[]).map((f) => (
              <Chip key={f} on={filter === f} onClick={() => setFilter(f)}>{FILTER_LABEL[f]}</Chip>
            ))}
            <span className="mx-2 self-center text-[11px]" style={{ color: palette.muted }}>·</span>
            <Chip on={categoryFilter === ""} onClick={() => setCategoryFilter("")}>All categories</Chip>
            {(Object.keys(CATEGORY_LABEL) as CpdCategory[]).map((c) => (
              <Chip key={c} on={categoryFilter === c} onClick={() => setCategoryFilter(c)}>{CATEGORY_LABEL[c]}</Chip>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border p-10 text-center" style={{ borderColor: palette.border, background: palette.glass }}>
              <p style={{ fontFamily: "'Fraunces', serif", color: palette.ink, fontSize: 20 }}>
                {filter === "this_cycle" && summary.hoursTotal === 0
                  ? "No hours logged this cycle. There's still time — and the first entry is the hardest."
                  : "Nothing matches this filter."}
              </p>
              <Link to="/cpd/log" className="inline-flex mt-4 items-center gap-1.5 rounded-full px-4 py-2 text-[12px]" style={{ background: palette.ink, color: "#fff" }}>
                <Plus className="h-3.5 w-3.5" /> Log training
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: palette.border, background: palette.glassStrong }}>
              {filtered.map((e, i) => (
                <Link
                  key={e.id}
                  to="/cpd/$eid"
                  params={{ eid: e.id }}
                  className="grid grid-cols-[1fr_auto] gap-3 items-baseline px-5 py-4 hover:bg-black/[.02] transition-colors duration-[150ms]"
                  style={{ borderTop: i === 0 ? "none" : `1px solid ${palette.border}` }}
                >
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="truncate" style={{ fontFamily: "'Fraunces', serif", color: palette.ink, fontSize: 16 }}>{e.title}</span>
                      {e.evidence.length === 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded" style={{ background: "#F1E9DA", color: "#7A5A18" }}>
                          <FileWarning className="h-3 w-3" /> no cert
                        </span>
                      )}
                    </div>
                    <div className="text-[12px] mt-1" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                      {e.provider} · {new Date(e.endAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })} · {TYPE_LABEL[e.type]} · {FORMAT_LABEL[e.format]}
                    </div>
                  </div>
                  <div className="text-right whitespace-nowrap">
                    <div style={{ fontFamily: "'Fraunces', serif", color: palette.ink, fontSize: 18 }}>{e.hoursClaimed}h</div>
                    <VerificationPill v={e.verification} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const FILTER_LABEL: Record<Filter, string> = {
  all: "All time",
  this_cycle: "This cycle",
  last_cycle: "Last cycle",
  verified: "Verified",
  pending: "Pending",
  missing_cert: "Missing certificate",
};

function StatCard({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "ok" | "warn" }) {
  const toneColor = tone === "warn" ? "#B85C4A" : palette.muted;
  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: palette.border, background: palette.glass, backdropFilter: "blur(12px)" }}>
      <div className="text-[10px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{label}</div>
      <div className="mt-1" style={{ fontFamily: "'Fraunces', serif", color: palette.ink, fontSize: 22 }}>{value}</div>
      {sub && <div className="text-[11px] mt-0.5" style={{ color: toneColor }}>{sub}</div>}
    </div>
  );
}

function Ring({ percent, behind }: { percent: number; behind: boolean }) {
  const r = 66, c = 2 * Math.PI * r;
  const off = c * (1 - percent);
  const stroke = behind ? "#C67560" : palette.primary;
  return (
    <div className="flex items-center justify-center mt-4">
      <svg width={160} height={160} viewBox="0 0 160 160">
        <circle cx={80} cy={80} r={r} fill="none" stroke={palette.border} strokeWidth={10} />
        <circle
          cx={80} cy={80} r={r} fill="none" stroke={stroke} strokeWidth={10} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={off}
          transform="rotate(-90 80 80)"
          style={{ transition: "stroke-dashoffset 400ms ease-out" }}
        />
        <text x={80} y={82} textAnchor="middle" style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fill: palette.ink }}>{Math.round(percent * 100)}%</text>
        <text x={80} y={102} textAnchor="middle" style={{ fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 10, fill: palette.muted }}>of cycle</text>
      </svg>
    </div>
  );
}

function CategoryBar({ label, hours, min }: { label: string; hours: number; min: number }) {
  const target = Math.max(min, hours, 1);
  const filled = Math.min(1, hours / (min || target));
  const short = min > 0 && hours < min;
  return (
    <div className="mb-3">
      <div className="flex justify-between text-[11px] mb-1" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
        <span>{label}</span>
        <span>{hours.toFixed(1)}h{min > 0 ? ` / ${min}` : ""}</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: palette.border }}>
        <div className="h-1.5 rounded-full" style={{ width: `${filled * 100}%`, background: short ? "#C67560" : palette.primary, transition: "width 300ms" }} />
      </div>
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="text-[11px] px-2.5 py-1 rounded-full border transition-all duration-[150ms]"
      style={{
        borderColor: on ? palette.ink : palette.border,
        background: on ? palette.ink : "transparent",
        color: on ? "#fff" : palette.muted,
        fontFamily: "'DM Mono', ui-monospace, monospace",
      }}
    >
      {children}
    </button>
  );
}

function VerificationPill({ v }: { v: VerificationStatus }) {
  const style: Record<VerificationStatus, { bg: string; fg: string; icon: React.ReactNode }> = {
    self: { bg: "#F1E9DA", fg: "#7A5A18", icon: <Clock className="h-2.5 w-2.5" /> },
    provider: { bg: "#E4EFE0", fg: "#3E6A2E", icon: <FileCheck2 className="h-2.5 w-2.5" /> },
    council: { bg: "#DDE7F0", fg: "#324357", icon: <FileCheck2 className="h-2.5 w-2.5" /> },
  };
  const s = style[v];
  return (
    <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded mt-1" style={{ background: s.bg, color: s.fg }}>
      {s.icon}{VERIFICATION_LABEL[v]}
    </span>
  );
}
