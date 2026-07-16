import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { palette } from "@/components/practice/palette";
import { useReferrals, SOURCE_LABEL, conversionStats, type ReferralSource } from "@/lib/referrals-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/referrals/sources")({
  component: SourcesPage,
});

function SourcesPage() {
  const hydrated = useHydrated();
  const referrals = useReferrals();
  const stats = useMemo(() => conversionStats(referrals), [referrals]);
  if (!hydrated) return null;

  const sources = Object.entries(stats.bySource).sort((a, b) => b[1].count - a[1].count) as [ReferralSource, { count: number; converted: number }][];
  const max = Math.max(1, ...sources.map(([, v]) => v.count));

  const named = new Map<string, { count: number; converted: number; source: ReferralSource }>();
  for (const r of referrals.filter((x) => x.direction === "incoming")) {
    const key = r.sourceName;
    const existing = named.get(key);
    if (existing) { existing.count += 1; if (r.status === "converted") existing.converted += 1; }
    else named.set(key, { count: 1, converted: r.status === "converted" ? 1 : 0, source: r.source });
  }
  const topNamed = Array.from(named.entries()).sort((a, b) => b[1].count - a[1].count).slice(0, 10);

  return (
    <div className="max-w-[1200px] mx-auto px-5 sm:px-8 pb-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-2xl border p-5" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(14px)" }}>
          <div className="text-[11px] uppercase tracking-[0.14em] mb-4" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>By channel</div>
          {sources.map(([k, v]) => {
            const conv = v.count ? Math.round((v.converted / v.count) * 100) : 0;
            return (
              <div key={k} className="mb-4 last:mb-0">
                <div className="flex items-center justify-between text-[12px]" style={{ color: palette.ink }}>
                  <span>{SOURCE_LABEL[k]}</span>
                  <span style={{ fontFamily: "'DM Mono', ui-monospace, monospace", color: palette.muted }}>{v.count} · {conv}% conv.</span>
                </div>
                <div className="mt-1.5 h-2 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.05)" }}>
                  <div className="h-full" style={{ width: `${(v.count / max) * 100}%`, background: palette.ink }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border p-5" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(14px)" }}>
          <div className="text-[11px] uppercase tracking-[0.14em] mb-4" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Top referrers (named)</div>
          {topNamed.map(([name, v]) => {
            const conv = v.count ? Math.round((v.converted / v.count) * 100) : 0;
            return (
              <div key={name} className="grid grid-cols-[1fr_60px_80px] gap-2 py-2 border-b last:border-0" style={{ borderColor: palette.border }}>
                <div>
                  <div className="text-[13px]" style={{ color: palette.ink }}>{name}</div>
                  <div className="text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{SOURCE_LABEL[v.source]}</div>
                </div>
                <div className="text-[13px] text-right" style={{ color: palette.ink, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{v.count}</div>
                <div className="text-[11px] text-right" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{conv}% conv.</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 rounded-2xl border p-5" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(14px)" }}>
        <div className="text-[11px] uppercase tracking-[0.14em] mb-3" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Reciprocity — outbound vs inbound</div>
        <p className="text-[12px] max-w-2xl" style={{ color: palette.muted }}>
          Referrals travel both ways. A healthy practice sends about as many outbound referrals as it receives from peers. Chronic asymmetry — a peer who sends but never receives — is worth a conversation, not a spreadsheet.
        </p>
      </div>
    </div>
  );
}
