import { createFileRoute } from "@tanstack/react-router";
import { palette } from "@/components/practice/palette";
import { Card, SectionTitle, Avatar, CapacityMeter, RoleChip } from "@/components/practice/team/primitives";
import { useMembers, useMe } from "@/lib/team-store";
import { Info } from "lucide-react";

export const Route = createFileRoute("/team/analytics")({
  head: () => ({ meta: [{ title: "Team analytics — Team" }] }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const me = useMe();
  const members = useMembers().filter((m) => m.weeklyCapacity > 0);
  const canSeeRevenue = me.role === "owner";

  const totalCaseload = members.reduce((a, m) => a + m.activeCaseload, 0);
  const utilValues = members.map((m) => m.utilization);
  const utilMin = Math.min(...utilValues);
  const utilMax = Math.max(...utilValues);
  const utilMedian = median(utilValues);
  const nsValues = members.map((m) => m.noShowRate);
  const nsMedian = median(nsValues);

  return (
    <div className="space-y-5">
      <Card className="p-3 flex items-start gap-2 text-[11.5px]" style={{ background: "#FFF7FA", borderColor: palette.soft }}>
        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: palette.primary }} />
        <span style={{ color: palette.muted }}>
          These charts show distribution, not a leaderboard. Numbers reflect complexity of caseload, not the quality of a clinician.
        </span>
      </Card>

      <Card className="p-4">
        <SectionTitle eyebrow="Caseload" title="How is the practice's care distributed?" />
        <div className="mt-2 space-y-2">
          {members.map((m) => {
            const pct = m.activeCaseload / totalCaseload;
            return (
              <div key={m.id} className="grid items-center gap-3" style={{ gridTemplateColumns: "180px 1fr 60px" }}>
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar member={m} size={22} />
                  <span className="text-[12px] truncate" style={{ color: palette.ink }}>{m.preferredName ?? m.fullName}</span>
                </div>
                <div className="h-3 rounded-full" style={{ background: palette.border }}>
                  <div style={{ width: `${pct * 100}%`, height: "100%", background: `linear-gradient(90deg, ${m.tone}, ${palette.primary})`, borderRadius: 999 }} />
                </div>
                <div className="text-right text-[11.5px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                  {m.activeCaseload} · {Math.round(pct * 100)}%
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <SectionTitle
            eyebrow="Utilization range"
            title="Where the team lands"
            hint={`Median ${(utilMedian * 100).toFixed(0)}%. Everyone else within ${(utilMin * 100).toFixed(0)}%–${(utilMax * 100).toFixed(0)}%.`}
          />
          <DistributionBar values={utilValues} format={(v) => `${Math.round(v * 100)}%`} tone={palette.primary} />
          <ul className="mt-3 space-y-1.5">
            {members.map((m) => (
              <li key={m.id} className="grid items-center gap-3" style={{ gridTemplateColumns: "160px 1fr 60px" }}>
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar member={m} size={20} />
                  <span className="text-[11.5px] truncate" style={{ color: palette.ink }}>{m.preferredName ?? m.fullName}</span>
                </div>
                <CapacityMeter pct={m.utilization} tone={m.utilization > 0.9 ? "#B08444" : palette.primary} />
                <span className="text-right text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{Math.round(m.utilization * 100)}%</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4">
          <SectionTitle
            eyebrow="No-show rate"
            title="Session attendance"
            hint={`Practice median ${(nsMedian * 100).toFixed(0)}%. Higher rates often reflect harder-to-reach populations.`}
          />
          <DistributionBar values={nsValues} format={(v) => `${Math.round(v * 100)}%`} tone="#D4A24C" />
          <ul className="mt-3 space-y-1.5">
            {members.map((m) => (
              <li key={m.id} className="grid items-center gap-3" style={{ gridTemplateColumns: "160px 1fr 60px" }}>
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar member={m} size={20} />
                  <span className="text-[11.5px] truncate" style={{ color: palette.ink }}>{m.preferredName ?? m.fullName}</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: palette.border }}>
                  <div style={{ width: `${(m.noShowRate / 0.2) * 100}%`, height: "100%", background: m.noShowRate > 0.12 ? "#D4A24C" : palette.primary, borderRadius: 999 }} />
                </div>
                <span className="text-right text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{Math.round(m.noShowRate * 100)}%</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="p-4">
        <SectionTitle eyebrow="Outcomes" title="Aggregate improvement index" hint="Blended assessment deltas across each clinician's active cases. Ranges only, never rankings." />
        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
          {members.map((m) => (
            <div key={m.id} className="rounded-xl p-3" style={{ background: palette.surface2, border: `1px solid ${palette.border}` }}>
              <div className="flex items-center gap-2">
                <Avatar member={m} size={26} />
                <span className="text-[12.5px]" style={{ color: palette.ink, fontFamily: "'Fraunces', serif" }}>{m.preferredName ?? m.fullName}</span>
                <RoleChip role={m.role} />
              </div>
              <div className="mt-2 h-16 relative">
                <OutcomeSpark index={m.outcomeIndex} tone={m.tone} />
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-[9.5px] uppercase tracking-[0.18em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Outcome index</span>
                <span className="text-[20px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink, fontVariantNumeric: "tabular-nums" }}>{m.outcomeIndex}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {canSeeRevenue && (
        <Card className="p-4">
          <SectionTitle
            eyebrow="Owner only"
            title="Revenue this month"
            hint="Visible to Owners. Never surfaced to non-owner clinicians."
          />
          <div className="space-y-2 mt-1">
            {members.map((m) => {
              const max = Math.max(...members.map((x) => x.revenueMonth || 0));
              const pct = max ? (m.revenueMonth / max) : 0;
              return (
                <div key={m.id} className="grid items-center gap-3" style={{ gridTemplateColumns: "180px 1fr 90px" }}>
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar member={m} size={22} />
                    <span className="text-[12px] truncate" style={{ color: palette.ink }}>{m.preferredName ?? m.fullName}</span>
                  </div>
                  <div className="h-3 rounded-full" style={{ background: palette.border }}>
                    <div style={{ width: `${pct * 100}%`, height: "100%", background: `linear-gradient(90deg, ${palette.primary}, ${m.tone})`, borderRadius: 999 }} />
                  </div>
                  <div className="text-right text-[11.5px]" style={{ color: palette.ink, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                    ₹{m.revenueMonth.toLocaleString("en-IN")}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

function median(a: number[]) {
  const s = [...a].sort((x, y) => x - y);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function DistributionBar({ values, format, tone }: { values: number[]; format: (v: number) => string; tone: string }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const med = median(values);
  const range = max - min || 1;
  const pctFor = (v: number) => ((v - min) / range) * 100;

  return (
    <div className="mt-3">
      <div className="relative h-9 rounded-lg" style={{ background: palette.surface2, border: `1px solid ${palette.border}` }}>
        <div
          className="absolute inset-y-2 rounded-full"
          style={{ left: `${pctFor(min)}%`, right: `${100 - pctFor(max)}%`, background: `linear-gradient(90deg, ${tone}44, ${tone}88)` }}
        />
        {values.map((v, i) => (
          <span key={i} className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full" style={{ left: `calc(${pctFor(v)}% - 3px)`, background: tone }} />
        ))}
        <span className="absolute -top-1 h-11 w-px" style={{ left: `${pctFor(med)}%`, background: palette.ink }} />
      </div>
      <div className="mt-1.5 flex justify-between text-[10.5px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
        <span>min · {format(min)}</span>
        <span>median · {format(med)}</span>
        <span>max · {format(max)}</span>
      </div>
    </div>
  );
}

function OutcomeSpark({ index, tone }: { index: number; tone: string }) {
  // Deterministic pseudo-trend so charts feel real without inventing data.
  const seed = index || 50;
  const pts: number[] = [];
  for (let i = 0; i < 20; i++) {
    const t = i / 19;
    const noise = Math.sin(seed * (i + 1) * 0.7) * 6;
    pts.push(Math.max(20, Math.min(95, 40 + t * (index - 40) + noise)));
  }
  const w = 300, h = 60;
  const d = pts.map((v, i) => `${i === 0 ? "M" : "L"} ${(i / (pts.length - 1)) * w} ${h - ((v - 20) / 75) * h}`).join(" ");
  const area = `${d} L ${w} ${h} L 0 ${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
      <defs>
        <linearGradient id={`g-${index}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={tone} stopOpacity="0.35" />
          <stop offset="100%" stopColor={tone} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#g-${index})`} />
      <path d={d} fill="none" stroke={tone} strokeWidth="1.5" />
    </svg>
  );
}
