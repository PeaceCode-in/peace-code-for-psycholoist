import { useEffect, useState, useMemo } from "react";
import { SEVERITY_META, type Instrument } from "@/lib/assessments-store";

/**
 * 3/4-arc dial split into severity band segments. Current score marked
 * with a small notch. Animates in on mount.
 */
export function SeverityDial({
  instrument,
  score,
  size = 240,
}: {
  instrument: Instrument;
  score: number;
  size?: number;
}) {
  const stroke = 16;
  const r = size / 2 - stroke;
  const cx = size / 2;
  const cy = size / 2;
  const startAng = Math.PI * 0.75;
  const endAng = Math.PI * 2.25;
  const totalAng = endAng - startAng;

  const bands = instrument.scoring.ranges;
  const min = bands[0].min;
  const max = bands[bands.length - 1].max;
  const rangeSize = max - min || 1;

  // count-up animation
  const [displayScore, setDisplayScore] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const dur = 700;
    function step(t: number) {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplayScore(score * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  const arcs = useMemo(() => bands.map((b) => {
    const p1 = (b.min - min) / (rangeSize + 1);
    const p2 = (b.max - min + 1) / (rangeSize + 1);
    const a1 = startAng + totalAng * p1;
    const a2 = startAng + totalAng * p2;
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2);
    const y2 = cy + r * Math.sin(a2);
    const large = a2 - a1 > Math.PI ? 1 : 0;
    return { d: `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`, color: SEVERITY_META[b.severity].color };
  }), [bands, min, rangeSize, r, cx, cy, startAng, totalAng]);

  const scoreClamped = Math.max(min, Math.min(max, score));
  const scoreAng = startAng + ((scoreClamped - min) / (rangeSize + 1)) * totalAng;
  const notchInner = r - stroke / 2 - 4;
  const notchOuter = r + stroke / 2 + 4;
  const notchX1 = cx + notchInner * Math.cos(scoreAng);
  const notchY1 = cy + notchInner * Math.sin(scoreAng);
  const notchX2 = cx + notchOuter * Math.cos(scoreAng);
  const notchY2 = cy + notchOuter * Math.sin(scoreAng);

  const currentBand = bands.find((b) => scoreClamped >= b.min && scoreClamped <= b.max) ?? bands[bands.length - 1];

  return (
    <div className="relative inline-block animate-in fade-in duration-200" style={{ width: size, height: size }}>
      <svg width={size} height={size} role="img" aria-label={`Score ${score} — ${currentBand.label}`}>
        {/* Band arcs — each drawn with its severity color, low opacity for empty bands */}
        {arcs.map((a, i) => (
          <path
            key={i}
            d={a.d}
            fill="none"
            stroke={a.color}
            strokeWidth={stroke}
            strokeLinecap="butt"
            opacity={0.28}
          />
        ))}
        {/* Filled progress — the primary arc up to the current score */}
        <path
          d={buildProgressPath(min, rangeSize, displayScore, startAng, totalAng, r, cx, cy)}
          fill="none"
          stroke={SEVERITY_META[currentBand.severity].color}
          strokeWidth={stroke}
          strokeLinecap="round"
          style={{ transition: "d 220ms ease-out" }}
        />
        {/* Notch */}
        <line x1={notchX1} y1={notchY1} x2={notchX2} y2={notchY2} stroke="#1E1418" strokeWidth={2} strokeLinecap="round" />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="text-[11px] tracking-[0.16em] uppercase" style={{ color: "#7B6A70" }}>Total</div>
        <div className="tabular-nums leading-none" style={{ fontFamily: "'Fraunces', serif", color: "#1E1418", fontSize: size * 0.24 }}>
          {Math.round(displayScore)}
        </div>
        <div className="text-[11px] tracking-[0.14em] uppercase mt-1" style={{ color: SEVERITY_META[currentBand.severity].color }}>
          {SEVERITY_META[currentBand.severity].label}
        </div>
      </div>
    </div>
  );
}

function buildProgressPath(min: number, rangeSize: number, score: number, startAng: number, totalAng: number, r: number, cx: number, cy: number) {
  const p = Math.max(0.001, (score - min) / (rangeSize + 1));
  const a = startAng + totalAng * p;
  const x1 = cx + r * Math.cos(startAng);
  const y1 = cy + r * Math.sin(startAng);
  const x2 = cx + r * Math.cos(a);
  const y2 = cy + r * Math.sin(a);
  const large = a - startAng > Math.PI ? 1 : 0;
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}
