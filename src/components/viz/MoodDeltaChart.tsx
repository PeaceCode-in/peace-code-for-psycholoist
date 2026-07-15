import { useMemo } from "react";

export type MoodPoint = { at: number; value: number };

/**
 * Compact line chart for mood over a windowed range, with a
 * vertical marker at highlightDate. All SVG, glass-friendly.
 */
export function MoodDeltaChart({
  data,
  highlightDate,
  days = 14,
  width = 380,
  height = 120,
}: {
  data: MoodPoint[];
  highlightDate?: number;
  days?: number;
  width?: number;
  height?: number;
}) {
  const now = Date.now();
  const start = now - days * 86_400_000;
  const points = useMemo(
    () => [...data].filter((p) => p.at >= start && p.at <= now).sort((a, b) => a.at - b.at),
    [data, start, now],
  );

  const pad = { l: 10, r: 10, t: 10, b: 16 };
  const w = width - pad.l - pad.r;
  const h = height - pad.t - pad.b;

  const xScale = (t: number) => pad.l + ((t - start) / (now - start)) * w;
  const yScale = (v: number) => pad.t + (1 - Math.max(0, Math.min(10, v)) / 10) * h;

  const path = points.length
    ? "M " + points.map((p) => `${xScale(p.at).toFixed(1)} ${yScale(p.value).toFixed(1)}`).join(" L ")
    : "";

  const area = points.length
    ? `M ${xScale(points[0].at).toFixed(1)} ${(pad.t + h).toFixed(1)} L ` +
      points.map((p) => `${xScale(p.at).toFixed(1)} ${yScale(p.value).toFixed(1)}`).join(" L ") +
      ` L ${xScale(points[points.length - 1].at).toFixed(1)} ${(pad.t + h).toFixed(1)} Z`
    : "";

  const highlightX = highlightDate ? xScale(Math.min(Math.max(highlightDate, start), now)) : null;

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="block animate-in fade-in duration-200" role="img" aria-label="Mood over recent sessions">
      <defs>
        <linearGradient id="mood-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#B0567A" stopOpacity={0.22} />
          <stop offset="100%" stopColor="#B0567A" stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* baseline gridlines at 3 / 5 / 7 */}
      {[3, 5, 7].map((v) => (
        <line
          key={v}
          x1={pad.l} x2={pad.l + w}
          y1={yScale(v)} y2={yScale(v)}
          stroke="#EADFE2" strokeDasharray="2 4" strokeWidth={1}
        />
      ))}

      {points.length > 0 && (
        <>
          <path d={area} fill="url(#mood-fill)" />
          <path d={path} fill="none" stroke="#B0567A" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          {points.map((p) => (
            <circle key={p.at} cx={xScale(p.at)} cy={yScale(p.value)} r={2.5} fill="#B0567A" />
          ))}
        </>
      )}

      {highlightX !== null && (
        <>
          <line x1={highlightX} x2={highlightX} y1={pad.t} y2={pad.t + h} stroke="#1E1418" strokeDasharray="2 3" strokeWidth={1} opacity={0.5} />
          <text x={highlightX} y={height - 2} fontSize={9} fill="#1E1418" opacity={0.65} textAnchor="middle" style={{ fontFamily: "'Fraunces', serif" }}>today</text>
        </>
      )}

      {points.length === 0 && (
        <text x={width / 2} y={height / 2} fontSize={10} fill="#B4A5AB" textAnchor="middle" style={{ letterSpacing: "0.14em", textTransform: "uppercase" }}>
          no mood data yet
        </text>
      )}
    </svg>
  );
}
