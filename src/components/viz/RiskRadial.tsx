import { useMemo } from "react";
import { RISK_META, type RiskLevel } from "@/lib/patients-store";

const RISK_VALUE: Record<RiskLevel, number> = { stable: 0.25, monitor: 0.5, elevated: 0.75, crisis: 1 };

/**
 * 3/4-arc radial gauge showing current risk tier, with an
 * optional history strip below (dots) for the last N changes.
 */
export function RiskRadial({
  value,
  history = [],
  size = 96,
}: {
  value: RiskLevel;
  history?: RiskLevel[];
  size?: number;
}) {
  const stroke = 8;
  const r = size / 2 - stroke;
  const cx = size / 2;
  const cy = size / 2;
  const start = Math.PI * 0.75;
  const end = Math.PI * 2.25;
  const total = end - start;

  const target = RISK_VALUE[value];
  const meta = RISK_META[value];

  const arc = useMemo(() => {
    const a = start + total * target;
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(a);
    const y2 = cy + r * Math.sin(a);
    const large = a - start > Math.PI ? 1 : 0;
    return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  }, [target, r, cx, cy, start, total]);

  const track = useMemo(() => {
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 1 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  }, [r, cx, cy, start, end]);

  return (
    <div className="inline-flex flex-col items-center gap-2 animate-in fade-in duration-200">
      <svg width={size} height={size} role="img" aria-label={`Risk: ${meta.label}`}>
        <path d={track} fill="none" stroke="#EADFE2" strokeWidth={stroke} strokeLinecap="round" />
        <path d={arc} fill="none" stroke={meta.token} strokeWidth={stroke} strokeLinecap="round" style={{ transition: "d 220ms ease-out" }} />
        <text x={cx} y={cy - 2} fontSize={12} fill="#7B6A70" textAnchor="middle" style={{ letterSpacing: "0.14em", textTransform: "uppercase" }}>
          risk
        </text>
        <text x={cx} y={cy + 14} fontSize={15} fill="#1E1418" textAnchor="middle" style={{ fontFamily: "'Fraunces', serif" }}>
          {meta.label}
        </text>
      </svg>
      {history.length > 0 && (
        <div className="flex items-center gap-1">
          {history.slice(0, 8).map((h, i) => (
            <span key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: RISK_META[h].token, opacity: 0.55 + (i / history.length) * 0.45 }} />
          ))}
        </div>
      )}
    </div>
  );
}
