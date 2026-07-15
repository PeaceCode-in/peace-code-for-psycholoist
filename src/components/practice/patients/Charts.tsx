// Hand-drawn SVG charts for the Patients module.
// No chart library — every visual is bespoke SVG for editorial polish.
import { palette } from "@/components/practice/palette";
import type { MoodDataPoint } from "@/lib/patients-store";

// ── Mood sparkline (compact for overview) ──────────────────
export function MoodSparkline({ series, width = 240, height = 56 }: { series: MoodDataPoint[]; width?: number; height?: number }) {
  if (series.length < 2) return <div className="text-[11px] italic" style={{ color: palette.muted }}>Not enough data</div>;
  const values = series.map((s) => s.value);
  const min = Math.min(...values, 1);
  const max = Math.max(...values, 10);
  const range = Math.max(1, max - min);
  const step = width / (series.length - 1);
  const pts = series.map((s, i) => {
    const x = i * step;
    const y = height - ((s.value - min) / range) * (height - 8) - 4;
    return `${x},${y}`;
  });
  const d = `M ${pts.join(" L ")}`;
  const area = `M 0,${height} L ${pts.join(" L ")} L ${width},${height} Z`;
  const last = pts[pts.length - 1].split(",");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <path d={area} fill={palette.soft} opacity={0.5} />
      <path d={d} fill="none" stroke={palette.primary} strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r={3} fill={palette.primary} />
    </svg>
  );
}

// ── Full-width mood chart (before / after per session) ─────
export function MoodTimeline({ series, days = 90 }: { series: MoodDataPoint[]; days?: number }) {
  const W = 720, H = 260, padL = 32, padR = 12, padT = 20, padB = 28;
  const now = Date.now();
  const cutoff = now - days * 86_400_000;
  const filtered = series.filter((s) => s.at >= cutoff);
  if (filtered.length < 2) {
    return (
      <div className="rounded-2xl p-10 text-center" style={{ background: palette.surface2, border: `1px dashed ${palette.border}`, color: palette.muted }}>
        Not enough mood data for this range yet.
      </div>
    );
  }
  // group sessions in pairs — before then after
  const sessions: Array<{ at: number; before?: number; after?: number }> = [];
  const map = new Map<number, { at: number; before?: number; after?: number }>();
  filtered.forEach((p) => {
    const bucket = Math.floor(p.at / 86_400_000) * 86_400_000;
    if (!map.has(bucket)) map.set(bucket, { at: bucket });
    const entry = map.get(bucket)!;
    if (p.value !== undefined) {
      // heuristic: first hit → before, second → after
      if (entry.before === undefined) entry.before = p.value;
      else entry.after = p.value;
    }
  });
  map.forEach((v) => sessions.push(v));
  sessions.sort((a, b) => a.at - b.at);
  const spanW = W - padL - padR;
  const spanH = H - padT - padB;
  const xFor = (at: number) => padL + ((at - cutoff) / (now - cutoff)) * spanW;
  const yFor = (v: number) => padT + (1 - (v - 1) / 9) * spanH;

  const before = sessions.filter((s) => s.before !== undefined);
  const after = sessions.filter((s) => s.after !== undefined);
  const linePath = (pts: Array<{ at: number; v: number }>) =>
    pts.length ? `M ${pts.map((p) => `${xFor(p.at).toFixed(1)},${yFor(p.v).toFixed(1)}`).join(" L ")}` : "";

  const beforePath = linePath(before.map((s) => ({ at: s.at, v: s.before! })));
  const afterPath = linePath(after.map((s) => ({ at: s.at, v: s.after! })));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* Gridlines */}
      {[1, 3, 5, 7, 10].map((v) => (
        <g key={v}>
          <line x1={padL} y1={yFor(v)} x2={W - padR} y2={yFor(v)} stroke={palette.border} strokeDasharray="3 4" />
          <text x={padL - 6} y={yFor(v) + 3} fontSize="9" textAnchor="end" fill={palette.muted}>{v}</text>
        </g>
      ))}
      {/* Axis line */}
      <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke={palette.border} />
      {/* Before line (lighter) */}
      <path d={beforePath} fill="none" stroke={palette.primary} strokeWidth={1.2} opacity={0.4} strokeLinejoin="round" />
      {/* After line (darker) */}
      <path d={afterPath} fill="none" stroke={palette.primary} strokeWidth={1.8} strokeLinejoin="round" />
      {/* Session markers with lift arrows */}
      {sessions.map((s) => {
        if (s.before === undefined || s.after === undefined) return null;
        const x = xFor(s.at);
        const y1 = yFor(s.before);
        const y2 = yFor(s.after);
        const lift = s.after - s.before;
        const color = lift >= 0 ? "var(--pc-risk-stable)" : "var(--pc-risk-elevated)";
        return (
          <g key={s.at}>
            <line x1={x} y1={y1} x2={x} y2={y2} stroke={color} strokeWidth={1.4} opacity={0.55} />
            <circle cx={x} cy={y1} r={2.4} fill={palette.surface} stroke={palette.primary} strokeWidth={1.1} opacity={0.6} />
            <circle cx={x} cy={y2} r={3.4} fill={palette.primary} />
          </g>
        );
      })}
      {/* X ticks */}
      {Array.from({ length: 4 }).map((_, i) => {
        const t = cutoff + ((now - cutoff) * i) / 3;
        return <text key={i} x={xFor(t)} y={H - 10} fontSize="9" fill={palette.muted} textAnchor="middle">
          {new Date(t).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
        </text>;
      })}
      {/* Legend */}
      <g transform={`translate(${W - 200}, ${padT - 4})`}>
        <circle cx={0} cy={0} r={3} fill={palette.primary} opacity={0.4} />
        <text x={8} y={3} fontSize="10" fill={palette.muted}>Before</text>
        <circle cx={60} cy={0} r={3.4} fill={palette.primary} />
        <text x={70} y={3} fontSize="10" fill={palette.muted}>After</text>
      </g>
    </svg>
  );
}

// ── Session frequency bar strip (weeks) ───────────────────
export function SessionFrequencyStrip({ series, days = 90 }: { series: MoodDataPoint[]; days?: number }) {
  const now = Date.now();
  const cutoff = now - days * 86_400_000;
  const weeks = Math.ceil(days / 7);
  const buckets = new Array(weeks).fill(0);
  const sessionsOnly = new Set<number>();
  series.forEach((p) => {
    const key = Math.floor(p.at / 86_400_000);
    if (sessionsOnly.has(key)) return;
    sessionsOnly.add(key);
    const wk = Math.floor((p.at - cutoff) / (7 * 86_400_000));
    if (wk >= 0 && wk < weeks) buckets[wk]++;
  });
  const max = Math.max(1, ...buckets);
  const W = 720, H = 80, padL = 32, padR = 12, padT = 10, padB = 24;
  const barW = (W - padL - padR) / weeks - 3;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <text x={padL - 6} y={padT + 8} fontSize="9" textAnchor="end" fill={palette.muted}>{max}</text>
      <text x={padL - 6} y={H - padB - 2} fontSize="9" textAnchor="end" fill={palette.muted}>0</text>
      {buckets.map((v, i) => {
        const x = padL + i * (barW + 3);
        const h = (v / max) * (H - padT - padB);
        const y = H - padB - h;
        return <rect key={i} x={x} y={y} width={barW} height={h} fill={palette.primary} opacity={0.7} rx={2} />;
      })}
      <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke={palette.border} />
      <text x={padL} y={H - 6} fontSize="9" fill={palette.muted}>{Math.round(days / 7)}w ago</text>
      <text x={W - padR} y={H - 6} fontSize="9" fill={palette.muted} textAnchor="end">now</text>
    </svg>
  );
}

// ── Tag cloud (from tags + assessment fragments) ──────────
export function TagCloud({ tags }: { tags: string[] }) {
  const freq = new Map<string, number>();
  tags.forEach((t) => freq.set(t, (freq.get(t) ?? 0) + 1));
  const entries = Array.from(freq.entries()).sort((a, b) => b[1] - a[1]).slice(0, 20);
  if (!entries.length) return <div className="text-[11px] italic" style={{ color: palette.muted }}>No themes yet</div>;
  const maxCount = Math.max(...entries.map((e) => e[1]));
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-2 items-baseline">
      {entries.map(([t, c]) => {
        const size = 11 + (c / maxCount) * 10;
        const opacity = 0.5 + (c / maxCount) * 0.5;
        return <span key={t} style={{ fontSize: size, color: palette.ink, opacity, fontFamily: "'Fraunces', serif" }}>{t}</span>;
      })}
    </div>
  );
}

// ── Small circular risk gauge ────────────────────────────
export function RiskGauge({ risk }: { risk: "stable" | "monitor" | "elevated" | "crisis" }) {
  const map = { stable: 25, monitor: 50, elevated: 75, crisis: 100 };
  const pct = map[risk];
  const tokens = {
    stable: "var(--pc-risk-stable)",
    monitor: "var(--pc-risk-monitor)",
    elevated: "var(--pc-risk-elevated)",
    crisis: "var(--pc-risk-crisis)",
  } as const;
  const R = 22, C = 2 * Math.PI * R;
  return (
    <svg width={56} height={56} viewBox="0 0 56 56">
      <circle cx={28} cy={28} r={R} fill="none" stroke={palette.border} strokeWidth={4} />
      <circle cx={28} cy={28} r={R} fill="none" stroke={tokens[risk]} strokeWidth={4}
        strokeDasharray={`${(pct / 100) * C} ${C}`}
        strokeDashoffset={C / 4} strokeLinecap="round"
        transform="rotate(-90 28 28)" />
    </svg>
  );
}
