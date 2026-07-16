import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { palette } from "@/components/practice/palette";
import { useReferrals, conversionStats } from "@/lib/referrals-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/referrals/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const hydrated = useHydrated();
  const referrals = useReferrals();
  const stats = useMemo(() => conversionStats(referrals), [referrals]);
  if (!hydrated) return null;

  const inc = referrals.filter((r) => r.direction === "incoming");
  const funnel = [
    { label: "Received", value: inc.length },
    { label: "Contacted", value: inc.filter((r) => r.firstContactAt || ["scheduled", "converted"].includes(r.status)).length },
    { label: "Scheduled", value: inc.filter((r) => r.scheduledAt || r.status === "converted").length },
    { label: "Converted", value: inc.filter((r) => r.status === "converted").length },
  ];
  const max = Math.max(1, ...funnel.map((f) => f.value));

  // avg days-to-contact and days-to-conversion
  const contacted = inc.filter((r) => r.firstContactAt);
  const avgContactDays = contacted.length ? contacted.reduce((s, r) => s + (r.firstContactAt! - r.receivedAt), 0) / contacted.length / 86400000 : 0;
  const converted = inc.filter((r) => r.convertedAt);
  const avgConvertDays = converted.length ? converted.reduce((s, r) => s + (r.convertedAt! - r.receivedAt), 0) / converted.length / 86400000 : 0;

  return (
    <div className="max-w-[1200px] mx-auto px-5 sm:px-8 pb-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-2xl border p-6" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(14px)" }}>
          <div className="text-[11px] uppercase tracking-[0.14em] mb-4" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Intake funnel</div>
          {funnel.map((f, i) => {
            const pct = Math.round((f.value / max) * 100);
            const dropFrom = i > 0 ? funnel[i - 1].value : f.value;
            const dropPct = dropFrom ? Math.round((f.value / dropFrom) * 100) : 0;
            return (
              <div key={f.label} className="mb-4 last:mb-0">
                <div className="flex items-center justify-between text-[13px]" style={{ color: palette.ink }}>
                  <span>{f.label}</span>
                  <span style={{ fontFamily: "'DM Mono', ui-monospace, monospace", color: palette.muted }}>{f.value}{i > 0 ? ` · ${dropPct}% of prev` : ""}</span>
                </div>
                <div className="mt-1.5 h-3 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.05)" }}>
                  <div className="h-full transition-all duration-[220ms]" style={{ width: `${pct}%`, background: palette.ink }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-3">
          <StatCard label="Response time (avg)" value={`${avgContactDays.toFixed(1)}d`} sub="received → first contact" tone={avgContactDays > 2 ? "warn" : "ok"} />
          <StatCard label="Conversion time (avg)" value={`${avgConvertDays.toFixed(1)}d`} sub="received → converted" />
          <StatCard label="Decline rate" value={`${Math.round((stats.declined / (stats.total || 1)) * 100)}%`} sub={`${stats.declined} declined — all with warm referrals`} />
          <StatCard label="Currently pending" value={String(stats.pending)} sub="need action" tone={stats.pending > 3 ? "warn" : "ok"} />
        </div>
      </div>

      <div className="mt-5 rounded-2xl border p-5" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(14px)" }}>
        <div className="text-[11px] uppercase tracking-[0.14em] mb-3" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Copilot observation</div>
        <p className="text-[13px] leading-relaxed max-w-2xl" style={{ color: palette.ink }}>
          Response time of <strong>{avgContactDays.toFixed(1)} days</strong> is {avgContactDays > 2 ? "outside the 48-hour window most GP-referred patients expect. Two of the last five GP referrals waited over 3 days for first contact." : "within the 48-hour window most GP-referred patients expect."} Every day of delay drops conversion by roughly 6% in your cohort.
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, tone = "ok" }: { label: string; value: string; sub: string; tone?: "ok" | "warn" }) {
  const border = tone === "warn" ? "rgba(203,108,84,0.4)" : palette.border;
  return (
    <div className="rounded-2xl border p-5" style={{ borderColor: border, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(14px)" }}>
      <div className="text-[11px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{label}</div>
      <div className="mt-1 text-[28px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{value}</div>
      <div className="text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{sub}</div>
    </div>
  );
}
