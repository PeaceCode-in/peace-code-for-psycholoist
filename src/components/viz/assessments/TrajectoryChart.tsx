import { useMemo } from "react";
import { SEVERITY_META, type Instrument, type AssessmentResult } from "@/lib/assessments-store";

/**
 * Trajectory line chart with dashed clinical threshold lines and optional
 * session-date ticks along the x-axis.
 */
export function TrajectoryChart({
  data,
  instrument,
  sessionDates = [],
  width = 560,
  height = 220,
  showSessionOverlay = false,
}: {
  data: AssessmentResult[];
  instrument: Instrument;
  sessionDates?: number[];
  width?: number;
  height?: number;
  showSessionOverlay?: boolean;
}) {
  const bands = instrument.scoring.ranges;
  const yMax = bands[bands.length - 1].max;
  const pad = { l: 34, r: 20, t: 20, b: 28 };
  const w = width - pad.l - pad.r;
  const h = height - pad.t - pad.b;

  const sorted = useMemo(() => [...data].sort((a, b) => a.completedAt.localeCompare(b.completedAt)), [data]);
  const startT = sorted.length ? new Date(sorted[0].completedAt).getTime() : Date.now() - 90 * 86_400_000;
  const endT = Date.now();

  const xScale = (t: number) => pad.l + ((t - startT) / Math.max(1, endT - startT)) * w;
  const yScale = (v: number) => pad.t + (1 - v / yMax) * h;

  const path = sorted.length
    ? "M " + sorted.map((r) => `${xScale(new Date(r.completedAt).getTime()).toFixed(1)} ${yScale(r.totalScore).toFixed(1)}`).join(" L ")
    : "";

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" className="block animate-in fade-in duration-200" role="img" aria-label="Score trajectory">
      <defs>
        <linearGradient id="traj-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#B0567A" stopOpacity={0.15} />
          <stop offset="100%" stopColor="#B0567A" stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Threshold lines — one per band boundary (dashed clinical thresholds) */}
      {bands.slice(0, -1).map((b, i) => {
        const y = yScale(b.max);
        const next = bands[i + 1];
        return (
          <g key={i}>
            <line x1={pad.l} x2={pad.l + w} y1={y} y2={y} stroke={SEVERITY_META[next.severity].color} strokeDasharray="3 5" strokeWidth={1} opacity={0.4} />
            <text x={pad.l + w - 2} y={y - 3} fontSize={8.5} textAnchor="end" fill={SEVERITY_META[next.severity].color} opacity={0.7} style={{ letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {SEVERITY_META[next.severity].label.toLowerCase()}
            </text>
          </g>
        );
      })}

      {/* Y-axis ticks */}
      {[0, Math.round(yMax / 2), yMax].map((v) => (
        <g key={v}>
          <text x={pad.l - 6} y={yScale(v) + 3} fontSize={9} textAnchor="end" fill="#7B6A70">{v}</text>
        </g>
      ))}

      {/* Session ticks */}
      {showSessionOverlay && sessionDates.map((d, i) => {
        const x = xScale(d);
        if (x < pad.l || x > pad.l + w) return null;
        return <line key={i} x1={x} x2={x} y1={pad.t + h} y2={pad.t + h + 4} stroke="#7B6A70" strokeWidth={1} opacity={0.6} />;
      })}

      {sorted.length > 0 && (
        <>
          <path d={`${path} L ${xScale(new Date(sorted[sorted.length - 1].completedAt).getTime()).toFixed(1)} ${pad.t + h} L ${xScale(new Date(sorted[0].completedAt).getTime()).toFixed(1)} ${pad.t + h} Z`} fill="url(#traj-fill)" />
          <path d={path} fill="none" stroke="#B0567A" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          {sorted.map((r, i) => {
            const isLast = i === sorted.length - 1;
            const x = xScale(new Date(r.completedAt).getTime());
            const y = yScale(r.totalScore);
            return (
              <g key={r.id}>
                {isLast && <circle cx={x} cy={y} r={7} fill="none" stroke="#B0567A" strokeWidth={1.2} opacity={0.4} />}
                <circle cx={x} cy={y} r={3} fill={SEVERITY_META[r.severity].color} />
              </g>
            );
          })}
        </>
      )}

      {/* Baseline */}
      <line x1={pad.l} x2={pad.l + w} y1={pad.t + h} y2={pad.t + h} stroke="#EADFE2" strokeWidth={1} />

      {sorted.length === 0 && (
        <text x={width / 2} y={height / 2} fontSize={10.5} textAnchor="middle" fill="#B4A5AB" style={{ letterSpacing: "0.14em", textTransform: "uppercase" }}>
          No results yet
        </text>
      )}
    </svg>
  );
}
