import { SEVERITY_META, type AssessmentResult, type Instrument } from "@/lib/assessments-store";

/**
 * 120×64 mini line chart for the trajectory wall.
 * Renders as pure SVG, latest point highlighted.
 */
export function TrajectoryCell({
  data,
  instrument,
  width = 120,
  height = 64,
}: {
  data: AssessmentResult[];
  instrument: Instrument;
  width?: number;
  height?: number;
}) {
  const bands = instrument.scoring.ranges;
  const yMax = bands[bands.length - 1].max;
  const pad = 4;
  const w = width - pad * 2;
  const h = height - pad * 2;

  const sorted = [...data].sort((a, b) => a.completedAt.localeCompare(b.completedAt));
  if (sorted.length === 0) {
    return (
      <div className="flex items-center justify-center text-[9px] tracking-[0.14em] uppercase" style={{ width, height, color: "#B4A5AB" }}>
        no data
      </div>
    );
  }

  const startT = new Date(sorted[0].completedAt).getTime();
  const endT = new Date(sorted[sorted.length - 1].completedAt).getTime();
  const dur = Math.max(1, endT - startT);
  const xScale = (t: number) => pad + ((t - startT) / dur) * w;
  const yScale = (v: number) => pad + (1 - v / yMax) * h;

  const pts = sorted.map((r) => `${xScale(new Date(r.completedAt).getTime()).toFixed(1)},${yScale(r.totalScore).toFixed(1)}`).join(" ");
  const last = sorted[sorted.length - 1];
  const lastX = xScale(new Date(last.completedAt).getTime());
  const lastY = yScale(last.totalScore);

  return (
    <svg width={width} height={height} className="block">
      {bands.slice(0, -1).map((b, i) => (
        <line key={i} x1={pad} x2={pad + w} y1={yScale(b.max)} y2={yScale(b.max)} stroke={SEVERITY_META[bands[i + 1].severity].color} strokeDasharray="1 3" strokeWidth={0.5} opacity={0.3} />
      ))}
      <polyline points={pts} fill="none" stroke={SEVERITY_META[last.severity].color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r={2.5} fill={SEVERITY_META[last.severity].color} />
    </svg>
  );
}
