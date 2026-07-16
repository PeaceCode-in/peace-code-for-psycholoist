import { createFileRoute } from "@tanstack/react-router";
import { palette } from "@/components/practice/palette";
import { useLivePieces } from "@/lib/library-store";
import { useHydrated } from "@/lib/use-hydrated";
import { Eye, TrendingUp, Share2, Heart } from "lucide-react";

export const Route = createFileRoute("/library/analytics")({ component: Analytics });

function Analytics() {
  const hydrated = useHydrated();
  const pieces = useLivePieces();
  if (!hydrated) return <div className="max-w-[1400px] mx-auto px-8 py-16 text-[11px] uppercase tracking-[0.14em]" style={{ color: palette.muted }}>Loading…</div>;
  const published = pieces.filter((p) => p.status === "published");
  const totalViews = published.reduce((s, p) => s + p.analytics.views, 0);
  const totalHelpful = published.reduce((s, p) => s + p.analytics.helpful, 0);
  const totalShares = published.reduce((s, p) => s + p.analytics.shares, 0);
  const avgComp = published.length ? Math.round(published.reduce((s, p) => s + p.analytics.avgScrollPct, 0) / published.length) : 0;
  const top = [...published].sort((a, b) => b.analytics.views - a.analytics.views).slice(0, 8);

  return (
    <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-24">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Stat icon={<Eye className="h-4 w-4" />} label="Total views" value={totalViews.toLocaleString()} />
        <Stat icon={<TrendingUp className="h-4 w-4" />} label="Avg read depth" value={`${avgComp}%`} />
        <Stat icon={<Heart className="h-4 w-4" />} label="Marked helpful" value={totalHelpful.toLocaleString()} />
        <Stat icon={<Share2 className="h-4 w-4" />} label="Shares" value={totalShares.toLocaleString()} />
      </div>

      <div className="rounded-2xl border" style={{ borderColor: palette.border, background: palette.glassStrong }}>
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: palette.border }}>
          <div className="text-[13px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Top pieces</div>
          <div className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: palette.muted }}>Last 30 days</div>
        </div>
        <ul>
          {top.map((p, i) => (
            <li key={p.id} className="px-5 py-3 border-b last:border-b-0 flex items-center gap-4" style={{ borderColor: palette.border }}>
              <span className="text-[11px] w-6" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{String(i + 1).padStart(2, "0")}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] truncate" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{p.title}</div>
                <div className="text-[10.5px] mt-0.5 uppercase tracking-[0.14em]" style={{ color: palette.muted }}>{p.format}</div>
              </div>
              <div className="flex items-center gap-4 text-[11.5px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                <span>{p.analytics.views.toLocaleString()} views</span>
                <span>{p.analytics.avgScrollPct}% depth</span>
                <span>{p.analytics.helpful} helpful</span>
              </div>
              <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: palette.border }}>
                <div className="h-full" style={{ width: `${Math.min(100, (p.analytics.views / (top[0]?.analytics.views || 1)) * 100)}%`, background: palette.primary }} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: palette.border, background: palette.glassStrong }}>
      <div className="flex items-center gap-2 mb-2 text-[10.5px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
        <span style={{ color: palette.primary }}>{icon}</span> {label}
      </div>
      <div className="text-[24px] tracking-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{value}</div>
    </div>
  );
}
